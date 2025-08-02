import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light'; // The resolved theme (no 'system')
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'metabento-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        setActualTheme(systemTheme);
        return systemTheme;
      }
      setActualTheme(theme);
      return theme;
    };

    const resolvedTheme = resolveTheme();

    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Listen for system theme changes when using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setActualTheme(newTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Theme Toggle Component
interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return '🖥️';
    }
    return actualTheme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${actualTheme})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={cycleTheme}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30
        border border-white/20 dark:border-white/10
        text-gray-900 dark:text-white
        transition-all duration-200
        ${className}
      `}
      title={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="text-sm font-medium hidden sm:inline">
        {getThemeLabel()}
      </span>
    </button>
  );
}
