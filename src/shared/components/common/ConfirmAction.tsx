import { useEffect, useRef } from 'react';
import { Button } from './Button';
import { AlertTriangle } from './Icons';
import './ConfirmAction.css';

interface ConfirmActionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export function ConfirmAction({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}: ConfirmActionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="confirm-action" ref={ref}>
      <div className="confirm-action__message">
        <div className="confirm-action__title">
          <AlertTriangle size={16} />
          {title}
        </div>
        <p>{message}</p>
      </div>
      <div className="confirm-action__options">
        <Button
          variant={confirmVariant === 'danger' ? 'outlined-danger' : 'primary'}
          onClick={onConfirm}
          className="confirm-action__button"
        >
          {confirmText}
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
          className="confirm-action__button"
        >
          {cancelText}
        </Button>
      </div>
    </div>
  );
}
