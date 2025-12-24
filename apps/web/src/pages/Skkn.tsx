// Chú thích: SKKN - Sáng kiến Kinh nghiệm với AI
// UI giống LessonPlan: form nhập → dàn ý → viết từng phần
// Theo cấu trúc chuẩn Bộ GD&ĐT

import { useState, useEffect } from 'react';
import {
    Lightbulb,
    Plus,
    Clock,
    Sparkles,
    Trash2,
    ChevronRight,
    ChevronDown,
    Check,
    Edit3,
    Download,
    FileText,
    Send,
    RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { callAI } from '../lib/frontend-ai';
import { getAIConfig } from '../lib/ai-config';
import { exportSkknToWord } from '../lib/export-word';

// ===== DÀN Ý CHUẨN SKKN THEO BỘ GD&ĐT =====

const SKKN_OUTLINE = [
    {
        id: 'opening',
        title: 'PHẦN I. MỞ ĐẦU',
        children: [
            { id: 'opening.title', title: '1.1. Tên sáng kiến', hint: 'Tên đề tài ngắn gọn, rõ ràng' },
            { id: 'opening.author', title: '1.2. Tác giả', hint: 'Họ tên, chức vụ, đơn vị công tác' },
            { id: 'opening.reason', title: '1.3. Lý do chọn đề tài', hint: 'Tầm quan trọng, vấn đề cần giải quyết' },
            { id: 'opening.objectives', title: '1.4. Mục đích nghiên cứu', hint: 'Kết quả mong muốn đạt được' },
            { id: 'opening.tasks', title: '1.5. Nhiệm vụ nghiên cứu', hint: 'Các công việc cụ thể cần thực hiện' },
            { id: 'opening.subject', title: '1.6. Đối tượng và phạm vi nghiên cứu', hint: 'HS, GV, lớp, trường...' },
            { id: 'opening.methods', title: '1.7. Phương pháp nghiên cứu', hint: 'Khảo sát, thực nghiệm, phân tích...' },
        ]
    },
    {
        id: 'content',
        title: 'PHẦN II. NỘI DUNG',
        children: [
            { id: 'content.theory', title: '2.1. Cơ sở lý luận của vấn đề', hint: 'Lý thuyết, khái niệm nền tảng' },
            {
                id: 'content.situation',
                title: '2.2. Thực trạng của vấn đề',
                hint: 'Tình hình trước khi áp dụng',
                subItems: [
                    { id: 'content.situation.advantages', title: 'a) Thuận lợi', hint: 'Điều kiện tốt' },
                    { id: 'content.situation.difficulties', title: 'b) Khó khăn', hint: 'Vấn đề cần giải quyết' },
                    { id: 'content.situation.data', title: 'c) Số liệu khảo sát', hint: 'Dữ liệu thực tế' },
                ]
            },
            {
                id: 'content.solutions',
                title: '2.3. Các giải pháp đã sử dụng',
                hint: 'Biện pháp cụ thể',
                subItems: [
                    { id: 'content.solutions.s1', title: 'Giải pháp 1', hint: 'Mô tả chi tiết' },
                    { id: 'content.solutions.s2', title: 'Giải pháp 2', hint: 'Mô tả chi tiết' },
                    { id: 'content.solutions.s3', title: 'Giải pháp 3', hint: 'Mô tả chi tiết' },
                    { id: 'content.solutions.s4', title: 'Giải pháp 4', hint: 'Mô tả chi tiết (nếu có)' },
                    { id: 'content.solutions.s5', title: 'Giải pháp 5', hint: 'Mô tả chi tiết (nếu có)' },
                ]
            },
            { id: 'content.results', title: '2.4. Hiệu quả của sáng kiến', hint: 'Kết quả đạt được, so sánh trước/sau' },
        ]
    },
    {
        id: 'conclusion',
        title: 'PHẦN III. KẾT LUẬN VÀ KIẾN NGHỊ',
        children: [
            { id: 'conclusion.summary', title: '3.1. Kết luận', hint: 'Tổng kết nội dung, bài học kinh nghiệm' },
            { id: 'conclusion.lessons', title: '3.2. Bài học kinh nghiệm', hint: 'Những điều rút ra' },
            { id: 'conclusion.recommendations', title: '3.3. Kiến nghị', hint: 'Đề xuất với các cấp quản lý' },
        ]
    },
    {
        id: 'references',
        title: 'PHẦN IV. TÀI LIỆU THAM KHẢO',
        children: [
            { id: 'references.list', title: '4.1. Danh mục tài liệu', hint: 'Sách, văn bản, website...' },
        ]
    },
];

// Lĩnh vực SKKN
const CATEGORIES = [
    { value: 'teaching_method', label: 'Phương pháp giảng dạy' },
    { value: 'classroom_management', label: 'Quản lý lớp học' },
    { value: 'assessment', label: 'Kiểm tra đánh giá' },
    { value: 'technology', label: 'Ứng dụng CNTT' },
    { value: 'curriculum', label: 'Phát triển chương trình' },
    { value: 'student_support', label: 'Hỗ trợ học sinh' },
    { value: 'extracurricular', label: 'Hoạt động ngoại khóa' },
    { value: 'school_management', label: 'Quản lý nhà trường' },
    { value: 'other', label: 'Khác' },
];

const STATUS_STYLES = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', label: 'Bản nháp' },
    submitted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Đã gửi' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Đã duyệt' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Từ chối' },
};

