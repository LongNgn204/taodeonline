// Chú thích: Lesson Plan (Kế hoạch Bài dạy) Page
// Tích hợp với /lessonplans API và AI generation

import { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    Clock,
    Target,
    Sparkles,
    Trash2,
    ChevronRight,
    GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    grade: number;
    topic: string;
    duration: number;
    created_at: string;
}

export default function LessonPlanPage() {
    const [plans, setPlans] = useState<LessonPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        grade: 10,
        topic: '',
        duration: 45,
        objectives: ''
    });

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

    const handleGenerate = async () => {
        if (!formData.subject || !formData.topic) {
            alert('Vui lòng nhập môn học và chủ đề');
            return;
        }

        setGenerating(true);
        try {
            // TODO: Integrate with AI generation
            const mockPlan = {
                title: `Kế hoạch bài dạy: ${formData.topic}`,
                subject: formData.subject,
                grade: formData.grade,
                topic: formData.topic,
                duration: formData.duration,
                objectives: formData.objectives.split('\n').filter(o => o.trim()),
                sections: [
                    {
                        phase: 'Khởi động',
                        duration: 5,
                        activities: ['Kiểm tra bài cũ', 'Giới thiệu bài mới'],
                    },
                    {
                        phase: 'Hình thành kiến thức',
                        duration: 20,
                        activities: ['Hoạt động 1: Tìm hiểu khái niệm', 'Hoạt động 2: Thảo luận nhóm'],
                    },
                    {
                        phase: 'Luyện tập',
                        duration: 15,
                        activities: ['Bài tập củng cố', 'Thực hành'],
                    },
                    {
                        phase: 'Vận dụng',
                        duration: 5,
                        activities: ['Giao bài tập về nhà', 'Tổng kết bài học'],
                    },
                ],
                assessment: {
                    type: 'formative',
                    criteria: ['Hiểu đúng khái niệm', 'Áp dụng được kiến thức']
                }
            };

            await api.post('/lessonplans', mockPlan);
            alert('Đã tạo kế hoạch bài dạy!');
            setShowCreate(false);
            fetchPlans();
        } catch (error) {
            console.error('Failed to generate:', error);
            alert('Lỗi tạo kế hoạch bài dạy');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa kế hoạch bài dạy này?')) return;
        try {
            await api.delete(`/lessonplans/${id}`);
            fetchPlans();
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
                        <BookOpen className="w-7 h-7 text-blue-500" />
                        Kế hoạch Bài dạy
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Tạo kế hoạch bài dạy theo mẫu chuẩn Bộ GD&ĐT
                    </p>
                </div>
                <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo mới
                </Button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Tạo kế hoạch bài dạy với AI
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
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
                                <option value="Toán">Toán</option>
                                <option value="Ngữ văn">Ngữ văn</option>
                                <option value="Vật lí">Vật lí</option>
                                <option value="Hóa học">Hóa học</option>
                                <option value="Sinh học">Sinh học</option>
                                <option value="Lịch sử">Lịch sử</option>
                                <option value="Địa lí">Địa lí</option>
                                <option value="Tiếng Anh">Tiếng Anh</option>
                                <option value="GDCD">GDCD</option>
                                <option value="Tin học">Tin học</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lớp
                            </label>
                            <select
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                {[10, 11, 12].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Chủ đề / Tên bài
                            </label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="VD: Hàm số bậc hai và đồ thị"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Thời lượng (phút)
                            </label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                <option value={45}>45 phút (1 tiết)</option>
                                <option value={90}>90 phút (2 tiết)</option>
                                <option value={135}>135 phút (3 tiết)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Target className="w-4 h-4 inline mr-1" />
                                Mục tiêu bài học (mỗi dòng 1 mục tiêu)
                            </label>
                            <textarea
                                value={formData.objectives}
                                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                rows={3}
                                placeholder="Học sinh nắm được khái niệm...&#10;Học sinh vận dụng được..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2">
                            {generating ? (
                                <>
                                    <span className="spinner w-4 h-4" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Tạo với AI
                                </>
                            )}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>
                            Hủy
                        </Button>
                    </div>
                </div>
            )}

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
                        Bắt đầu tạo kế hoạch bài dạy đầu tiên của bạn
                    </p>
                    <Button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tạo kế hoạch mới
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
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400">
                                    {new Date(plan.created_at).toLocaleDateString('vi-VN')}
                                </span>
                                <button className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                    Xem chi tiết
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
