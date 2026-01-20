import { Button } from '@common/Button';
import { Input } from '@common/Input';
import RefreshIcon from '@public/refresh-outline.svg?react';
import type React from 'react';
import {
  Dropdown,
  DropdownMenuItem,
} from '../../../shared/components/common/Dropdown';
import {
  MoreHorizontal,
  Plus,
  Search,
} from '../../../shared/components/common/Icons';
import type { Namespace } from '../useNamespaces';

interface NamespaceTableViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredNamespaces: Namespace[];
  loading: boolean;
  error: string | null;
  isFetching: boolean;
  onRefresh: () => void;
  onCreateClick: () => void;
  onSwitchNamespace: (path: string) => void;
  onViewKeyInfo: (namespace: Namespace) => void;
  onDelete: (path: string) => void;
  getNestingLevel: (path: string) => number;
}

export const NamespaceTableView: React.FC<NamespaceTableViewProps> = ({
  searchQuery,
  setSearchQuery,
  filteredNamespaces,
  loading,
  error,
  isFetching,
  onRefresh,
  onCreateClick,
  onSwitchNamespace,
  onViewKeyInfo,
  onDelete,
  getNestingLevel,
}) => {
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
            onClick={onRefresh}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh namespaces'}
          </Button>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={onCreateClick}
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
                        <DropdownMenuItem
                          onClick={() => onSwitchNamespace(ns.path)}
                        >
                          Switch to Namespace
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewKeyInfo(ns)}>
                          View Key Info
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          danger
                          onClick={() => onDelete(ns.path)}
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
