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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4 w-8 h-8 border-primary-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

            {/* Protected routes */}
            <Route element={user ? <Layout /> : <Navigate to="/login" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/libraries" element={<Libraries />} />
                <Route path="/libraries/:id" element={<LibraryDetail />} />
                <Route path="/libraries/:id/create-exam" element={<CreateExam />} />
                <Route path="/exams/:id" element={<ExamDetail />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
                            <p className="text-gray-500">Trang không tồn tại</p>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;
