import { MenuItem } from '@common/MenuItem';
import {
  AnalyticsIcon,
  ChevronBackIcon,
  DocumentTextIcon,
  FileTrayStackedIcon,
  KeyIcon,
  MenuIcon,
  OpenBaoIcon,
  PeopleIcon,
  PersonIcon,
  SettingsIcon,
  ShieldIcon,
  TerminalIcon,
} from '@icons';
import { Link, useLocation } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from '@/shared/components/theme/ThemeToggle';
import './Sidebar.css';
import {
  type NavigationItem,
  type NavigationSection,
  navigationConfig,
} from '@/shared/config/navigation';

/* TODO - REMOVE MENU ITEMS */
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: AnalyticsIcon },
  { path: '/secrets', label: 'Secrets', icon: KeyIcon },
  { path: '/policies', label: 'Policies', icon: DocumentTextIcon },
  { path: '/auth', label: 'Auth Methods', icon: PeopleIcon },
  { path: '/audit', label: 'Audit', icon: ShieldIcon },
  { path: '/system', label: 'System', icon: SettingsIcon },
];

function isNavigationSection(item: NavigationItem): item is NavigationSection {
  return 'sections' in item;
}

function SidebarComponent() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<NavigationSection | null>(
    null,
  );

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openPanel = (section: NavigationSection) => {
    setActivePanel(section);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleNavClick = () => {
    closeMobileMenu();
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
            <PersonIcon />
          </button>
          <button
            type="button"
            className="sidebar__utility-btn"
            aria-label="Terminal"
          >
            <TerminalIcon />
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
              <PersonIcon />
            </button>
            <button
              type="button"
              className="sidebar__utility-btn"
              aria-label="Terminal"
            >
              <TerminalIcon />
            </button>
          </div>
        </div>

        {/* Header with Logo */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <OpenBaoIcon className="sidebar__logo-icon" />
            <div className="sidebar__brand">
              <h3 className="sidebar__title">OpenBao</h3>
              <p className="text-caption">v2.3.1</p>
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {/* Show sub-panel if active */}
          {activePanel ? (
            <div className="sidebar__panel sidebar__panel--sub">
              {/* Back to main navigation button */}
              <MenuItem
                className="return-btn"
                onClick={closePanel}
                icon={<ChevronBackIcon />}
              >
                Back to main navigation
              </MenuItem>

              {/* Render all sections from the active panel */}
              {activePanel.sections.map((section) => (
                <div key={section.title} className="sidebar__menu-group">
                  <h3 className="sidebar__group-title">{section.title}</h3>
                  <div className="sidebar__menu">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const IconComponent = item.icon;

                      return (
                        <MenuItem
                          active={isActive}
                          key={item.label}
                          icon={IconComponent ? <IconComponent /> : undefined}
                          onClick={handleNavClick}
                        >
                          {item.label}
                        </MenuItem>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show main navigation panel
            <div className="sidebar__panel sidebar__panel--main">
              {navigationConfig.map((group) => (
                <div key={group.title} className="sidebar__menu-group">
                  {/* e.g. OpenBao, Monitoring */}
                  {group.title && (
                    <h3 className="sidebar__group-title">{group.title}</h3>
                  )}

                  <div className="sidebar__menu">
                    {group.items.map((item) => {
                      if (isNavigationSection(item)) {
                        const IconComponent = item.icon;
                        return (
                          <MenuItem
                            variant="section"
                            key={item.label}
                            onClick={() => openPanel(item)}
                            icon={IconComponent ? <IconComponent /> : undefined}
                          >
                            {item.label}
                          </MenuItem>
                        );
                      }

                      const isActive = location.pathname === item.path;
                      const IconComponent = item.icon;

                      return (
                        <MenuItem
                          active={isActive}
                          key={item.label}
                          onClick={handleNavClick}
                          icon={IconComponent ? <IconComponent /> : undefined}
                        >
                          {item.label}
                        </MenuItem>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer with Namespace */}
        <div className="sidebar__footer">
          <div className="sidebar__namespace">
            <div className="sidebar__namespace-label">
              <FileTrayStackedIcon />
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
