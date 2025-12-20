// Chú thích: Main App component với routing

import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Libraries from './pages/Libraries';
import LibraryDetail from './pages/LibraryDetail';
import CreateExam from './pages/CreateExam';
import DigitizeExam from './pages/DigitizeExam';
import StudentLayout from './components/StudentLayout';
import StudentExam from './pages/StudentExam';
import ExamDetail from './pages/ExamDetail';
import Settings from './pages/Settings';
import AIHub from './pages/AIHub';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TokenDashboard from './pages/TokenDashboard';
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Protected routes */}
            <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/libraries" element={<Libraries />} />
                <Route path="/libraries/:id" element={<LibraryDetail />} />
                <Route path="/libraries/:id/create-exam" element={<CreateExam />} />
                <Route path="/digitize" element={<DigitizeExam />} />
                <Route path="/exams/:id" element={<ExamDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-hub" element={<AIHub />} />
                <Route path="/exams/:id/analytics" element={<AnalyticsDashboard />} />
                <Route path="/usage" element={<TokenDashboard />} />
            </Route>

            {/* Student Portal Routes */}
            <Route element={<StudentLayout />}>
                <Route path="/take-exam/:code" element={<StudentExam />} />
            </Route>

            {/* 404 */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
                            <p className="text-gray-500">Trang không tồn tại</p>
                            <a href="/" className="mt-4 inline-block text-primary-600 hover:underline">
                                Về trang chủ
                            </a>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;
