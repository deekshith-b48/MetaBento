import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
interface ProfileCard {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  icon?: string;
  link?: string;
  card_type: 'social' | 'professional' | 'project' | 'contact' | 'custom';
  platform?: string;
  visibility: 'professional' | 'casual' | 'both' | 'private';
  order_index: number;
  style_config?: Record<string, any>;
  metadata?: Record<string, any>;
  is_featured?: boolean;
  is_active?: boolean;
}

interface CreateCardRequest {
  userId: string;
  sessionToken: string;
  card: Omit<ProfileCard, 'id' | 'user_id'>;
}

interface UpdateCardRequest {
  cardId: string;
  sessionToken: string;
  updates: Partial<ProfileCard>;
}

interface ReorderCardsRequest {
  userId: string;
  sessionToken: string;
  cardOrders: Array<{ id: string; order_index: number }>;
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

// Get profile cards for a user
export const getUserCards: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mode, includePrivate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let query = supabase
      .from('profile_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    // Filter by visibility based on mode
    if (mode && !includePrivate) {
      if (mode === 'professional') {
        query = query.in('visibility', ['professional', 'both']);
      } else if (mode === 'casual') {
        query = query.in('visibility', ['casual', 'both']);
      } else {
        query = query.in('visibility', ['professional', 'casual', 'both']);
      }
    } else if (!includePrivate) {
      query = query.neq('visibility', 'private');
    }

    const { data: cards, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ success: true, cards: cards || [] });
  } catch (error) {
    console.error('Get user cards error:', error);
    res.status(500).json({ error: 'Failed to get profile cards' });
  }
};

// Create a new profile card
export const createCard: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken, card }: CreateCardRequest = req.body;

    if (!userId || !sessionToken || !card) {
      return res.status(400).json({ error: 'User ID, session token, and card data are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Validate required card fields
    if (!card.title || !card.card_type || !card.visibility) {
      return res.status(400).json({ error: 'Title, card type, and visibility are required' });
    }

    // Get the next order index
    const { data: existingCards } = await supabase
      .from('profile_cards')
      .select('order_index')
      .eq('user_id', userId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingCards && existingCards.length > 0 
      ? existingCards[0].order_index + 1 
      : 0;

    // Create the card
    const { data: newCard, error } = await supabase
      .from('profile_cards')
      .insert({
        user_id: userId,
        ...card,
        order_index: card.order_index ?? nextOrderIndex,
        style_config: card.style_config || {},
        metadata: card.metadata || {},
        is_featured: card.is_featured || false,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Award XP for card creation
    await supabase.rpc('award_user_xp', {
      target_user_id: userId,
      xp_amount: 5,
      xp_source: 'card_creation'
    });

    res.json({ success: true, card: newCard });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create profile card' });
  }
};

// Update an existing profile card
export const updateCard: RequestHandler = async (req, res) => {
  try {
    const { cardId, sessionToken, updates }: UpdateCardRequest = req.body;

    if (!cardId || !sessionToken || !updates) {
      return res.status(400).json({ error: 'Card ID, session token, and updates are required' });
    }

    // Get the card to verify ownership
    const { data: existingCard, error: fetchError } = await supabase
      .from('profile_cards')
      .select('user_id')
      .eq('id', cardId)
      .single();

    if (fetchError || !existingCard) {
      return res.status(404).json({ error: 'Profile card not found' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== existingCard.user_id) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Remove fields that shouldn't be updated directly
    const { user_id, id, created_at, ...allowedUpdates } = updates;

    // Update the card
    const { data: updatedCard, error } = await supabase
      .from('profile_cards')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, card: updatedCard });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update profile card' });
  }
};

// Delete a profile card
export const deleteCard: RequestHandler = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { sessionToken } = req.body;

    if (!cardId || !sessionToken) {
      return res.status(400).json({ error: 'Card ID and session token are required' });
    }

    // Get the card to verify ownership
    const { data: existingCard, error: fetchError } = await supabase
      .from('profile_cards')
      .select('user_id')
      .eq('id', cardId)
      .single();

    if (fetchError || !existingCard) {
      return res.status(404).json({ error: 'Profile card not found' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== existingCard.user_id) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Soft delete the card
    const { error } = await supabase
      .from('profile_cards')
      .update({ is_active: false })
      .eq('id', cardId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Profile card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete profile card' });
  }
};

// Reorder profile cards
export const reorderCards: RequestHandler = async (req, res) => {
  try {
    const { userId, sessionToken, cardOrders }: ReorderCardsRequest = req.body;

    if (!userId || !sessionToken || !cardOrders || !Array.isArray(cardOrders)) {
      return res.status(400).json({ error: 'User ID, session token, and card orders array are required' });
    }

    // Verify session
    const verifiedUserId = await verifySession(sessionToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update each card's order index
    const updatePromises = cardOrders.map(({ id, order_index }) =>
      supabase
        .from('profile_cards')
        .update({ order_index })
        .eq('id', id)
        .eq('user_id', userId) // Additional security check
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Cards reordered successfully' });
  } catch (error) {
    console.error('Reorder cards error:', error);
    res.status(500).json({ error: 'Failed to reorder profile cards' });
  }
};

// Get card templates/suggestions
export const getCardTemplates: RequestHandler = async (req, res) => {
  try {
    const templates = [
      {
        title: 'LinkedIn Profile',
        description: 'Professional networking',
        icon: 'linkedin',
        card_type: 'professional',
        platform: 'linkedin',
        visibility: 'professional',
        style_config: { color: '#0077B5', glassmorphism: true }
      },
      {
        title: 'GitHub',
        description: 'Code repositories',
        icon: 'github',
        card_type: 'professional',
        platform: 'github',
        visibility: 'both',
        style_config: { color: '#333333', glassmorphism: true }
      },
      {
        title: 'Twitter',
        description: 'Social updates',
        icon: 'twitter',
        card_type: 'social',
        platform: 'twitter',
        visibility: 'casual',
        style_config: { color: '#1DA1F2', glassmorphism: true }
      },
      {
        title: 'Portfolio Website',
        description: 'Personal projects',
        icon: 'globe',
        card_type: 'project',
        platform: 'website',
        visibility: 'both',
        style_config: { color: '#6366F1', glassmorphism: true }
      },
      {
        title: 'Email Contact',
        description: 'Professional email',
        icon: 'mail',
        card_type: 'contact',
        platform: 'email',
        visibility: 'professional',
        style_config: { color: '#EF4444', glassmorphism: true }
      },
      {
        title: 'Discord',
        description: 'Gaming & communities',
        icon: 'message-circle',
        card_type: 'social',
        platform: 'discord',
        visibility: 'casual',
        style_config: { color: '#5865F2', glassmorphism: true }
      }
    ];

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get card templates error:', error);
    res.status(500).json({ error: 'Failed to get card templates' });
  }
};

// Get popular card types
export const getPopularCards: RequestHandler = async (req, res) => {
  try {
    const { data: popularCards, error } = await supabase
      .from('profile_cards')
      .select('card_type, platform, COUNT(*) as usage_count')
      .eq('is_active', true)
      .neq('visibility', 'private')
      .group('card_type, platform')
      .order('usage_count', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    res.json({ success: true, popularCards: popularCards || [] });
  } catch (error) {
    console.error('Get popular cards error:', error);
    res.status(500).json({ error: 'Failed to get popular cards' });
  }
};
