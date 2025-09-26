import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => <Outlet />,
  beforeLoad: () => {
    // Redirect from root to appropriate page
    if (window.location.pathname === '/') {
      // Let the login page handle auth state checking
      throw redirect({ to: '/login' });
    }
  },
});
