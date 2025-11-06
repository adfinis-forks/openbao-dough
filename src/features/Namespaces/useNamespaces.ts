import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  namespacesListNamespacesOptions,
  namespacesReadNamespacesPathOptions,
  namespacesWriteNamespacesPathMutation,
  namespacesDeleteNamespacesPathMutation,
} from '@/shared/client/@tanstack/react-query.gen';
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
      if (!listResponse?.keys || !client) {
        return [];
      }

      // If key_info exists and has data, use it
      if (
        listResponse.key_info &&
        Object.keys(listResponse.key_info).length > 0
      ) {
        return listResponse.keys.map((path) => {
          const info = listResponse.key_info?.[path] as any;
          if (info && typeof info === 'object') {
            return {
              path: info.path || path,
              id: info.id,
              locked: info.locked,
              tainted: info.tainted,
              uuid: info.uuid || info.id,
              custom_metadata: info.custom_metadata,
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
        listResponse.keys.map(async (path) => {
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
          } catch (error) {}

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
    enabled: !!listResponse?.keys && !!client && listResponse.keys.length > 0,
  });

  return {
    loading: isLoading || namespaces.isLoading,
    error: queryError?.message ?? namespaces.error?.message ?? null,
    namespaces: namespaces.data ?? [],
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
