// Chú thích: SKKN (Sáng kiến Kinh nghiệm) Page
// Tích hợp với /skkn API

import { useState, useEffect } from 'react';
import {
    Lightbulb,
    Plus,
    FileText,
    Clock,
    Send,
    Trash2,
    Sparkles,
    Edit3
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

interface Skkn {
    id: string;
    title: string;
    category: string;
    subject?: string;
    grade?: number;
    abstract: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

const CATEGORIES = [
    { value: 'teaching_method', label: 'Phương pháp giảng dạy' },
    { value: 'classroom_management', label: 'Quản lý lớp học' },
    { value: 'assessment', label: 'Kiểm tra đánh giá' },
    { value: 'technology', label: 'Ứng dụng CNTT' },
    { value: 'curriculum', label: 'Phát triển chương trình' },
    { value: 'student_support', label: 'Hỗ trợ học sinh' },
    { value: 'other', label: 'Khác' },
];

const STATUS_STYLES = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', label: 'Bản nháp' },
    submitted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Đã gửi' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Đã duyệt' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Từ chối' },
};

export default function SkknPage() {
    const [items, setItems] = useState<Skkn[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subject: '',
        grade: 10,
        abstract: '',
        sections: ''
    });

    useEffect(() => {
        fetchItems();
    }, [filterStatus]);

    const fetchItems = async () => {
        try {
            const url = filterStatus ? `/skkn?status=${filterStatus}` : '/skkn';
            const res = await api.get(url) as { items?: Skkn[] };
            setItems(res.items || []);
        } catch (error) {
            console.error('Failed to fetch SKKN:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.category || !formData.abstract) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setGenerating(true);
        try {
            const sections = formData.sections.split('\n\n').filter(s => s.trim()).map((s, i) => ({
                title: `Phần ${i + 1}`,
                content: s.trim()
            }));

            await api.post('/skkn', {
                title: formData.title,
                category: formData.category,
                subject: formData.subject || null,
                grade: formData.grade,
                abstract: formData.abstract,
                sections
            });

            setShowCreate(false);
            setFormData({ title: '', category: '', subject: '', grade: 10, abstract: '', sections: '' });
            fetchItems();
        } catch (error) {
            console.error('Failed to create:', error);
            alert('Lỗi tạo SKKN');
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (id: string) => {
        if (!confirm('Gửi sáng kiến này để xét duyệt?')) return;
        try {
            await api.post(`/skkn/${id}/submit`);
            fetchItems();
        } catch (error) {
            console.error('Failed to submit:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa sáng kiến này?')) return;
        try {
            await api.delete(`/skkn/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Lightbulb className="w-7 h-7 text-amber-500" />
                        Sáng kiến Kinh nghiệm
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Viết và quản lý sáng kiến kinh nghiệm giáo dục
                    </p>
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo mới
                </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === ''
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                >
                    Tất cả
                </button>
                {Object.entries(STATUS_STYLES).map(([key, style]) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === key
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : `${style.bg} ${style.text}`
                            }`}
                    >
                        {style.label}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Tạo sáng kiến kinh nghiệm mới
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tên sáng kiến
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Ứng dụng AI trong dạy học Toán THPT"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lĩnh vực
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value="">Chọn lĩnh vực</option>
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Môn học (nếu có)
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="VD: Toán"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tóm tắt sáng kiến
                            </label>
                            <textarea
                                value={formData.abstract}
                                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                rows={3}
                                placeholder="Mô tả ngắn gọn nội dung và điểm mới của sáng kiến..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nội dung chi tiết (phân cách bằng dòng trống)
                            </label>
                            <textarea
                                value={formData.sections}
                                onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                                rows={6}
                                placeholder="Phần 1: Vấn đề nghiên cứu...&#10;&#10;Phần 2: Giải pháp..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={handleCreate} disabled={generating} className="flex items-center gap-2">
                            {generating ? (
                                <>
                                    <span className="spinner w-4 h-4" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    Lưu bản nháp
                                </>
                            )}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>
                            Hủy
                        </Button>
                    </div>
                </div>
            )}

            {/* Items List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner w-8 h-8 border-amber-500" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Lightbulb className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Chưa có sáng kiến nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Bắt đầu viết sáng kiến kinh nghiệm đầu tiên
                    </p>
                    <Button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo sáng kiến mới
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.draft;
                        const categoryLabel = CATEGORIES.find(c => c.value === item.category)?.label || item.category;

                        return (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-400 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                                {statusStyle.label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                            {item.abstract}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                                {categoryLabel}
                                            </span>
                                            {item.subject && (
                                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                                    {item.subject}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.status === 'draft' && (
                                            <>
                                                <button
                                                    onClick={() => handleSubmit(item.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Gửi xét duyệt"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
