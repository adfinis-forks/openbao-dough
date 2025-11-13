import { Button } from '@common/Button';
import { Input } from '@common/Input';
import RefreshIcon from '@public/refresh-outline.svg?react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Dropdown,
  DropdownMenuItem,
} from '../../shared/components/common/Dropdown';
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
} from '../../shared/components/common/Icons';
import { useNotifications } from '../../shared/components/common/Notification';
import './Namespaces.css';
import {
  useCreateNamespace,
  useDeleteNamespace,
  useNamespaces,
} from './useNamespaces';

export const Namespaces: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [namespacePath, setNamespacePath] = useState('');

  const { namespaces, loading, error, isFetching, refetch } = useNamespaces();

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

  const filteredNamespaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedNamespaces;

    return sortedNamespaces.filter((ns) => ns.path.toLowerCase().includes(q));
  }, [sortedNamespaces, searchQuery]);

  const getNestingLevel = (path: string): number =>
    Math.max(path.split('/').length - 1, 0);

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

  if (isCreating) {
    return (
      <div className="create-namespace-view">
        <div className="create-namespace-view__header">
          <Button
            variant="secondary"
            icon={<ChevronDown size={16} />}
            onClick={handleBack}
            className="back-button"
          >
            Back to Namespaces
          </Button>
          <div>
            <h1 className="create-namespace-view__title">
              Create a New Namespace
            </h1>
            <p className="create-namespace-view__subtitle">
              Configure a new namespace for your vault
            </p>
          </div>
        </div>

        <div className="create-namespace-view__content">
          <div className="namespace-creation-state">
            <div className="path-configuration">
              <div className="path-form">
                <h3>Path</h3>
                <Input
                  value={namespacePath}
                  onChange={handlePathChange}
                  placeholder="Enter path for the namespace"
                />
                <div className="create-namespace-view__actions">
                  <Button
                    variant="primary"
                    onClick={handleCreateNamespace}
                    disabled={
                      !namespacePath.trim() || createNamespace.isPending
                    }
                  >
                    {createNamespace.isPending
                      ? 'Creating...'
                      : 'Create Namespace'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasNamespaces = filteredNamespaces.length > 0;

  return (
    <div className="namespaces-view">
      <div className="namespaces-view__header">
        <h1 className="namespaces-view__title">Namespaces</h1>
      </div>

      <div>
        <div className="namespaces-header">
          <Input
            placeholder="Search namespaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
            className="namespaces-search"
          />

          <Button
            variant="secondary"
            icon={<RefreshIcon width={16} height={16} />}
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh namespaces'}
          </Button>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateClick}
          >
            Create new namespace
          </Button>
        </div>

        <div>
          {loading ? (
            <div className="namespaces-empty-state">
              <p className="namespaces-empty-state__message">
                Loading namespaces...
              </p>
            </div>
          ) : error ? (
            <div className="namespaces-empty-state">
              <p className="namespaces-empty-state__message">
                Error loading namespaces
              </p>
              <p className="namespaces-empty-state__description">{error}</p>
            </div>
          ) : !hasNamespaces ? (
            <div className="namespaces-empty-state">
              <p className="namespaces-empty-state__message">
                {searchQuery ? 'No namespaces found' : 'No namespaces yet'}
              </p>
              <p className="namespaces-empty-state__description">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Your namespaces will be listed here. Add your first namespace to get started.'}
              </p>
            </div>
          ) : (
            <div className="namespaces-list">
              {filteredNamespaces.map((ns) => {
                const nestingLevel = getNestingLevel(ns.path);
                return (
                  <div
                    key={ns.uuid ?? ns.path}
                    className={`namespace-item namespace-item--level-${nestingLevel}`}
                  >
                    <div className="namespace-item__info">
                      {nestingLevel > 0 && (
                        <span className="namespace-item__indent" />
                      )}
                      <span className="namespace-item__label" title={ns.path}>
                        {ns.path}
                      </span>
                    </div>
                    <div className="namespace-item__actions">
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="small">
                            <MoreHorizontal size={14} />
                          </Button>
                        }
                        align="end"
                      >
                        <DropdownMenuItem>Switch to Namespace</DropdownMenuItem>
                        <DropdownMenuItem
                          danger
                          onClick={() => handleDelete(ns.path)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
