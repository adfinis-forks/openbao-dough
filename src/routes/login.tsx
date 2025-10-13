import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Login } from '../pages/Login';

type LoginSearch = {
  namespace?: string;
  redirect_to?: string;
  with?: string;
};

const LoginComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { namespace, redirect_to } = Route.useSearch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({
        to: redirect_to || '/dashboard',
        search: namespace ? { namespace } : undefined,
      });
    }
  }, [isAuthenticated, navigate, redirect_to, namespace]);

  return <Login />;
};

export const Route = createFileRoute('/login')({
  component: LoginComponent,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    namespace: search.namespace as string | undefined,
    redirect_to: search.redirect_to as string | undefined,
    with: search.with as string | undefined,
  }),
});
