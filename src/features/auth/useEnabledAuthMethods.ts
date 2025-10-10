import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { authListEnabledMethodsOptions } from '@/shared/client/@tanstack/react-query.gen';
import { useAuth } from '../../shared/hooks/useAuth';
import type { AuthMethodType } from './authMethods';
import { SUPPORTED_AUTH_BACKENDS } from './authMethods';

export interface EnabledAuth {
  path: string;
  type: AuthMethodType;
  description?: string;
}

/**
 * Hook to get enabled authentication methods from the server
 * Used in authenticated pages (like /auth route) to display configured auth methods
 */
export function useEnabledAuthMethods() {
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();

  const {
    data: list,
    isLoading,
    error: queryError,
  } = useQuery({
    ...authListEnabledMethodsOptions({
      client: client ?? undefined,
    }),
    enabled: !!client,
    retry: false,
  });

  const enabled = useMemo(() => {
    if (!list || typeof list !== 'object') {
      return [];
    }

    return Object.entries(list as any)
      .filter(([, info]) => info && typeof info === 'object')
      .map(([path, info]: [string, any]) => ({
        path,
        type: info.type as AuthMethodType,
        description: info.description,
      }));
  }, [list]);

  const options = useMemo(() => {
    return enabled
      .filter((method): method is EnabledAuth => {
        return SUPPORTED_AUTH_BACKENDS.some((b) => b.type === method.type);
      })
      .map((method) => {
        const backend = SUPPORTED_AUTH_BACKENDS.find(
          (b) => b.type === method.type,
        )!;
        return {
          value: `${method.type}:${method.path}`,
          label: backend.label,
          description: method.description || backend.description,
          icon: backend.icon,
          backend,
          raw: method,
        };
      });
  }, [enabled]);

  return {
    loading: isLoading,
    error: queryError?.message ?? null,
    enabled,
    options,
  };
}
