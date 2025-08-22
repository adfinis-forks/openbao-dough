import type { AuthMethodType } from './authMethods';

export const ALLOWED_AUTH_TYPES: AuthMethodType[] = [
  'token',
  'userpass',
  'ldap',
  'jwt',
  'oidc',
  'approle',
];

export const formatAuthMethodPath = (type: string, path: string): string =>
  `${type}:${path}`;

export const parseAuthMethodValue = (
  value: string,
): { type: string; path: string } | null => {
  const [type, path] = value.split(':');
  return type && path ? { type, path } : null;
};
