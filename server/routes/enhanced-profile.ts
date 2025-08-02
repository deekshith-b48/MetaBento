import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  mode: 'professional' | 'casual';
  profile_layout: 'bento' | 'grid' | 'list';
  glassmorphism_enabled: boolean;
  background_style: 'gradient' | 'solid' | 'animated' | 'particles';
  privacy_level: 'public' | 'unlisted' | 'private';
  notifications_enabled: boolean;
  qr_scan_sound: boolean;
  profile_complete: boolean;
  onboarding_completed: boolean;
  preferred_language: string;
  timezone: string;
  settings_config: Record<string, any>;
}

interface UpdateSettingsRequest {
  userId: string;
  sessionToken: string;
  settings: Partial<UserSettings>;
}

interface GetUserByUsernameRequest {
  username: string;
  viewerUserId?: string;
}

interface UpdateProfileRequest {
  userId: string;
  sessionToken: string;
  profile: {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    is_public?: boolean;
  };
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

// Get user profile by username (for dynamic routing)
export const getUserByUsername: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    const { viewerUserId } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Get user profile with settings and level
    const { data: user, error } = await supabase
      .from('user_profile_summary')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile is public or if viewer is the owner
    const isOwner = viewerUserId && viewerUserId === user.id;
    const canView = user.is_public || isOwner;

    if (!canView) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    // Get profile cards
    let cardQuery = supabase
      .from('active_profile_cards')
      .select('*')
      .eq('user_id', user.id);

    // Filter cards based on current mode and privacy
    if (!isOwner) {
      if (user.mode === 'professional') {
        cardQuery = cardQuery.in('visibility', ['professional', 'both']);
      } else if (user.mode === 'casual') {
        cardQuery = cardQuery.in('visibility', ['casual', 'both']);
      } else {
        cardQuery = cardQuery.in('visibility', ['professional', 'casual', 'both']);
      }
    }

    const { data: cards } = await cardQuery;

    // Increment profile views if not owner
    if (!isOwner && viewerUserId) {
      await supabase
        .from('user_levels')
        .update({ profile_views: supabase.sql`profile_views + 1` })
        .eq('user_id', user.id);
    }

    res.json({
      success: true,
      user: {
        ...user,
        cards: cards || []
      }
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// Get user settings
export const getUserSettings: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionToken } = req.query;

    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken as string);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings found, create default settings
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return res.json({ success: true, settings: newSettings });
    }

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ error: 'Failed to get user settings' });
  }
};

// Update user settings
export const updateUserSettings: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken, settings }: UpdateSettingsRequest = req.body;

    if (!userId || !sessionToken || !settings) {
      return res.status(400).json({ error: 'User ID, session token, and settings are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Remove fields that shouldn't be updated directly
    const { user_id, created_at, ...allowedUpdates } = settings as any;

    // Update settings
    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
};

// Update user profile
export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken, profile }: UpdateProfileRequest = req.body;

    if (!userId || !sessionToken || !profile) {
      return res.status(400).json({ error: 'User ID, session token, and profile data are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check if username is being updated and is available
    if (profile.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', profile.username.toLowerCase())
        .neq('id', userId)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        ...profile,
        username: profile.username?.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Complete onboarding
export const completeOnboarding: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken } = req.body;

    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update onboarding status
    await supabase
      .from('user_settings')
      .update({ onboarding_completed: true })
      .eq('user_id', userId);

    // Award onboarding completion XP
    await supabase.rpc('award_user_xp', {
      target_user_id: userId,
      xp_amount: 25,
      xp_source: 'onboarding_complete'
    });

    res.json({ success: true, message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

// Toggle profile mode (professional/casual)
export const toggleProfileMode: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken, mode } = req.body;

    if (!userId || !sessionToken || !mode) {
      return res.status(400).json({ error: 'User ID, session token, and mode are required' });
    }

    if (!['professional', 'casual'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be either professional or casual' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update user mode
    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .update({ mode })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, mode, settings: updatedSettings });
  } catch (error) {
    console.error('Toggle profile mode error:', error);
    res.status(500).json({ error: 'Failed to toggle profile mode' });
  }
};

// Get profile completion status
export const getProfileCompletion: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionToken } = req.query;

    if (!userId || !sessionToken) {
      return res.status(400).json({ error: 'User ID and session token are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken as string);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username, display_name, bio, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    // Get user cards count
    const { count: cardsCount, error: cardsError } = await supabase
      .from('profile_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (cardsError) {
      throw cardsError;
    }

    // Calculate completion percentage
    let completionScore = 0;
    const tasks = [
      { name: 'username', completed: !!user.username, weight: 20 },
      { name: 'display_name', completed: !!user.display_name, weight: 15 },
      { name: 'bio', completed: !!user.bio, weight: 15 },
      { name: 'avatar', completed: !!user.avatar_url, weight: 20 },
      { name: 'cards', completed: (cardsCount || 0) >= 3, weight: 30 }
    ];

    tasks.forEach(task => {
      if (task.completed) {
        completionScore += task.weight;
      }
    });

    const isComplete = completionScore >= 80;

    // Update profile complete status if needed
    if (isComplete) {
      await supabase
        .from('user_settings')
        .update({ profile_complete: true })
        .eq('user_id', userId);
    }

    res.json({
      success: true,
      completion: {
        score: completionScore,
        isComplete,
        tasks: tasks.map(task => ({
          name: task.name,
          completed: task.completed,
          weight: task.weight
        }))
      }
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({ error: 'Failed to get profile completion status' });
  }
};
