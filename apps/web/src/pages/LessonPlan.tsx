// Chú thích: Lesson Plan - Kế hoạch Bài dạy với AI
// UI giống SKKN: form nhập → dàn ý → viết từng phần
// Theo CV 5512 (THCS/THPT), CV 2345 + 1001 (Tiểu học)

import { useState, useEffect } from 'react';
import {
    BookOpen,
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
    GraduationCap,
    RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import {
    generateLessonPlanWithPolicy,
    callAI,
    buildLessonPlanSystemPrompt
} from '../lib/frontend-ai';
import { exportLessonPlanToWord } from '../lib/export-word';

// ===== ĐỊNH NGHĨA DÀN Ý CHUẨN THEO CÔNG VĂN =====

// CV 5512: Khung KHBD cho THCS/THPT
const OUTLINE_CV5512 = [
    {
        id: 'info',
        title: 'I. THÔNG TIN CHUNG',
        children: [
            { id: 'info.title', title: '1.1. Tên bài dạy', hint: 'Ghi tên bài học theo SGK' },
            { id: 'info.subject', title: '1.2. Môn học', hint: 'Môn học / Hoạt động GD' },
            { id: 'info.grade', title: '1.3. Lớp', hint: 'Lớp học áp dụng' },
            { id: 'info.duration', title: '1.4. Thời gian', hint: 'Số tiết thực hiện' },
        ]
    },
    {
        id: 'objectives',
        title: 'II. MỤC TIÊU',
        children: [
            { id: 'objectives.knowledge', title: '2.1. Về kiến thức', hint: 'HS nêu được, mô tả được, phân biệt được...' },
            { id: 'objectives.competencies', title: '2.2. Về năng lực', hint: 'Năng lực chung + Năng lực đặc thù môn học' },
            { id: 'objectives.qualities', title: '2.3. Về phẩm chất', hint: 'Trung thực, Trách nhiệm, Chăm chỉ...' },
        ]
    },
    {
        id: 'materials',
        title: 'III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU',
        children: [
            { id: 'materials.teacher', title: '3.1. Giáo viên chuẩn bị', hint: 'SGK, máy chiếu, phiếu học tập...' },
            { id: 'materials.student', title: '3.2. Học sinh chuẩn bị', hint: 'SGK, vở ghi, đồ dùng học tập...' },
        ]
    },
    {
        id: 'activities',
        title: 'IV. TIẾN TRÌNH DẠY HỌC',
        children: [
            {
                id: 'activities.opening',
                title: '4.1. Hoạt động 1: Khởi động/Mở đầu',
                hint: '~5-10 phút',
                subItems: [
                    { id: 'activities.opening.goal', title: 'a) Mục tiêu', hint: 'Xác định vấn đề học tập' },
                    { id: 'activities.opening.content', title: 'b) Nội dung', hint: 'Tình huống, câu hỏi gợi mở' },
                    { id: 'activities.opening.product', title: 'c) Sản phẩm', hint: 'Kết quả mong đợi' },
                    { id: 'activities.opening.organization', title: 'd) Tổ chức thực hiện', hint: 'Vai trò GV-HS' },
                ]
            },
            {
                id: 'activities.knowledge',
                title: '4.2. Hoạt động 2: Hình thành kiến thức mới',
                hint: '~20-25 phút',
                subItems: [
                    { id: 'activities.knowledge.goal', title: 'a) Mục tiêu', hint: 'Tiếp thu kiến thức mới' },
                    { id: 'activities.knowledge.content', title: 'b) Nội dung', hint: 'Nghiên cứu SGK, thảo luận' },
                    { id: 'activities.knowledge.product', title: 'c) Sản phẩm', hint: 'Phiếu học tập, báo cáo' },
                    { id: 'activities.knowledge.organization', title: 'd) Tổ chức thực hiện', hint: 'Hoạt động nhóm/cá nhân' },
                ]
            },
            {
                id: 'activities.practice',
                title: '4.3. Hoạt động 3: Luyện tập',
                hint: '~10-15 phút',
                subItems: [
                    { id: 'activities.practice.goal', title: 'a) Mục tiêu', hint: 'Củng cố, rèn kỹ năng' },
                    { id: 'activities.practice.content', title: 'b) Nội dung', hint: 'Bài tập, thực hành' },
                    { id: 'activities.practice.product', title: 'c) Sản phẩm', hint: 'Đáp án, kết quả' },
                    { id: 'activities.practice.organization', title: 'd) Tổ chức thực hiện', hint: 'Làm bài, chữa bài' },
                ]
            },
            {
                id: 'activities.application',
                title: '4.4. Hoạt động 4: Vận dụng',
                hint: '~5 phút',
                subItems: [
                    { id: 'activities.application.goal', title: 'a) Mục tiêu', hint: 'Áp dụng thực tiễn' },
                    { id: 'activities.application.content', title: 'b) Nội dung', hint: 'Tình huống thực tế, bài về nhà' },
                    { id: 'activities.application.product', title: 'c) Sản phẩm', hint: 'Báo cáo, giải pháp' },
                    { id: 'activities.application.organization', title: 'd) Tổ chức thực hiện', hint: 'Giao việc, hướng dẫn' },
                ]
            },
        ]
    },
];

// CV 2345 + 1001: Khung KHBD cho Tiểu học
const OUTLINE_PRIMARY = [
    {
        id: 'info',
        title: 'I. THÔNG TIN CHUNG',
        children: [
            { id: 'info.title', title: '1.1. Tên bài dạy', hint: 'Theo SGK' },
            { id: 'info.subject', title: '1.2. Môn học/HĐGD', hint: 'Môn học' },
            { id: 'info.grade', title: '1.3. Lớp', hint: '1-5' },
            { id: 'info.duration', title: '1.4. Thời gian', hint: 'Số tiết' },
        ]
    },
    {
        id: 'objectives',
        title: 'II. MỤC TIÊU (theo CTGDPT 2018)',
        children: [
            { id: 'objectives.knowledge', title: '2.1. Yêu cầu cần đạt', hint: 'Theo chương trình môn học' },
            { id: 'objectives.competencies_general', title: '2.2. Năng lực chung', hint: 'Tự chủ, Giao tiếp, Sáng tạo' },
            { id: 'objectives.competencies_specific', title: '2.3. Năng lực đặc thù', hint: 'Theo môn học' },
            { id: 'objectives.qualities', title: '2.4. Phẩm chất', hint: 'Yêu nước, Nhân ái, Chăm chỉ...' },
        ]
    },
    {
        id: 'integration',
        title: 'III. NỘI DUNG TÍCH HỢP (nếu có)',
        children: [
            { id: 'integration.cross_subject', title: '3.1. Tích hợp liên môn', hint: 'Nội dung liên môn' },
            { id: 'integration.life_skills', title: '3.2. Kỹ năng sống', hint: 'Các kỹ năng' },
            { id: 'integration.local', title: '3.3. Nội dung địa phương', hint: 'Nếu có' },
        ]
    },
    {
        id: 'materials',
        title: 'IV. ĐỒ DÙNG DẠY HỌC',
        children: [
            { id: 'materials.teacher', title: '4.1. GV chuẩn bị', hint: 'SGK, tranh ảnh...' },
            { id: 'materials.student', title: '4.2. HS chuẩn bị', hint: 'SGK, vở...' },
        ]
    },
    {
        id: 'activities',
        title: 'V. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU',
        children: [
            {
                id: 'activities.opening',
                title: '5.1. Hoạt động mở đầu',
                hint: '~5 phút',
                subItems: [
                    { id: 'activities.opening.goal', title: 'a) Mục tiêu', hint: 'Khơi gợi hứng thú' },
                    { id: 'activities.opening.content', title: 'b) Nội dung', hint: 'Trò chơi, câu đố' },
                    { id: 'activities.opening.organization', title: 'c) Tổ chức', hint: 'Cách thực hiện' },
                ]
            },
            {
                id: 'activities.knowledge',
                title: '5.2. Hình thành kiến thức mới',
                hint: '~15-20 phút',
                subItems: [
                    { id: 'activities.knowledge.goal', title: 'a) Mục tiêu', hint: 'Tiếp thu KT mới' },
                    { id: 'activities.knowledge.content', title: 'b) Nội dung', hint: 'Khám phá, học tập' },
                    { id: 'activities.knowledge.organization', title: 'c) Tổ chức', hint: 'Hoạt động học' },
                ]
            },
            {
                id: 'activities.practice',
                title: '5.3. Luyện tập, thực hành',
                hint: '~15 phút',
                subItems: [
                    { id: 'activities.practice.goal', title: 'a) Mục tiêu', hint: 'Củng cố' },
                    { id: 'activities.practice.content', title: 'b) Nội dung', hint: 'Bài tập' },
                    { id: 'activities.practice.organization', title: 'c) Tổ chức', hint: 'Làm bài' },
                ]
            },
            {
                id: 'activities.application',
                title: '5.4. Vận dụng, mở rộng',
                hint: '~5 phút',
                subItems: [
                    { id: 'activities.application.goal', title: 'a) Mục tiêu', hint: 'Áp dụng' },
                    { id: 'activities.application.content', title: 'b) Nội dung', hint: 'Thực tế, về nhà' },
                    { id: 'activities.application.organization', title: 'c) Tổ chức', hint: 'Giao việc' },
                ]
            },
        ]
    },
];

// Danh sách môn học
const SUBJECTS = [
    'Toán', 'Ngữ văn', 'Vật lí', 'Hóa học', 'Sinh học',
    'Lịch sử', 'Địa lí', 'Tiếng Anh', 'GDCD', 'Tin học',
    'Công nghệ', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật',
    'Hoạt động trải nghiệm'
];

interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    grade: number;
    topic: string;
    duration: number;
    policy_ref?: string;
    content?: Record<string, string>;
    created_at: string;
}

