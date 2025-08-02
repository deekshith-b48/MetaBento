import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Types
interface AuthNonceRequest {
  walletAddress: string;
}

interface WalletLoginRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
}

interface PasswordLoginRequest {
  walletAddress: string;
  password: string;
}

interface SetPasswordRequest {
  walletAddress: string;
  password: string;
  sessionToken: string;
}

interface EmailSignupRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

interface EmailLoginRequest {
  email: string;
  password: string;
}

interface WalletSignupRequest {
  walletAddress: string;
  username: string;
  displayName: string;
  email?: string;
}

interface CheckWalletRequest {
  walletAddress: string;
}

// Helper functions
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createSignMessage(walletAddress: string, nonce: string): string {
  return `Welcome to MetaBento!

Click to sign in and accept the MetaBento Terms of Service.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
${walletAddress}

Nonce:
${nonce}`;
}

function verifySignature(message: string, signature: string, walletAddress: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

function generateSessionToken(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

// Generate nonce for wallet signature
export const generateAuthNonce: RequestHandler = async (req, res) => {
  try {
    const { walletAddress }: AuthNonceRequest = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Valid wallet address is required' });
    }

    const nonce = generateNonce();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

    // Store nonce in database
    const { error } = await supabase
      .from('auth_nonces')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        nonce,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      throw error;
    }

    const message = createSignMessage(walletAddress, nonce);

    res.json({ 
      success: true, 
      nonce, 
      message,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Generate nonce error:', error);
    res.status(500).json({ error: 'Failed to generate authentication nonce' });
  }
};

// Wallet-based login
export const walletLogin: RequestHandler = async (req, res) => {
  try {
    const { walletAddress, signature, nonce }: WalletLoginRequest = req.body;

    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({ error: 'Wallet address, signature, and nonce are required' });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Verify nonce exists and is valid
    const { data: nonceData, error: nonceError } = await supabase
      .from('auth_nonces')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('nonce', nonce)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (nonceError || !nonceData) {
      return res.status(400).json({ error: 'Invalid or expired nonce' });
    }

    // Verify signature
    const message = createSignMessage(walletAddress, nonce);
    const isValidSignature = verifySignature(message, signature, walletAddress);

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Mark nonce as used
    await supabase
      .from('auth_nonces')
      .update({ used: true })
      .eq('id', nonceData.id);

    // Get or create user
    let userId: string;
    let isNewUser = false;

    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingUser) {
      userId = existingUser.id;
      
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          last_login: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !newUser) {
        throw new Error(`Failed to create user: ${insertError?.message}`);
      }

      userId = newUser.id;
      isNewUser = true;
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      throw sessionError;
    }

    // Generate JWT for additional security
    const jwtToken = jwt.sign(
      { userId, walletAddress: walletAddress.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      sessionToken,
      jwtToken,
      userId,
      walletAddress: walletAddress.toLowerCase(),
      isNewUser,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Password-based login (optional)
export const passwordLogin: RequestHandler = async (req, res) => {
  try {
    const { walletAddress, password }: PasswordLoginRequest = req.body;

    if (!walletAddress || !password) {
      return res.status(400).json({ error: 'Wallet address and password are required' });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get user with password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ error: 'Password not set for this wallet. Please use wallet login.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress.toLowerCase(),
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      throw sessionError;
    }

    const jwtToken = jwt.sign(
      { userId: user.id, walletAddress: walletAddress.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      sessionToken,
      jwtToken,
      userId: user.id,
      walletAddress: walletAddress.toLowerCase(),
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Set password for wallet (optional security)
export const setPassword: RequestHandler = async (req, res) => {
  try {
    const { walletAddress, password, sessionToken }: SetPasswordRequest = req.body;

    if (!walletAddress || !password || !sessionToken) {
      return res.status(400).json({ error: 'Wallet address, password, and session token are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('wallet_address', walletAddress.toLowerCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user with password hash
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', session.user_id);

    if (updateError) {
      throw updateError;
    }

    res.json({ success: true, message: 'Password set successfully' });

  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

// Verify session token
export const verifySession: RequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('user_id, wallet_address')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    res.json({
      success: true,
      userId: session.user_id,
      walletAddress: session.wallet_address
    });

  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: 'Session verification failed' });
  }
};

// Email signup
export const emailSignup: RequestHandler = async (req, res) => {
  try {
    const { email, password, username, displayName }: EmailSignupRequest = req.body;

    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ error: 'Email, password, username, and display name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if email or username already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        username: username.toLowerCase(),
        display_name: displayName,
        last_login: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !newUser) {
      throw new Error(`Failed to create user: ${insertError?.message}`);
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: newUser.id,
        wallet_address: '', // No wallet for email-only signup
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      throw sessionError;
    }

    const jwtToken = jwt.sign(
      { userId: newUser.id, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      sessionToken,
      jwtToken,
      userId: newUser.id,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Email login
export const emailLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: EmailLoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, password_hash, username')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ error: 'This account uses wallet authentication. Please connect your wallet.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: user.id,
        wallet_address: '', // No wallet for email login
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      throw sessionError;
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      sessionToken,
      jwtToken,
      userId: user.id,
      email: email.toLowerCase(),
      username: user.username,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Wallet signup (for new wallets)
export const walletSignup: RequestHandler = async (req, res) => {
  try {
    const { walletAddress, username, displayName, email }: WalletSignupRequest = req.body;

    if (!walletAddress || !username || !displayName) {
      return res.status(400).json({ error: 'Wallet address, username, and display name are required' });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Check if wallet or username already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, wallet_address, username')
      .or(`wallet_address.eq.${walletAddress.toLowerCase()},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.wallet_address === walletAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Wallet address already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        username: username.toLowerCase(),
        display_name: displayName,
        email: email?.toLowerCase(),
        last_login: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !newUser) {
      throw new Error(`Failed to create user: ${insertError?.message}`);
    }

    res.json({
      success: true,
      userId: newUser.id,
      message: 'Profile created successfully. Please sign the message to complete login.'
    });

  } catch (error) {
    console.error('Wallet signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Check if wallet exists
export const checkWallet: RequestHandler = async (req, res) => {
  try {
    const { walletAddress }: CheckWalletRequest = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Valid wallet address is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    res.json({
      exists: !!user,
      username: user?.username || null
    });

  } catch (error) {
    console.error('Check wallet error:', error);
    res.status(500).json({ error: 'Failed to check wallet' });
  }
};

// Logout
export const logout: RequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    await supabase
      .from('auth_sessions')
      .delete()
      .eq('session_token', sessionToken);

    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
