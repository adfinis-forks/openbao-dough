import type React from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import './Dropdown.css';

export interface DropdownProps {
  children: ReactNode;
  trigger: ReactNode;
  align?: 'start' | 'end' | 'center';
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  trigger,
  align = 'start',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown__trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown__content dropdown__content--${align}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  danger = false,
  disabled = false,
}) => {
  return (
    <button
      className={`dropdown-item ${danger ? 'dropdown-item--danger' : ''} ${disabled ? 'dropdown-item--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Alias for shadcn/ui compatibility
export const DropdownMenu = Dropdown;
export const DropdownMenuContent = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => <>{children}</>;
