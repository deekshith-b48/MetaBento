import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, User } from '@/lib/supabase';
import { 
  verifySessionToken, 
  logout as logoutAuth, 
  cleanupUserSessions 
} from '@/lib/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  login: (sessionToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('metabento-session');
      if (storedToken) {
        const sessionData = await verifySessionToken(storedToken);
        if (sessionData) {
          setSessionToken(storedToken);
          await loadUser(sessionData.userId);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('metabento-session');
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem('metabento-session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
      toast.error('Failed to load user profile');
    }
  };

  const login = async (newSessionToken: string) => {
    try {
      const sessionData = await verifySessionToken(newSessionToken);
      if (!sessionData) {
        throw new Error('Invalid session token');
      }

      setSessionToken(newSessionToken);
      localStorage.setItem('metabento-session', newSessionToken);
      
      await loadUser(sessionData.userId);
      
      // Clean up old sessions
      await cleanupUserSessions(sessionData.userId);
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await logoutAuth(sessionToken);
      }
      
      setUser(null);
      setSessionToken(null);
      localStorage.removeItem('metabento-session');
      
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    await loadUser(user.id);
  };

  const value: AuthContextType = {
    user,
    sessionToken,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
