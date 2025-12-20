// Chú thích: Community page - khám phá và chia sẻ ma trận - Revamped UI

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Download, Search, Share2, Sparkles, User, Globe, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SharedMatrix {
    id: string;
    title: string;
    subject: string;
    grade: string;
    description: string;
    downloads: number;
    created_at: string;
    user_id: string;
}

export default function Community() {
    const [matrices, setMatrices] = useState<SharedMatrix[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatrices();
    }, []);

    async function fetchMatrices() {
        try {
            const res = await api.get('/community/matrices');
            const data = await res.json();
            setMatrices(data.matrices || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleImport(id: string) {
        if (!confirm('Bạn có muốn sao chép ma trận này về kho của mình không?')) return;
        setImporting(id);
        try {
            const res = await api.post(`/community/matrices/${id}/import`, {});
            const data = await res.json();
            if (res.ok && data.examId) {
                navigate(`/exams/${data.examId}`);
            }
        } catch (e) {
            alert('Lỗi khi import');
        } finally {
            setImporting(null);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                        <Globe className="w-8 h-8 text-primary-500" />
                        Cộng đồng Kiến Tạo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Khám phá hàng ngàn ma trận đề thi chất lượng từ giáo viên trên toàn quốc.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="btn-secondary">
                        <Share2 className="w-4 h-4" />
                        Chia sẻ đề của tôi
                    </button>
                    <button className="btn-primary">
                        <Sparkles className="w-4 h-4" />
                        Khám phá AI
                    </button>
                </div>
            </div>

            {/* Sticky Search Bar */}
            <div className="sticky top-20 z-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-lg shadow-black/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo môn học, lớp, từ khóa..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-2 text-sm overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa', 'GDCD'].map(subj => (
                        <button key={subj} className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-500/30 whitespace-nowrap transition-colors">
                            {subj}
                        </button>
                    ))}
                    <button className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matrices.map(m => (
                        <div
                            key={m.id}
                            className="group bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Đăng bởi</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[100px]">GV. {m.user_id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                                    {m.subject} {m.grade}
                                </span>
                            </div>

                            <div className="flex-1 mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                                    {m.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                    {m.description || 'Chưa có mô tả chi tiết cho tài liệu này.'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Download className="w-3.5 h-3.5" /> {m.downloads}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span>{new Date(m.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <button
                                    onClick={() => handleImport(m.id)}
                                    disabled={importing === m.id}
                                    className="btn-sm btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                >
                                    {importing === m.id ? <div className="spinner w-3 h-3" /> : <Download className="w-3 h-3" />}
                                    Tải về
                                </button>
                            </div>
                        </div>
                    ))}

                    {matrices.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có kết quả</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
