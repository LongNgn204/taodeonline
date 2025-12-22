// Chú thích: Main App component với routing

import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import { useAuth } from './hooks/useAuth';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Community from './pages/Community';
import Libraries from './pages/Libraries';
import LibraryDetail from './pages/LibraryDetail';
import CreateExam from './pages/CreateExam';
import DigitizeExam from './pages/DigitizeExam';
import StudentExam from './pages/StudentExam';
import ExamDetail from './pages/ExamDetail';
import ExamHistory from './pages/ExamHistory';
import Settings from './pages/Settings';
import AIHub from './pages/AIHub';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TokenDashboard from './pages/TokenDashboard';

// New Pages (Phase 15/16)
import ZaloIntegration from './pages/ZaloIntegration';
import CameraGrading from './pages/CameraGrading';
import Gradebook from './pages/Gradebook';
import Guide7991 from './pages/Guide7991';

// New Pages (Final Completion)
import LessonPlan from './pages/LessonPlan';
import Skkn from './pages/Skkn';

function App() {
    const { user } = useAuth();
    // ...
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/guide-7991" element={<Guide7991 />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Protected routes */}
            <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Community & Extensions */}
                <Route path="/community" element={<Community />} />
                <Route path="/zalo-integration" element={<ZaloIntegration />} />
                <Route path="/grading" element={<CameraGrading />} />
                <Route path="/gradebook" element={<Gradebook />} />

                {/* Core Features */}
                <Route path="/libraries" element={<Libraries />} />
                <Route path="/libraries/:id" element={<LibraryDetail />} />
                <Route path="/libraries/:id/create-exam" element={<CreateExam />} />
                <Route path="/create-exam" element={<CreateExam />} />
                <Route path="/digitize" element={<DigitizeExam />} />
                <Route path="/exams/:id" element={<ExamDetail />} />
                <Route path="/history" element={<ExamHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-hub" element={<AIHub />} />
                <Route path="/exams/:id/analytics" element={<AnalyticsDashboard />} />
                <Route path="/usage" element={<TokenDashboard />} />

                {/* New Modules */}
                <Route path="/lesson-plan" element={<LessonPlan />} />
                <Route path="/skkn" element={<Skkn />} />
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
