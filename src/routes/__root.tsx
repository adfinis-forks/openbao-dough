import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';

// Auth state - in a real app, this would come from context/store
let isAuthenticated = false;

export const setAuthState = (authenticated: boolean) => {
  isAuthenticated = authenticated;
};

export const getAuthState = () => isAuthenticated;

export const Route = createRootRoute({
  component: () => <Outlet />,
  beforeLoad: () => {
    // Redirect from root based on auth state
    if (window.location.pathname === '/') {
      if (isAuthenticated) {
        throw redirect({ to: '/dashboard' });
      } else {
        throw redirect({ to: '/login' });
      }
    }
  },
});
