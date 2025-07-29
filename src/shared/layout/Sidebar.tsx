import { Link, useLocation } from '@tanstack/react-router';
import React from 'react';
import OpenBaoLogo from '../../../public/openbao.svg';
import { Button } from '../ui/Button';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '/analytics-outline.svg' },
  { path: '/secrets', label: 'Secrets', icon: '/key-outline.svg' },
  { path: '/policies', label: 'Policies', icon: '/document-text-outline.svg' },
  { path: '/auth', label: 'Auth Methods', icon: '/people-outline.svg' },
  { path: '/audit', label: 'Audit', icon: '/shield-outline.svg' },
  { path: '/system', label: 'System', icon: '/settings-outline.svg' },
];

const SidebarComponent: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img
            src={OpenBaoLogo}
            alt="OpenBao Logo"
            className="sidebar__logo-icon"
          />
          <div className="sidebar__brand">
            <h2 className="sidebar__title">OpenBao</h2>
            <p className="sidebar__version">v2.3.1</p>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__menu">
          {menuItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (currentPath === '/' && item.path === '/dashboard');
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="menu-item"
                  size="medium"
                  active={isActive}
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
    </div>
  );
};

export const Sidebar = React.memo(SidebarComponent);
