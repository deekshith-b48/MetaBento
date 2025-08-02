-- MetaBento Aura Points System Database Schema
-- Additional tables for the Aura Points and token swap system

-- Update users table to include aura_points
ALTER TABLE users ADD COLUMN IF NOT EXISTS aura_points INTEGER DEFAULT 100;

-- QR Connections table - tracks referral connections
CREATE TABLE IF NOT EXISTS qr_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scanner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 10,
    metadata JSONB,
    UNIQUE(scanner_id, referrer_id),
    CHECK (scanner_id != referrer_id)
);

-- Aura Points transaction log (replaces a_points_transactions)
CREATE TABLE IF NOT EXISTS aura_point_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Positive for gains, negative for spending
    reason TEXT NOT NULL, -- 'QR Connection - Scanner', 'QR Connection - Referrer', 'Token Swap', etc.
    connection_id UUID REFERENCES qr_connections(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token swaps table - tracks Aura Points to Monad token exchanges
CREATE TABLE IF NOT EXISTS token_swaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points_swapped INTEGER NOT NULL,
    token_amount DECIMAL(18, 8) NOT NULL, -- Monad token amount with 8 decimal precision
    wallet_address TEXT NOT NULL,
    exchange_rate INTEGER DEFAULT 100, -- Points per token (100 points = 1 token)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_hash TEXT, -- Blockchain transaction hash when completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Aura Points achievements/milestones
CREATE TABLE IF NOT EXISTS aura_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_connection', 'super_connector', 'early_adopter', 'token_trader', 'leaderboard')),
    achievement_name TEXT NOT NULL,
    description TEXT,
    points_awarded INTEGER DEFAULT 0,
    icon TEXT, -- Icon identifier
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_aura_points ON users(aura_points DESC);
CREATE INDEX IF NOT EXISTS idx_qr_connections_scanner ON qr_connections(scanner_id);
CREATE INDEX IF NOT EXISTS idx_qr_connections_referrer ON qr_connections(referrer_id);
CREATE INDEX IF NOT EXISTS idx_qr_connections_date ON qr_connections(connection_date);
CREATE INDEX IF NOT EXISTS idx_aura_transactions_user_id ON aura_point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_aura_transactions_created_at ON aura_point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_swaps_user_id ON token_swaps(user_id);
CREATE INDEX IF NOT EXISTS idx_token_swaps_status ON token_swaps(status);
CREATE INDEX IF NOT EXISTS idx_aura_achievements_user_id ON aura_achievements(user_id);

-- Row Level Security
ALTER TABLE qr_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for QR Connections
CREATE POLICY "Users can view connections involving them" ON qr_connections
    FOR SELECT USING (
        auth.uid()::text = scanner_id::text OR
        auth.uid()::text = referrer_id::text
    );

CREATE POLICY "Users can create connections as scanner" ON qr_connections
    FOR INSERT WITH CHECK (auth.uid()::text = scanner_id::text);

-- RLS Policies for Aura Point Transactions
CREATE POLICY "Users can view own aura transactions" ON aura_point_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- RLS Policies for Token Swaps
CREATE POLICY "Users can view own token swaps" ON token_swaps
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own token swaps" ON token_swaps
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for Aura Achievements
CREATE POLICY "Users can view own achievements" ON aura_achievements
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Function to add Aura Points
CREATE OR REPLACE FUNCTION add_aura_points(
    user_id UUID,
    points INTEGER,
    reason TEXT,
    connection_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Update user's total points
    UPDATE users 
    SET aura_points = COALESCE(aura_points, 0) + points,
        updated_at = NOW()
    WHERE id = user_id;

    -- Log the transaction
    INSERT INTO aura_point_transactions (user_id, points, reason, connection_id)
    VALUES (user_id, points, reason, connection_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_aura_achievements(user_id UUID)
RETURNS void AS $$
DECLARE
    user_points INTEGER;
    connection_count INTEGER;
    swap_count INTEGER;
BEGIN
    -- Get user stats
    SELECT aura_points INTO user_points FROM users WHERE id = user_id;
    
    SELECT COUNT(*) INTO connection_count 
    FROM qr_connections 
    WHERE scanner_id = user_id OR referrer_id = user_id;
    
    SELECT COUNT(*) INTO swap_count 
    FROM token_swaps 
    WHERE user_id = user_id AND status = 'completed';

    -- First Connection Achievement
    IF connection_count >= 1 AND NOT EXISTS (
        SELECT 1 FROM aura_achievements 
        WHERE user_id = user_id AND achievement_type = 'first_connection'
    ) THEN
        INSERT INTO aura_achievements (user_id, achievement_type, achievement_name, description, points_awarded, icon)
        VALUES (user_id, 'first_connection', 'First Connection', 'Made your first QR connection', 50, 'handshake');
        
        PERFORM add_aura_points(user_id, 50, 'Achievement: First Connection');
    END IF;

    -- Super Connector Achievement
    IF connection_count >= 10 AND NOT EXISTS (
        SELECT 1 FROM aura_achievements 
        WHERE user_id = user_id AND achievement_type = 'super_connector'
    ) THEN
        INSERT INTO aura_achievements (user_id, achievement_type, achievement_name, description, points_awarded, icon)
        VALUES (user_id, 'super_connector', 'Super Connector', 'Made 10+ connections', 200, 'network');
        
        PERFORM add_aura_points(user_id, 200, 'Achievement: Super Connector');
    END IF;

    -- Token Trader Achievement
    IF swap_count >= 1 AND NOT EXISTS (
        SELECT 1 FROM aura_achievements 
        WHERE user_id = user_id AND achievement_type = 'token_trader'
    ) THEN
        INSERT INTO aura_achievements (user_id, achievement_type, achievement_name, description, points_awarded, icon)
        VALUES (user_id, 'token_trader', 'Token Trader', 'Completed first token swap', 100, 'coins');
        
        PERFORM add_aura_points(user_id, 100, 'Achievement: Token Trader');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user rank
CREATE OR REPLACE FUNCTION get_user_aura_rank(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_points INTEGER;
    rank INTEGER;
BEGIN
    SELECT aura_points INTO user_points FROM users WHERE id = user_id;
    
    SELECT COUNT(*) + 1 INTO rank
    FROM users 
    WHERE aura_points > user_points;
    
    RETURN rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check achievements after point transactions
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.points > 0 THEN -- Only check on point gains
        PERFORM check_aura_achievements(NEW.user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_achievements_after_points 
    AFTER INSERT ON aura_point_transactions
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_check_achievements();
