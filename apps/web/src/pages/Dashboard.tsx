// Chú thích: Dashboard tổng quan - Revamped UI

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Plus, TrendingUp, Clock, ArrowRight, Zap } from 'lucide-react';
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
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header / Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 shadow-2xl shadow-primary-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Xin chào, Giáo viên! 👋</h1>
                        <p className="text-primary-100 max-w-xl">
                            Chào mừng thầy/cô quay trở lại. Hệ thống đã sẵn sàng hỗ trợ thầy/cô tạo ma trận
                            và đề thi chuẩn Công văn 7991.
                        </p>
                    </div>
                    <Link
                        to="/libraries"
                        className="btn-white self-start md:self-auto shadow-lg shadow-black/20"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo thư viện mới
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Thống kê nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card: Libraries */}
                    <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:border-primary-500/30 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Thư viện đề</p>
                                <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1 group-hover:text-primary-500 transition-colors">
                                    {stats.librariesCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Card: Exams */}
                    <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:border-accent-500/30 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Đề thi đã tạo</p>
                                <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1 group-hover:text-accent-500 transition-colors">
                                    {stats.examsCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Card: Rating/Compliance */}
                    <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chuẩn CV 7991</p>
                                <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1 group-hover:text-green-500 transition-colors">
                                    100%
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Exams List - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Hoạt động gần đây
                        </h2>
                        {stats.recentExams.length > 0 && (
                            <Link to="/exams" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center gap-1 group">
                                Xem tất cả
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>

                    {stats.recentExams.length > 0 ? (
                        <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                            {stats.recentExams.map((exam, index) => (
                                <Link
                                    key={exam.id}
                                    to={`/exams/${exam.id}`}
                                    className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${index !== stats.recentExams.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                                {exam.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Cập nhật: {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-primary-500 transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Chưa có đề thi nào</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                Bắt đầu tạo đề thi đầu tiên của bạn ngay hôm nay. Hệ thống sẽ giúp bạn lưu trữ và quản lý dễ dàng.
                            </p>
                            <Link to="/libraries" className="btn-primary inline-flex">
                                <Plus className="w-4 h-4" />
                                Tạo đề mới ngay
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Tips - Takes up 1 column */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Mẹo sử dụng
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                title: 'Quy trình 4 bước',
                                desc: 'Chọn môn -> Upload tài liệu -> Tạo ma trận -> Xuất đề Word.',
                                color: 'bg-blue-500'
                            },
                            {
                                title: 'Chuẩn 7991',
                                desc: 'Ma trận được tự động cân đối tỉ lệ NB-TH-VD-VDC.',
                                color: 'bg-purple-500'
                            },
                            {
                                title: 'Chấm Camera',
                                desc: 'Sử dụng điện thoại để chấm phiếu trắc nghiệm cực nhanh.',
                                color: 'bg-green-500'
                            },
                        ].map((item, i) => (
                            <div key={i} className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-default">
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${item.color} shrink-0`} />
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <p className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wide">Mới nhất</p>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                Cộng đồng chia sẻ
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Tham gia kho tài nguyên đề thi cùng hàng ngàn giáo viên khác.
                            </p>
                            <Link to="/community" className="text-sm font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
                                Khám phá ngay <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
