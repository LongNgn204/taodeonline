// Chú thích: Layout component với sidebar và header
// Refactored for "Modern/Glass" theme

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    FileSpreadsheet,
    Sparkles,
    QrCode,
    Camera,
    BarChart3,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ChatAssistant from './ChatAssistant';

const navItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/libraries', label: 'Thư viện', icon: BookOpen },
    { path: '/create-exam', label: 'Tạo đề thi', icon: FileSpreadsheet, highlight: true },
    { path: '/history', label: 'Kho đề thi', icon: Clock },
    { path: '/community', label: 'Cộng đồng', icon: Sparkles },
    { path: '/gradebook', label: 'Sổ điểm', icon: BarChart3 },
    { path: '/grading', label: 'Chấm Camera', icon: Camera },
    { path: '/zalo-integration', label: 'Kết nối Zalo', icon: QrCode },
    { path: '/ai-hub', label: 'Trung tâm AI', icon: Sparkles },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-white font-bold font-display">K</span>
                        </div>
                        <span className="font-bold text-lg font-display tracking-tight">Kiến Tạo Việt</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                                } ${item.highlight ? 'ring-1 ring-primary-500/30' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${
                                // Highlight logic for icon
                                ''
                                }`} />
                            <span className="truncate">{item.label}</span>
                            {item.highlight && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />}
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm shadow-md">
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                Giáo viên
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
                                {/* Dynamic Page Title Could Go Here */}
                                Tổng quan
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-500/20">
                                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                    CV 7991/BGDĐT-GDTrH
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
                    <Outlet />
                </main>
            </div>

            {/* AI Assistant Chat */}
            <ChatAssistant />
        </div>
    );
}
