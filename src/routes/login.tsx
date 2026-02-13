import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Login } from '../pages/Login';
import { createClient } from '@/shared/client/client';
import { sealStatus } from '@/shared/client';
import { BAO_ADDR } from '@/shared/config/config';
import { useNotifications } from '@/shared/components/common/Notification';

type LoginSearch = {
  namespace?: string;
  redirect_to?: string;
  with?: string;
};

const LoginComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { namespace, redirect_to } = Route.useSearch();
  const [isReady, setIsReady] = useState(false);
  const { addNotification } = useNotifications();

  // Check seal status first
  useEffect(() => {
    const checkSealStatus = async () => {
      try {
        const client = createClient({ baseUrl: BAO_ADDR });
        const { data } = await sealStatus({ client, throwOnError: false });
        if (data?.sealed) {
          navigate({ to: '/unseal' });
          return;
        }
      } catch {
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to OpenBao server. Please try again later.',
        });
        return;
      }
      setIsReady(true);
    };
    checkSealStatus();
  }, [navigate, addNotification]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate({
        to: redirect_to || '/dashboard',
        search: namespace ? { namespace } : undefined,
      });
    }
  }, [isReady, isAuthenticated, navigate, redirect_to, namespace]);

  if (!isReady) return null;
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
