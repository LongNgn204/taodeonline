// Chú thích: Dashboard tổng quan

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Plus, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/api';

interface Stats {
    librariesCount: number;
    examsCount: number;
    recentExams: Array<{ id: string; title: string; updatedAt: string }>;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
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
            } catch (e) {
                console.error('Failed to fetch stats', e);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-8 h-8 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Chào mừng đến với Exam Matrix Generator
                    </p>
                </div>
                <Link to="/libraries" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Tạo thư viện mới
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Thư viện</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.librariesCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Đề thi</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.examsCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chuẩn CV 7991</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick start */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
                <h2 className="text-xl font-bold mb-2">Bắt đầu nhanh</h2>
                <p className="text-primary-100 mb-6">
                    Tạo ma trận và đề kiểm tra theo các bước đơn giản
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { step: 1, title: 'Tạo thư viện', desc: 'Chọn môn, lớp, bộ sách' },
                        { step: 2, title: 'Upload tài liệu', desc: 'SGK, tài liệu tham khảo' },
                        { step: 3, title: 'Tạo ma trận', desc: 'AI hỗ trợ theo CV 7991' },
                        { step: 4, title: 'Sinh đề & Export', desc: 'Excel ma trận, Word đề thi' },
                    ].map((item) => (
                        <div key={item.step} className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-3">
                                {item.step}
                            </div>
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-primary-100">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent exams */}
            {stats.recentExams.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đề thi gần đây</h2>
                        <Link to="/exams" className="text-sm text-primary-600 hover:underline">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentExams.map((exam) => (
                            <Link
                                key={exam.id}
                                to={`/exams/${exam.id}`}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">{exam.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
