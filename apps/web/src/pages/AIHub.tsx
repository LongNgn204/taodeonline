// Chú thích: AI Literacy Hub main page

import { useState, useEffect } from 'react';
import {
    GraduationCap,
    BookOpen,
    Lightbulb,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Target,
    Users
} from 'lucide-react';
import CourseCard from '../components/ai-hub/CourseCard';
import ResourceCard from '../components/ai-hub/ResourceCard';

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
                            <h1 className="text-3xl font-bold">Trung tâm AI</h1>
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Lightbulb className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Thực hành với AI
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                Luyện tập viết prompt, kiểm chứng đáp án và tạo câu hỏi chất lượng với các bài tập tương tác
                            </p>
                            <button className="btn-primary inline-flex items-center gap-2">
                                Bắt đầu thực hành
                                <ArrowRight className="w-4 h-4" />
                            </button>
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
