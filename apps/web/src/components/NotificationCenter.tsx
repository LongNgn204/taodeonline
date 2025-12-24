// Chú thích: Notification Center - UI hiển thị và quản lý thông báo
// Dropdown với danh sách thông báo, đánh dấu đã đọc, xóa

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Trash2,
    X,
    FileText,
    BookOpen,
    Lightbulb,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Settings
} from 'lucide-react';
import { useNotifications, Notification } from '../lib/notifications';

export default function NotificationCenter() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        permission,
        requestPermission,
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get icon for notification type
    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'info': return Info;
            case 'warning': return AlertTriangle;
            case 'error': return AlertCircle;
            case 'exam': return FileText;
            case 'lesson': return BookOpen;
            case 'skkn': return Lightbulb;
            default: return Info;
        }
    };

    // Get color for notification type
    const getColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'text-green-500';
            case 'info': return 'text-blue-500';
            case 'warning': return 'text-amber-500';
            case 'error': return 'text-red-500';
            case 'exam': return 'text-purple-500';
            case 'lesson': return 'text-teal-500';
            case 'skkn': return 'text-orange-500';
            default: return 'text-gray-500';
        }
    };

    // Format time ago
    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Thông báo
                            </h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-gray-500">
                                    {unreadCount} chưa đọc
                                </p>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Xóa tất cả"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Permission Banner */}
                    {permission !== 'granted' && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-blue-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Bật thông báo
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Nhận thông báo khi có cập nhật mới
                                    </p>
                                </div>
                                <button
                                    onClick={requestPermission}
                                    className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Bật
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Chưa có thông báo nào
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map(notification => {
                                    const Icon = getIcon(notification.type);
                                    const color = getColor(notification.type);

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 ${color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium line-clamp-1 ${notification.read
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeNotification(notification.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setIsOpen(false);
                                }}
                                className="text-sm text-primary-600 hover:underline flex items-center justify-center gap-1"
                            >
                                <Settings className="w-3 h-3" />
                                Cài đặt thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
