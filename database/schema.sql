-- W3Connect Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - core user data
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT, -- Optional for wallet-only auth
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    ens_name TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    default_mode TEXT DEFAULT 'professional' CHECK (default_mode IN ('professional', 'casual')),
    a_points INTEGER DEFAULT 100, -- Starting points for new users
    total_connections INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_auth_method CHECK (wallet_address IS NOT NULL OR email IS NOT NULL)
);

-- User profiles/links table - social media and professional links
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'linkedin', 'github', 'twitter', etc.
    username TEXT NOT NULL,
    url TEXT NOT NULL,
    profile_type TEXT DEFAULT 'both' CHECK (profile_type IN ('professional', 'casual', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Auth nonces table - for wallet signature verification
CREATE TABLE auth_nonces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    nonce TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auth sessions table - for managing user sessions
CREATE TABLE auth_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User connections table - for QR-based networking
CREATE TABLE user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'qr_scan' CHECK (connection_type IN ('qr_scan', 'manual', 'event')),
    a_points_awarded INTEGER DEFAULT 10,
    metadata JSONB, -- For storing additional connection context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id), -- Prevent duplicate connections
    CHECK (from_user_id != to_user_id) -- Prevent self-connections
);

-- A-Points transaction log
CREATE TABLE a_points_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL, -- Positive for gains, negative for spending
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('connection', 'daily_bonus', 'achievement', 'spent', 'admin')),
    description TEXT,
    reference_id UUID, -- Reference to connection, achievement, etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_connection', 'networker', 'early_adopter', 'influencer', 'collector')),
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_a_points ON users(a_points);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_auth_nonces_wallet_address ON auth_nonces(wallet_address);
CREATE INDEX idx_auth_nonces_nonce ON auth_nonces(nonce);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_user_connections_from_user ON user_connections(from_user_id);
CREATE INDEX idx_user_connections_to_user ON user_connections(to_user_id);
CREATE INDEX idx_user_connections_created_at ON user_connections(created_at);
CREATE INDEX idx_a_points_transactions_user_id ON a_points_transactions(user_id);
CREATE INDEX idx_a_points_transactions_type ON a_points_transactions(transaction_type);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE a_points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (is_public = true);

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- User profiles policies
CREATE POLICY "Public user profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_profiles.user_id 
            AND users.is_public = true
        )
    );

CREATE POLICY "Users can manage own profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_profiles.user_id 
            AND auth.uid()::text = users.id::text
        )
    );

-- Auth sessions policies
CREATE POLICY "Users can view own sessions" ON auth_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON auth_sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- User connections policies
CREATE POLICY "Users can view connections involving them" ON user_connections
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can create connections" ON user_connections
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

-- A-Points transactions policies
CREATE POLICY "Users can view own transactions" ON a_points_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired nonces
CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_nonces WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_sessions WHERE expires_at < NOW();
END;
$$ language 'plpgsql';