interface OutlineItem {
    id: string;
    title: string;
    hint?: string;
    children?: OutlineItem[];
    subItems?: { id: string; title: string; hint?: string }[];
}

export default function LessonPlanPage() {
    // States
    const [plans, setPlans] = useState<LessonPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'list' | 'form' | 'editor'>('list');

    // Form data
    const [formData, setFormData] = useState({
        subject: '',
        grade: 10,
        topic: '',
        duration: 45,
        level: 'highschool' as 'primary' | 'secondary' | 'highschool',
        authorName: '',
        schoolName: '',
        targetWords: 3000,
    });

    // Editor state
    const [outline, setOutline] = useState<OutlineItem[]>([]);
    const [content, setContent] = useState<Record<string, string>>({});
    const [currentSection, setCurrentSection] = useState<string>('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['info', 'objectives', 'materials', 'activities']));
    const [generating, setGenerating] = useState(false);
    const [generatingSection, setGeneratingSection] = useState<string>('');
    const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/lessonplans') as { lessonPlans?: LessonPlan[] };
            setPlans(res.lessonPlans || []);
        } catch (error) {
            console.error('Failed to fetch lesson plans:', error);
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
        if (!formData.subject || !formData.topic) {
            alert('Vui lòng nhập môn học và chủ đề/tên bài');
            return;
        }

        // Chọn outline theo cấp học
        const isPrimary = formData.level === 'primary' || formData.grade <= 5;
        setOutline(isPrimary ? OUTLINE_PRIMARY : OUTLINE_CV5512);

        // Pre-fill thông tin cơ bản
        setContent({
            'info.title': formData.topic,
            'info.subject': formData.subject,
            'info.grade': `Lớp ${formData.grade}`,
            'info.duration': formData.duration === 45 ? '1 tiết (45 phút)' :
                formData.duration === 90 ? '2 tiết (90 phút)' : `${formData.duration} phút`,
        });

        setCurrentSection('info.title');
        setStep('editor');
    };

    // Tạo nội dung cho 1 section bằng AI
    const handleGenerateSection = async (sectionId: string) => {
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

            const isPrimary = formData.level === 'primary';
            const policyText = isPrimary
                ? 'Theo CV 2345/BGDĐT-GDTH và CV 1001/SGDĐT-GDPT - KHBD Tiểu học'
                : 'Theo CV 5512/BGDĐT-GDTrH - KHBD THCS/THPT';

            const prompt = `Bạn là chuyên gia giáo dục, viết phần "${sectionTitle}" cho Kế hoạch Bài dạy.

THÔNG TIN BÀI DẠY:
- Môn: ${formData.subject}
- Lớp: ${formData.grade}
- Tên bài: ${formData.topic}
- Thời lượng: ${formData.duration} phút
- Công văn áp dụng: ${policyText}

HƯỚNG DẪN CHO PHẦN NÀY:
${sectionHint}

NỘI DUNG ĐÃ CÓ (để tham khảo):
${Object.entries(content).filter(([k, v]) => v && k !== sectionId).map(([k, v]) => `${k}: ${v}`).join('\n').slice(0, 2000)}

YÊU CẦU:
1. Viết nội dung phù hợp với phần "${sectionTitle}"
2. Phong cách chuyên nghiệp, đúng chuẩn Bộ GD&ĐT
3. Cụ thể, thực thi được
4. Độ dài vừa phải (100-300 từ cho mỗi phần)

Chỉ trả về NỘI DUNG của phần này, KHÔNG có tiêu đề hay giải thích thêm.`;

            const result = await callAI({
                systemPrompt: buildLessonPlanSystemPrompt(policyText),
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

    // Tạo toàn bộ dàn ý
    const handleGenerateAll = async () => {
        setGenerating(true);

        try {
            const result = await generateLessonPlanWithPolicy({
                subject: formData.subject,
                grade: formData.grade,
                topic: formData.topic,
                duration: formData.duration,
                level: formData.level,
            });

            // Chuyển output thành content
            const lp = result.lessonPlan;
            const newContent: Record<string, string> = {
                'info.title': lp.title,
                'info.subject': lp.subject,
                'info.grade': `Lớp ${lp.grade}`,
                'info.duration': `${lp.duration} phút`,
                'objectives.knowledge': lp.objectives.knowledge.join('\n'),
                'objectives.competencies': [
                    '**Năng lực chung:**',
                    ...lp.objectives.competencies.general.map(c => `- ${c}`),
                    '',
                    '**Năng lực đặc thù:**',
                    ...lp.objectives.competencies.specific.map(c => `- ${c}`)
                ].join('\n'),
                'objectives.qualities': lp.objectives.qualities.join('\n'),
                'materials.teacher': lp.materials.teacher.join(', '),
                'materials.student': lp.materials.student.join(', '),
            };

            // Map activities
            lp.activities.forEach(act => {
                const prefix = `activities.${act.phase === 'knowledge_formation' ? 'knowledge' : act.phase}`;
                newContent[`${prefix}.goal`] = act.goal;
                newContent[`${prefix}.content`] = act.content;
                newContent[`${prefix}.product`] = act.product;
                newContent[`${prefix}.organization`] = `**Giáo viên:** ${act.organization.teacher}\n\n**Học sinh:** ${act.organization.student}`;
            });

            setContent(newContent);
        } catch (error) {
            console.error('Full generation failed:', error);
            alert('Lỗi tạo KHBD. Vui lòng kiểm tra cấu hình API key.');
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

    // Lưu KHBD
    const handleSave = async () => {
        try {
            const payload = {
                title: content['info.title'] || formData.topic,
                subject: formData.subject,
                grade: formData.grade,
                topic: formData.topic,
                duration: formData.duration,
                policy_ref: formData.level === 'primary' ? 'CV2345+1001' : 'CV5512',
                content,
            };

            if (editingPlan) {
                await api.put(`/lessonplans/${editingPlan.id}`, payload);
            } else {
                await api.post('/lessonplans', payload);
            }

            alert('Đã lưu kế hoạch bài dạy!');
            setStep('list');
            fetchPlans();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Lỗi lưu. Vui lòng thử lại.');
        }
    };

    // Edit existing plan
    const handleEdit = (plan: LessonPlan) => {
        setEditingPlan(plan);
        setFormData({
            subject: plan.subject,
            grade: plan.grade,
            topic: plan.topic,
            duration: plan.duration,
            level: plan.grade <= 5 ? 'primary' : plan.grade <= 9 ? 'secondary' : 'highschool',
            authorName: '',
            schoolName: '',
            targetWords: 3000,
        });
        setOutline(plan.grade <= 5 ? OUTLINE_PRIMARY : OUTLINE_CV5512);
        setContent(plan.content || {});
        setStep('editor');
    };

    // Delete plan
    const handleDelete = async (id: string) => {
        if (!confirm('Xóa kế hoạch bài dạy này?')) return;
        try {
            await api.delete(`/lessonplans/${id}`);
            fetchPlans();
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
                            <BookOpen className="w-7 h-7 text-blue-500" />
                            Kế hoạch Bài dạy
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Tạo KHBD theo CV 5512 (THCS/THPT) hoặc CV 2345 + 1001 (Tiểu học)
                        </p>
                    </div>
                    <Button onClick={() => { setEditingPlan(null); setStep('form'); }} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo mới
                    </Button>
                </div>

                {/* Plans List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner w-8 h-8 border-blue-500" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Chưa có kế hoạch bài dạy
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Tạo KHBD đầu tiên với AI hỗ trợ
                        </p>
                        <Button onClick={() => setStep('form')} className="inline-flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Tạo với AI
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                    {plan.title || plan.topic}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                        {plan.subject}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                        Lớp {plan.grade}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        {plan.duration} phút
                                    </span>
                                    {plan.policy_ref && (
                                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                            {plan.policy_ref}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-400">
                                        {new Date(plan.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                    >
                                        Chỉnh sửa
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
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
                        Bắt đầu Kế hoạch Bài dạy
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Cung cấp thông tin để AI xây dựng dàn ý chi tiết
                    </p>

                    <div className="space-y-4">
                        {/* Cấp học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cấp học
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'primary', label: 'Tiểu học', hint: 'CV 2345 + 1001' },
                                    { value: 'secondary', label: 'THCS', hint: 'CV 5512' },
                                    { value: 'highschool', label: 'THPT', hint: 'CV 5512' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFormData({ ...formData, level: opt.value as any })}
                                        className={`flex-1 p-3 rounded-lg border-2 transition-colors ${formData.level === opt.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{opt.label}</div>
                                        <div className="text-xs text-gray-500">{opt.hint}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Môn học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Môn học
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value="">Chọn môn học</option>
                                {SUBJECTS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Lớp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lớp
                            </label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                {formData.level === 'primary' && [1, 2, 3, 4, 5].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                                {formData.level === 'secondary' && [6, 7, 8, 9].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                                {formData.level === 'highschool' && [10, 11, 12].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tên bài / Chủ đề */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tên bài / Chủ đề
                            </label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="VD: Hàm số bậc hai và đồ thị"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        {/* Thời lượng */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Thời lượng
                            </label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value={35}>35 phút (1 tiết TH)</option>
                                <option value={45}>45 phút (1 tiết)</option>
                                <option value={90}>90 phút (2 tiết)</option>
                                <option value={135}>135 phút (3 tiết)</option>
                            </select>
                        </div>

                        {/* Thông tin tác giả (optional) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Họ tên giáo viên
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
                                    Trường học
                                </label>
                                <input
                                    type="text"
                                    value={formData.schoolName}
                                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                    placeholder="THPT ABC"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>
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
                            <span>{calculateProgress()}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${calculateProgress()}%` }}
                            />
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
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
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
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
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
                            <><RefreshCw className="w-4 h-4" /> Tạo lại toàn bộ</>
                        )}
                    </Button>
                    <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Lưu KHBD
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
                            {totalWords} / {formData.targetWords} từ
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
                                    {currentSection.split('.').pop()?.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                                </h4>
                                <p className="text-sm text-gray-500">ID: {currentSection}</p>
                            </div>

                            {/* Word count and generate button */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">
                                    {countWords(content[currentSection] || '')} từ
                                </span>
                                <button
                                    onClick={() => handleGenerateSection(currentSection)}
                                    disabled={!!generatingSection}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                                className="w-full h-64 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Chọn một mục từ dàn ý để bắt đầu soạn thảo
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
                            onClick={() => exportLessonPlanToWord({
                                title: content['info.title'] || formData.topic,
                                subject: formData.subject,
                                grade: formData.grade,
                                duration: formData.duration,
                                authorName: formData.authorName,
                                schoolName: formData.schoolName,
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
