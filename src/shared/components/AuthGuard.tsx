import { Navigate, useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Don't redirect if already on login page
    if (location.pathname === '/login') {
      return null;
    }

    // Only use pathname for redirect_to, not full URL with query string
    return <Navigate to="/login" search={{ redirect_to: location.pathname }} />;
  }

  return <>{children}</>;
}
