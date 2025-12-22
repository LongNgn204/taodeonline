// Chú thích: ResearchProgress component - hiển thị tiến độ nghiên cứu tài liệu
// Các giai đoạn: Đọc tài liệu → Phân tích cấu trúc → Tạo ma trận → Hoàn tất

import { BookOpen, Brain, FileText, Check, Loader2 } from 'lucide-react';

export interface ResearchStage {
    id: string;
    label: string;
    icon: 'book' | 'brain' | 'file' | 'check';
}

export const RESEARCH_STAGES: ResearchStage[] = [
    { id: 'reading', label: 'Đọc tài liệu nguồn', icon: 'book' },
    { id: 'analyzing', label: 'Phân tích cấu trúc', icon: 'brain' },
    { id: 'generating', label: 'Tạo ma trận đề', icon: 'file' },
    { id: 'done', label: 'Hoàn tất', icon: 'check' },
];

interface ResearchProgressProps {
    currentStageId: string;
    progress: number; // 0-100 for current stage
    documentsCount: number;
    tokensCount: number;
    estimatedSeconds?: number;
    error?: string;
}

const IconMap = {
    book: BookOpen,
    brain: Brain,
    file: FileText,
    check: Check,
};

export default function ResearchProgress({
    currentStageId,
    progress,
    documentsCount,
    tokensCount,
    estimatedSeconds,
    error,
}: ResearchProgressProps) {
    const currentIndex = RESEARCH_STAGES.findIndex((s) => s.id === currentStageId);

    // Chú thích: Tính toán overall progress
    const overallProgress = Math.min(
        100,
        ((currentIndex + progress / 100) / RESEARCH_STAGES.length) * 100
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 animate-pulse">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    AI đang nghiên cứu tài liệu
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Đang phân tích {documentsCount} tài liệu (~{(tokensCount / 1000).toFixed(1)}k tokens)
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm">
                    <p className="font-medium mb-1">Đã xảy ra lỗi</p>
                    <p className="text-red-600/80 dark:text-red-400/70">{error}</p>
                </div>
            )}

            {/* Overall Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
                <p className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(overallProgress)}%
                </p>
            </div>

            {/* Stages */}
            <div className="space-y-3">
                {RESEARCH_STAGES.map((stage, index) => {
                    const Icon = IconMap[stage.icon];
                    const isComplete = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div
                            key={stage.id}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isCurrent
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30'
                                : isComplete
                                    ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            {/* Icon */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCurrent
                                    ? 'bg-blue-500 text-white'
                                    : isComplete
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {isCurrent ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isComplete ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <p
                                    className={`font-medium ${isCurrent
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : isComplete
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {stage.label}
                                </p>
                                {isCurrent && (
                                    <div className="mt-2 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${isCurrent
                                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                    : isComplete
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {isCurrent ? 'Đang xử lý' : isComplete ? 'Hoàn tất' : 'Chờ'}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Estimated Time */}
            {estimatedSeconds && estimatedSeconds > 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Thời gian ước tính còn lại: ~{estimatedSeconds} giây
                </p>
            )}

            {/* Tip */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    💡 <strong>Mẹo:</strong> Bạn có thể rời trang này. Khi quay lại, AI sẽ tiếp tục từ nơi dừng lại.
                </p>
            </div>
        </div>
    );
}
