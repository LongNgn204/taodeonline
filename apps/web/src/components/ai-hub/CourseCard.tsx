// Chú thích: Course Card component for AI Hub

import { Clock, CheckCircle, Play, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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

interface CourseCardProps {
    course: Course;
}

const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
};

const categoryIcons: Record<string, string> = {
    prompting: '💬',
    verification: '✅',
    assessment: '📊',
    general: '📚',
};

export default function CourseCard({ course }: CourseCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const progress = course.progressPercent || 0;
    const isCompleted = !!course.completedAt;

    return (
        <div
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Progress bar at top */}
            <div className="h-1 bg-gray-100 dark:bg-gray-700">
                <div
                    className={`h-full transition-all duration-500 ${isCompleted
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-primary-500 to-accent-500'
                        }`}
                    style={{ width: `${isCompleted ? 100 : progress}%` }}
                />
            </div>

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{categoryIcons[course.category] || '📚'}</span>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Hoàn thành
                            </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[course.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner
                            }`}>
                            {difficultyLabels[course.difficulty as keyof typeof difficultyLabels] || 'Cơ bản'}
                        </span>
                    </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_minutes} phút</span>
                    </div>

                    <button className={`flex items-center gap-1 text-sm font-medium transition-all ${isHovered
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-500'
                        }`}>
                        {progress > 0 && !isCompleted ? (
                            <>
                                Tiếp tục
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : isCompleted ? (
                            <>
                                Xem lại
                                <ArrowRight className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Bắt đầu
                            </>
                        )}
                    </button>
                </div>

                {/* Progress text */}
                {progress > 0 && !isCompleted && (
                    <div className="mt-3 text-xs text-gray-400">
                        Tiến độ: {progress}%
                    </div>
                )}
            </div>
        </div>
    );
}
