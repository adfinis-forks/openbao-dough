import { useEffect, useMemo, useState } from 'react';
import type { AuthMethodType } from './authMethods';
import { KNOWN_AUTH_METHODS } from './authMethods';
import { APP_CONFIG } from '../../shared/config';

export interface EnabledAuth {
  path: string;
  type: AuthMethodType;
  description?: string;
}

interface SysAuthResponse {
  [path: string]: {
    type: string;
    description?: string;
  };
}

const ALLOWED_AUTH_TYPES: AuthMethodType[] = [
  'token',
  'userpass',
  'ldap',
  'jwt',
  'oidc',
  'approle',
];

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

export function useEnabledAuthMethods(baseUrl?: string) {
  // Resolve API URL using helper with defaults
  const apiUrl = (baseUrl || APP_CONFIG.BAO_ADDR || '').trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<EnabledAuth[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAuthMethods() {
      setLoading(true);
      setError(null);

      try {
        if (!apiUrl) {
          // Use default mock data in development
          if (!cancelled) {
            setEnabled(DEFAULT_AUTH_METHODS);
          }
          return;
        }

        const url = `${apiUrl.replace(/\/$/, '')}/v1/sys/auth`;
        const res = await fetch(url, { method: 'GET' });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: SysAuthResponse = await res.json();
        const authMethods: EnabledAuth[] = Object.entries(data).map(
          ([path, info]) => ({
            path,
            type: info.type as AuthMethodType,
            description: info.description,
          }),
        );

        if (!cancelled) {
          setEnabled(authMethods);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load auth methods';
          setError(message);
          // Use default data as fallback
          setEnabled(DEFAULT_AUTH_METHODS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAuthMethods();

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  // Build select options with clean labels
  const options = useMemo(() => {
    return enabled
      .filter((method) => {
        const meta = KNOWN_AUTH_METHODS[method.type];
        return meta && ALLOWED_AUTH_TYPES.includes(method.type);
      })
      .map((method) => {
        const meta = KNOWN_AUTH_METHODS[method.type];
        return {
          value: `${method.type}:${method.path}`,
          label: meta.label,
          description: method.description || meta.description,
          icon: getAuthIcon(method.type),
          meta,
          raw: method,
        };
      });
  }, [enabled]);

  return { loading, error, enabled, options };
}

function getAuthIcon(type: AuthMethodType): string {
  const iconMap: Record<AuthMethodType, string> = {
    token: '🔑',
    userpass: '👤',
    ldap: '📇',
    oidc: '🌐',
    jwt: '🎫',
    approle: '🏷',
    kubernetes: '☸️',
    github: '🐙',
    aws: '☁️',
    azure: '☁️',
    gcp: '☁️',
    cert: '📜',
    radius: '📡',
  };
  return iconMap[type] || '🔐';
}
