import React from 'react';
import { useThemeStore } from './themeStore';
import styles from './FloatingThemeToggle.module.css';

export const FloatingThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</div>
      <div className={styles.ripple}></div>
    </button>
  );
};
