-- Enhanced MetaBento Database Schema for Advanced Features
-- Run this after the base schema.sql to add new features

-- Profile Cards Table for Bento Grid System
CREATE TABLE profile_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Icon name/class from lucide-react or similar
    link TEXT,
    card_type TEXT NOT NULL CHECK (card_type IN ('social', 'professional', 'project', 'contact', 'custom')),
    platform TEXT, -- 'linkedin', 'github', 'twitter', 'email', etc.
    visibility TEXT DEFAULT 'both' CHECK (visibility IN ('professional', 'casual', 'both', 'private')),
    order_index INTEGER DEFAULT 0,
    style_config JSONB DEFAULT '{}', -- Custom styling, colors, glassmorphism settings
    metadata JSONB DEFAULT '{}', -- Additional platform-specific data
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table for Themes, Modes, and Preferences
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    mode TEXT DEFAULT 'professional' CHECK (mode IN ('professional', 'casual')),
    profile_layout TEXT DEFAULT 'bento' CHECK (profile_layout IN ('bento', 'grid', 'list')),
    glassmorphism_enabled BOOLEAN DEFAULT TRUE,
    background_style TEXT DEFAULT 'gradient' CHECK (background_style IN ('gradient', 'solid', 'animated', 'particles')),
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'unlisted', 'private')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    qr_scan_sound BOOLEAN DEFAULT TRUE,
    profile_complete BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    settings_config JSONB DEFAULT '{}', -- Extended configuration options
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced A-Points System with Levels and Achievements
CREATE TABLE user_levels (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    next_level_xp INTEGER DEFAULT 100,
    level_name TEXT DEFAULT 'Newcomer',
    prestige_level INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    connections_made INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    qr_scans_performed INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Code Activity Log
CREATE TABLE qr_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scanner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scanned_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scan_type TEXT DEFAULT 'profile' CHECK (scan_type IN ('profile', 'card', 'event')),
    location_data JSONB, -- Optional location tracking
    device_info JSONB, -- Browser/device information
    interaction_type TEXT DEFAULT 'view' CHECK (interaction_type IN ('view', 'connect', 'save')),
    xp_awarded INTEGER DEFAULT 5,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events and Networking Sessions
CREATE TABLE networking_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_description TEXT,
    event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'conference', 'workshop', 'hackathon', 'networking')),
    organizer_id UUID REFERENCES users(id),
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    entry_code TEXT UNIQUE, -- Special QR code for event entry
    xp_multiplier DECIMAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Participation Tracking
CREATE TABLE event_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES networking_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connections_made INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    participation_type TEXT DEFAULT 'attendee' CHECK (participation_type IN ('attendee', 'speaker', 'organizer', 'sponsor')),
    UNIQUE(event_id, user_id)
);

-- Notification System
CREATE TABLE user_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('connection_request', 'level_up', 'achievement', 'event_invite', 'profile_view', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced Indexes for Performance
CREATE INDEX idx_profile_cards_user_id ON profile_cards(user_id);
CREATE INDEX idx_profile_cards_visibility ON profile_cards(visibility);
CREATE INDEX idx_profile_cards_order ON profile_cards(user_id, order_index);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_levels_level ON user_levels(current_level);
CREATE INDEX idx_user_levels_xp ON user_levels(total_xp);
CREATE INDEX idx_qr_activities_scanner ON qr_activities(scanner_user_id);
CREATE INDEX idx_qr_activities_scanned ON qr_activities(scanned_user_id);
CREATE INDEX idx_qr_activities_timestamp ON qr_activities(scan_timestamp);
CREATE INDEX idx_networking_events_active ON networking_events(is_active);
CREATE INDEX idx_networking_events_time ON networking_events(start_time);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);
CREATE INDEX idx_notifications_user_unread ON user_notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON user_notifications(created_at);

-- Enhanced Row Level Security Policies

-- Profile Cards Policies
ALTER TABLE profile_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile cards" ON profile_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = profile_cards.user_id 
            AND auth.uid()::text = users.id::text
        )
    );

CREATE POLICY "Public profile cards are viewable by everyone" ON profile_cards
    FOR SELECT USING (
        visibility IN ('professional', 'casual', 'both') AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = profile_cards.user_id 
            AND users.is_public = true
        )
    );

-- User Settings Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid()::text = user_id::text);

-- User Levels Policies
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own levels" ON user_levels
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Public levels are viewable" ON user_levels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_levels.user_id 
            AND users.is_public = true
        )
    );

-- QR Activities Policies
ALTER TABLE qr_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view QR activities involving them" ON qr_activities
    FOR SELECT USING (
        auth.uid()::text = scanner_user_id::text OR
        auth.uid()::text = scanned_user_id::text
    );

