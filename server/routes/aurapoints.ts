import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface QRConnectionRequest {
  scannerId: string;
  referrerId: string;
  sessionToken: string;
}

interface GetPointsRequest {
  userId: string;
  sessionToken: string;
}

interface SwapPointsRequest {
  userId: string;
  pointsToSwap: number;
  sessionToken: string;
}

// Helper function to verify session and get user
async function verifyUserSession(sessionToken: string, expectedUserId?: string) {
  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select('user_id, wallet_address')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    throw new Error('Invalid or expired session');
  }

  if (expectedUserId && session.user_id !== expectedUserId) {
    throw new Error('Session does not match user');
  }

  return session;
}

// Process QR connection and award Aura Points
export const processQRConnection: RequestHandler = async (req, res) => {
  try {
    const { scannerId, referrerId, sessionToken }: QRConnectionRequest = req.body;

    if (!scannerId || !referrerId || !sessionToken) {
      return res.status(400).json({ error: 'Scanner ID, Referrer ID, and session token are required' });
    }

    if (scannerId === referrerId) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    // Verify session belongs to scanner
    const session = await verifyUserSession(sessionToken, scannerId);

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('qr_connections')
      .select('id')
      .eq('scanner_id', scannerId)
      .eq('referrer_id', referrerId)
      .single();

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    // Start transaction by creating connection record
    const { data: connection, error: connectionError } = await supabase
      .from('qr_connections')
      .insert({
        scanner_id: scannerId,
        referrer_id: referrerId,
        connection_date: new Date().toISOString(),
        points_awarded: 10
      })
      .select()
      .single();

    if (connectionError) {
      throw connectionError;
    }

    // Award points to both users
    const pointsPerUser = 10;

    // Award points to scanner
    await supabase.rpc('add_aura_points', { 
      user_id: scannerId, 
      points: pointsPerUser,
      reason: 'QR Connection - Scanner',
      connection_id: connection.id
    });

    // Award points to referrer
    await supabase.rpc('add_aura_points', { 
      user_id: referrerId, 
      points: pointsPerUser,
      reason: 'QR Connection - Referrer',
      connection_id: connection.id
    });

    // Get updated point totals
    const { data: scannerPoints } = await supabase
      .from('users')
      .select('aura_points')
      .eq('id', scannerId)
      .single();

    const { data: referrerPoints } = await supabase
      .from('users')
      .select('aura_points')
      .eq('id', referrerId)
      .single();

    res.json({
      success: true,
      connection: {
        id: connection.id,
        pointsAwarded: pointsPerUser,
        scannerPoints: scannerPoints?.aura_points || 0,
        referrerPoints: referrerPoints?.aura_points || 0
      },
      message: `Connection successful! Both users earned ${pointsPerUser} Aura Points.`
    });

  } catch (error) {
    console.error('QR connection error:', error);
    res.status(500).json({ error: 'Failed to process QR connection' });
  }
};

// Get user's Aura Points balance and history
export const getUserPoints: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken }: GetPointsRequest = req.body;

    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }

    // Verify session
    await verifyUserSession(sessionToken, userId);

    // Get user's current points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('aura_points, username, display_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get points history
    const { data: history, error: historyError } = await supabase
      .from('aura_point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get connection count
    const { count: connectionCount } = await supabase
      .from('qr_connections')
      .select('*', { count: 'exact' })
      .or(`scanner_id.eq.${userId},referrer_id.eq.${userId}`);

    // Get rank
    const { data: rankData } = await supabase
      .from('users')
      .select('id')
      .gt('aura_points', user.aura_points)
      .order('aura_points', { ascending: false });

    const rank = (rankData?.length || 0) + 1;

    res.json({
      success: true,
      user: {
        id: userId,
        username: user.username,
        displayName: user.display_name,
        auraPoints: user.aura_points || 0,
        connections: connectionCount || 0,
        rank
      },
      history: history || [],
      stats: {
        totalEarned: history?.reduce((sum, tx) => sum + (tx.points > 0 ? tx.points : 0), 0) || 0,
        totalSpent: history?.reduce((sum, tx) => sum + (tx.points < 0 ? Math.abs(tx.points) : 0), 0) || 0
      }
    });

  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ error: 'Failed to get user points' });
  }
};

