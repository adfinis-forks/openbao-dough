import { Button } from '@common/Button';
import FileTrayStackedOutlineIcon from '@public/file-tray-stacked-outline.svg?react';
import MenuIcon from '@public/menu.svg?react';
import OpenBaoLogo from '@public/openbao.svg?react';
import PersonOutlineIcon from '@public/person-outline.svg?react';
import TerminalOutlineIcon from '@public/terminal-outline.svg?react';
import { Link, useLocation } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from '@/shared/components/theme/ThemeToggle';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '/analytics-outline.svg' },
  { path: '/secrets', label: 'Secrets', icon: '/key-outline.svg' },
  { path: '/policies', label: 'Policies', icon: '/document-text-outline.svg' },
  { path: '/auth', label: 'Auth Methods', icon: '/people-outline.svg' },
  { path: '/audit', label: 'Audit', icon: '/shield-outline.svg' },
  { path: '/system', label: 'System', icon: '/settings-outline.svg' },
];

function SidebarComponent() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Utility Bar - separate from sidebar */}
      <div className="sidebar__utility-mobile">
        <button
          type="button"
          className="sidebar__menu-toggle"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <MenuIcon />
        </button>
        <ThemeToggle className="sidebar__utility-theme-toggle" />
        <div className="sidebar__utility-actions">
          <button
            type="button"
            className="sidebar__utility-btn"
            aria-label="User settings"
          >
            <PersonOutlineIcon />
          </button>
          <button
            type="button"
            className="sidebar__utility-btn"
            aria-label="Terminal"
          >
            <TerminalOutlineIcon />
          </button>
        </div>
      </div>

      {/* Sidebar - overlay on mobile */}
      <div
        className={`sidebar ${isMobileMenuOpen ? 'sidebar--mobile-open' : ''}`}
      >
        {/* Utility Bar */}
        <div className="sidebar__utility">
          <button
            type="button"
            className="sidebar__menu-toggle sidebar__utility-close"
            onClick={toggleMobileMenu}
            aria-label="Close menu"
          >
            <MenuIcon />
          </button>
          <ThemeToggle className="sidebar__utility-theme-toggle" />
          <div className="sidebar__utility-actions">
            <button
              type="button"
              className="sidebar__utility-btn"
              aria-label="User settings"
            >
              <PersonOutlineIcon />
            </button>
            <button
              type="button"
              className="sidebar__utility-btn"
              aria-label="Terminal"
            >
              <TerminalOutlineIcon />
            </button>
          </div>
        </div>

        {/* Header with Logo */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <OpenBaoLogo className="sidebar__logo-icon" />
            <div className="sidebar__brand">
              <h3 className="sidebar__title">OpenBao</h3>
              <p className="text-caption">v2.3.1</p>
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__menu">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname === '/' && item.path === '/dashboard');
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="menu-item"
                    size="medium"
                    active={isActive}
                    onClick={() => setIsMobileMenuOpen(false)}
                    icon={
                      <img
                        src={item.icon}
                        alt={item.label}
                        width={18}
                        height={18}
                      />
                    }
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer with Namespace */}
        <div className="sidebar__footer">
          <div className="sidebar__namespace">
            <div className="sidebar__namespace-label">
              <FileTrayStackedOutlineIcon />
              <span>namespace</span>
            </div>
            <p className="sidebar__namespace-value">/ (root)</p>
          </div>
        </div>
      </div>
    </>
  );
}

export const Sidebar = React.memo(SidebarComponent);
