import { createRouter, RouterProvider } from '@tanstack/react-router';
import type React from 'react';
import { routeTree } from './routeTree.gen';
import { FloatingThemeToggle } from '../shared/theme';
import './App.css';

export type ViewType =
  | 'dashboard'
  | 'secrets'
  | 'policies'
  | 'auth'
  | 'audit'
  | 'system';

// Create router with generated route tree
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <FloatingThemeToggle />
    </>
  );
};

export default App;
