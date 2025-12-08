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
  const { getAuthenticatedClient, currentNamespace } = useAuth();
  const client = getAuthenticatedClient();

  const listQuery = useQuery({
    queryKey: [
      ...namespacesListNamespacesQueryKey({
        client: client ?? undefined,
        query: { list: 'true' },
      }),
      'namespace',
      currentNamespace ?? 'root',
    ],
    enabled: !!client,
    retry: false,
    queryFn: async () => {
      if (!client) {
        throw new Error('Client not available');
      }

      const result = await namespacesListNamespaces({
        client,
        query: { list: 'true' },
        throwOnError: false,
      });

      //Error 404 is expected behaviour and we should show empty list if we receive it
      if ('error' in result && result.error) {
        if (result.response.status === 404) {
          return {
            keys: [],
            key_info: undefined,
          } as NamespacesListNamespacesResponse;
        }
        throw result.error;
      }

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

  const detailsQuery = useQuery<Namespace[]>({
    queryKey: [
      'namespaces',
      'details',
      responseData?.keys,
      responseData?.key_info,
      'namespace',
      currentNamespace ?? 'root',
    ],
    enabled: !!client && hasKeys,
    queryFn: async () => {
      if (!responseData?.keys || !client) {
        return [];
      }

      const keyInfo = responseData.key_info;

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
          } catch {}

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
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            (key[0] === 'namespacesListNamespaces' ||
              (key[0] === 'namespaces' && key[1] === 'details'))
          );
        },
      });
    },
  });
}

/**
 * Hook to delete a namespace
 */
export function useDeleteNamespace() {
  const { getAuthenticatedClient, currentNamespace, setNamespace } = useAuth();
  const client = getAuthenticatedClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...namespacesDeleteNamespacesPathMutation({
      client: client ?? undefined,
    }),
    onSuccess: (_, variables) => {
      const deletedPath = variables.path.path;

      // If the deleted namespace is the current namespace, switch back to root
      if (currentNamespace === deletedPath) {
        setNamespace(null);
      }

      // Invalidate namespace list queries for all namespaces
      // (namespace list is global, so we invalidate all namespace-specific queries)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          // Match queries that start with 'namespacesListNamespaces' or 'namespaces'
          return (
            Array.isArray(key) &&
            (key[0] === 'namespacesListNamespaces' ||
              (key[0] === 'namespaces' && key[1] === 'details'))
          );
        },
      });
    },
  });
}
