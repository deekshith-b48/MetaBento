import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface from auth context
interface User {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  wallet_address?: string;
  email?: string;
  avatar_url?: string;
  is_public: boolean;
  default_mode: 'professional' | 'casual';
  aura_points: number;
  total_connections: number;
}

// Profile mode type
type ProfileMode = 'professional' | 'casual';

// Theme type
type Theme = 'light' | 'dark' | 'system';

// App state interface
interface AppState {
  // User state
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  
  // UI state
  mode: ProfileMode;
  theme: Theme;
  actualTheme: 'light' | 'dark';
  
  // Aura Points state
  auraPoints: number;
  pointsThisWeek: number;
  userRank: number;
  
  // Connection state
  totalConnections: number;
  connectionsThisWeek: number;
  
  // UI flags
  isLoading: boolean;
  showProfileSetup: boolean;
  showQRScanner: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSessionToken: (token: string | null) => void;
  setMode: (mode: ProfileMode) => void;
  setTheme: (theme: Theme) => void;
  setActualTheme: (theme: 'light' | 'dark') => void;
  updateAuraPoints: (points: number) => void;
  addAuraPoints: (points: number) => void;
  updateStats: (stats: {
    auraPoints?: number;
    pointsThisWeek?: number;
    userRank?: number;
    totalConnections?: number;
    connectionsThisWeek?: number;
  }) => void;
  setLoading: (loading: boolean) => void;
  setShowProfileSetup: (show: boolean) => void;
  setShowQRScanner: (show: boolean) => void;
  logout: () => void;
  reset: () => void;
}

// Create the store with persistence for specific fields
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      mode: 'professional',
      theme: 'dark',
      actualTheme: 'dark',
      auraPoints: 0,
      pointsThisWeek: 0,
      userRank: 0,
      totalConnections: 0,
      connectionsThisWeek: 0,
      isLoading: false,
      showProfileSetup: false,
      showQRScanner: false,

      // User actions
      setUser: (user) => set((state) => ({
        user,
        isAuthenticated: !!user,
        auraPoints: user?.aura_points || 0,
        totalConnections: user?.total_connections || 0,
        mode: user?.default_mode || state.mode,
      })),

      setSessionToken: (token) => set({
        sessionToken: token,
        isAuthenticated: !!token,
      }),

      // UI actions
      setMode: (mode) => set({ mode }),
      
      setTheme: (theme) => set({ theme }),
      
      setActualTheme: (actualTheme) => set({ actualTheme }),

      // Aura Points actions
      updateAuraPoints: (points) => set({ auraPoints: points }),
      
      addAuraPoints: (points) => set((state) => ({
        auraPoints: state.auraPoints + points,
      })),

      updateStats: (stats) => set((state) => ({
        ...state,
        ...stats,
      })),

      // UI state actions
      setLoading: (isLoading) => set({ isLoading }),
      
      setShowProfileSetup: (showProfileSetup) => set({ showProfileSetup }),
      
      setShowQRScanner: (showQRScanner) => set({ showQRScanner }),

      // Auth actions
      logout: () => set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        auraPoints: 0,
        pointsThisWeek: 0,
        userRank: 0,
        totalConnections: 0,
        connectionsThisWeek: 0,
      }),

      reset: () => set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        mode: 'professional',
        theme: 'dark',
        actualTheme: 'dark',
        auraPoints: 0,
        pointsThisWeek: 0,
        userRank: 0,
        totalConnections: 0,
        connectionsThisWeek: 0,
        isLoading: false,
        showProfileSetup: false,
        showQRScanner: false,
      }),
    }),
    {
      name: 'metabento-app-state',
      // Only persist these specific fields
      partialize: (state) => ({
        mode: state.mode,
        theme: state.theme,
        sessionToken: state.sessionToken,
      }),
    }
  )
);

// Convenience hooks for specific parts of the state
export const useAuth = () => {
  const { user, sessionToken, isAuthenticated, setUser, setSessionToken, logout } = useAppStore();
  return { user, sessionToken, isAuthenticated, setUser, setSessionToken, logout };
};

export const useProfile = () => {
  const { mode, setMode, showProfileSetup, setShowProfileSetup } = useAppStore();
  return { mode, setMode, showProfileSetup, setShowProfileSetup };
};

export const useThemeStore = () => {
  const { theme, actualTheme, setTheme, setActualTheme } = useAppStore();
  return { theme, actualTheme, setTheme, setActualTheme };
};

export const useAuraPoints = () => {
  const { 
    auraPoints, 
    pointsThisWeek, 
    userRank, 
    updateAuraPoints, 
    addAuraPoints, 
    updateStats 
  } = useAppStore();
  
  return { 
    auraPoints, 
    pointsThisWeek, 
    userRank, 
    updateAuraPoints, 
    addAuraPoints, 
    updateStats 
  };
};

export const useConnections = () => {
  const { totalConnections, connectionsThisWeek, updateStats } = useAppStore();
  return { totalConnections, connectionsThisWeek, updateStats };
};

export const useUI = () => {
  const { 
    isLoading, 
    showQRScanner, 
    setLoading, 
    setShowQRScanner 
  } = useAppStore();
  
  return { 
    isLoading, 
    showQRScanner, 
    setLoading, 
    setShowQRScanner 
  };
};

// Custom hook for reactive theme management
export const useThemeManager = () => {
  const { theme, actualTheme, setTheme, setActualTheme } = useThemeStore();

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content', 
          newTheme === 'dark' ? '#0f0f23' : '#ffffff'
        );
      }
    }
  };

  // Resolve system theme
  const resolveSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  // Get effective theme
  const getEffectiveTheme = (): 'light' | 'dark' => {
    return theme === 'system' ? resolveSystemTheme() : theme === 'dark' ? 'dark' : 'light';
  };

  return {
    theme,
    actualTheme,
    setTheme,
    setActualTheme,
    applyTheme,
    resolveSystemTheme,
    getEffectiveTheme,
  };
};
