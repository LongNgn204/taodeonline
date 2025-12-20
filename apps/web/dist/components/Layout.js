import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Layout component với sidebar và header
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, LogOut, Menu, X, FileSpreadsheet, } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/libraries', label: 'Thư viện', icon: BookOpen },
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-black/50 lg:hidden", onClick: () => setSidebarOpen(false) })), _jsxs("aside", { className: `fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`, children: [_jsxs("div", { className: "h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center", children: _jsx(FileSpreadsheet, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "font-bold text-lg text-gray-900 dark:text-white", children: "Exam Matrix" })] }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("nav", { className: "p-4 space-y-1", children: navItems.map((item) => (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`, onClick: () => setSidebarOpen(false), children: [_jsx(item.icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: item.label })] }, item.path))) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium text-sm", children: user?.email[0].toUpperCase() }), _jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]", children: user?.email })] }), _jsx("button", { onClick: handleLogout, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-500 transition-colors", title: "\u0110\u0103ng xu\u1EA5t", children: _jsx(LogOut, { className: "w-5 h-5" }) })] }) })] }), _jsxs("div", { className: "lg:pl-64", children: [_jsx("header", { className: "sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "h-full px-4 flex items-center justify-between", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700", children: _jsx(Menu, { className: "w-5 h-5" }) }), _jsx("div", { className: "flex-1" }), _jsx("div", { className: "text-sm text-gray-500", children: "CV 7991/BGD\u0110T-GDTrH" })] }) }), _jsx("main", { className: "p-4 md:p-6 lg:p-8", children: _jsx(Outlet, {}) })] })] }));
}
//# sourceMappingURL=Layout.js.map