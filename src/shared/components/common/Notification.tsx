import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import './Notification.css';
import CloseCircleOultineIcon from '@public/close-circle-outline.svg?react';
import MegaphoneOutlineIcon from '@public/megaphone-outline.svg?react';
import NotificationsOutlineIcon from '@public/notifications-outline.svg?react';
import SkullOutlineIcon from '@public/skull-outline.svg?react';
import ThumbsUpOutlineIcon from '@public/thumbs-up-outline.svg?react';

// Types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationInput {
  type: NotificationType;
  title: string;
  message?: string;
}

interface Notification extends NotificationInput {
  id: string;
}

interface NotificationContextValue {
  addNotification: (notification: NotificationInput) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

// Provider
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function addNotification(notification: NotificationInput): void {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }

  function removeNotification(id: string): void {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const configs = {
    success: {
      icon: <ThumbsUpOutlineIcon />,
      color: 'var(--color-primary)',
    },
    error: {
      icon: <SkullOutlineIcon />,
      color: 'var(--color-red)',
    },
    warning: {
      icon: <MegaphoneOutlineIcon />,
      color: 'var(--color-secondary)',
    },
    info: {
      icon: <NotificationsOutlineIcon />,
      color: 'var(--color-blue)',
    },
  };

  function NotificationItem({ notification }: { notification: Notification }) {
    useEffect(() => {
      const timer = setTimeout(
        () => removeNotification(notification.id),
        10000,
      );
      return () => clearTimeout(timer);
    }, [notification.id]);

    const config = configs[notification.type];

    return (
      <div className="notification" style={{ borderLeftColor: config.color }}>
        <div style={{ color: config.color }}>{config.icon}</div>
        <div className="notification-content">
          <div className="title">{notification.title}</div>
          {notification.message && (
            <div className="notification-message body-text">
              {notification.message}
            </div>
          )}
        </div>
        <button
          type="button"
          className="notification-close"
          onClick={() => removeNotification(notification.id)}
        >
          <CloseCircleOultineIcon />
        </button>
      </div>
    );
  }

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification }}
    >
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
}
