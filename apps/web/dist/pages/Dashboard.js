import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Dashboard tổng quan
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Plus, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/api';
export default function Dashboard() {
    const [stats, setStats] = useState({
        librariesCount: 0,
        examsCount: 0,
        recentExams: [],
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchStats() {
            try {
                const [libRes, examRes] = await Promise.all([
                    api.get('/libraries'),
                    api.get('/exams'),
                ]);
                const libData = await libRes.json();
                const examData = await examRes.json();
                setStats({
                    librariesCount: libData.libraries?.length || 0,
                    examsCount: examData.exams?.length || 0,
                    recentExams: (examData.exams || []).slice(0, 5),
                });
            }
            catch (e) {
                console.error('Failed to fetch stats', e);
            }
            finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "spinner w-8 h-8 border-primary-500" }) }));
    }
    return (_jsxs("div", { className: "space-y-8 animate-fade-in", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "T\u1ED5ng quan" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: "Ch\u00E0o m\u1EEBng \u0111\u1EBFn v\u1EDBi Exam Matrix Generator" })] }), _jsxs(Link, { to: "/libraries", className: "btn-primary", children: [_jsx(Plus, { className: "w-4 h-4" }), "T\u1EA1o th\u01B0 vi\u1EC7n m\u1EDBi"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center", children: _jsx(BookOpen, { className: "w-6 h-6 text-primary-600 dark:text-primary-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Th\u01B0 vi\u1EC7n" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats.librariesCount })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center", children: _jsx(FileText, { className: "w-6 h-6 text-accent-600 dark:text-accent-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u0110\u1EC1 thi" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats.examsCount })] })] }) }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Chu\u1EA9n CV 7991" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "100%" })] })] }) })] }), _jsxs("div", { className: "bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white", children: [_jsx("h2", { className: "text-xl font-bold mb-2", children: "B\u1EAFt \u0111\u1EA7u nhanh" }), _jsx("p", { className: "text-primary-100 mb-6", children: "T\u1EA1o ma tr\u1EADn v\u00E0 \u0111\u1EC1 ki\u1EC3m tra theo c\u00E1c b\u01B0\u1EDBc \u0111\u01A1n gi\u1EA3n" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                            { step: 1, title: 'Tạo thư viện', desc: 'Chọn môn, lớp, bộ sách' },
                            { step: 2, title: 'Upload tài liệu', desc: 'SGK, tài liệu tham khảo' },
                            { step: 3, title: 'Tạo ma trận', desc: 'AI hỗ trợ theo CV 7991' },
                            { step: 4, title: 'Sinh đề & Export', desc: 'Excel ma trận, Word đề thi' },
                        ].map((item) => (_jsxs("div", { className: "bg-white/10 backdrop-blur rounded-xl p-4", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-3", children: item.step }), _jsx("h3", { className: "font-semibold mb-1", children: item.title }), _jsx("p", { className: "text-sm text-primary-100", children: item.desc })] }, item.step))) })] }), stats.recentExams.length > 0 && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "\u0110\u1EC1 thi g\u1EA7n \u0111\u00E2y" }), _jsx(Link, { to: "/exams", className: "text-sm text-primary-600 hover:underline", children: "Xem t\u1EA5t c\u1EA3" })] }), _jsx("div", { className: "space-y-3", children: stats.recentExams.map((exam) => (_jsxs(Link, { to: `/exams/${exam.id}`, className: "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: exam.title })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx(Clock, { className: "w-4 h-4" }), new Date(exam.updatedAt).toLocaleDateString('vi-VN')] })] }, exam.id))) })] }))] }));
}
//# sourceMappingURL=Dashboard.js.map