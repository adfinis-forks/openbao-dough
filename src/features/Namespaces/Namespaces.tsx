import type React from 'react';
import { useState, useMemo } from 'react';
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
} from '../../shared/components/common/Icons';
import './Namespaces.css';
import { useNamespaces, useDeleteNamespace } from './useNamespaces';

export const Namespaces: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { namespaces, loading, error } = useNamespaces();
  const deleteNamespace = useDeleteNamespace();

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
          <Button variant="primary" icon={<Plus size={16} />}>
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
