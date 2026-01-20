import { useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useNotifications } from '../../shared/components/common/Notification';
import { useAuth } from '../../shared/hooks/useAuth';
import './Namespaces.css';
import {
  type Namespace,
  useCreateNamespace,
  useDeleteNamespace,
  useFilteredNamespaces,
  useNamespaces,
} from './useNamespaces';
import { CreateNamespaceView } from './Views/CreateNamespaceView';
import { NamespaceTableView } from './Views/NamespaceTableView';
import { ViewKeyInfoView } from './Views/ViewKeyInfoView';

export const Namespaces: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [namespacePath, setNamespacePath] = useState('');
  const [viewingKeyInfo, setViewingKeyInfo] = useState<Namespace | null>(null);

  const { namespaces, loading, error, isFetching, refetch } = useNamespaces();
  const { setNamespace } = useAuth();
  const queryClient = useQueryClient();

  const deleteNamespace = useDeleteNamespace();
  const createNamespace = useCreateNamespace();
  const { addNotification } = useNotifications();

  const sortedNamespaces = useMemo(
    () =>
      [...namespaces].sort((a, b) => {
        if (a.path.startsWith(`${b.path}/`)) return 1;
        if (b.path.startsWith(`${a.path}/`)) return -1;
        return a.path.localeCompare(b.path);
      }),
    [namespaces],
  );

  const filteredNamespaces = useFilteredNamespaces(
    sortedNamespaces,
    searchQuery,
  );

  const getNestingLevel = (path: string): number =>
    Math.max(path.split('/').length - 1, 0);

  const handleSwitchNamespace = useCallback(
    (path: string) => {
      setNamespace(path);
      queryClient.invalidateQueries();
      addNotification({
        type: 'success',
        title: 'Namespace switched',
        message: `Switched to namespace "${path}"`,
      });
    },
    [setNamespace, queryClient, addNotification],
  );

  const handleDelete = useCallback(
    async (path: string) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete namespace "${path}"?`,
      );
      if (!confirmed) return;

      try {
        await deleteNamespace.mutateAsync({ path: { path } });
        addNotification({
          type: 'success',
          title: 'Namespace deleted',
          message: `Namespace "${path}" has been deleted`,
        });

        await refetch();
      } catch (err) {
        console.error('Failed to delete namespace:', err);
        addNotification({
          type: 'error',
          title: 'Failed to delete namespace',
          message:
            err instanceof Error
              ? err.message
              : 'An error occurred while deleting the namespace',
        });
      }
    },
    [deleteNamespace, addNotification, refetch],
  );

  const handleRefresh = useCallback(() => {
    // This now uses the exact same queries as the hook
    refetch();
  }, [refetch]);

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleBack = useCallback(() => {
    setIsCreating(false);
    setNamespacePath('');
    setViewingKeyInfo(null);
  }, []);

  const handleViewKeyInfo = useCallback((namespace: Namespace) => {
    setViewingKeyInfo(namespace);
  }, []);

  const handlePathChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNamespacePath(e.target.value);
    },
    [],
  );

  const handleCreateNamespace = useCallback(async () => {
    const trimmed = namespacePath.trim();
    if (!trimmed) return;

    try {
      await createNamespace.mutateAsync({
        path: { path: trimmed },
        body: {},
      });

      addNotification({
        type: 'success',
        title: 'Namespace created',
        message: `Namespace "${trimmed}" has been successfully created`,
      });

      setIsCreating(false);
      setNamespacePath('');

      await refetch();
    } catch (err) {
      console.error('Failed to create namespace:', err);
      addNotification({
        type: 'error',
        title: 'Failed to create namespace',
        message:
          err instanceof Error
            ? err.message
            : 'An error occurred while creating the namespace',
      });
    }
  }, [namespacePath, createNamespace, addNotification, refetch]);

  const getKeyInfoData = useCallback((namespace: Namespace) => {
    const namespaceInfo = {
      custom_metadata: namespace.custom_metadata || {},
      id: namespace.id || '',
      locked: namespace.locked ?? false,
      path: namespace.path,
      tainted: namespace.tainted ?? false,
      uuid: namespace.uuid || namespace.id || '',
    };

    const keyInfo: Record<string, unknown> = {};
    keyInfo[namespace.path] = namespaceInfo;

    return {
      key_info: keyInfo,
    };
  }, []);

  if (isCreating) {
    return (
      <CreateNamespaceView
        namespacePath={namespacePath}
        onPathChange={handlePathChange}
        onBack={handleBack}
        onCreate={handleCreateNamespace}
        isPending={createNamespace.isPending}
      />
    );
  }

  if (viewingKeyInfo) {
    return (
      <ViewKeyInfoView
        namespace={viewingKeyInfo}
        onBack={handleBack}
        getKeyInfoData={getKeyInfoData}
      />
    );
  }

  return (
    <NamespaceTableView
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filteredNamespaces={filteredNamespaces}
      loading={loading}
      error={error}
      isFetching={isFetching}
      onRefresh={handleRefresh}
      onCreateClick={handleCreateClick}
      onSwitchNamespace={handleSwitchNamespace}
      onViewKeyInfo={handleViewKeyInfo}
      onDelete={handleDelete}
      getNestingLevel={getNestingLevel}
    />
  );
};
