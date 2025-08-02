import { createClient } from '@supabase/supabase-js';

// These should be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  wallet_address?: string;
  email?: string;
  password_hash?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  ens_name?: string;
  avatar_url?: string;
  is_public: boolean;
  default_mode: 'professional' | 'casual';
  a_points: number;
  total_connections: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  url: string;
  profile_type: 'professional' | 'casual' | 'both';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  id: string;
  user_id: string;
  wallet_address: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// Auth nonce for wallet signature verification
export interface AuthNonce {
  id: string;
  wallet_address: string;
  nonce: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}
