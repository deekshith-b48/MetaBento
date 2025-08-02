import { ethers } from 'ethers';
import { supabase } from './supabase';

// Generate a random nonce for signature verification
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create a message to sign for wallet verification
export function createSignMessage(walletAddress: string, nonce: string): string {
  return `Welcome to MetaBento!

Click to sign in and accept the MetaBento Terms of Service.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address:
${walletAddress}

Nonce:
${nonce}`;
}

// Verify a wallet signature
export function verifySignature(message: string, signature: string, walletAddress: string): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Generate and store a nonce for wallet verification
export async function generateAuthNonce(walletAddress: string): Promise<string> {
  const nonce = generateNonce();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

  const { error } = await supabase
    .from('auth_nonces')
    .insert({
      wallet_address: walletAddress,
      nonce,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error(`Failed to generate nonce: ${error.message}`);
  }

  return nonce;
}

// Verify nonce exists and is valid
export async function verifyAuthNonce(walletAddress: string, nonce: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('auth_nonces')
    .select('*')
    .eq('wallet_address', walletAddress)
    .eq('nonce', nonce)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return false;
  }

  // Mark nonce as used
  await supabase
    .from('auth_nonces')
    .update({ used: true })
    .eq('id', data.id);

  return true;
}

// Generate a session token
export function generateSessionToken(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

// Create a new auth session
export async function createAuthSession(userId: string, walletAddress: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

  const { error } = await supabase
    .from('auth_sessions')
    .insert({
      user_id: userId,
      wallet_address: walletAddress,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return sessionToken;
}

// Verify a session token
export async function verifySessionToken(sessionToken: string): Promise<{ userId: string; walletAddress: string } | null> {
  const { data, error } = await supabase
    .from('auth_sessions')
    .select('user_id, wallet_address')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return {
    userId: data.user_id,
    walletAddress: data.wallet_address,
  };
}

// Clean up expired sessions for a user
export async function cleanupUserSessions(userId: string): Promise<void> {
  await supabase
    .from('auth_sessions')
    .delete()
    .eq('user_id', userId)
    .lt('expires_at', new Date().toISOString());
}

// Logout - remove session
export async function logout(sessionToken: string): Promise<void> {
  await supabase
    .from('auth_sessions')
    .delete()
    .eq('session_token', sessionToken);
}

// Check if wallet address is available for registration
export async function isWalletAvailable(walletAddress: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single();

  return error && error.code === 'PGRST116'; // Not found error
}

// Get or create user by wallet address
export async function getOrCreateUser(walletAddress: string): Promise<{ id: string; isNewUser: boolean }> {
  // First try to get existing user
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single();

  if (existingUser) {
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', existingUser.id);

    return { id: existingUser.id, isNewUser: false };
  }

  // Create new user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      wallet_address: walletAddress,
      last_login: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError || !newUser) {
    throw new Error(`Failed to create user: ${insertError?.message}`);
  }

  return { id: newUser.id, isNewUser: true };
}
