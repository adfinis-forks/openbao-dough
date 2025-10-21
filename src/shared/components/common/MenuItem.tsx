import { ChevronForwardIcon } from '@icons';
import { useNavigate } from '@tanstack/react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './MenuItem.css';

export type MenuItemVariant = 'link' | 'section';

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MenuItemVariant;
  active?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  to?: string;
}

const SectionArrow = () => (
  <span className="menu-item__section-arrow" aria-hidden>
    <ChevronForwardIcon className="menu-item__section-arrow-icon menu-item__section-arrow-icon--one" />
    <ChevronForwardIcon className="menu-item__section-arrow-icon menu-item__section-arrow-icon--two" />
    <ChevronForwardIcon className="menu-item__section-arrow-icon menu-item__section-arrow-icon--three" />
  </span>
);

export function MenuItem({
  variant = 'link',
  active = false,
  icon,
  trailingIcon,
  children,
  className = '',
  disabled = false,
  type,
  to,
  onClick,
  ...props
}: MenuItemProps) {
  const navigate = useNavigate();

  const menuItemClasses = [
    'menu-item',
    `menu-item--${variant}`,
    active && 'menu-item--active',
    disabled && 'menu-item--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderedTrailingIcon =
    trailingIcon ?? (variant === 'section' ? <SectionArrow /> : null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (to) {
      navigate({ to });
    }
    onClick?.(e);
  };

  return (
    <button
      type={type ?? 'button'}
      className={menuItemClasses}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="menu-item__icon">{icon}</span>}
      <span className="menu-item__text">{children}</span>
      {renderedTrailingIcon && (
        <span className="menu-item__trailing-icon">{renderedTrailingIcon}</span>
      )}
    </button>
  );
}
