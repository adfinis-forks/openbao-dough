import { FileTrayStackedIcon, RefreshIcon, SettingsIcon } from '@icons';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp, Search } from '@/shared/components/common/Icons';
import { Input } from '@/shared/components/common/Input';
import { useFilteredNamespaces, useNamespaces } from './useNamespaces';
import './NamespacePicker.css';

interface NamespacePickerProps {
  onCloseMobileMenu?: () => void;
}

export function NamespacePicker({ onCloseMobileMenu }: NamespacePickerProps) {
  const navigate = useNavigate();

  const [isNamespaceDropdownOpen, setIsNamespaceDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // virtual focus index: 0 = search, 1..N = namespaces, N+1 = refresh, N+2 = settings
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const namespaceDropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRefreshRef = useRef<HTMLButtonElement | null>(null);
  const footerSettingsRef = useRef<HTMLButtonElement | null>(null);

  const { namespaces, loading, refetch, isFetching } = useNamespaces();
  const filteredNamespaces = useFilteredNamespaces(namespaces, searchQuery);

  const namespaceCount = filteredNamespaces.length;
  const totalFocusable = 1 + namespaceCount + 2; // search + namespaces + (refresh, settings)

  const resetFocus = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsNamespaceDropdownOpen(false);
    setSearchQuery('');
    resetFocus();
  }, [resetFocus]);

  const toggleDropdown = useCallback(() => {
    setIsNamespaceDropdownOpen((prev) => !prev);
  }, []);

  const scrollVirtualItemIntoView = useCallback(
    (index: number) => {
      if (index === 0) {
        // search
        searchContainerRef.current?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
        return;
      }

      if (index >= 1 && index <= namespaceCount) {
        const nsIndex = index - 1;
        const item = itemRefs.current[nsIndex];
        item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
      }

      if (index === namespaceCount + 1) {
        footerRefreshRef.current?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
        return;
      }

      if (index === namespaceCount + 2) {
        footerSettingsRef.current?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
        return;
      }
    },
    [namespaceCount],
  );

  const focusVirtualItem = useCallback(
    (index: number) => {
      if (index === 0) {
        const inputEl = searchContainerRef.current?.querySelector('input');
        inputEl?.focus();
        return;
      }

      if (index >= 1 && index <= namespaceCount) {
        const nsIndex = index - 1;
        const item = itemRefs.current[nsIndex];
        if (item) {
          item.focus();
        }
        return;
      }

      if (index === namespaceCount + 1) {
        footerRefreshRef.current?.focus();
        return;
      }

      if (index === namespaceCount + 2) {
        footerSettingsRef.current?.focus();
        return;
      }
    },
    [namespaceCount],
  );

  // Reset focused index when dropdown opens/closes or search changes
  useEffect(() => {
    if (!isNamespaceDropdownOpen || namespaceCount === 0) {
      resetFocus();
    }
  }, [isNamespaceDropdownOpen, namespaceCount, resetFocus]);

  // Auto-focus dropdown container when it opens (not a specific item)
  useEffect(() => {
    if (isNamespaceDropdownOpen && dropdownRef.current) {
      requestAnimationFrame(() => {
        dropdownRef.current?.focus();
      });
    }
  }, [isNamespaceDropdownOpen]);

  useEffect(() => {
    if (isNamespaceDropdownOpen) return;

    if (filteredNamespaces.length > 0) {
      const firstNamespaceVirtualIndex = 1;
      setFocusedIndex(firstNamespaceVirtualIndex);
      scrollVirtualItemIntoView(firstNamespaceVirtualIndex);
      focusVirtualItem(firstNamespaceVirtualIndex);
    } else {
      setFocusedIndex(0);
      focusVirtualItem(0);
    }
  }, [
    isNamespaceDropdownOpen,
    filteredNamespaces,
    scrollVirtualItemIntoView,
    focusVirtualItem,
  ]);

  // Close namespace dropdown when clicking outside
  useEffect(() => {
    if (!isNamespaceDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        namespaceDropdownRef.current &&
        !namespaceDropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNamespaceDropdownOpen, closeDropdown]);

  const handleNavigateToNamespaces = useCallback(() => {
    navigate({ to: '/access/namespaces' });
    closeDropdown();
    onCloseMobileMenu?.();
  }, [navigate, closeDropdown, onCloseMobileMenu]);

  const handleRefresh = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await refetch();
    },
    [refetch],
  );

  const handleNamespaceSelect = useCallback(
    (nsIndex: number) => {
      const selectedNamespace = filteredNamespaces[nsIndex];
      if (!selectedNamespace) return;

      // TODO: Implement namespace switching using selectedNamespace
      closeDropdown();
    },
    [filteredNamespaces, closeDropdown],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isNamespaceDropdownOpen || totalFocusable === 0) return;

      const key = event.key;

      // ESCAPE — close
      if (key === 'Escape') {
        event.preventDefault();
        closeDropdown();
        return;
      }

      // ENTER — activate focused item
      if (key === 'Enter') {
        event.preventDefault();
        if (focusedIndex === null) return;

        if (focusedIndex === 0) {
          // search — nothing special on Enter here
          const inputEl = searchContainerRef.current?.querySelector('input');
          inputEl?.focus();
          return;
        }

        if (focusedIndex >= 1 && focusedIndex <= namespaceCount) {
          const nsIndex = focusedIndex - 1;
          handleNamespaceSelect(nsIndex);
          return;
        }

        if (focusedIndex === namespaceCount + 1) {
          // refresh
          footerRefreshRef.current?.click();
          return;
        }

        if (focusedIndex === namespaceCount + 2) {
          // settings
          footerSettingsRef.current?.click();
          return;
        }

        return;
      }

      // ARROW navigation
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();

        setFocusedIndex((prev) => {
          let next: number;

          if (prev === null) {
            // first move: go to search (down) or last (up)
            next = key === 'ArrowDown' ? 0 : totalFocusable - 1;
          } else if (key === 'ArrowDown') {
            next = (prev + 1) % totalFocusable;
          } else {
            next = (prev - 1 + totalFocusable) % totalFocusable;
          }

          scrollVirtualItemIntoView(next);
          focusVirtualItem(next);

          return next;
        });
      }
    },
    [
      isNamespaceDropdownOpen,
      closeDropdown,
      focusedIndex,
      namespaceCount,
      totalFocusable,
      scrollVirtualItemIntoView,
      focusVirtualItem,
      handleNamespaceSelect,
    ],
  );

  return (
    <div className="sidebar__footer">
      <div
        className="sidebar__namespace"
        ref={namespaceDropdownRef}
        onClick={toggleDropdown}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isNamespaceDropdownOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          // keyboard for trigger: open/close on Enter/Space
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        <div className="sidebar__namespace-label">
          <FileTrayStackedIcon />
          <span>namespace</span>
        </div>
        <div className="sidebar__namespace-header">
          <p className="sidebar__namespace-value">/ (root)</p>
          <ChevronUp
            size={16}
            className={`sidebar__namespace-chevron ${
              isNamespaceDropdownOpen ? 'sidebar__namespace-chevron--open' : ''
            }`}
          />
        </div>

        {isNamespaceDropdownOpen && (
          <div
            ref={dropdownRef}
            className="sidebar__namespace-dropdown"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
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
                <button
                  type="button"
                  className="sidebar__namespace-dropdown-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToNamespaces();
                  }}
                >
                  Go to Namespaces
                </button>
              </div>
            ) : (
              <>
                <div
                  className="sidebar__namespace-dropdown-header"
                  ref={searchContainerRef}
                >
                  <Input
                    placeholder="Search namespaces..."
                    value={searchQuery}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSearchQuery(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    icon={<Search size={16} />}
                    className="sidebar__namespace-dropdown-search"
                  />
                </div>

                {filteredNamespaces.length === 0 ? (
                  <div className="sidebar__namespace-dropdown-item">
                    <p className="sidebar__namespace-dropdown-message">
                      No namespaces found
                    </p>
                    <p className="sidebar__namespace-dropdown-description">
                      Try adjusting your search query
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="sidebar__namespace-dropdown-list">
                      {filteredNamespaces.map((ns, index) => {
                        const virtualIndex = index + 1; // 0 = search, so list starts at 1
                        const isFocused = focusedIndex === virtualIndex;

                        return (
                          <div
                            key={ns.uuid ?? ns.path}
                            ref={(el) => {
                              itemRefs.current[index] = el;
                            }}
                            className={`sidebar__namespace-dropdown-item sidebar__namespace-dropdown-item--clickable ${
                              isFocused
                                ? 'sidebar__namespace-dropdown-item--focused'
                                : ''
                            }`}
                            tabIndex={-1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNamespaceSelect(index);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNamespaceSelect(index);
                              }
                            }}
                            onMouseEnter={() => setFocusedIndex(virtualIndex)}
                            role="option"
                            aria-selected={isFocused}
                          >
                            <span className="sidebar__namespace-dropdown-path">
                              {ns.path}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="sidebar__namespace-dropdown-footer">
                      <button
                        type="button"
                        ref={footerRefreshRef}
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
                        ref={footerSettingsRef}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
