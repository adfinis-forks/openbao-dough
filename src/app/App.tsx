import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type React from 'react';
import { queryClient } from '../shared/api/queryClient';
import { NotificationProvider } from '../shared/components/common/Notification';
import { ThemeProvider } from '../shared/components/theme/ThemeProvider';
import { AuthProvider } from '../shared/hooks/useAuth';
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
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
