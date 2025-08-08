import { useEffect, useMemo, useState } from 'react';
import type { AuthMethodType } from './authMethods';
import { KNOWN_AUTH_METHODS } from './authMethods';

export interface EnabledAuth {
  path: string; // e.g., 'userpass/'
  type: AuthMethodType; // e.g., 'userpass'
  description?: string;
}

interface SysAuthResponse {
  [path: string]: {
    type: string;
    description?: string;
  };
}

const ALLOWED: AuthMethodType[] = [
  'token',
  'userpass',
  'ldap',
  'jwt',
  'oidc',
  'approle',
];

export function useEnabledAuthMethods(opts?: { baseUrl?: string }) {
  const baseUrl =
    opts?.baseUrl || (import.meta as any)?.env?.VITE_OPENBAO_ADDR || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<EnabledAuth[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const url = `${baseUrl.replace(/\/$/, '')}/v1/sys/auth`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SysAuthResponse = await res.json();
        const list: EnabledAuth[] = Object.entries(data).map(
          ([path, info]) => ({
            path,
            type: info.type as AuthMethodType,
            description: info.description,
          }),
        );
        if (!cancelled) setEnabled(list);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load auth methods');
          setEnabled([
            {
              path: 'userpass/',
              type: 'userpass',
              description: KNOWN_AUTH_METHODS.userpass.description,
            },
            {
              path: 'token/',
              type: 'token',
              description: KNOWN_AUTH_METHODS.token.description,
            },
            {
              path: 'ldap/',
              type: 'ldap',
              description: KNOWN_AUTH_METHODS.ldap.description,
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  // Build select options, filtered to allowed types, with clean labels (no mount path in label)
  const options = useMemo(() => {
    return enabled
      .filter(
        (m) =>
          KNOWN_AUTH_METHODS[m.type as keyof typeof KNOWN_AUTH_METHODS] &&
          ALLOWED.includes(m.type),
      )
      .map((m) => {
        const meta = KNOWN_AUTH_METHODS[m.type];
        const icon = getIcon(meta.type);
        return {
          value: `${m.type}:${m.path}`, // unique by type+path
          label: meta.label, // no "(/userpass)" suffix
          description: m.description || meta.description,
          icon,
          meta,
          raw: m,
        };
      });
  }, [enabled]);

  return { loading, error, enabled, options };
}

function getIcon(type: AuthMethodType) {
  switch (type) {
    case 'token':
      return '🔑';
    case 'userpass':
      return '👤';
    case 'ldap':
      return '📇';
    case 'oidc':
      return '🌐';
    case 'jwt':
      return '🧾';
    case 'approle':
      return '🏷';
    case 'kubernetes':
      return '🧭';
    case 'github':
      return '🐙';
    case 'aws':
      return '☁';
    case 'azure':
      return '🔷';
    case 'gcp':
      return '🟨';
    case 'cert':
      return '📜';
    case 'radius':
      return '📡';
    default:
      return '🔐';
  }
}
