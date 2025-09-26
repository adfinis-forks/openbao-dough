import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/shared/client/client';
import { tokenLookUpSelfGet } from '@/shared/client/sdk.gen';
import { BAO_ADDR } from '@/shared/config';
import { useAuth } from './useAuth';

interface AuthCredentials {
  token?: string;
  username?: string;
  password?: string;
  ldapUsername?: string;
  ldapPassword?: string;
  roleId?: string;
  secretId?: string;
}

interface AuthParams {
  method: string;
  credentials: AuthCredentials;
  namespace?: string;
  mountPath?: string;
}

export function useAuthenticate() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({
      method,
      credentials,
      namespace,
      mountPath,
    }: AuthParams) => {
      const baseUrl = BAO_ADDR;

      const headers: Record<string, string> = {};
      if (namespace && namespace !== '/') {
        headers['X-Vault-Namespace'] = namespace;
      }

      const client = createClient({ baseUrl, headers });

      switch (method) {
        case 'token': {
          if (!credentials.token) {
            throw new Error('Token is required for token authentication');
          }

          const tokenClient = createClient({
            baseUrl,
            headers: {
              ...headers,
              'X-Vault-Token': credentials.token,
            },
          });

          const { data, error } = await tokenLookUpSelfGet({
            client: tokenClient,
            throwOnError: false,
          });

          if (error || !data) {
            throw new Error('Invalid token or authentication failed');
          }

          return {
            token: credentials.token,
            accessor: data?.accessor,
            ttl: data?.ttl,
            renewable: data?.renewable,
            policies: data?.policies,
          };
        }

        case 'userpass': {
          if (!credentials.username || !credentials.password) {
            throw new Error('Username and password are required');
          }

          const path = mountPath || 'userpass';
          const { data, error } = await client.post({
            url: `/auth/${path}/login/${credentials.username}`,
            body: { password: credentials.password },
            headers: { 'Content-Type': 'application/json' },
            throwOnError: false,
          });

          if (error || !data) {
            throw new Error('Invalid username or password');
          }

          const auth = (data as any)?.auth;
          return {
            token: auth?.client_token,
            accessor: auth?.accessor,
            ttl: auth?.lease_duration,
            renewable: auth?.renewable,
            policies: auth?.policies,
            metadata: auth?.metadata,
          };
        }

        case 'ldap': {
          const username = credentials.ldapUsername || credentials.username;
          const password = credentials.ldapPassword || credentials.password;

          if (!username || !password) {
            throw new Error('Username and password are required for LDAP');
          }

          const path = mountPath || 'ldap';
          const { data, error } = await client.post({
            url: `/auth/${path}/login/${username}`,
            body: { password },
            headers: { 'Content-Type': 'application/json' },
            throwOnError: false,
          });

          if (error || !data) {
            throw new Error('LDAP authentication failed');
          }

          const auth = (data as any)?.auth;
          return {
            token: auth?.client_token,
            accessor: auth?.accessor,
            ttl: auth?.lease_duration,
            renewable: auth?.renewable,
            policies: auth?.policies,
            metadata: auth?.metadata,
          };
        }

        case 'approle': {
          if (!credentials.roleId || !credentials.secretId) {
            throw new Error('Role ID and Secret ID are required for AppRole');
          }

          const path = mountPath || 'approle';
          const { data, error } = await client.post({
            url: `/auth/${path}/login`,
            body: {
              role_id: credentials.roleId,
              secret_id: credentials.secretId,
            },
            headers: { 'Content-Type': 'application/json' },
            throwOnError: false,
          });

          if (error || !data) {
            throw new Error('AppRole authentication failed');
          }

          const auth = (data as any)?.auth;
          return {
            token: auth?.client_token,
            accessor: auth?.accessor,
            ttl: auth?.lease_duration,
            renewable: auth?.renewable,
            policies: auth?.policies,
            metadata: auth?.metadata,
          };
        }

        default:
          throw new Error(`Unsupported authentication method: ${method}`);
      }
    },
    onSuccess: (tokenData, { namespace }) => {
      if (tokenData.token) {
        login(tokenData.token, namespace);
      }
    },
  });
}

export function useTokenValidation() {
  return useMutation({
    mutationFn: async ({
      token,
      namespace,
    }: {
      token: string;
      namespace?: string;
    }) => {
      const headers: Record<string, string> = {
        'X-Vault-Token': token,
      };

      if (namespace && namespace !== '/') {
        headers['X-Vault-Namespace'] = namespace;
      }

      const client = createClient({ baseUrl: BAO_ADDR, headers });

      const { data, error } = await tokenLookUpSelfGet({
        client,
        throwOnError: false,
      });

      if (error || !data) {
        throw new Error('Token validation failed');
      }

      return data;
    },
  });
}
