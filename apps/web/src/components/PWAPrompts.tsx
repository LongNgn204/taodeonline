// Chú thích: PWA Update Prompt - Hiển thị khi có version mới
// Và Offline Indicator khi mất kết nối

import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Download, WifiOff, X, Sparkles, Check } from 'lucide-react';
import { Button } from './ui/Button';

// ===== PWA UPDATE PROMPT =====
export function PWAUpdatePrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(registration) {
            console.log('[PWA] Service Worker registered:', registration);
        },
        onRegisterError(error) {
            console.error('[PWA] Service Worker registration error:', error);
        },
    });

    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await updateServiceWorker(true);
        } catch (e) {
            console.error('[PWA] Update failed:', e);
            setUpdating(false);
        }
    };

    const handleDismiss = () => {
        setNeedRefresh(false);
    };

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Phiên bản mới</h3>
                            <p className="text-sm text-white/80">Có bản cập nhật mới</p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="ml-auto p-1 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Cập nhật để có trải nghiệm tốt nhất với các tính năng mới và sửa lỗi.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleDismiss}
                            className="flex-1"
                        >
                            Để sau
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updating}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            {updating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Cập nhật ngay
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== OFFLINE INDICATOR =====
export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                // Hiển thị thông báo đã kết nối lại
                setShowBanner(true);
                setTimeout(() => setShowBanner(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (!showBanner) return null;

    return (
        <div className="fixed top-16 left-0 right-0 z-40 px-4">
            <div
                className={`max-w-md mx-auto rounded-xl shadow-lg p-3 flex items-center gap-3 animate-slide-down ${isOnline
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
                    }`}
            >
                {isOnline ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Đã kết nối lại
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Dữ liệu sẽ được đồng bộ
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <WifiOff className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Mất kết nối mạng
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                Bạn vẫn có thể xem nội dung đã tải
                            </p>
                        </div>
                    </>
                )}

                <button
                    onClick={() => setShowBanner(false)}
                    className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ===== INSTALL PWA PROMPT =====
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWAPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Chỉ hiện sau 30s đầu tiên
            setTimeout(() => {
                if (!localStorage.getItem('pwa-prompt-dismissed')) {
                    setShowPrompt(true);
                }
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === 'accepted') {
            console.log('[PWA] User accepted install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa-prompt-dismissed', 'true');
        setShowPrompt(false);
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-50 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-lg">
                        K
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Cài đặt ứng dụng
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Thêm Kiến Tạo Việt vào màn hình chính
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDismiss}
                        className="flex-1"
                    >
                        Không, cảm ơn
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleInstall}
                        className="flex-1 flex items-center justify-center gap-1"
                    >
                        <Download className="w-4 h-4" />
                        Cài đặt
                    </Button>
                </div>
            </div>
        </div>
    );
}
