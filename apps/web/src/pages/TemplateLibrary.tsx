// Chú thích: Template Library - Mẫu KHBD và SKKN sẵn có
// Cho phép GV chọn mẫu và điền thông tin nhanh

import { useState } from 'react';
import {
    BookTemplate,
    Search,
    Star,
    Download,
    Sparkles,
    BookOpen,
    Lightbulb
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Mẫu KHBD theo môn học
const LESSON_PLAN_TEMPLATES = [
    {
        id: 'lp-math-algebra',
        title: 'KHBD Toán - Đại số lớp 10',
        category: 'lessonplan',
        subject: 'Toán',
        grade: 10,
        description: 'Mẫu kế hoạch bài dạy Toán đại số theo CV 5512',
        downloads: 1250,
        rating: 4.8,
        policyRef: 'CV 5512',
        thumbnail: '📊',
        duration: 45,
    },
    {
        id: 'lp-physics-motion',
        title: 'KHBD Vật lý - Động học',
        category: 'lessonplan',
        subject: 'Vật lý',
        grade: 10,
        description: 'Bài dạy chuyển động thẳng đều và biến đổi đều',
        downloads: 890,
        rating: 4.7,
        policyRef: 'CV 5512',
        thumbnail: '⚡',
        duration: 45,
    },
    {
        id: 'lp-chemistry-periodic',
        title: 'KHBD Hóa học - Bảng tuần hoàn',
        category: 'lessonplan',
        subject: 'Hóa học',
        grade: 10,
        description: 'Cấu tạo bảng tuần hoàn các nguyên tố hóa học',
        downloads: 760,
        rating: 4.6,
        policyRef: 'CV 5512',
        thumbnail: '🧪',
        duration: 90,
    },
    {
        id: 'lp-literature-poetry',
        title: 'KHBD Ngữ văn - Thơ Đường',
        category: 'lessonplan',
        subject: 'Ngữ văn',
        grade: 10,
        description: 'Đọc hiểu và cảm thụ thơ Đường luật',
        downloads: 1100,
        rating: 4.9,
        policyRef: 'CV 5512',
        thumbnail: '📚',
        duration: 90,
    },
    {
        id: 'lp-english-grammar',
        title: 'KHBD Tiếng Anh - Present Perfect',
        category: 'lessonplan',
        subject: 'Tiếng Anh',
        grade: 10,
        description: 'Grammar: Present Perfect vs Past Simple',
        downloads: 980,
        rating: 4.5,
        policyRef: 'CV 5512',
        thumbnail: '🌍',
        duration: 45,
    },
    {
        id: 'lp-biology-cell',
        title: 'KHBD Sinh học - Tế bào',
        category: 'lessonplan',
        subject: 'Sinh học',
        grade: 10,
        description: 'Cấu trúc và chức năng tế bào',
        downloads: 650,
        rating: 4.7,
        policyRef: 'CV 5512',
        thumbnail: '🔬',
        duration: 45,
    },
    {
        id: 'lp-primary-math',
        title: 'KHBD Toán lớp 3 - Phép nhân',
        category: 'lessonplan',
        subject: 'Toán',
        grade: 3,
        description: 'Bài dạy phép nhân theo CV 2345 + 1001',
        downloads: 1500,
        rating: 4.9,
        policyRef: 'CV 2345',
        thumbnail: '🔢',
        duration: 35,
    },
    {
        id: 'lp-primary-vietnamese',
        title: 'KHBD Tiếng Việt lớp 3 - Tập đọc',
        category: 'lessonplan',
        subject: 'Tiếng Việt',
        grade: 3,
        description: 'Bài tập đọc và luyện từ ngữ',
        downloads: 1350,
        rating: 4.8,
        policyRef: 'CV 2345',
        thumbnail: '📖',
        duration: 35,
    },
];

// Mẫu SKKN theo lĩnh vực
const SKKN_TEMPLATES = [
    {
        id: 'skkn-teaching-method',
        title: 'SKKN - Đổi mới PPDH Toán THPT',
        category: 'skkn',
        field: 'Phương pháp giảng dạy',
        description: 'Ứng dụng phương pháp dạy học tích cực trong môn Toán',
        downloads: 2100,
        rating: 4.9,
        thumbnail: '💡',
        targetWords: 5000,
    },
    {
        id: 'skkn-technology',
        title: 'SKKN - Ứng dụng AI trong giảng dạy',
        category: 'skkn',
        field: 'Ứng dụng CNTT',
        description: 'Tích hợp công cụ AI vào quá trình dạy và học',
        downloads: 1800,
        rating: 4.8,
        thumbnail: '🤖',
        targetWords: 6000,
    },
    {
        id: 'skkn-assessment',
        title: 'SKKN - Đổi mới kiểm tra đánh giá',
        category: 'skkn',
        field: 'Kiểm tra đánh giá',
        description: 'Phương pháp đánh giá theo năng lực học sinh',
        downloads: 1950,
        rating: 4.7,
        thumbnail: '📝',
        targetWords: 5500,
    },
    {
        id: 'skkn-classroom',
        title: 'SKKN - Quản lý lớp học hiệu quả',
        category: 'skkn',
        field: 'Quản lý lớp học',
        description: 'Kinh nghiệm xây dựng nề nếp và kỷ luật tích cực',
        downloads: 1650,
        rating: 4.6,
        thumbnail: '👥',
        targetWords: 4500,
    },
    {
        id: 'skkn-student-support',
        title: 'SKKN - Hỗ trợ học sinh yếu kém',
        category: 'skkn',
        field: 'Hỗ trợ học sinh',
        description: 'Giải pháp nâng cao chất lượng học sinh yếu kém',
        downloads: 1400,
        rating: 4.8,
        thumbnail: '🎯',
        targetWords: 5000,
    },
    {
        id: 'skkn-extracurricular',
        title: 'SKKN - Tổ chức hoạt động ngoại khóa',
        category: 'skkn',
        field: 'Hoạt động ngoại khóa',
        description: 'Xây dựng CLB học tập và hoạt động trải nghiệm',
        downloads: 1200,
        rating: 4.5,
        thumbnail: '🎪',
        targetWords: 4000,
    },
];

interface Template {
    id: string;
    title: string;
    category: string;
    description: string;
    downloads: number;
    rating: number;
    thumbnail: string;
    subject?: string;
    grade?: number;
    field?: string;
    policyRef?: string;
    duration?: number;
    targetWords?: number;
}

export default function TemplateLibrary() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'lessonplan' | 'skkn'>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [filterSubject, setFilterSubject] = useState('');

    // Combine templates
    const allTemplates: Template[] = [...LESSON_PLAN_TEMPLATES, ...SKKN_TEMPLATES];

    // Filter
    const filteredTemplates = allTemplates.filter(t => {
        const matchesTab = activeTab === 'all' || t.category === activeTab;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = !filterSubject || ('subject' in t && t.subject === filterSubject);
        return matchesTab && matchesSearch && matchesSubject;
    });

    // Get unique subjects
    const subjects = [...new Set(LESSON_PLAN_TEMPLATES.map(t => t.subject))];

    // Handle use template
    const handleUseTemplate = (template: Template) => {
        // TODO: Navigate to LessonPlan or SKKN page with pre-filled data
        const path = template.category === 'lessonplan' ? '/lesson-plan' : '/skkn';
        // For now, just alert
        alert(`Sẽ chuyển đến ${path} với mẫu "${template.title}"`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BookTemplate className="w-7 h-7 text-indigo-500" />
                        Thư viện Mẫu
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Mẫu KHBD và SKKN sẵn có để bắt đầu nhanh
                    </p>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all'
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setActiveTab('lessonplan')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'lessonplan'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Kế hoạch Bài dạy
                    </button>
                    <button
                        onClick={() => setActiveTab('skkn')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'skkn'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        <Lightbulb className="w-4 h-4" />
                        Sáng kiến KN
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm mẫu..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                    </div>

                    {activeTab !== 'skkn' && (
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        >
                            <option value="">Tất cả môn</option>
                            {subjects.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                    >
                        {/* Header */}
                        <div className={`p-4 ${template.category === 'lessonplan'
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                            }`}>
                            <div className="text-4xl mb-2">{template.thumbnail}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {template.title}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                {template.description}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-3">
                                {'subject' in template && template.subject && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                        {template.subject}
                                    </span>
                                )}
                                {'grade' in template && template.grade && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                        Lớp {template.grade}
                                    </span>
                                )}
                                {'field' in template && template.field && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                                        {template.field}
                                    </span>
                                )}
                                {'policyRef' in template && template.policyRef && (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                        {template.policyRef}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{template.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <Download className="w-4 h-4" />
                                    <span>{template.downloads.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Action */}
                        <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseTemplate(template);
                                }}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Sử dụng mẫu
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
                <div className="text-center py-16">
                    <BookTemplate className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy mẫu
                    </h3>
                    <p className="text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc</p>
                </div>
            )}

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`p-6 ${selectedTemplate.category === 'lessonplan'
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                            }`}>
                            <div className="text-5xl mb-4">{selectedTemplate.thumbnail}</div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedTemplate.title}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                {selectedTemplate.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {'subject' in selectedTemplate && selectedTemplate.subject && (
                                    <div>
                                        <span className="text-gray-500">Môn học:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.subject}</span>
                                    </div>
                                )}
                                {'grade' in selectedTemplate && selectedTemplate.grade && (
                                    <div>
                                        <span className="text-gray-500">Lớp:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.grade}</span>
                                    </div>
                                )}
                                {'duration' in selectedTemplate && selectedTemplate.duration && (
                                    <div>
                                        <span className="text-gray-500">Thời lượng:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.duration} phút</span>
                                    </div>
                                )}
                                {'policyRef' in selectedTemplate && selectedTemplate.policyRef && (
                                    <div>
                                        <span className="text-gray-500">Theo CV:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.policyRef}</span>
                                    </div>
                                )}
                                {'field' in selectedTemplate && selectedTemplate.field && (
                                    <div>
                                        <span className="text-gray-500">Lĩnh vực:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.field}</span>
                                    </div>
                                )}
                                {'targetWords' in selectedTemplate && selectedTemplate.targetWords && (
                                    <div>
                                        <span className="text-gray-500">Số từ:</span>
                                        <span className="ml-2 font-medium">~{selectedTemplate.targetWords.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-medium">{selectedTemplate.rating}</span>
                                    <span className="text-gray-400 text-sm">/ 5.0</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Download className="w-5 h-5" />
                                    <span>{selectedTemplate.downloads.toLocaleString()} lượt dùng</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedTemplate(null)}
                                className="flex-1"
                            >
                                Đóng
                            </Button>
                            <Button
                                onClick={() => {
                                    handleUseTemplate(selectedTemplate);
                                    setSelectedTemplate(null);
                                }}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Sử dụng mẫu
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
