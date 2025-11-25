import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  namespacesDeleteNamespacesPathMutation,
  namespacesListNamespacesQueryKey,
  namespacesWriteNamespacesPathMutation,
} from '@/shared/client/@tanstack/react-query.gen';
import {
  namespacesListNamespaces,
  namespacesReadNamespacesPath,
} from '@/shared/client/sdk.gen';
import type { NamespacesListNamespacesResponse } from '@/shared/client/types.gen';
import { useAuth } from '@/shared/hooks/useAuth';

export interface Namespace {
  path: string;
  id?: string;
  locked?: boolean;
  tainted?: boolean;
  uuid?: string;
  custom_metadata?: Record<string, unknown>;
}

const extractListResponse = (
  raw: unknown,
): NamespacesListNamespacesResponse | undefined => {
  if (!raw) return undefined;
  const maybeWrapped = raw as { data?: NamespacesListNamespacesResponse };
  if (maybeWrapped.data) return maybeWrapped.data;
  return raw as NamespacesListNamespacesResponse;
};

/**
 * Hook to debounce a value
 */
export function useDebouncer<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function useFilteredNamespaces(
  namespaces: Namespace[],
  searchQuery: string,
  delay: number = 300,
): Namespace[] {
  const debouncedSearchQuery = useDebouncer(searchQuery, delay);

  return useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return namespaces;
    return namespaces.filter((ns) => ns.path.toLowerCase().includes(q));
  }, [namespaces, debouncedSearchQuery]);
}

/**
 * Hook to list all namespaces from the server
 */
export function useNamespaces() {
  const { getAuthenticatedClient } = useAuth();
  const client = getAuthenticatedClient();

  // 1. Base "list" query – returns keys & maybe key_info
  const listQuery = useQuery({
    queryKey: namespacesListNamespacesQueryKey({
      client: client ?? undefined,
      query: { list: 'true' },
    }),
    enabled: !!client,
    retry: false,
    queryFn: async () => {
      if (!client) {
        throw new Error('Client not available');
      }

      // Use throwOnError: false to check response status
      const result = await namespacesListNamespaces({
        client,
        query: { list: 'true' },
        throwOnError: false,
      });

      // If there's an error, check if it's a 404 (empty list)
      if ('error' in result && result.error) {
        // Check if the response status is 404
        if (result.response.status === 404) {
          // 404 means empty list, return empty response structure
          return {
            keys: [],
            key_info: undefined,
          } as NamespacesListNamespacesResponse;
        }
        // For other errors, throw them
        throw result.error;
      }

      // Return the data if available
      return result.data;
    },
  });

  const responseData = extractListResponse(listQuery.data);

  const hasKeys =
    !!responseData &&
    Array.isArray(responseData.keys) &&
    responseData.keys.length > 0;

  const basicNamespaces: Namespace[] =
    hasKeys && responseData?.keys
      ? responseData.keys.map((path) => ({ path }))
      : [];

  // 2. Details query – enrich each namespace
  const detailsQuery = useQuery<Namespace[]>({
    queryKey: [
      'namespaces',
      'details',
      responseData?.keys,
      responseData?.key_info,
    ],
    enabled: !!client && hasKeys,
    queryFn: async () => {
      if (!responseData?.keys || !client) {
        return [];
      }

      const keyInfo = responseData.key_info;

      // Case 1: key_info already contains everything
      if (
        keyInfo &&
        typeof keyInfo === 'object' &&
        Object.keys(keyInfo).length > 0
      ) {
        return responseData.keys.map((path: string) => {
          const info = keyInfo[path] as Record<string, unknown> | undefined;
          if (info && typeof info === 'object') {
            const infoPath =
              typeof info.path === 'string' ? (info.path as string) : path;

            const id =
              typeof info.id === 'string' ? (info.id as string) : undefined;
            const uuid =
              typeof info.uuid === 'string'
                ? (info.uuid as string)
                : (id ?? undefined);

            const customMetadata =
              info.custom_metadata &&
              typeof info.custom_metadata === 'object' &&
              !Array.isArray(info.custom_metadata)
                ? (info.custom_metadata as Record<string, unknown>)
                : undefined;

            return {
              path: infoPath || path,
              id,
              locked:
                typeof info.locked === 'boolean'
                  ? (info.locked as boolean)
                  : undefined,
              tainted:
                typeof info.tainted === 'boolean'
                  ? (info.tainted as boolean)
                  : undefined,
              uuid,
              custom_metadata: customMetadata,
            } as Namespace;
          }

          // fallback – basic
          return { path } as Namespace;
        });
      }

      // Case 2: call read endpoint for each namespace
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
            // ignore individual failures
          }

          return { path } as Namespace;
        }),
      );

      return namespaceDetails;
    },
  });

  // Prefer detailed data only when it's "complete"
  const finalNamespaces: Namespace[] =
    hasKeys &&
    Array.isArray(detailsQuery.data) &&
    detailsQuery.data.length === basicNamespaces.length
      ? detailsQuery.data
      : basicNamespaces;

  const errorMessage =
    (listQuery.error as Error | null)?.message ??
    (detailsQuery.error as Error | null)?.message ??
    null;

  return {
    namespaces: finalNamespaces,
    loading: listQuery.isLoading || (hasKeys && detailsQuery.isLoading),
    error: errorMessage,
    isFetching: listQuery.isFetching || detailsQuery.isFetching,
    // IMPORTANT: one place to refresh everything
    refetch: async () => {
      await listQuery.refetch();
      await detailsQuery.refetch();
    },
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
      // Invalidate both list & details to be safe
      queryClient.invalidateQueries({
        // this should match the key prefix used in namespacesListNamespacesOptions
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
      queryClient.invalidateQueries({
        queryKey: ['namespacesListNamespaces'],
      });
      queryClient.invalidateQueries({
        queryKey: ['namespaces', 'details'],
      });
    },
  });
}
