// Chú thích: Notification Settings page - Cài đặt thông báo riêng
// Lấy route /settings/notifications

import { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Sun, Moon, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../lib/notifications';
import { Button } from '../components/ui/Button';

export default function NotificationSettings() {
    const navigate = useNavigate();
    const { permission, requestPermission } = useNotifications();

    // Notification preferences
    const [notifExam, setNotifExam] = useState(() => localStorage.getItem('notif_exam') !== 'false');
    const [notifLesson, setNotifLesson] = useState(() => localStorage.getItem('notif_lesson') !== 'false');
    const [notifSystem, setNotifSystem] = useState(() => localStorage.getItem('notif_system') !== 'false');
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sound') !== 'false');

    // Theme
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    // Theme effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Thông báo & Giao diện
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Tùy chỉnh cách nhận thông báo và hiển thị
                    </p>
                </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-500" />
                    Thông báo đẩy
                </h3>

                {/* Permission */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">Thông báo trình duyệt</p>
                        <p className="text-sm text-gray-500">Nhận thông báo ngay cả khi không mở app</p>
                    </div>
                    {permission === 'granted' ? (
                        <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            Đã bật
                        </span>
                    ) : permission === 'denied' ? (
                        <span className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                            Bị từ chối
                        </span>
                    ) : (
                        <Button size="sm" onClick={requestPermission}>
                            Bật thông báo
                        </Button>
                    )}
                </div>

                {/* Notification Types */}
                <div className="space-y-3">
                    {[
                        { key: 'exam', label: 'Đề thi', desc: 'Khi đề thi được tạo xong', value: notifExam, set: setNotifExam },
                        { key: 'lesson', label: 'KHBD/SKKN', desc: 'Khi tài liệu được lưu', value: notifLesson, set: setNotifLesson },
                        { key: 'system', label: 'Hệ thống', desc: 'Cập nhật, bảo trì, thông báo quan trọng', value: notifSystem, set: setNotifSystem },
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={item.value}
                                    onChange={(e) => {
                                        item.set(e.target.checked);
                                        localStorage.setItem(`notif_${item.key}`, String(e.target.checked));
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    ))}
                </div>

                {/* Sound */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Âm thanh thông báo</p>
                                <p className="text-sm text-gray-500">Phát âm thanh khi có thông báo mới</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={(e) => {
                                    setSoundEnabled(e.target.checked);
                                    localStorage.setItem('sound', String(e.target.checked));
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-primary-500" />
                    Chế độ hiển thị
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'light', label: 'Sáng', icon: Sun },
                        { id: 'dark', label: 'Tối', icon: Moon },
                        { id: 'system', label: 'Hệ thống', icon: Globe },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === opt.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <opt.icon className={`w-6 h-6 ${theme === opt.id ? 'text-primary-500' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${theme === opt.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                {opt.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-end">
                <Button onClick={() => navigate('/settings')}>
                    Quay lại Cài đặt
                </Button>
            </div>
        </div>
    );
}
