// Chú thích: AI Literacy Hub main page

import { useState, useEffect } from 'react';
import {
    GraduationCap,
    BookOpen,
    Lightbulb,
    CheckCircle,
    Sparkles,
    Target,
    Users
} from 'lucide-react';
import { CourseCard, ResourceCard } from '../components/ai-hub';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration_minutes: number;
    progressPercent?: number;
    completedAt?: string;
}

interface Resource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    category: string;
}

export default function AIHub() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'courses' | 'resources' | 'practice'>('courses');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, resourcesRes] = await Promise.all([
                fetch('/api/ai-hub/courses', { credentials: 'include' }),
                fetch('/api/ai-hub/resources', { credentials: 'include' })
            ]);

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setCourses(data.courses || []);
            }
            if (resourcesRes.ok) {
                const data = await resourcesRes.json();
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Error fetching AI Hub data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        coursesCompleted: courses.filter(c => c.completedAt).length,
        totalCourses: courses.length,
        averageProgress: courses.length > 0
            ? Math.round(courses.reduce((acc, c) => acc + (c.progressPercent || 0), 0) / courses.length)
            : 0
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Trung tâm học AI</h1>
                            <p className="text-white/80">Nâng cao năng lực sử dụng AI trong giảng dạy</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Đã hoàn thành</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.coursesCompleted}/{stats.totalCourses}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 mb-1">
                                <Target className="w-4 h-4" />
                                <span className="text-sm">Tiến độ TB</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 text-white/70 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">Thành viên</span>
                            </div>
                            <p className="text-2xl font-bold">1,234</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                    { id: 'courses', label: 'Khóa học', icon: GraduationCap },
                    { id: 'resources', label: 'Tài liệu', icon: BookOpen },
                    { id: 'practice', label: 'Thực hành', icon: Lightbulb },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner w-8 h-8 border-primary-500" />
                </div>
            ) : (
                <>
                    {activeTab === 'courses' && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.length > 0 ? courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            )) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Chưa có khóa học nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.length > 0 ? resources.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            )) : (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Chưa có tài liệu nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'practice' && (
                        <div className="space-y-6">
                            {/* Interactive Prompt Builder */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                        <Lightbulb className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Thực hành viết Prompt
                                        </h3>
                                        <p className="text-sm text-gray-500">Chọn mẫu và tùy chỉnh theo nhu cầu</p>
                                    </div>
                                </div>

                                {/* Prompt Templates Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* CV 7991 Templates */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">CV 7991 - KTĐG</h4>

                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Mức Nhận biết (NB)</span>
                                                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">Dễ</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Tạo 1 câu hỏi trắc nghiệm mức Nhận biết về [Chủ đề].
Yêu cầu: Học sinh nhận diện/nhớ lại [Khái niệm].
4 đáp án, 1 đúng. Giải thích ngắn.`}
                                            </code>
                                        </div>

                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Mức Thông hiểu (TH)</span>
                                                <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">TB</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Tạo 1 câu hỏi trắc nghiệm mức Thông hiểu về [Chủ đề].
Yêu cầu: Học sinh giải thích/so sánh [Khái niệm].
4 đáp án, 1 đúng. Kèm lời giải chi tiết.`}
                                            </code>
                                        </div>

                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Mức Vận dụng (VD)</span>
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">Khó</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Tạo 1 bài toán thực tế mức Vận dụng.
Áp dụng [Công thức/Định lý] để giải quyết [Tình huống].
Kèm lời giải chi tiết theo từng bước.`}
                                            </code>
                                        </div>
                                    </div>

                                    {/* CV 4117 Templates */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">CV 4117 - TN THPT</h4>

                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Câu hỏi Đúng/Sai</span>
                                                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">4 mệnh đề</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Tạo 1 câu hỏi Đúng/Sai theo CV 4117 về [Chủ đề].
Gồm 4 mệnh đề (a, b, c, d).
2 mệnh đề đúng, 2 mệnh đề sai.
Đáp án + giải thích từng mệnh đề.`}
                                            </code>
                                        </div>

                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Trả lời ngắn</span>
                                                <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">Điền đáp số</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Tạo 1 câu hỏi trả lời ngắn về [Chủ đề].
Học sinh điền kết quả (số hoặc từ ngắn).
Đáp án duy nhất, không có đơn vị.`}
                                            </code>
                                        </div>

                                        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-pink-700 dark:text-pink-300">MCQ với RAG</span>
                                                <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full">Có nguồn</span>
                                            </div>
                                            <code className="block text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded font-mono whitespace-pre-wrap">
                                                {`Dựa vào tài liệu đã cung cấp, tạo MCQ về [Chủ đề].
Trích dẫn chính xác từ SGK.
Kèm [sources] để student có thể verify.`}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Thử ngay với AI
                                    </button>
                                    <button className="btn-secondary flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Xem thêm mẫu
                                    </button>
                                </div>
                            </div>

                            {/* Tips Cards */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-500/20">
                                    <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Kiểm tra đáp án</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Luôn verify với SGK gốc</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <Target className="w-5 h-5 text-blue-500 mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Cụ thể hoá</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Prompt càng chi tiết, output càng tốt</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                                    <Users className="w-5 h-5 text-purple-500 mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Chia sẻ</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Prompt hay? Đóng góp cho cộng đồng</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg text-white shrink-0">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Mẹo hôm nay
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Khi tạo câu hỏi bằng AI, luôn kiểm tra đáp án với nguồn SGK gốc.
                            AI có thể tạo nội dung hợp lý nhưng chưa chính xác về mặt kiến thức.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
