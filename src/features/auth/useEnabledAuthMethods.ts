import { useEffect, useMemo, useState } from 'react';
import type { AuthMethodType } from './authMethods';
import { KNOWN_AUTH_METHODS } from './authMethods';
import { ALLOWED_AUTH_TYPES, formatAuthMethodPath } from './authUtils';
import { useAuthStore } from '../../shared/stores/authStore';

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
  const { getClient, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<EnabledAuth[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchAuthMethods = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const client = getClient();

        // If no authenticated client, fall back to default auth methods
        if (!client || !isAuthenticated) {
          if (!cancelled) {
            setEnabled(DEFAULT_AUTH_METHODS);
          }
          return;
        }

        const { data, error: apiError } = await client.GET('/sys/auth');

        if (apiError) {
          throw new Error(
            `API Error: ${apiError.detail || 'Failed to fetch auth methods'}`,
          );
        }

        if (data?.data) {
          const authMethods: EnabledAuth[] = Object.entries(data.data).map(
            ([path, info]: [string, any]) => ({
              path,
              type: info.type as AuthMethodType,
              description: info.description,
            }),
          );

          if (!cancelled) {
            setEnabled(authMethods);
          }
        } else {
          // Fall back to default methods if no data
          if (!cancelled) {
            setEnabled(DEFAULT_AUTH_METHODS);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load auth methods';
          setError(message);
          setEnabled(DEFAULT_AUTH_METHODS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAuthMethods();

    return () => {
      cancelled = true;
    };
  }, [getClient, isAuthenticated]);

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

  return { loading, error, enabled, options };
}
