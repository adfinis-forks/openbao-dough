import type React from 'react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import './Layout.css';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render layout while redirecting
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        <div className="layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
