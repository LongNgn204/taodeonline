// Chú thích: Notification Service - Quản lý push notifications và in-app notifications
// Hỗ trợ: Browser notifications, in-app notifications, notification center

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// ===== TYPES =====
export interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error' | 'exam' | 'lesson' | 'skkn';
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    link?: string;
    data?: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    permission: NotificationPermission;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    requestPermission: () => Promise<boolean>;
    sendPushNotification: (title: string, options?: NotificationOptions) => void;
}

// ===== CONTEXT =====
const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}

// ===== PROVIDER =====
interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        // Load from localStorage
        try {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
            }
        } catch (e) {
            console.error('Failed to load notifications:', e);
        }
        return [];
    });

    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (e) {
            console.error('Failed to save notifications:', e);
        }
    }, [notifications]);

    // Unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Add notification
    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50
    }, []);

    // Mark as read
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Request permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (typeof Notification === 'undefined') {
            console.warn('Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            setPermission('granted');
            return true;
        }

        if (Notification.permission === 'denied') {
            setPermission('denied');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (e) {
            console.error('Failed to request permission:', e);
            return false;
        }
    }, []);

    // Send push notification
    const sendPushNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        try {
            const notification = new Notification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                ...options,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (e) {
            console.error('Failed to send notification:', e);
        }
    }, [permission]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                permission,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
                requestPermission,
                sendPushNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

// ===== PREDEFINED NOTIFICATIONS =====
export const NotificationTemplates = {
    examGenerated: (examTitle: string) => ({
        type: 'exam' as const,
        title: 'Đề thi đã tạo xong',
        message: `Đề "${examTitle}" đã được tạo thành công.`,
        link: '/history',
    }),
    lessonPlanSaved: (title: string) => ({
        type: 'lesson' as const,
        title: 'KHBD đã lưu',
        message: `Kế hoạch bài dạy "${title}" đã được lưu.`,
        link: '/lesson-plan',
    }),
    skknSubmitted: (title: string) => ({
        type: 'skkn' as const,
        title: 'SKKN đã nộp',
        message: `SKKN "${title}" đã được gửi để phê duyệt.`,
        link: '/skkn',
    }),
    newVersion: () => ({
        type: 'info' as const,
        title: 'Phiên bản mới',
        message: 'Có bản cập nhật mới. Làm mới trang để nhận bản mới nhất.',
    }),
    offlineReady: () => ({
        type: 'success' as const,
        title: 'Sẵn sàng offline',
        message: 'Ứng dụng đã được lưu cache và có thể sử dụng offline.',
    }),
    syncComplete: () => ({
        type: 'success' as const,
        title: 'Đồng bộ hoàn tất',
        message: 'Dữ liệu đã được đồng bộ với máy chủ.',
    }),
    error: (message: string) => ({
        type: 'error' as const,
        title: 'Lỗi',
        message,
    }),
};
