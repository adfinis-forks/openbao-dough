import { Outlet } from '@tanstack/react-router';
import type React from 'react';
import { Sidebar } from './Sidebar';
import './Layout.css';

export const Layout: React.FC = () => {
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
