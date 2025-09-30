import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Login } from '../pages/Login';
import { useAuth } from '@/shared/hooks/useAuth';

const LoginComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
});
