import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  namespacesListNamespacesOptions,
  namespacesWriteNamespacesPathMutation,
  namespacesDeleteNamespacesPathMutation,
} from '@/shared/client/@tanstack/react-query.gen';
import type { NamespacesListNamespacesResponse } from '@/shared/client/types.gen';
import { useAuth } from '@/shared/hooks/useAuth';
import { namespacesReadNamespacesPath } from '@/shared/client/sdk.gen';

export interface Namespace {
  path: string;
  id?: string;
  locked?: boolean;
  tainted?: boolean;
  uuid?: string;
  custom_metadata?: Record<string, unknown>;
}

/**
 * Hook to list all namespaces from the server
 */
export function useNamespaces() {
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();

  const {
    data: listResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    ...namespacesListNamespacesOptions({
      client: client ?? undefined,
      query: {
        list: 'true',
      },
    }),
    enabled: !!client,
    retry: false,
  });

  // Fetch details for each namespace
  // First try to use key_info if available, otherwise fetch individual details
  const namespaces = useQuery({
    queryKey: [
      'namespaces',
      'details',
      listResponse?.keys,
      listResponse?.key_info,
    ],
    queryFn: async () => {
      // Handle potential nested data structure (backend may wrap response in 'data' property)
      const responseData: NamespacesListNamespacesResponse | undefined = 
        (listResponse as { data?: NamespacesListNamespacesResponse })?.data || 
        (listResponse as NamespacesListNamespacesResponse | undefined);
      
      if (!responseData?.keys || !client) {
        return [];
      }

      // If key_info exists and has data, use it
      const keyInfo = responseData.key_info;
      if (keyInfo && typeof keyInfo === 'object' && Object.keys(keyInfo).length > 0) {
        return responseData.keys.map((path: string) => {
          const info = keyInfo[path] as Record<string, unknown> | undefined;
          if (info && typeof info === 'object') {
            return {
              path: (typeof info.path === 'string' ? info.path : path) || path,
              id: typeof info.id === 'string' ? info.id : undefined,
              locked: typeof info.locked === 'boolean' ? info.locked : undefined,
              tainted: typeof info.tainted === 'boolean' ? info.tainted : undefined,
              uuid: typeof info.uuid === 'string' ? info.uuid : (typeof info.id === 'string' ? info.id : undefined),
              custom_metadata: info.custom_metadata && typeof info.custom_metadata === 'object' && !Array.isArray(info.custom_metadata) 
                ? info.custom_metadata as Record<string, unknown> 
                : undefined,
            } as Namespace;
          }
          // Fallback to basic info if key_info doesn't have expected structure
          return {
            path,
            id: undefined,
            locked: undefined,
            tainted: undefined,
          } as Namespace;
        });
      }

      // Otherwise, fetch details for each namespace
      const namespaceDetails = await Promise.all(
        responseData.keys.map(async (path: string) => {
          try {
            const { data } = await namespacesReadNamespacesPath({
              client,
              path: { path },
              throwOnError: false,
            });

            if (data) {
              return {
                path: data.path || path,
                id: data.id,
                locked: data.locked,
                tainted: data.tainted,
                uuid: data.uuid || data.id,
                custom_metadata: data.custom_metadata,
              } as Namespace;
            }
          } catch {
            // Ignore errors when fetching individual namespace details
          }

          return {
            path,
            id: undefined,
            locked: undefined,
            tainted: undefined,
          } as Namespace;
        }),
      );

      return namespaceDetails;
    },
    enabled: !!listResponse && !!client && (
      ((listResponse as { data?: NamespacesListNamespacesResponse })?.data?.keys?.length ?? 0) > 0 || 
      ((listResponse as NamespacesListNamespacesResponse)?.keys?.length ?? 0) > 0
    ),
  });

  // Handle potential nested data structure for determining if we have keys
  const responseData: NamespacesListNamespacesResponse | undefined = 
    listResponse 
      ? ((listResponse as { data?: NamespacesListNamespacesResponse })?.data || 
         (listResponse as NamespacesListNamespacesResponse | undefined))
      : undefined;

  // Determine if we have namespaces from the list response
  const hasKeys =
    responseData &&
    responseData.keys !== undefined &&
    Array.isArray(responseData.keys) &&
    responseData.keys.length > 0;

  // Create basic namespace objects from the keys
  // These are always available when we have keys from the list response
  const basicNamespaces =
    hasKeys && responseData && responseData.keys
      ? responseData.keys.map((path) => ({ path } as Namespace))
      : [];

  // Return namespaces: prefer detailed data if available and complete, otherwise use basic
  // The details query might return fewer items if some fetches fail, so we ensure
  // we always show all namespaces from the list response
  let finalNamespaces: Namespace[] = [];
  
  if (hasKeys) {
    // We have keys, so we should show namespaces
    if (namespaces.data !== undefined && namespaces.data.length === basicNamespaces.length) {
      // Details query completed and returned all namespaces, use detailed data
      finalNamespaces = namespaces.data;
    } else {
      // Details query hasn't completed, failed, or returned incomplete data
      // Use basic namespaces to ensure all are shown
      finalNamespaces = basicNamespaces;
    }
  } else {
    // No keys from list response, no namespaces to show
    finalNamespaces = [];
  }

  return {
    loading: isLoading || (hasKeys && namespaces.isLoading),
    error: queryError?.message ?? namespaces.error?.message ?? null,
    namespaces: finalNamespaces,
  };
}

/**
 * Hook to create or update a namespace
 */
export function useCreateNamespace() {
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...namespacesWriteNamespacesPathMutation({
      client: client ?? undefined,
    }),
    onSuccess: () => {
      // Invalidate and refetch namespaces list
      queryClient.invalidateQueries({
        queryKey: ['namespacesListNamespaces'],
      });
      queryClient.invalidateQueries({
        queryKey: ['namespaces', 'details'],
      });
    },
  });
}

/**
 * Hook to delete a namespace
 */
export function useDeleteNamespace() {
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...namespacesDeleteNamespacesPathMutation({
      client: client ?? undefined,
    }),
    onSuccess: () => {
      // Invalidate and refetch namespaces list
      queryClient.invalidateQueries({
        queryKey: ['namespacesListNamespaces'],
      });
      queryClient.invalidateQueries({
        queryKey: ['namespaces', 'details'],
      });
    },
  });
}
