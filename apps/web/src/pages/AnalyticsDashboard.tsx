// Chú thích: Analytics Dashboard page

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    Target,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';

interface ExamStats {
    attemptsCount: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
    stdDeviation: number;
    avgTimeMinutes: number;
    passRate: number;
    scoreDistribution: Record<string, number>;
}

interface ItemStats {
    question_id: string;
    attempts_count: number;
    correct_count: number;
    difficulty_index: number;
    discrimination_index: number;
}

interface Suggestion {
    id: string;
    question_id: string;
    suggestion_type: string;
    severity: string;
    title: string;
    description: string;
}

export default function AnalyticsDashboard() {
    const { id: examId } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [examTitle, setExamTitle] = useState('');
    const [stats, setStats] = useState<ExamStats | null>(null);
    const [itemStats, setItemStats] = useState<ItemStats[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, [examId]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`/api/analytics/exams/${examId}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setExamTitle(data.examTitle || 'Đề thi');
                setStats(data.stats);
                setItemStats(data.itemStats || []);
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            const res = await fetch(`/api/analytics/exams/${examId}/recalculate`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                await fetchAnalytics();
            }
        } catch (error) {
            console.error('Error recalculating:', error);
        } finally {
            setRecalculating(false);
        }
    };

    const getDifficultyLabel = (index: number) => {
        if (index > 0.7) return { label: 'Dễ', color: 'text-green-600 bg-green-100' };
        if (index > 0.3) return { label: 'TB', color: 'text-yellow-600 bg-yellow-100' };
        return { label: 'Khó', color: 'text-red-600 bg-red-100' };
    };

    const getDiscriminationLabel = (index: number) => {
        if (index >= 0.4) return { label: 'Tốt', color: 'text-green-600' };
        if (index >= 0.3) return { label: 'Khá', color: 'text-blue-600' };
        if (index >= 0.2) return { label: 'TB', color: 'text-yellow-600' };
        if (index >= 0) return { label: 'Yếu', color: 'text-orange-600' };
        return { label: 'Âm', color: 'text-red-600' };
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="spinner w-8 h-8 border-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/exams/${examId}`}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Phân tích đề thi
                        </h1>
                        <p className="text-gray-500">{examTitle}</p>
                    </div>
                </div>
                <button
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    className="btn-secondary"
                >
                    {recalculating ? (
                        <div className="spinner w-4 h-4" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Tính lại
                </button>
            </div>

            {/* Quick Stats */}
            {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số lượt làm</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.attemptsCount}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Target className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Điểm TB</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.avgScore.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tỷ lệ đạt</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(stats.passRate * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Thời gian TB</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(stats.avgTimeMinutes)} phút
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Thêm bài làm của học sinh để bắt đầu phân tích
                    </p>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Gợi ý cải thiện ({suggestions.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {suggestions.slice(0, 5).map((sugg) => (
                            <div key={sugg.id} className="p-4 flex items-start gap-3">
                                {sugg.severity === 'critical' ? (
                                    <TrendingDown className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                ) : sugg.severity === 'warning' ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {sugg.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {sugg.description}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Câu hỏi: {sugg.question_id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Item Analysis Table */}
            {itemStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary-500" />
                            Phân tích câu hỏi
                        </h2>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Câu hỏi</th>
                                    <th>Lượt làm</th>
                                    <th>Đúng</th>
                                    <th>Độ khó (P)</th>
                                    <th>Phân biệt (D)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemStats.map((item) => {
                                    const diff = getDifficultyLabel(item.difficulty_index);
                                    const disc = getDiscriminationLabel(item.discrimination_index);
                                    return (
                                        <tr key={item.question_id}>
                                            <td className="font-medium">{item.question_id}</td>
                                            <td>{item.attempts_count}</td>
                                            <td>
                                                {item.correct_count} ({Math.round((item.correct_count / item.attempts_count) * 100)}%)
                                            </td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${diff.color}`}>
                                                    {item.difficulty_index.toFixed(2)} - {diff.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`font-medium ${disc.color}`}>
                                                    {item.discrimination_index.toFixed(2)} - {disc.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Score Distribution */}
            {stats?.scoreDistribution && Object.keys(stats.scoreDistribution).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Phân bố điểm
                    </h2>
                    <div className="flex items-end gap-2 h-40">
                        {Object.entries(stats.scoreDistribution).map(([range, count]) => {
                            const maxCount = Math.max(...Object.values(stats.scoreDistribution));
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            return (
                                <div key={range} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-500">{count}</span>
                                    <div
                                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                                        style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                    />
                                    <span className="text-xs text-gray-500">{range}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
