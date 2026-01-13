import type React from 'react';
import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react';
import './TextArea.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasIcon = Boolean(icon);

    const wrapperClasses = [
      'textarea-wrapper',
      fullWidth && 'textarea-wrapper--full-width',
      error && 'textarea-wrapper--error',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClasses = [
      'textarea',
      hasIcon && `textarea--with-icon-${iconPosition}`,
      error && 'textarea--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className="textarea__label">
            {label}
          </label>
        )}
        <div className="textarea__container">
          {icon && iconPosition === 'left' && (
            <span className="textarea__icon textarea__icon--left">{icon}</span>
          )}
          <textarea ref={ref} id={textareaId} className={textareaClasses} {...props} />
          {icon && iconPosition === 'right' && (
            <span className="textarea__icon textarea__icon--right">{icon}</span>
          )}
        </div>
        {error && <span className="textarea__error">{error}</span>}
        {hint && !error && <span className="textarea__hint">{hint}</span>}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
