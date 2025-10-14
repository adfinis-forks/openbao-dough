import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Client } from '@/shared/client/client';
import { createClient } from '@/shared/client/client';
import {
  tokenLookUpSelfGet,
  tokenRenewSelf,
  tokenRevokeSelf,
} from '@/shared/client/sdk.gen';
import type { TokenLookupResponse } from '@/shared/client/types.gen';
import { BAO_ADDR } from '@/shared/config/config';

export interface AuthContextValue {
  token: string | null;
  tokenData: TokenLookupResponse | null;
  isAuthenticated: boolean;
  login: (token: string, namespace?: string) => Promise<void>;
  logout: (namespace?: string) => Promise<void>;
  getAuthenticatedClient: (namespace?: string) => Client | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper: Create authenticated client
const createAuthClient = (token: string, namespace?: string): Client => {
  const headers: Record<string, string> = { 'X-Vault-Token': token };
  if (namespace && namespace !== '/') headers['X-Vault-Namespace'] = namespace;
  return createClient({ baseUrl: BAO_ADDR, headers });
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenLookupResponse | null>(null);
  const renewalTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const isAuthenticated = !!token && !!tokenData;

  const getAuthenticatedClient = useCallback(
    (namespace?: string) => {
      return token ? createAuthClient(token, namespace) : null;
    },
    [token],
  );

  const login = useCallback(async (newToken: string, namespace?: string) => {
    const { data, error } = await tokenLookUpSelfGet({
      client: createAuthClient(newToken, namespace),
      throwOnError: false,
    });

    if (error || !data) throw new Error('Invalid token');

    setToken(newToken);
    setTokenData(data);
  }, []);

  const logout = useCallback(
    async (namespace?: string) => {
      if (token) {
        try {
          await tokenRevokeSelf({
            client: createAuthClient(token, namespace),
            throwOnError: false,
          });
        } catch {}
      }
      setToken(null);
      setTokenData(null);
    },
    [token],
  );

  // Auto-renew renewable tokens
  useEffect(() => {
    if (!token || !tokenData?.renewable || !tokenData.ttl) return;

    const renewAt = tokenData.ttl * 500; // 50% of TTL
    renewalTimer.current = setTimeout(async () => {
      try {
        const { data } = await tokenRenewSelf({
          client: createAuthClient(token),
          body: {},
          throwOnError: false,
        });
        if (data) setTokenData(data);
      } catch {}
    }, renewAt);

    return () => {
      if (renewalTimer.current) clearTimeout(renewalTimer.current);
    };
  }, [token, tokenData]);

  return (
    <AuthContext.Provider
      value={{
        token,
        tokenData,
        isAuthenticated,
        login,
        logout,
        getAuthenticatedClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthenticatedClient(namespace?: string) {
  const { getAuthenticatedClient } = useAuth();
  return getAuthenticatedClient(namespace);
}
