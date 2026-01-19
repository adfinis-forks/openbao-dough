import { FileTrayStackedIcon, RefreshIcon, SettingsIcon } from '@icons';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp, Search } from '@/shared/components/common/Icons';
import { Input } from '@/shared/components/common/Input';
import { useAuth } from '@/shared/hooks/useAuth';
import { useFilteredNamespaces, useNamespaces } from './useNamespaces';
import './NamespacePicker.css';
import { Button } from '@/shared/components/common/Button';

interface NamespacePickerProps {
  onCloseMobileMenu?: () => void;
}

export function NamespacePicker({ onCloseMobileMenu }: NamespacePickerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentNamespace, setNamespace } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { namespaces, loading, refetch, isFetching } = useNamespaces();
  const filteredNamespaces = useFilteredNamespaces(namespaces, searchQuery);

  // Build list: conditionally include root + filtered namespaces
  const namespaceList = useMemo(() => {
    const showRoot =
      !searchQuery ||
      '/'.includes(searchQuery.toLowerCase()) ||
      'root'.includes(searchQuery.toLowerCase());

    const items: Array<{ path: string | null; label: string }> = [];

    if (showRoot) {
      items.push({ path: null, label: '/ (root)' });
    }

    for (const ns of filteredNamespaces) {
      items.push({ path: ns.path, label: ns.path });
    }

    return items;
  }, [searchQuery, filteredNamespaces]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightIndex(-1);
  }, []);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isOpen]);

  const handleNavigateToNamespaces = useCallback(() => {
    navigate({ to: '/access/namespaces' });
    close();
    onCloseMobileMenu?.();
  }, [navigate, close, onCloseMobileMenu]);

  const handleRefresh = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await refetch();
    },
    [refetch],
  );

  const selectNamespace = useCallback(
    (index: number) => {
      const ns = namespaceList[index];
      if (!ns) return;

      setNamespace(ns.path);
      queryClient.invalidateQueries();
      close();
    },
    [namespaceList, setNamespace, queryClient, close],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        e.preventDefault();
        return;
      }

      if (e.key === 'ArrowDown') {
        setHighlightIndex((i) => Math.min(i + 1, namespaceList.length - 1));
        e.preventDefault();
        return;
      }

      if (e.key === 'ArrowUp') {
        setHighlightIndex((i) => Math.max(i - 1, 0));
        e.preventDefault();
        return;
      }

      if (e.key === 'Enter' && highlightIndex >= 0) {
        selectNamespace(highlightIndex);
        e.preventDefault();
      }
    },
    [close, namespaceList.length, highlightIndex, selectNamespace],
  );

  const displayNamespace = currentNamespace || '/ (root)';

  return (
    <div className="sidebar__footer">
      <div className="sidebar__namespace-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className="sidebar__namespace"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="sidebar__namespace-content">
            <FileTrayStackedIcon />
            <span className="sidebar__namespace-label">namespace:</span>
            <span className="sidebar__namespace-value">{displayNamespace}</span>
          </div>
          <ChevronUp
            size={16}
            className={`sidebar__namespace-chevron ${
              isOpen ? 'sidebar__namespace-chevron--open' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="sidebar__namespace-dropdown"
            role="dialog"
            onKeyDown={onKeyDown}
          >
            {loading ? (
              <div className="sidebar__namespace-dropdown-item">
                <p className="sidebar__namespace-dropdown-message">
                  Loading namespaces...
                </p>
              </div>
            ) : namespaces.length === 0 ? (
              <div className="sidebar__namespace-dropdown-item">
                <p className="sidebar__namespace-dropdown-message">
                  No namespaces yet
                </p>
                <p className="sidebar__namespace-dropdown-description">
                  Your namespaces will be listed here. Add your first namespace
                  to get started.
                </p>
                <Button
                  className="sidebar__namespace-dropdown-button"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToNamespaces();
                  }}
                >
                  Go to Namespaces
                </Button>
                <Button
                  variant="secondary"
                  className="sidebar__namespace-dropdown-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNamespace(null);
                    queryClient.invalidateQueries();
                    close();
                  }}
                >
                  Switch to root
                </Button>
              </div>
            ) : (
              <>
                <div className="sidebar__namespace-dropdown-header">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search namespaces..."
                    value={searchQuery}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSearchQuery(e.target.value);
                      setHighlightIndex(0);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    icon={<Search size={16} />}
                    className="sidebar__namespace-dropdown-search"
                  />
                </div>

                {namespaceList.length === 0 ? (
                  <div className="sidebar__namespace-dropdown-item">
                    <p className="sidebar__namespace-dropdown-message">
                      No namespaces found
                    </p>
                    <p className="sidebar__namespace-dropdown-description">
                      Try adjusting your search query
                    </p>
                  </div>
                ) : (
                  <ul className="sidebar__namespace-dropdown-list">
                    {namespaceList.map((ns, idx) => (
                      <li key={ns.path ?? 'root'}>
                        <button
                          type="button"
                          className={`sidebar__namespace-dropdown-item sidebar__namespace-dropdown-item--clickable ${
                            idx === highlightIndex
                              ? 'sidebar__namespace-dropdown-item--highlight'
                              : ''
                          } ${
                            currentNamespace === ns.path
                              ? 'sidebar__namespace-dropdown-item--selected'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectNamespace(idx);
                          }}
                          onMouseEnter={() => setHighlightIndex(idx)}
                        >
                          <span className="sidebar__namespace-dropdown-path">
                            {ns.label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="sidebar__namespace-dropdown-footer">
                  <button
                    type="button"
                    className={`sidebar__namespace-dropdown-footer-button ${
                      isFetching
                        ? 'sidebar__namespace-dropdown-footer-button--loading'
                        : ''
                    }`}
                    onClick={handleRefresh}
                    title="Refresh namespaces"
                  >
                    <RefreshIcon />
                  </button>
                  <button
                    type="button"
                    className="sidebar__namespace-dropdown-footer-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToNamespaces();
                    }}
                    title="Manage namespaces"
                  >
                    <SettingsIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
