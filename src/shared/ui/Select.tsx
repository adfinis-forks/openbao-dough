import type React from 'react';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  group?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  fullWidth?: boolean;
  searchable?: boolean;
  noResultsText?: string;
  ariaLabel?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  fullWidth = false,
  searchable = true,
  noResultsText = 'No results',
  ariaLabel = 'Select',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightIndex(-1);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [close]);

  useEffect(() => {
    if (open && searchable) {
      // focus search input after opening
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, searchable]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'Escape') {
      close();
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      setHighlightIndex((i) =>
        Math.min(i + 1, Math.max(0, filtered.length - 1)),
      );
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
      setHighlightIndex((i) => Math.max(i - 1, 0));
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        const opt = filtered[highlightIndex];
        if (!opt.disabled) {
          onChange(opt.value, opt);
          close();
        }
      }
      e.preventDefault();
    }
  };

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value, opt);
    close();
  };

  return (
    <div
      className={`select ${fullWidth ? 'select--full' : ''}`}
      ref={wrapperRef}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="select__control"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="select__value">
          {selected?.icon && (
            <span className="select__icon">{selected.icon}</span>
          )}
          <span
            className={`select__text ${!selected ? 'select__placeholder' : ''}`}
          >
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <span className="select__chevron">▾</span>
      </button>

      {open && (
        <div className="select__menu">
          {searchable && (
            <div className="select__search">
              <input
                ref={inputRef}
                className="select__search-input"
                placeholder="Search..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightIndex(0);
                }}
              />
            </div>
          )}
          <ul role="listbox" className="select__list">
            {filtered.length === 0 && (
              <li className="select__empty">{noResultsText}</li>
            )}
            {filtered.map((opt, idx) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  className={`select__option
                    ${opt.value === value ? 'is-selected' : ''}
                    ${idx === highlightIndex ? 'is-active' : ''}
                    ${opt.disabled ? 'is-disabled' : ''}`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => handleSelect(opt)}
                  disabled={opt.disabled}
                >
                  {opt.icon && (
                    <span className="select__option-icon">{opt.icon}</span>
                  )}
                  <span className="select__option-main">
                    <span className="select__option-label">{opt.label}</span>
                    {opt.description && (
                      <span className="select__option-desc">
                        {opt.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
