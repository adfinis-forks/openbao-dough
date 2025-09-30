import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { authListEnabledMethodsOptions } from '@/shared/client/@tanstack/react-query.gen';
import { useAuth } from '../../shared/hooks/useAuth';
import type { AuthMethodType } from './authMethods';
import { KNOWN_AUTH_METHODS } from './authMethods';
import { ALLOWED_AUTH_TYPES, formatAuthMethodPath } from './authUtils';

export interface EnabledAuth {
  path: string;
  type: AuthMethodType;
  description?: string;
}

// Default mock data for development
const DEFAULT_AUTH_METHODS: EnabledAuth[] = [
  {
    path: 'userpass/',
    type: 'userpass',
    description: 'Username and password authentication',
  },
  {
    path: 'token/',
    type: 'token',
    description: 'Direct token authentication',
  },
  {
    path: 'ldap/',
    type: 'ldap',
    description: 'LDAP directory authentication',
  },
];

export function useEnabledAuthMethods() {
  const { isAuthenticated, getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();

  const {
    data: list,
    isLoading,
    error: queryError,
  } = useQuery({
    ...authListEnabledMethodsOptions({
      client: client ?? undefined,
    }),
    enabled: isAuthenticated && !!client,
    retry: false,
  });

  const enabled = useMemo(() => {
    // If not authenticated or no data, use defaults
    if (!isAuthenticated || !list || typeof list !== 'object') {
      return DEFAULT_AUTH_METHODS;
    }

    return Object.entries(list as any)
      .filter(([, info]) => info && typeof info === 'object')
      .map(([path, info]: [string, any]) => ({
        path,
        type: info.type as AuthMethodType,
        description: info.description,
      }));
  }, [isAuthenticated, list]);

  const options = useMemo(() => {
    return enabled
      .filter((method): method is EnabledAuth => {
        const meta = KNOWN_AUTH_METHODS[method.type];
        return Boolean(meta && ALLOWED_AUTH_TYPES.includes(method.type));
      })
      .map((method) => {
        const meta = KNOWN_AUTH_METHODS[method.type]!;
        return {
          value: formatAuthMethodPath(method.type, method.path),
          label: meta.label,
          description: method.description || meta.description,
          icon: meta.icon,
          meta,
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