-- Networking Events Policies
ALTER TABLE networking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active events" ON networking_events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Organizers can manage own events" ON networking_events
    FOR ALL USING (auth.uid()::text = organizer_id::text);

-- Event Participants Policies
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view event participation" ON event_participants
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR
        EXISTS (
            SELECT 1 FROM networking_events 
            WHERE networking_events.id = event_participants.event_id 
            AND auth.uid()::text = networking_events.organizer_id::text
        )
    );

-- Notifications Policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON user_notifications
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Enhanced Functions and Triggers

-- Function to calculate next level XP requirement
CREATE OR REPLACE FUNCTION calculate_next_level_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Exponential XP curve: base * (level ^ 1.5) * 50
    RETURN FLOOR(100 * (POWER(current_level, 1.5)) * 1.2);
END;
$$ LANGUAGE plpgsql;

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
    level_name TEXT;
BEGIN
    -- Calculate new level based on total XP
    new_level := FLOOR(SQRT(NEW.total_xp / 50)) + 1;
    
    -- Determine level name
    CASE 
        WHEN new_level <= 5 THEN level_name := 'Newcomer';
        WHEN new_level <= 10 THEN level_name := 'Networker';
        WHEN new_level <= 20 THEN level_name := 'Connector';
        WHEN new_level <= 35 THEN level_name := 'Influencer';
        WHEN new_level <= 50 THEN level_name := 'Ambassador';
        ELSE level_name := 'Legend';
    END CASE;
    
    -- Update level if it changed
    IF new_level > NEW.current_level THEN
        NEW.current_level := new_level;
        NEW.level_name := level_name;
        NEW.next_level_xp := calculate_next_level_xp(new_level);
        
        -- Create level up notification
        INSERT INTO user_notifications (user_id, notification_type, title, message, data)
        VALUES (
            NEW.user_id,
            'level_up',
            'Level Up!',
            'Congratulations! You reached level ' || new_level || ' (' || level_name || ')',
            jsonb_build_object('new_level', new_level, 'level_name', level_name)
        );
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic level updates
CREATE TRIGGER update_user_level_trigger
    BEFORE UPDATE ON user_levels
    FOR EACH ROW
    WHEN (OLD.total_xp != NEW.total_xp)
    EXECUTE FUNCTION update_user_level();

-- Function to award XP and update user levels
CREATE OR REPLACE FUNCTION award_user_xp(target_user_id UUID, xp_amount INTEGER, xp_source TEXT DEFAULT 'manual')
RETURNS BOOLEAN AS $$
BEGIN
    -- Update user's A-Points
    UPDATE users 
    SET a_points = a_points + xp_amount
    WHERE id = target_user_id;
    
    -- Update user levels (this will trigger level calculation)
    INSERT INTO user_levels (user_id, current_xp, total_xp)
    VALUES (target_user_id, xp_amount, xp_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        current_xp = user_levels.current_xp + xp_amount,
        total_xp = user_levels.total_xp + xp_amount;
    
    -- Log the XP transaction
    INSERT INTO a_points_transactions (user_id, points_change, transaction_type, description)
    VALUES (target_user_id, xp_amount, xp_source, 'XP awarded: ' || xp_source);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM user_notifications 
    WHERE expires_at < NOW() 
       OR (created_at < NOW() - INTERVAL '30 days' AND is_read = true);
END;
$$ LANGUAGE plpgsql;

-- Insert default settings for existing users
INSERT INTO user_settings (user_id)
SELECT id FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
);

-- Insert default levels for existing users
INSERT INTO user_levels (user_id, total_xp)
SELECT id, COALESCE(a_points, 0) FROM users 
WHERE NOT EXISTS (
    SELECT 1 FROM user_levels WHERE user_levels.user_id = users.id
);

-- Add helpful views for common queries

-- User Profile Summary View
CREATE VIEW user_profile_summary AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.avatar_url,
    u.is_public,
    us.theme,
    us.mode,
    us.profile_layout,
    ul.current_level,
    ul.level_name,
    ul.total_xp,
    u.total_connections,
    u.created_at
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
LEFT JOIN user_levels ul ON u.id = ul.user_id;

-- Active Profile Cards View
CREATE VIEW active_profile_cards AS
SELECT 
    pc.*,
    u.username,
    u.is_public
FROM profile_cards pc
JOIN users u ON pc.user_id = u.id
WHERE pc.is_active = true
ORDER BY pc.user_id, pc.order_index;

-- Leaderboard View
CREATE VIEW xp_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    ul.current_level,
    ul.level_name,
    ul.total_xp,
    u.total_connections,
    ROW_NUMBER() OVER (ORDER BY ul.total_xp DESC) as rank
FROM users u
JOIN user_levels ul ON u.id = ul.user_id
WHERE u.is_public = true
ORDER BY ul.total_xp DESC;
