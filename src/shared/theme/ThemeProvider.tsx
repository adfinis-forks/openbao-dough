import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'openbao-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return Theme.LIGHT;

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === Theme.LIGHT || savedTheme === Theme.DARK) {
      return savedTheme as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? Theme.DARK
    : Theme.LIGHT;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
