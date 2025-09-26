import type React from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outlined?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  outlined = false,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    outlined && 'badge--outlined',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
};
