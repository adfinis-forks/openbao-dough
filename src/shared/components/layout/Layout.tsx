import { Outlet } from '@tanstack/react-router';
import type React from 'react';
import { Sidebar } from './Sidebar';
import './Layout.css';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Outlet />
      </div>
    </div>
  );
};
