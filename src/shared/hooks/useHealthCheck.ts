import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BAO_ADDR } from '@/shared/config/config';
import { sealStatus } from '../client';
import { createClient } from '../client/client';

const POLL_INTERVAL = 10000; // 10 seconds

export function useHealthCheck() {
  const [isSealed, setIsSealed] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/unseal') {
      return;
    }

    const client = createClient({ baseUrl: BAO_ADDR });

    const checkHealth = async () => {
      try {
        const { data } = await sealStatus({ client, throwOnError: false });
        setIsSealed(data?.sealed ?? false);
        if (data?.sealed) {
          navigate({ to: '/unseal' });
        }
      } catch {}
    };

    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return { isSealed };
}
