import type React from 'react';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasIcon = Boolean(icon);

    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      error && 'input-wrapper--error',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'input',
      hasIcon && `input--with-icon-${iconPosition}`,
      error && 'input--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
          </label>
        )}
        <div className="input__container">
          {icon && iconPosition === 'left' && (
            <span className="input__icon input__icon--left">{icon}</span>
          )}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />
          {icon && iconPosition === 'right' && (
            <span className="input__icon input__icon--right">{icon}</span>
          )}
        </div>
        {error && <span className="input__error">{error}</span>}
        {hint && !error && <span className="input__hint">{hint}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';

// Label Component for standalone use
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
      {required && <span className="label__required">*</span>}
    </label>
  );
};
