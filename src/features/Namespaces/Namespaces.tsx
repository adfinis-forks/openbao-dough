import type React from 'react';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@common/Button';
import { Input } from '@common/Input';
import {
  Dropdown,
  DropdownMenuItem,
} from '../../shared/components/common/Dropdown';
import {
  MoreHorizontal,
  Database,
  Search,
  Plus,
  ChevronDown,
} from '../../shared/components/common/Icons';
import RefreshIcon from '@public/refresh-outline.svg?react';
import { useNotifications } from '../../shared/components/common/Notification';
import './Namespaces.css';
import {
  useNamespaces,
  useDeleteNamespace,
  useCreateNamespace,
} from './useNamespaces';

export const Namespaces: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [namespacePath, setNamespacePath] = useState('');
  const { namespaces, loading, error } = useNamespaces();
  const deleteNamespace = useDeleteNamespace();
  const createNamespace = useCreateNamespace();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const getNestingLevel = (path: string): number => {
    return path.split('/').length - 1;
  };

  const getDisplayPath = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const sortedNamespaces = useMemo(() => {
    return [...namespaces].sort((a, b) => {
      if (a.path.startsWith(`${b.path}/`)) {
        return 1;
      }
      if (b.path.startsWith(`${a.path}/`)) {
        return -1;
      }
      return a.path.localeCompare(b.path);
    });
  }, [namespaces]);

  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedNamespaces;
    }
    const query = searchQuery.toLowerCase();
    return sortedNamespaces.filter((namespace) =>
      namespace.path.toLowerCase().includes(query),
    );
  }, [sortedNamespaces, searchQuery]);

  const handleDelete = async (path: string) => {
    if (confirm(`Are you sure you want to delete namespace "${path}"?`)) {
      try {
        await deleteNamespace.mutateAsync({
          path: { path },
        });
      } catch (error) {
        console.error('Failed to delete namespace:', error);
      }
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['namespacesListNamespaces'],
    });
    queryClient.invalidateQueries({
      queryKey: ['namespaces', 'details'],
    });
  };

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleBack = () => {
    setIsCreating(false);
    setNamespacePath('');
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNamespacePath(e.target.value);
  };

  const handleCreateNamespace = async () => {
    if (!namespacePath.trim()) {
      return;
    }

    try {
      await createNamespace.mutateAsync({
        path: { path: namespacePath.trim() },
        body: {},
      });
      addNotification({
        type: 'success',
        title: 'Namespace created',
        message: `Namespace "${namespacePath.trim()}" has been successfully created`,
      });
      setIsCreating(false);
      setNamespacePath('');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to create namespace',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating the namespace',
      });
    }
  };

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

  return (
    <div className="namespaces-view">
      <div className="namespaces-view__header">
        <div>
          <h1 className="namespaces-view__title">Namespaces</h1>
        </div>
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
          >
            Refresh namespaces
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
          ) : filteredNamespaces.length === 0 ? (
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
              {filteredNamespaces.map((namespace) => {
                const nestingLevel = getNestingLevel(namespace.path);
                const displayPath = getDisplayPath(namespace.path);

                return (
                  <div
                    key={namespace.path || namespace.uuid}
                    className={`namespace-item namespace-item--level-${nestingLevel}`}
                  >
                    <div className="namespace-item__info">
                      {nestingLevel > 0 && (
                        <span className="namespace-item__indent" />
                      )}
                      <Database size={20} />
                      <span
                        className="namespace-item__label"
                        title={namespace.path}
                      >
                        {displayPath}
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
                          onClick={() => handleDelete(namespace.path)}
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