interface Skkn {
    id: string;
    title: string;
    category: string;
    subject?: string;
    grade?: number;
    abstract: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    content?: Record<string, string>;
    created_at: string;
    updated_at: string;
}

interface OutlineItem {
    id: string;
    title: string;
    hint?: string;
    children?: OutlineItem[];
    subItems?: { id: string; title: string; hint?: string }[];
}

export default function SkknPage() {
    // States
    const [items, setItems] = useState<Skkn[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'list' | 'form' | 'editor'>('list');
    const [filterStatus, setFilterStatus] = useState<string>('');

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subject: '',
        authorName: '',
        authorTitle: '',
        schoolName: '',
        targetWords: 5000,
        year: new Date().getFullYear(),
    });

    // Editor state
    const [outline] = useState<OutlineItem[]>(SKKN_OUTLINE);
    const [content, setContent] = useState<Record<string, string>>({});
    const [currentSection, setCurrentSection] = useState<string>('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['opening', 'content', 'conclusion', 'references']));
    const [generating, setGenerating] = useState(false);
    const [generatingSection, setGeneratingSection] = useState<string>('');
    const [editingItem, setEditingItem] = useState<Skkn | null>(null);

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

    // Tính % hoàn thành
    const calculateProgress = () => {
        const allIds = getAllSectionIds(outline);
        const completed = allIds.filter(id => content[id]?.trim()).length;
        return Math.round((completed / allIds.length) * 100);
    };

    // Lấy tất cả section IDs
    const getAllSectionIds = (items: OutlineItem[]): string[] => {
        const ids: string[] = [];
        items.forEach(item => {
            if (item.children) {
                item.children.forEach(child => {
                    if ('subItems' in child && child.subItems) {
                        child.subItems.forEach(sub => ids.push(sub.id));
                    } else {
                        ids.push(child.id);
                    }
                });
            }
        });
        return ids;
    };

    // Đếm số từ
    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(w => w).length;
    };

    // Tổng số từ
    const totalWords = Object.values(content).reduce((sum, text) => sum + countWords(text), 0);

    // Bắt đầu tạo dàn ý
    const handleStartOutline = async () => {
        if (!formData.title || !formData.category) {
            alert('Vui lòng nhập tên sáng kiến và chọn lĩnh vực');
            return;
        }

        // Pre-fill thông tin cơ bản
        setContent({
            'opening.title': formData.title,
            'opening.author': `Họ và tên: ${formData.authorName}\nChức vụ: ${formData.authorTitle}\nĐơn vị công tác: ${formData.schoolName}`,
        });

        setCurrentSection('opening.title');
        setStep('editor');
    };

    // Tạo nội dung cho 1 section bằng AI
    const handleGenerateSection = async (sectionId: string) => {
        const config = getAIConfig();
        if (!config.apiKey) {
            alert('Vui lòng cấu hình API Key trong phần Cài đặt');
            return;
        }

        setGeneratingSection(sectionId);

        try {
            // Tìm thông tin section
            let sectionTitle = '';
            let sectionHint = '';
            outline.forEach(group => {
                group.children?.forEach(child => {
                    if (child.id === sectionId) {
                        sectionTitle = child.title;
                        sectionHint = child.hint || '';
                    }
                    if ('subItems' in child && child.subItems) {
                        child.subItems.forEach(sub => {
                            if (sub.id === sectionId) {
                                sectionTitle = `${child.title} - ${sub.title}`;
                                sectionHint = sub.hint || '';
                            }
                        });
                    }
                });
            });

            const categoryLabel = CATEGORIES.find(c => c.value === formData.category)?.label || formData.category;

            const prompt = `Bạn là chuyên gia giáo dục Việt Nam, viết phần "${sectionTitle}" cho Sáng kiến Kinh nghiệm.

THÔNG TIN SÁNG KIẾN:
- Tên đề tài: ${formData.title}
- Lĩnh vực: ${categoryLabel}
- Môn học: ${formData.subject || 'Không xác định'}
- Tác giả: ${formData.authorName}
- Đơn vị: ${formData.schoolName}
- Năm học: ${formData.year}

HƯỚNG DẪN CHO PHẦN NÀY:
${sectionHint}

NỘI DUNG ĐÃ CÓ (để tham khảo):
${Object.entries(content).filter(([k, v]) => v && k !== sectionId).map(([k, v]) => `${k}: ${v.slice(0, 500)}`).join('\n').slice(0, 3000)}

YÊU CẦU:
1. Viết nội dung phù hợp với phần "${sectionTitle}"
2. Phong cách học thuật, chuyên nghiệp
3. Có tính logic, mạch lạc
4. Độ dài: 200-500 từ (tùy phần)
5. Nếu là phần giải pháp, mô tả chi tiết cách thực hiện
6. Nếu là phần kết quả, đưa số liệu minh họa (có thể giả định)

Chỉ trả về NỘI DUNG của phần này, KHÔNG có tiêu đề hay giải thích thêm.`;

            const systemPrompt = `Bạn là chuyên gia giáo dục Việt Nam với kinh nghiệm viết Sáng kiến Kinh nghiệm.
Nhiệm vụ: Viết nội dung cho từng phần của SKKN theo cấu trúc chuẩn Bộ GD&ĐT.
Phong cách: Học thuật, chuyên nghiệp, có tính phản biện và sáng tạo.
Output: Chỉ trả về nội dung văn bản, không có markdown hay định dạng đặc biệt.`;

            const result = await callAI({
                systemPrompt,
                userPrompt: prompt,
            });

            setContent(prev => ({ ...prev, [sectionId]: result.trim() }));
        } catch (error) {
            console.error('AI generation failed:', error);
            alert('Lỗi tạo nội dung. Vui lòng thử lại.');
        } finally {
            setGeneratingSection('');
        }
    };

    // Tạo toàn bộ (tuần tự từng phần)
    const handleGenerateAll = async () => {
        const config = getAIConfig();
        if (!config.apiKey) {
            alert('Vui lòng cấu hình API Key trong phần Cài đặt');
            return;
        }

        setGenerating(true);
        const allIds = getAllSectionIds(outline);

        try {
            for (const id of allIds) {
                if (!content[id]?.trim()) {
                    setCurrentSection(id);
                    await handleGenerateSection(id);
                    // Delay nhỏ để tránh rate limit
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            alert('Đã tạo xong toàn bộ nội dung!');
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Viết mục tiếp theo
    const handleWriteNext = async () => {
        const allIds = getAllSectionIds(outline);
        const emptySection = allIds.find(id => !content[id]?.trim());
        if (emptySection) {
            setCurrentSection(emptySection);
            await handleGenerateSection(emptySection);
        } else {
            alert('Đã hoàn thành tất cả các mục!');
        }
    };

    // Lưu SKKN
    const handleSave = async () => {
        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                subject: formData.subject || null,
                abstract: content['opening.reason']?.slice(0, 500) || '',
                content,
                status: 'draft',
            };

            if (editingItem) {
                await api.put(`/skkn/${editingItem.id}`, payload);
            } else {
                await api.post('/skkn', payload);
            }

            alert('Đã lưu sáng kiến!');
            setStep('list');
            fetchItems();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Lỗi lưu. Vui lòng thử lại.');
        }
    };

    // Submit để duyệt
    const handleSubmit = async (id: string) => {
        if (!confirm('Gửi sáng kiến này để xét duyệt?')) return;
        try {
            await api.post(`/skkn/${id}/submit`);
            fetchItems();
        } catch (error) {
            console.error('Submit failed:', error);
        }
    };

    // Edit existing
    const handleEdit = (item: Skkn) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            category: item.category,
            subject: item.subject || '',
            authorName: '',
            authorTitle: '',
            schoolName: '',
            targetWords: 5000,
            year: new Date().getFullYear(),
        });
        setContent(item.content || {});
        setStep('editor');
    };

    // Delete
    const handleDelete = async (id: string) => {
        if (!confirm('Xóa sáng kiến này?')) return;
        try {
            await api.delete(`/skkn/${id}`);
            fetchItems();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    // Toggle section expand
    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ===== RENDER =====

    // Step 1: Danh sách
    if (step === 'list') {
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
                            Viết SKKN với AI hỗ trợ theo cấu trúc chuẩn Bộ GD&ĐT
                        </p>
                    </div>
                    <Button onClick={() => { setEditingItem(null); setContent({}); setStep('form'); }} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo mới
                    </Button>
                </div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap">
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
                            Bắt đầu viết sáng kiến kinh nghiệm với AI hỗ trợ
                        </p>
                        <Button onClick={() => setStep('form')} className="inline-flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Tạo với AI
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
                                                        onClick={() => handleEdit(item)}
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

    // Step 2: Form nhập liệu
    if (step === 'form') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Bắt đầu Sáng kiến Kinh nghiệm
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Cung cấp thông tin để AI xây dựng dàn ý chi tiết
                    </p>

                    <div className="space-y-4">
                        {/* Tên sáng kiến */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tên sáng kiến kinh nghiệm *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Ứng dụng AI trong dạy học Toán THPT"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        {/* Mục tiêu số từ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mục tiêu số từ
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min={3000}
                                    max={10000}
                                    step={500}
                                    value={formData.targetWords}
                                    onChange={(e) => setFormData({ ...formData, targetWords: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                                    {formData.targetWords.toLocaleString()} từ
                                </span>
                            </div>
                        </div>

                        {/* Lĩnh vực */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lĩnh vực *
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

                        {/* Môn học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Môn học (nếu có)
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="VD: Toán, Ngữ văn..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        {/* Thông tin tác giả */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Họ tên đầy đủ
                                </label>
                                <input
                                    type="text"
                                    value={formData.authorName}
                                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Chức vụ
                                </label>
                                <input
                                    type="text"
                                    value={formData.authorTitle}
                                    onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
                                    placeholder="Giáo viên"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        {/* Trường học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tên trường học
                            </label>
                            <input
                                type="text"
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                placeholder="Trường THPT ABC"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        {/* Năm học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Năm học
                            </label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={handleStartOutline} className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Tạo dàn ý chi tiết
                        </Button>
                        <Button variant="secondary" onClick={() => setStep('list')}>
                            Hủy
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Editor với dàn ý
    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Sidebar: Dàn ý & Tiến độ */}
            <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Dàn ý & Tiến độ
                    </h3>
                    <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Tiến độ tổng thể</span>
                            <span>{totalWords} / {formData.targetWords} từ</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${Math.min(100, (totalWords / formData.targetWords) * 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Hoàn thành: {calculateProgress()}%
                        </div>
                    </div>
                </div>

                {/* Outline Tree */}
                <div className="flex-1 overflow-y-auto p-2">
                    {outline.map((group) => (
                        <div key={group.id} className="mb-2">
                            <button
                                onClick={() => toggleSection(group.id)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                            >
                                {expandedSections.has(group.id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {group.title}
                                </span>
                            </button>

                            {expandedSections.has(group.id) && group.children && (
                                <div className="ml-4 space-y-0.5">
                                    {group.children.map((child) => {
                                        const hasSubItems = 'subItems' in child && child.subItems;
                                        const isCompleted = hasSubItems
                                            ? child.subItems!.every(s => content[s.id]?.trim())
                                            : content[child.id]?.trim();
                                        const isActive = hasSubItems
                                            ? child.subItems!.some(s => currentSection === s.id)
                                            : currentSection === child.id;

                                        return (
                                            <div key={child.id}>
                                                <button
                                                    onClick={() => {
                                                        if (hasSubItems) {
                                                            toggleSection(child.id);
                                                            setCurrentSection(child.subItems![0].id);
                                                        } else {
                                                            setCurrentSection(child.id);
                                                        }
                                                    }}
                                                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${isActive
                                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                                    )}
                                                    <span className="truncate">{child.title}</span>
                                                </button>

                                                {hasSubItems && expandedSections.has(child.id) && (
                                                    <div className="ml-6 space-y-0.5">
                                                        {child.subItems!.map((sub) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => setCurrentSection(sub.id)}
                                                                className={`w-full flex items-center gap-2 p-1.5 rounded text-left text-xs ${currentSection === sub.id
                                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                                                    : 'text-gray-500 hover:text-gray-700'
                                                                    }`}
                                                            >
                                                                {content[sub.id]?.trim() ? (
                                                                    <Check className="w-3 h-3 text-green-500" />
                                                                ) : (
                                                                    <div className="w-3 h-3 rounded-full border border-gray-300" />
                                                                )}
                                                                {sub.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Button
                        onClick={handleGenerateAll}
                        disabled={generating}
                        className="w-full flex items-center justify-center gap-2"
                        variant="secondary"
                    >
                        {generating ? (
                            <><span className="spinner w-4 h-4" /> Đang tạo...</>
                        ) : (
                            <><RefreshCw className="w-4 h-4" /> Tạo toàn bộ</>
                        )}
                    </Button>
                    <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Lưu SKKN
                    </Button>
                </div>
            </div>

            {/* Main: Soạn thảo nội dung */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Soạn thảo Nội dung
                        </h3>
                        <p className="text-sm text-gray-500">
                            {currentSection ? `${countWords(content[currentSection] || '')} từ` : 'Chọn mục để bắt đầu'}
                        </p>
                    </div>
                    <Button
                        onClick={handleWriteNext}
                        disabled={generating || !!generatingSection}
                        className="flex items-center gap-2"
                    >
                        {generatingSection ? (
                            <><span className="spinner w-4 h-4" /> Đang viết...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Viết mục tiếp theo</>
                        )}
                    </Button>
                </div>

                {/* Content Editor */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentSection ? (
                        <div className="max-w-3xl">
                            {/* Section Title */}
                            <div className="mb-4">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {(() => {
                                        let title = '';
                                        outline.forEach(group => {
                                            group.children?.forEach(child => {
                                                if (child.id === currentSection) title = child.title;
                                                if ('subItems' in child && child.subItems) {
                                                    child.subItems.forEach(sub => {
                                                        if (sub.id === currentSection) title = `${child.title} → ${sub.title}`;
                                                    });
                                                }
                                            });
                                        });
                                        return title;
                                    })()}
                                </h4>
                            </div>

                            {/* Word count and generate button */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">
                                    {countWords(content[currentSection] || '')} từ
                                </span>
                                <button
                                    onClick={() => handleGenerateSection(currentSection)}
                                    disabled={!!generatingSection}
                                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                >
                                    {generatingSection === currentSection ? (
                                        <><span className="spinner w-3 h-3" /> Đang tạo...</>
                                    ) : (
                                        <><Sparkles className="w-3 h-3" /> Tạo với AI</>
                                    )}
                                </button>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={content[currentSection] || ''}
                                onChange={(e) => setContent(prev => ({ ...prev, [currentSection]: e.target.value }))}
                                placeholder="Nhập nội dung hoặc nhấn 'Tạo với AI'..."
                                className="w-full h-80 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Chọn một mục từ dàn ý để bắt đầu soạn thảo</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button variant="secondary" onClick={() => setStep('list')}>
                        ← Quay lại
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => exportSkknToWord({
                                title: formData.title,
                                category: formData.category,
                                subject: formData.subject,
                                authorName: formData.authorName,
                                authorTitle: formData.authorTitle,
                                schoolName: formData.schoolName,
                                year: formData.year,
                                content,
                            })}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Xuất Word
                        </Button>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Lưu
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
