import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type React from 'react';
import { queryClient } from '../shared/api/queryClient';
import { ThemeProvider } from '../shared/theme/ThemeProvider';
import { routeTree } from './routeTree.gen';
import './App.css';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
