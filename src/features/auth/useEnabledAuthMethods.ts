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

// Static auth methods that are always available on login page
const STATIC_AUTH_METHODS: EnabledAuth[] = [
  {
    path: 'token/',
    type: 'token',
    description: 'Direct token authentication',
  },
  {
    path: 'userpass/',
    type: 'userpass',
    description: 'Username and password authentication',
  },
  {
    path: 'ldap/',
    type: 'ldap',
    description: 'LDAP directory authentication',
  },
  {
    path: 'jwt/',
    type: 'jwt',
    description: 'JWT authentication',
  },
  {
    path: 'oidc/',
    type: 'oidc',
    description: 'OpenID Connect single sign-on',
  },
  {
    path: 'radius/',
    type: 'radius',
    description: 'RADIUS server authentication',
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
    // If not authenticated (on login page), always return static auth methods
    if (!isAuthenticated) {
      return STATIC_AUTH_METHODS;
    }

    // If authenticated and have list data, use that (for auth management pages)
    if (list && typeof list === 'object') {
      return Object.entries(list as any)
        .filter(([, info]) => info && typeof info === 'object')
        .map(([path, info]: [string, any]) => ({
          path,
          type: info.type as AuthMethodType,
          description: info.description,
        }));
    }

    // Fallback to static methods
    return STATIC_AUTH_METHODS;
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
