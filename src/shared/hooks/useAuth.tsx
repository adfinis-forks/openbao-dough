import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Client } from '@/shared/client/client';
import { createClient } from '@/shared/client/client';
import { tokenLookUpSelfGet } from '@/shared/client/sdk.gen';
import { BAO_ADDR } from '@/shared/config';

interface TokenInfo {
  token: string;
  accessor?: string;
  ttl?: number;
  renewable?: boolean;
  policies?: string[];
  metadata?: Record<string, any>;
  expiresAt?: number;
}

interface AuthContextValue {
  tokenInfo: TokenInfo | null;
  isAuthenticated: boolean;
  namespace?: string;
  login: (token: string, namespace?: string) => Promise<void>;
  logout: () => void;
  setNamespace: (namespace?: string) => void;
  getAuthenticatedClient: () => Client | null;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [namespace, setNamespaceState] = useState<string | undefined>();

  const isTokenExpired = useCallback(() => {
    if (!tokenInfo?.expiresAt) return false;
    const bufferMs = 5 * 60 * 1000; // 5 minute buffer
    return Date.now() + bufferMs >= tokenInfo.expiresAt;
  }, [tokenInfo]);

  const isAuthenticated = Boolean(tokenInfo && !isTokenExpired());

  const getAuthenticatedClient = useCallback(() => {
    if (!tokenInfo || isTokenExpired()) return null;

    const headers: Record<string, string> = {
      'X-Vault-Token': tokenInfo.token,
    };

    if (namespace && namespace !== '/') {
      headers['X-Vault-Namespace'] = namespace;
    }

    return createClient({
      baseUrl: BAO_ADDR,
      headers,
    });
  }, [tokenInfo, namespace, isTokenExpired]);

  const login = useCallback(async (token: string, ns?: string) => {
    const headers: Record<string, string> = {
      'X-Vault-Token': token,
    };

    if (ns && ns !== '/') {
      headers['X-Vault-Namespace'] = ns;
    }

    const client = createClient({
      baseUrl: BAO_ADDR,
      headers,
    });

    const { data, error } = await tokenLookUpSelfGet({
      client,
      throwOnError: false,
    });

    if (error || !data) {
      throw new Error('Invalid token or authentication failed');
    }

    const expiresAt = data?.ttl ? Date.now() + data.ttl * 1000 : undefined;

    setTokenInfo({
      token,
      accessor: data?.accessor,
      ttl: data?.ttl,
      renewable: data?.renewable,
      policies: data?.policies,
      metadata: (data as any)?.meta,
      expiresAt,
    });

    setNamespaceState(ns);
  }, []);

  const logout = useCallback(() => {
    setTokenInfo(null);
    setNamespaceState(undefined);
  }, []);

  const setNamespace = useCallback((ns?: string) => {
    setNamespaceState(ns);
  }, []);

  const contextValue = useMemo(
    () => ({
      tokenInfo,
      isAuthenticated,
      namespace,
      login,
      logout,
      setNamespace,
      getAuthenticatedClient,
      isTokenExpired,
    }),
    [
      tokenInfo,
      isAuthenticated,
      namespace,
      login,
      logout,
      setNamespace,
      getAuthenticatedClient,
      isTokenExpired,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthenticatedClient() {
  const { getAuthenticatedClient } = useAuth();
  return getAuthenticatedClient();
}
