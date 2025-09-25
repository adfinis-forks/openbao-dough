import type React from 'react';
import { Theme, useTheme } from './ThemeProvider';
import './ThemeToggle.css';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, style }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className || ''}`}
      style={style}
      aria-label="Toggle theme"
      title={`Switch to ${theme === Theme.LIGHT ? 'dark' : 'light'} mode`}
    >
      <div className="theme-toggle__icon-wrapper">
        <SunIcon className="theme-toggle__icon theme-toggle__icon--sun" />
        <MoonIcon className="theme-toggle__icon theme-toggle__icon--moon" />
      </div>
    </button>
  );
};

export { ThemeToggle };
