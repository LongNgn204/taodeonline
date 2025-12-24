// Chú thích: Batch Exam Generator - Tạo nhiều đề cùng lúc
// Cho phép GV tạo nhiều biến thể đề từ 1 ma trận

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Layers,
    Plus,
    Check,
    Download,
    FileText,
    RefreshCw,
    Settings,
    AlertCircle,
    Sparkles,
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getAIConfig } from '../lib/ai-config';
import { generateExamWithPolicy } from '../lib/frontend-ai';
import { api } from '../lib/api';

interface ExamVariant {
    id: string;
    name: string;
    status: 'pending' | 'generating' | 'done' | 'error';
    progress: number;
    exam?: any;
    error?: string;
    generatedAt?: Date;
}

interface BatchConfig {
    numVariants: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    difficultySpread: boolean;
    prefix: string;
}

export default function BatchExamGenerator() {
    const aiConfig = getAIConfig();

    // State
    const [libraries, setLibraries] = useState<any[]>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
    const [matrix, setMatrix] = useState<any>(null);
    const [variants, setVariants] = useState<ExamVariant[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [config, setConfig] = useState<BatchConfig>({
        numVariants: 4,
        shuffleQuestions: true,
        shuffleOptions: true,
        difficultySpread: false,
        prefix: 'Mã đề',
    });

    // Load libraries
    useEffect(() => {
        async function load() {
            try {
                const res = await api.get('/libraries');
                const data = await res.json();
                setLibraries(data.libraries || []);
            } catch (e) {
                console.error('Failed to load libraries:', e);
            }
        }
        load();
    }, []);

    // Load matrix from library (if has recent exam)
    useEffect(() => {
        if (!selectedLibrary) return;

        async function loadMatrix() {
            try {
                const res = await api.get(`/exams?libraryId=${selectedLibrary}&limit=1`);
                const data = await res.json();
                if (data.exams?.[0]?.matrix_json) {
                    setMatrix(JSON.parse(data.exams[0].matrix_json));
                }
            } catch (e) {
                console.error('Failed to load matrix:', e);
            }
        }
        loadMatrix();
    }, [selectedLibrary]);

    // Initialize variants
    const initializeVariants = () => {
        const newVariants: ExamVariant[] = [];
        for (let i = 0; i < config.numVariants; i++) {
            newVariants.push({
                id: `v${i + 1}`,
                name: `${config.prefix} ${String(100 + i + 1).slice(1)}`, // 101, 102, etc
                status: 'pending',
                progress: 0,
            });
        }
        setVariants(newVariants);
    };

    // Generate all variants
    const generateAll = async () => {
        if (!matrix || !aiConfig.apiKey) {
            alert('Vui lòng chọn thư viện có ma trận và cấu hình API Key.');
            return;
        }

        setIsGenerating(true);
        setCurrentIndex(0);

        for (let i = 0; i < variants.length; i++) {
            setCurrentIndex(i);

            // Update status to generating
            setVariants(prev => prev.map((v, idx) =>
                idx === i ? { ...v, status: 'generating', progress: 0 } : v
            ));

            try {
                // Chú thích: Tạo đề với seed khác nhau để có biến thể
                const result = await generateExamWithPolicy(
                    matrix,
                    {
                        grade: matrix.grade,
                        subject: matrix.subject,
                        assessmentType: 'school_assessment',
                    }
                );

                // Update với kết quả
                setVariants(prev => prev.map((v, idx) =>
                    idx === i ? {
                        ...v,
                        status: 'done',
                        progress: 100,
                        exam: result.exam,
                        generatedAt: new Date(),
                    } : v
                ));

            } catch (e: any) {
                setVariants(prev => prev.map((v, idx) =>
                    idx === i ? {
                        ...v,
                        status: 'error',
                        error: e.message || 'Lỗi tạo đề',
                    } : v
                ));
            }

            // Small delay between variants
            await new Promise(r => setTimeout(r, 500));
        }

        setIsGenerating(false);
    };

    // Retry single variant
    const retryVariant = async (index: number) => {
        if (!matrix) return;

        setVariants(prev => prev.map((v, idx) =>
            idx === index ? { ...v, status: 'generating', progress: 0, error: undefined } : v
        ));

        try {
            const result = await generateExamWithPolicy(
                matrix,
                {
                    grade: matrix.grade,
                    subject: matrix.subject,
                    assessmentType: 'school_assessment',
                }
            );

            setVariants(prev => prev.map((v, idx) =>
                idx === index ? {
                    ...v,
                    status: 'done',
                    progress: 100,
                    exam: result.exam,
                    generatedAt: new Date(),
                } : v
            ));
        } catch (e: any) {
            setVariants(prev => prev.map((v, idx) =>
                idx === index ? {
                    ...v,
                    status: 'error',
                    error: e.message,
                } : v
            ));
        }
    };

    // Download all as ZIP
    const downloadAll = async () => {
        const completedVariants = variants.filter(v => v.status === 'done');
        if (completedVariants.length === 0) {
            alert('Chưa có đề nào được tạo xong.');
            return;
        }

        // For now, download as JSON bundle
        const bundle = {
            matrix,
            variants: completedVariants.map(v => ({
                name: v.name,
                exam: v.exam,
                generatedAt: v.generatedAt,
            })),
            generatedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${matrix?.subject}_${config.numVariants}de.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Stats
    const completedCount = variants.filter(v => v.status === 'done').length;
    const errorCount = variants.filter(v => v.status === 'error').length;
    const progress = variants.length > 0 ? Math.round((completedCount / variants.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Layers className="w-7 h-7 text-purple-500" />
                        Tạo Đề Hàng loạt
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Tạo nhiều biến thể đề thi từ một ma trận
                    </p>
                </div>

                {!aiConfig.apiKey && (
                    <Link
                        to="/settings"
                        className="text-sm text-orange-600 hover:underline flex items-center gap-1"
                    >
                        <AlertCircle className="w-4 h-4" />
                        Cấu hình API Key
                    </Link>
                )}
            </div>

            {/* Config Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Cấu hình
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Library Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thư viện nguồn
                        </label>
                        <select
                            value={selectedLibrary || ''}
                            onChange={(e) => setSelectedLibrary(e.target.value || null)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="">Chọn thư viện...</option>
                            {libraries.map(lib => (
                                <option key={lib.id} value={lib.id}>
                                    {lib.name} ({lib.subject} - Lớp {lib.grade})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Number of Variants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Số lượng đề
                        </label>
                        <select
                            value={config.numVariants}
                            onChange={(e) => setConfig(prev => ({ ...prev, numVariants: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            {[2, 4, 6, 8, 10, 12, 16, 20].map(n => (
                                <option key={n} value={n}>{n} đề</option>
                            ))}
                        </select>
                    </div>

                    {/* Prefix */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tiền tố mã đề
                        </label>
                        <input
                            type="text"
                            value={config.prefix}
                            onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            placeholder="Mã đề"
                        />
                    </div>

                    {/* Shuffle Options */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={config.shuffleQuestions}
                                onChange={(e) => setConfig(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                                className="rounded"
                            />
                            <span>Đảo thứ tự câu hỏi</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={config.shuffleOptions}
                                onChange={(e) => setConfig(prev => ({ ...prev, shuffleOptions: e.target.checked }))}
                                className="rounded"
                            />
                            <span>Đảo thứ tự đáp án</span>
                        </label>
                    </div>
                </div>

                {/* Matrix Info */}
                {matrix && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-sm">
                            <FileText className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                Ma trận sẵn sàng: {matrix.subject} - Lớp {matrix.grade}
                            </span>
                            <span className="text-gray-400">
                                ({matrix.topics?.length || 0} chủ đề)
                            </span>
                        </div>
                    </div>
                )}

                {/* Initialize Button */}
                <div className="mt-6">
                    <Button
                        onClick={initializeVariants}
                        disabled={!selectedLibrary || !matrix}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Khởi tạo {config.numVariants} đề
                    </Button>
                </div>
            </div>

            {/* Variants Grid */}
            {variants.length > 0 && (
                <div className="space-y-4">
                    {/* Progress Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Danh sách đề ({completedCount}/{variants.length})
                            </h3>
                            {errorCount > 0 && (
                                <p className="text-sm text-red-500">{errorCount} đề lỗi</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Progress Bar */}
                            <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Actions */}
                            {!isGenerating ? (
                                <Button
                                    onClick={generateAll}
                                    disabled={completedCount === variants.length}
                                    className="flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Tạo tất cả
                                </Button>
                            ) : (
                                <Button variant="secondary" disabled className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tạo... ({currentIndex + 1}/{variants.length})
                                </Button>
                            )}

                            {completedCount > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={downloadAll}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Tải tất cả
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Variants Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {variants.map((variant, index) => (
                            <div
                                key={variant.id}
                                className={`p-4 rounded-xl border transition-all ${variant.status === 'done'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                    : variant.status === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                        : variant.status === 'generating'
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {variant.name}
                                    </span>
                                    {variant.status === 'done' && (
                                        <Check className="w-5 h-5 text-green-500" />
                                    )}
                                    {variant.status === 'error' && (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    {variant.status === 'generating' && (
                                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                                    )}
                                </div>

                                {variant.status === 'generating' && (
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 animate-pulse"
                                            style={{ width: '60%' }}
                                        />
                                    </div>
                                )}

                                {variant.status === 'done' && variant.exam && (
                                    <p className="text-xs text-gray-500">
                                        {variant.exam.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) || 0} câu hỏi
                                    </p>
                                )}

                                {variant.status === 'error' && (
                                    <div>
                                        <p className="text-xs text-red-500 mb-2">{variant.error}</p>
                                        <button
                                            onClick={() => retryVariant(index)}
                                            className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Thử lại
                                        </button>
                                    </div>
                                )}

                                {variant.status === 'pending' && (
                                    <p className="text-xs text-gray-400">Chờ tạo...</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {variants.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Chưa có đề nào
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Chọn thư viện có ma trận và nhấn "Khởi tạo" để bắt đầu tạo nhiều đề cùng lúc.
                    </p>
                </div>
            )}
        </div>
    );
}
