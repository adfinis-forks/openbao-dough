import { useMemo } from 'react';
import type { Options } from '@/shared/client/sdk.gen';
import { useAuth } from './useAuth';

// Single helper surface to integrate with generated client helpers
export function useAuthenticatedOptions() {
  const { getAuthenticatedClient, isAuthenticated } = useAuth();

  return useMemo(() => {
    const client = getAuthenticatedClient();
    const enabled = isAuthenticated && !!client;
    return {
      client: client ?? undefined,
      enabled,
      throwOnError: true,
    } satisfies Partial<Options> & { enabled: boolean };
  }, [getAuthenticatedClient, isAuthenticated]);
}

// For mutation helpers that only need the client
export function useAuthenticatedMutationOptions() {
  const { getAuthenticatedClient, isAuthenticated } = useAuth();

  return useMemo(() => {
    const client = getAuthenticatedClient();
    return { client: client ?? undefined, enabled: isAuthenticated && !!client } satisfies Partial<Options> & { enabled: boolean };
  }, [getAuthenticatedClient, isAuthenticated]);
}
