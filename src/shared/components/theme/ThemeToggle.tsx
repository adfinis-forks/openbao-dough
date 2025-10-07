import type React from 'react';
import { Theme, useTheme } from './ThemeProvider';
import './ThemeToggle.css';
import SunOutlineIcon from '@public/sun-outline.svg?react';
import MoonOutlineIcon from '@public/moon-outline.svg?react';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, style }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === Theme.DARK;

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
        <SunOutlineIcon
          className={`theme-toggle__icon ${isDark ? 'theme-toggle__icon--hidden' : 'theme-toggle__icon--visible'}`}
        />
        <MoonOutlineIcon
          className={`theme-toggle__icon ${isDark ? 'theme-toggle__icon--visible' : 'theme-toggle__icon--hidden'}`}
        />
      </div>
    </button>
  );
};

export { ThemeToggle };
