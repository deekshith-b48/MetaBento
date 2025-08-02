import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface QRConnectionRequest {
  scannerUserId: string;
  scannedUserId: string;
  sessionToken: string;
  scanType?: 'profile' | 'card' | 'event';
  locationData?: Record<string, any>;
  deviceInfo?: Record<string, any>;
}

interface AwardXPRequest {
  userId: string;
  amount: number;
  source: string;
  description?: string;
  sessionToken: string;
}

interface EventCheckInRequest {
  userId: string;
  eventCode: string;
  sessionToken: string;
}

// Verify session and get user ID
async function verifySession(sessionToken: string): Promise<string | null> {
  try {
    const { data: session, error } = await supabase
      .from('auth_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    return session.user_id;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

// Process QR code scan and award points
export const processQRConnection: RequestHandler = async (req, res) => {
  try {
    const {
      scannerUserId,
      scannedUserId,
      sessionToken,
      scanType = 'profile',
      locationData,
      deviceInfo
    }: QRConnectionRequest = req.body;

    if (!scannerUserId || !scannedUserId || !sessionToken) {
      return res.status(400).json({ error: 'Scanner ID, scanned user ID, and session token are required' });
    }

    if (scannerUserId === scannedUserId) {
      return res.status(400).json({ error: 'Cannot scan your own QR code' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== scannerUserId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check if users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name')
      .in('id', [scannerUserId, scannedUserId]);

    if (usersError || !users || users.length !== 2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const scanner = users.find(u => u.id === scannerUserId);
    const scanned = users.find(u => u.id === scannedUserId);

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id')
      .or(`and(from_user_id.eq.${scannerUserId},to_user_id.eq.${scannedUserId}),and(from_user_id.eq.${scannedUserId},to_user_id.eq.${scannerUserId})`)
      .single();

    let isNewConnection = !existingConnection;
    let connectionXP = 0;
    let scanXP = 5; // Base XP for scanning

    // Log the QR activity
    const { error: activityError } = await supabase
      .from('qr_activities')
      .insert({
        scanner_user_id: scannerUserId,
        scanned_user_id: scannedUserId,
        scan_type: scanType,
        location_data: locationData,
        device_info: deviceInfo,
        interaction_type: isNewConnection ? 'connect' : 'view',
        xp_awarded: scanXP
      });

    if (activityError) {
      console.error('QR activity log error:', activityError);
    }

    // Create new connection if it doesn't exist
    if (isNewConnection) {
      connectionXP = 15; // Bonus XP for new connection

      // Create bidirectional connection
      const { error: connectionError } = await supabase
        .from('user_connections')
        .insert([
          {
            from_user_id: scannerUserId,
            to_user_id: scannedUserId,
            connection_type: 'qr_scan',
            a_points_awarded: connectionXP
          },
          {
            from_user_id: scannedUserId,
            to_user_id: scannerUserId,
            connection_type: 'qr_scan',
            a_points_awarded: connectionXP
          }
        ]);

      if (connectionError) {
        throw connectionError;
      }

      // Update connection counts
      await supabase
        .from('users')
        .update({ total_connections: supabase.sql`total_connections + 1` })
        .in('id', [scannerUserId, scannedUserId]);

      // Update user level stats
      await supabase
        .from('user_levels')
        .update({ connections_made: supabase.sql`connections_made + 1` })
        .in('user_id', [scannerUserId, scannedUserId]);
    }

    // Award XP to scanner
    const totalXP = scanXP + connectionXP;
    await supabase.rpc('award_user_xp', {
      target_user_id: scannerUserId,
      xp_amount: totalXP,
      xp_source: isNewConnection ? 'new_connection' : 'qr_scan'
    });

    // Award connection XP to scanned user if new connection
    if (isNewConnection) {
      await supabase.rpc('award_user_xp', {
        target_user_id: scannedUserId,
        xp_amount: connectionXP,
        xp_source: 'new_connection'
      });
    }

    // Update scan count
    await supabase
      .from('user_levels')
      .update({ qr_scans_performed: supabase.sql`qr_scans_performed + 1` })
      .eq('user_id', scannerUserId);

    res.json({
      success: true,
      isNewConnection,
      xpAwarded: totalXP,
      scannedUser: {
        id: scanned?.id,
        username: scanned?.username,
        displayName: scanned?.display_name
      },
      message: isNewConnection 
        ? `New connection with ${scanned?.display_name || scanned?.username}! You both earned ${connectionXP} XP.`
        : `QR scan completed. You earned ${scanXP} XP.`
    });
  } catch (error) {
    console.error('Process QR connection error:', error);
    res.status(500).json({ error: 'Failed to process QR connection' });
  }
};

// Get user's XP and level information
export const getUserXPInfo: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: userLevel, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create default level if doesn't exist
      const { data: newLevel, error: createError } = await supabase
        .from('user_levels')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return res.json({ success: true, level: newLevel });
    }

    res.json({ success: true, level: userLevel });
  } catch (error) {
    console.error('Get user XP info error:', error);
    res.status(500).json({ error: 'Failed to get user XP information' });
  }
};

// Get leaderboard
export const getXPLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: leaderboard, error } = await supabase
      .from('xp_leaderboard')
      .select('*')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({ success: true, leaderboard: leaderboard || [] });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Award XP manually (admin function)
export const awardXP: RequestHandler = async (req, res) => {
  try {
    const { userId, amount, source, description, sessionToken }: AwardXPRequest = req.body;

    if (!userId || !amount || !source || !sessionToken) {
      return res.status(400).json({ error: 'User ID, amount, source, and session token are required' });
    }

    // Verify session (could add admin check here)
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Award XP
    const success = await supabase.rpc('award_user_xp', {
      target_user_id: userId,
      xp_amount: amount,
      xp_source: source
    });

    if (!success) {
      throw new Error('Failed to award XP');
    }

    res.json({ success: true, message: `Awarded ${amount} XP for ${source}` });
  } catch (error) {
    console.error('Award XP error:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
};

// Get user's recent connections
export const getUserConnections: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: connections, error } = await supabase
      .from('user_connections')
      .select(`
        id,
        to_user_id,
        connection_type,
        a_points_awarded,
        created_at,
        to_user:users!user_connections_to_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({ success: true, connections: connections || [] });
  } catch (error) {
    console.error('Get user connections error:', error);
    res.status(500).json({ error: 'Failed to get user connections' });
  }
};

// Get user's QR scan history
export const getQRScanHistory: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: scans, error } = await supabase
      .from('qr_activities')
      .select(`
        id,
        scanned_user_id,
        scan_type,
        interaction_type,
        xp_awarded,
        scan_timestamp,
        scanned_user:users!qr_activities_scanned_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('scanner_user_id', userId)
      .order('scan_timestamp', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({ success: true, scans: scans || [] });
  } catch (error) {
    console.error('Get QR scan history error:', error);
    res.status(500).json({ error: 'Failed to get QR scan history' });
  }
};

// Check in to networking event
export const checkInToEvent: RequestHandler = async (req, res) => {
  try {
    const { userId, eventCode, sessionToken }: EventCheckInRequest = req.body;

    if (!userId || !eventCode || !sessionToken) {
      return res.status(400).json({ error: 'User ID, event code, and session token are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Find active event by entry code
    const { data: event, error: eventError } = await supabase
      .from('networking_events')
      .select('*')
      .eq('entry_code', eventCode)
      .eq('is_active', true)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }

    // Check if event is currently running
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (now < startTime || now > endTime) {
      return res.status(400).json({ error: 'Event is not currently active' });
    }

    // Check if user is already checked in
    const { data: existingParticipation } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', userId)
      .single();

    if (existingParticipation) {
      return res.status(400).json({ error: 'Already checked in to this event' });
    }

    // Check capacity
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return res.status(400).json({ error: 'Event is at capacity' });
    }

    // Check in user
    const { error: checkinError } = await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        user_id: userId,
        participation_type: 'attendee'
      });

    if (checkinError) {
      throw checkinError;
    }

    // Update event participant count
    await supabase
      .from('networking_events')
      .update({ current_participants: supabase.sql`current_participants + 1` })
      .eq('id', event.id);

    // Award event check-in XP
    const eventXP = Math.floor(10 * (event.xp_multiplier || 1));
    await supabase.rpc('award_user_xp', {
      target_user_id: userId,
      xp_amount: eventXP,
      xp_source: 'event_checkin'
    });

    res.json({
      success: true,
      event: {
        id: event.id,
        name: event.event_name,
        type: event.event_type,
        location: event.location
      },
      xpAwarded: eventXP,
      message: `Successfully checked in to ${event.event_name}! You earned ${eventXP} XP.`
    });
  } catch (error) {
    console.error('Event check-in error:', error);
    res.status(500).json({ error: 'Failed to check in to event' });
  }
};

// Get user's achievements
export const getUserAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ success: true, achievements: achievements || [] });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ error: 'Failed to get user achievements' });
  }
};
