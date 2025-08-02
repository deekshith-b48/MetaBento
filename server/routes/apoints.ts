import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface CreateConnectionRequest {
  fromUserId: string;
  toUserId: string;
  connectionType?: 'qr_scan' | 'manual' | 'event';
  sessionToken: string;
}

interface GetLeaderboardRequest {
  limit?: number;
  period?: 'all' | 'month' | 'week';
}

interface AwardPointsRequest {
  userId: string;
  points: number;
  transactionType: 'connection' | 'daily_bonus' | 'achievement' | 'admin';
  description: string;
  referenceId?: string;
  sessionToken: string;
}

// Verify session and get user
async function verifySessionAndGetUser(sessionToken: string) {
  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select('user_id, wallet_address')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return null;
  }

  return session;
}

// Create connection between users
export const createConnection: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toUserId, connectionType = 'qr_scan', sessionToken }: CreateConnectionRequest = req.body;

    if (!fromUserId || !toUserId || !sessionToken) {
      return res.status(400).json({ error: 'From user ID, to user ID, and session token are required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Verify session
    const session = await verifySessionAndGetUser(sessionToken);
    if (!session || session.user_id !== fromUserId) {
      return res.status(401).json({ error: 'Invalid or unauthorized session' });
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id')
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
      .single();

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    // Get both users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, a_points, total_connections')
      .in('id', [fromUserId, toUserId]);

    if (usersError || !users || users.length !== 2) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
      return res.status(400).json({ error: 'Users not found' });
    }

    // Calculate A-Points based on connection type and user activity
    let pointsAwarded = 10; // Base points
    if (connectionType === 'qr_scan') {
      pointsAwarded = 15; // Bonus for QR scanning
    }
    
    // Bonus for first connections
    if (fromUser.total_connections === 0) {
      pointsAwarded += 25; // First connection bonus
    }

    // Start transaction
    const { data: connection, error: connectionError } = await supabase
      .from('user_connections')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        connection_type: connectionType,
        a_points_awarded: pointsAwarded,
        metadata: {
          from_user_name: fromUser.display_name,
          to_user_name: toUser.display_name,
        }
      })
      .select('*')
      .single();

    if (connectionError) {
      throw connectionError;
    }

    // Create reverse connection for mutual relationship
    await supabase
      .from('user_connections')
      .insert({
        from_user_id: toUserId,
        to_user_id: fromUserId,
        connection_type: connectionType,
        a_points_awarded: pointsAwarded,
        metadata: {
          from_user_name: toUser.display_name,
          to_user_name: fromUser.display_name,
        }
      });

    // Award A-Points to both users
    const promises = [
      // Update from user
      supabase
        .from('users')
        .update({ 
          a_points: fromUser.a_points + pointsAwarded,
          total_connections: fromUser.total_connections + 1
        })
        .eq('id', fromUserId),
      
      // Update to user
      supabase
        .from('users')
        .update({ 
          a_points: toUser.a_points + pointsAwarded,
          total_connections: toUser.total_connections + 1
        })
        .eq('id', toUserId),

      // Log transactions
      supabase
        .from('a_points_transactions')
        .insert([
          {
            user_id: fromUserId,
            points_change: pointsAwarded,
            transaction_type: 'connection',
            description: `Connected with ${toUser.display_name}`,
            reference_id: connection.id,
            metadata: { connection_type: connectionType }
          },
          {
            user_id: toUserId,
            points_change: pointsAwarded,
            transaction_type: 'connection',
            description: `Connected with ${fromUser.display_name}`,
            reference_id: connection.id,
            metadata: { connection_type: connectionType }
          }
        ])
    ];

    await Promise.all(promises);

    // Check for achievements
    if (fromUser.total_connections === 0) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id: fromUserId,
          achievement_type: 'first_connection',
          achievement_name: 'First Connection',
          achievement_description: 'Made your first professional connection',
          points_awarded: 25
        });
    }

    res.json({
      success: true,
      connection: connection,
      pointsAwarded,
      message: `Successfully connected! Both users earned ${pointsAwarded} A-Points.`,
      fromUser: {
        id: fromUserId,
        newPoints: fromUser.a_points + pointsAwarded,
        newConnections: fromUser.total_connections + 1
      },
      toUser: {
        id: toUserId,
        newPoints: toUser.a_points + pointsAwarded,
        newConnections: toUser.total_connections + 1
      }
    });

  } catch (error) {
    console.error('Create connection error:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
};

// Get user's A-Points and stats
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user with stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, display_name, a_points, total_connections, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('a_points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get achievements
    const { data: achievements, error: achError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    // Get connections count this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: recentConnections, error: connError } = await supabase
      .from('user_connections')
      .select('id')
      .eq('from_user_id', userId)
      .gte('created_at', weekAgo.toISOString());

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        aPoints: user.a_points,
        totalConnections: user.total_connections,
        memberSince: user.created_at,
        connectionsThisWeek: recentConnections?.length || 0
      },
      recentTransactions: transactions || [],
      achievements: achievements || [],
      stats: {
        rank: 0, // TODO: Calculate rank
        pointsThisWeek: transactions?.filter(t => 
          new Date(t.created_at) > weekAgo && t.points_change > 0
        ).reduce((sum, t) => sum + t.points_change, 0) || 0
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
};

// Get leaderboard
export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { limit = 50, period = 'all' } = req.query as GetLeaderboardRequest;

    // Get top users by A-Points
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, a_points, total_connections, avatar_url')
      .order('a_points', { ascending: false })
      .limit(Number(limit));

    if (usersError) {
      throw usersError;
    }

    const leaderboard = users?.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      aPoints: user.a_points,
      totalConnections: user.total_connections,
      avatarUrl: user.avatar_url
    })) || [];

    res.json({
      leaderboard,
      period,
      totalUsers: users?.length || 0
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Get user's connections
export const getUserConnections: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionToken } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify session if provided (for private data)
    let isOwnProfile = false;
    if (sessionToken) {
      const session = await verifySessionAndGetUser(sessionToken as string);
      isOwnProfile = session?.user_id === userId;
    }

    // Get connections
    const { data: connections, error: connError } = await supabase
      .from('user_connections')
      .select(`
        id,
        to_user_id,
        connection_type,
        a_points_awarded,
        created_at,
        to_user:users!user_connections_to_user_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          is_public
        )
      `)
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    if (connError) {
      throw connError;
    }

    // Filter based on privacy settings
    const filteredConnections = connections?.filter(conn => 
      isOwnProfile || conn.to_user.is_public
    ).map(conn => ({
      id: conn.id,
      user: {
        id: conn.to_user.id,
        username: conn.to_user.username,
        displayName: conn.to_user.display_name,
        avatarUrl: conn.to_user.avatar_url
      },
      connectionType: conn.connection_type,
      pointsAwarded: conn.a_points_awarded,
      connectedAt: conn.created_at
    })) || [];

    res.json({
      connections: filteredConnections,
      totalConnections: filteredConnections.length
    });

  } catch (error) {
    console.error('Get user connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
};

// Award points manually (admin function)
export const awardPoints: RequestHandler = async (req, res) => {
  try {
    const { userId, points, transactionType, description, referenceId, sessionToken }: AwardPointsRequest = req.body;

    if (!userId || !points || !transactionType || !description || !sessionToken) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify admin session (for now, just verify valid session)
    const session = await verifySessionAndGetUser(sessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('a_points')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user points
    const newPoints = Math.max(0, user.a_points + points); // Prevent negative points

    const promises = [
      supabase
        .from('users')
        .update({ a_points: newPoints })
        .eq('id', userId),
      
      supabase
        .from('a_points_transactions')
        .insert({
          user_id: userId,
          points_change: points,
          transaction_type: transactionType,
          description,
          reference_id: referenceId
        })
    ];

    await Promise.all(promises);

    res.json({
      success: true,
      newPoints,
      pointsChange: points,
      message: `Successfully ${points > 0 ? 'awarded' : 'deducted'} ${Math.abs(points)} A-Points`
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
};
