import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppNotification, NotificationType } from '../types';

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        try {
            const savedNotifications = localStorage.getItem('app_notifications');
            return savedNotifications ? JSON.parse(savedNotifications) : [];
        } catch (error) {
            console.error("Failed to parse notifications from localStorage", error);
            return [];
        }
    });

    // useEffect(() => {
    //     localStorage.setItem('app_notifications', JSON.stringify(notifications));
    // }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: AppNotification = {
            ...notification,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};