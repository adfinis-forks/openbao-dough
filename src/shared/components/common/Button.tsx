import type React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outlined'
  | 'outlined-danger'
  | 'menu-item';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  active = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    size !== 'medium' && `btn--${size}`,
    fullWidth && 'btn--full-width',
    (disabled || loading) && 'btn--disabled',
    active && 'btn--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderContent = () => {
    if (loading) {
      return <span className="btn__loader" />;
    }

    return (
      <span className="btn__content">
        {icon && iconPosition === 'left' && (
          <span className="btn__icon">{icon}</span>
        )}
        <span className="btn__text">{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="btn__icon">{icon}</span>
        )}
      </span>
    );
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      data-text={typeof children === 'string' ? children : ''}
      {...props}
    >
      {renderContent()}
    </button>
  );
};
