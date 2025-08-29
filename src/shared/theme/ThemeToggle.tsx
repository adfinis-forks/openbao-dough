import React from 'react';
import { useThemeStore } from './themeStore';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  style,
}) => {
  const { theme, toggleTheme } = useThemeStore();

  const defaultStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-base)',
    ...style,
  };

  return (
    <button
      onClick={toggleTheme}
      className={className}
      style={defaultStyle}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
