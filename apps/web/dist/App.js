import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Main App component với routing
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Libraries from './pages/Libraries';
import LibraryDetail from './pages/LibraryDetail';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import Settings from './pages/Settings';
import { useAuth } from './hooks/useAuth';
function App() {
    const { user, loading, checkAuth } = useAuth();
    useEffect(() => {
        checkAuth();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "spinner mx-auto mb-4 w-8 h-8 border-primary-500" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "\u0110ang t\u1EA3i..." })] }) }));
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/" }) : _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: user ? _jsx(Navigate, { to: "/" }) : _jsx(Register, {}) }), _jsxs(Route, { element: user ? _jsx(Layout, {}) : _jsx(Navigate, { to: "/login" }), children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/libraries", element: _jsx(Libraries, {}) }), _jsx(Route, { path: "/libraries/:id", element: _jsx(LibraryDetail, {}) }), _jsx(Route, { path: "/libraries/:id/create-exam", element: _jsx(CreateExam, {}) }), _jsx(Route, { path: "/exams/:id", element: _jsx(ExamDetail, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) })] }), _jsx(Route, { path: "*", element: _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 dark:text-white mb-2", children: "404" }), _jsx("p", { className: "text-gray-500", children: "Trang kh\u00F4ng t\u1ED3n t\u1EA1i" })] }) }) })] }));
}
export default App;
//# sourceMappingURL=App.js.map