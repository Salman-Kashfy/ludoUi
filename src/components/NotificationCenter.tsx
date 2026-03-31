import React, { useState, useCallback, useEffect } from 'react';
import './NotificationCenter.css';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
}

// Global notification listeners
const notificationListeners: Set<(notification: NotificationPayload) => void> = new Set();

export const addNotificationListener = (callback: (notification: NotificationPayload) => void) => {
  notificationListeners.add(callback);
  return () => {
    notificationListeners.delete(callback);
  };
};

export const triggerNotification = (notification: Omit<NotificationPayload, 'id' | 'timestamp'>) => {
  const payload: NotificationPayload = {
    ...notification,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    duration: notification.duration || 5000
  };
  notificationListeners.forEach(callback => callback(payload));
};

/**
 * NotificationCenter Component
 * Displays push notifications in the UI (both foreground and system notifications)
 * 
 * Usage:
 * 1. Add <NotificationCenter /> to your App or main layout
 * 2. Import and use triggerNotification() to show notifications
 * 3. Auto-hides after duration specified (default 5s, 0 = no auto-hide)
 */
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: NotificationPayload) => {
    setNotifications(prev => [notification, ...prev]);

    // Auto-hide notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, [removeNotification]);

  // Subscribe to global notification events
  useEffect(() => {
    const unsubscribe = addNotificationListener(addNotification);
    return unsubscribe;
  }, [addNotification]);

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: NotificationPayload;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return '🔔';
    }
  };

  return (
    <div className={`notification-item notification-${notification.type || 'info'}`}>
      <div className="notification-icon">
        {notification.icon ? (
          <img src={notification.icon} alt="" />
        ) : (
          <span>{getIcon()}</span>
        )}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        {notification.body && (
          <div className="notification-body">{notification.body}</div>
        )}
      </div>
      <button className="notification-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default NotificationCenter;
