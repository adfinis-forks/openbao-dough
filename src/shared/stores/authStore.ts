import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createOpenBaoClient, type OpenBaoClient } from '../api/client';
import { APP_CONFIG } from '../config';

interface TokenInfo {
  token: string;
  accessor: string;
  ttl: number;
  renewable: boolean;
  expiresAt: number; // Unix timestamp
  policies: string[];
  metadata?: Record<string, any>;
}

interface AuthState {
  // Token management
  tokenInfo: TokenInfo | null;
  client: OpenBaoClient | null;
  isAuthenticated: boolean;
  
  // Actions
  setToken: (tokenData: Partial<TokenInfo> & { token: string }) => void;
  clearAuth: () => void;
  refreshToken: () => Promise<void>;
  isTokenExpired: () => boolean;
  getToken: () => string | null;
  getClient: () => OpenBaoClient | null;
}

// Secure storage implementation
const secureStorage = {
  getItem: (name: string): string | null => {
    try {
      // Use sessionStorage for better security than localStorage
      const item = sessionStorage.getItem(name);
      if (!item) return null;
      
      // Basic obfuscation (not cryptographically secure, but better than plain text)
      return atob(item);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      // Basic obfuscation
      sessionStorage.setItem(name, btoa(value));
    } catch {
      // Storage failed, continue without persistence
    }
  },
  removeItem: (name: string): void => {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // Ignore removal errors
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokenInfo: null,
      client: null,
      isAuthenticated: false,

      setToken: (tokenData) => {
        const expiresAt = Date.now() + (tokenData.ttl || 3600) * 1000; // TTL in seconds to milliseconds
        
        const tokenInfo: TokenInfo = {
          token: tokenData.token,
          accessor: tokenData.accessor || '',
          ttl: tokenData.ttl || 3600,
          renewable: tokenData.renewable || false,
          expiresAt,
          policies: tokenData.policies || [],
          metadata: tokenData.metadata,
        };

        const client = createOpenBaoClient(APP_CONFIG.BAO_ADDR, tokenData.token);

        set({
          tokenInfo,
          client,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          tokenInfo: null,
          client: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        const { tokenInfo, client } = get();
        if (!tokenInfo?.renewable || !client) return;

        try {
          const { data, error } = await client.POST('/auth/token/renew-self');
          
          if (error) {
            console.warn('Token renewal failed:', error);
            get().clearAuth();
            return;
          }

          if (data?.auth) {
            get().setToken({
              token: tokenInfo.token, // Keep existing token
              accessor: data.auth.accessor || tokenInfo.accessor,
              ttl: data.auth.lease_duration || tokenInfo.ttl,
              renewable: data.auth.renewable ?? tokenInfo.renewable,
              policies: data.auth.policies || tokenInfo.policies,
              metadata: data.auth.metadata || tokenInfo.metadata,
            });
          }
        } catch (error) {
          console.warn('Token renewal error:', error);
          get().clearAuth();
        }
      },

      isTokenExpired: () => {
        const { tokenInfo } = get();
        if (!tokenInfo) return true;
        
        // Add 5 minute buffer before expiration
        const bufferMs = 5 * 60 * 1000;
        return Date.now() + bufferMs >= tokenInfo.expiresAt;
      },

      getToken: () => {
        const { tokenInfo, isTokenExpired } = get();
        if (!tokenInfo || isTokenExpired()) return null;
        return tokenInfo.token;
      },

      getClient: () => {
        const { client, isTokenExpired } = get();
        if (!client || isTokenExpired()) return null;
        return client;
      },
    }),
    {
      name: 'openbao-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        // Only persist token info, not the client instance
        tokenInfo: state.tokenInfo,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.tokenInfo && !state.isTokenExpired()) {
          // Recreate client after rehydration
          const client = createOpenBaoClient(APP_CONFIG.BAO_ADDR, state.tokenInfo.token);
          state.client = client;
        } else if (state) {
          // Clear expired auth
          state.clearAuth();
        }
      },
    }
  )
);

// Auto-refresh token before expiration
let refreshInterval: NodeJS.Timeout | null = null;

useAuthStore.subscribe((state) => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }

  if (state.isAuthenticated && state.tokenInfo?.renewable) {
    const refreshTime = Math.max(
      (state.tokenInfo.ttl * 1000) / 2, // Refresh at half TTL
      5 * 60 * 1000 // Minimum 5 minutes
    );

    refreshInterval = setInterval(() => {
      if (!state.isTokenExpired()) {
        state.refreshToken();
      }
    }, refreshTime);
  }
});

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
}