// Get Aura Points leaderboard
export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { data: leaders, error } = await supabase
      .from('users')
      .select('id, username, display_name, aura_points')
      .gt('aura_points', 0)
      .order('aura_points', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Get connection counts for each leader
    const leadersWithConnections = await Promise.all(
      (leaders || []).map(async (leader, index) => {
        const { count: connections } = await supabase
          .from('qr_connections')
          .select('*', { count: 'exact' })
          .or(`scanner_id.eq.${leader.id},referrer_id.eq.${leader.id}`);

        return {
          ...leader,
          rank: index + 1,
          connections: connections || 0
        };
      })
    );

    res.json({
      success: true,
      leaderboard: leadersWithConnections
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Swap Aura Points for Monad tokens
export const swapPointsForTokens: RequestHandler = async (req, res) => {
  try {
    const { userId, pointsToSwap, sessionToken }: SwapPointsRequest = req.body;

    if (!userId || !pointsToSwap || !sessionToken) {
      return res.status(400).json({ error: 'User ID, points to swap, and session token are required' });
    }

    if (pointsToSwap <= 0) {
      return res.status(400).json({ error: 'Points to swap must be positive' });
    }

    // Verify session
    await verifyUserSession(sessionToken, userId);

    // Get user's current points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('aura_points, wallet_address')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if ((user.aura_points || 0) < pointsToSwap) {
      return res.status(400).json({ error: 'Insufficient Aura Points' });
    }

    // Calculate token amount (e.g., 100 points = 1 MONAD token)
    const exchangeRate = 100; // 100 Aura Points = 1 MONAD
    const tokenAmount = pointsToSwap / exchangeRate;

    if (tokenAmount < 0.01) {
      return res.status(400).json({ error: 'Minimum swap is 100 Aura Points (0.01 MONAD)' });
    }

    // Deduct points from user
    const { error: updateError } = await supabase
      .from('users')
      .update({ aura_points: (user.aura_points || 0) - pointsToSwap })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Record the swap transaction
    const { error: transactionError } = await supabase
      .from('aura_point_transactions')
      .insert({
        user_id: userId,
        points: -pointsToSwap,
        reason: 'Token Swap',
        metadata: {
          tokenAmount,
          exchangeRate,
          walletAddress: user.wallet_address
        }
      });

    if (transactionError) {
      throw transactionError;
    }

    // Record token swap (for future token distribution)
    const { error: swapError } = await supabase
      .from('token_swaps')
      .insert({
        user_id: userId,
        points_swapped: pointsToSwap,
        token_amount: tokenAmount,
        wallet_address: user.wallet_address,
        status: 'pending'
      });

    if (swapError) {
      throw swapError;
    }

    res.json({
      success: true,
      swap: {
        pointsSwapped: pointsToSwap,
        tokenAmount,
        exchangeRate,
        remainingPoints: (user.aura_points || 0) - pointsToSwap
      },
      message: `Successfully swapped ${pointsToSwap} Aura Points for ${tokenAmount} MONAD tokens. Tokens will be distributed to your wallet.`
    });

  } catch (error) {
    console.error('Token swap error:', error);
    res.status(500).json({ error: 'Failed to swap points for tokens' });
  }
};

// Get user's token swap history
export const getSwapHistory: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken } = req.body;

    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }

    // Verify session
    await verifyUserSession(sessionToken, userId);

    const { data: swaps, error } = await supabase
      .from('token_swaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      swaps: swaps || []
    });

  } catch (error) {
    console.error('Swap history error:', error);
    res.status(500).json({ error: 'Failed to get swap history' });
  }
};
