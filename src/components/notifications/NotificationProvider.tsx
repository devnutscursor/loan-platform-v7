'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Custom notification types
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

// Create notification context
const NotificationContext = createContext<{
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
  removeNotification: (id: string) => void;
} | null>(null);

// Notification provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      duration: 4500,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Set global handler on mount
  React.useEffect(() => {
    setGlobalNotificationHandler(addNotification);
    return () => {
      setGlobalNotificationHandler(() => {});
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// Notification container component
function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Individual notification item
function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: NotificationData; 
  onClose: () => void;
}) {
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`
      max-w-sm w-full bg-white border rounded-lg shadow-lg p-4
      transform transition-all duration-300 ease-in-out
      ${getNotificationStyles()}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-lg mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {notification.message}
          </p>
          {notification.description && (
            <p className="text-sm mt-1 opacity-90">
              {notification.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Global notification functions
let globalAddNotification: ((notification: Omit<NotificationData, 'id'>) => void) | null = null;

export const setGlobalNotificationHandler = (handler: (notification: Omit<NotificationData, 'id'>) => void) => {
  globalAddNotification = handler;
};

export const showSuccessNotification = (message: string, description?: string) => {
  if (globalAddNotification) {
    globalAddNotification({ type: 'success', message, description });
  }
};

export const showErrorNotification = (message: string, description?: string) => {
  if (globalAddNotification) {
    globalAddNotification({ type: 'error', message, description, duration: 6000 });
  }
};

export const showWarningNotification = (message: string, description?: string) => {
  if (globalAddNotification) {
    globalAddNotification({ type: 'warning', message, description });
  }
};

export const showInfoNotification = (message: string, description?: string) => {
  if (globalAddNotification) {
    globalAddNotification({ type: 'info', message, description });
  }
};
