// Chú thích: Create Exam page - wizard tạo ma trận và đề thi - Revamped UI

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wand2, ChevronLeft, Check, Download, Zap, BrainCircuit, FileText, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useCollaboration } from '../hooks/useCollaboration';
import { getAIConfig } from '../lib/ai-config';
import PresenceIndicator from '../components/PresenceIndicator';
import MatrixEditor from '../components/MatrixEditor';
import { exportExamToWord, exportMatrixToExcel } from '../lib/exportUtils';

type Step = 'config' | 'matrix' | 'exam' | 'export';

// const AI_PROVIDERS = [
//     { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
//     { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
//     { id: 'google', name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
//     { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
//     { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
// ];

export default function CreateExam() {
    const { id: libraryId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Real-time Collaboration (Mock logic for demo)
    const collaborationSessionId = libraryId ? `lib-${libraryId}` : 'demo';
    const { connected, peers, lastMessage, sendMessage } = useCollaboration(collaborationSessionId);

    // Sync matrix update from peers
    useEffect(() => {
        if (lastMessage?.type === 'MATRIX_UPDATE') {
            setMatrix(lastMessage.payload);
        }
    }, [lastMessage]);

    const [step, setStep] = useState<Step>('config');
    const [loading, setLoading] = useState(false);
    const [exportingLatex, setExportingLatex] = useState(false);

    // Config state
    // Read local storage initial values via helper
    const aiConfig = getAIConfig();
    const [provider] = useState(aiConfig.providerId);
    const [model] = useState(aiConfig.modelId);
    const [apiKey] = useState(aiConfig.apiKey);
    const [numTopics, setNumTopics] = useState(4);

    // Generated data
    const [matrix, setMatrix] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [savedExamId, setSavedExamId] = useState<string | null>(null);

    async function handleGenerateMatrix() {
        if (!apiKey) {
            alert('Vui lòng nhập API key');
            return;
        }
        // Removed redundant localStorage write to preserve encryption
        setLoading(true);
        try {
            const res = await api.post('/exams/generate-matrix', {
                libraryId,
                numTopics,
                provider,
                model,
                apiKey,
            });
            const data = await res.json();
            if (res.ok) {
                setMatrix(data.matrix);
                setStep('matrix');
            } else {
                alert(data.message || 'Lỗi khi tạo ma trận');
            }
        } catch (e) {
            console.error('Failed to generate matrix', e);
            alert('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateExam() {
        setLoading(true);
        try {
            const res = await api.post('/exams/generate-exam', {
                libraryId,
                matrixJson: JSON.stringify(matrix),
                provider,
                model,
                apiKey,
            });
            const data = await res.json();
            if (res.ok) {
                setExam(data.exam);
                setStep('exam');
            } else {
                alert(data.message || 'Lỗi khi tạo đề');
            }
        } catch (e) {
            console.error('Failed to generate exam', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveAndExport() {
        setLoading(true);
        try {
            const saveRes = await api.post('/exams', {
                libraryId,
                title: `Đề kiểm tra ${matrix?.subject || ''} Lớp ${matrix?.grade || ''}`,
                matrixJson: JSON.stringify(matrix),
                examJson: exam ? JSON.stringify(exam) : undefined,
                status: 'draft',
            });
            const data = await saveRes.json();
            if (saveRes.ok) {
                setSavedExamId(data.examId || null);
                setStep('export');
            }
        } catch (e) {
            console.error('Failed to save', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleExportLatex() {
        if (!savedExamId) {
            alert('Chưa có mã đề để xuất LaTeX');
            return;
        }

        setExportingLatex(true);
        try {
            const res = await api.post(`/exports/${savedExamId}/exam-tex`);
            const data = await res.json();

            if (res.ok && data.downloadUrl) {
                window.open(`/api${data.downloadUrl}`, '_blank');
            } else {
                alert(data.message || 'Export LaTeX thất bại');
            }
        } catch (e) {
            console.error('Export LaTeX failed', e);
            alert('Không thể xuất LaTeX, vui lòng thử lại.');
        } finally {
            setExportingLatex(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-yellow-500" />
                        Trình tạo đề thông minh
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Tạo ma trận và đề thi chuẩn 7991 chỉ trong vài phút
                    </p>
                </div>

                {/* Collaboration Status */}
                <div className="hidden md:block">
                    <PresenceIndicator connected={connected} peers={peers} />
                </div>
            </div>

            {/* Stepper */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-10" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full -z-10 transition-all duration-500 ease-out"
                        style={{ width: `${(['config', 'matrix', 'exam', 'export'].indexOf(step) / 3) * 100}%` }}
                    />

                    {(['config', 'matrix', 'exam', 'export'] as Step[]).map((s, i) => {
                        const currentIndex = ['config', 'matrix', 'exam', 'export'].indexOf(step);
                        const isCompleted = i < currentIndex;
                        const isCurrent = i === currentIndex;

                        return (
                            <div key={s} className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] px-2 rounded-xl">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${isCompleted || isCurrent
                                        ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-primary-500/25'
                                        : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                                        } ${isCurrent ? 'scale-110 ring-4 ring-primary-500/10' : ''}`}
                                >
                                    {isCompleted ? <Check className="w-6 h-6" /> : i + 1}
                                </div>
                                <span className={`text-sm font-medium ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                                    {s === 'config' && 'Cấu hình'}
                                    {s === 'matrix' && 'Ma trận'}
                                    {s === 'exam' && 'Đề thi'}
                                    {s === 'export' && 'Hoàn tất'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden min-h-[400px] relative">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="p-8">
                    {step === 'config' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center max-w-lg mx-auto mb-8">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                                    <BrainCircuit className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cấu hình AI</h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Hệ thống sử dụng cấu hình AI mặc định của bạn để sinh ma trận đề thi.
                                </p>
                            </div>

                            {apiKey ? (
                                // STATE: API Ready
                                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-500/20 rounded-2xl p-6 max-w-2xl mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Hệ thống đã sẵn sàng</h3>
                                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                                <p>• Nhà cung cấp: <span className="font-semibold">{provider.toUpperCase()}</span></p>
                                                <p>• Mô hình: <span className="font-semibold font-mono">{model}</span></p>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-500/20 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5 block">Số chủ đề mong muốn</label>
                                                    <select
                                                        value={numTopics}
                                                        onChange={(e) => setNumTopics(Number(e.target.value))}
                                                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                                    >
                                                        {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                                                            <option key={n} value={n}>{n} chủ đề</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/settings')}
                                                    className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline px-3 py-2"
                                                >
                                                    Thay đổi cấu hình
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={handleGenerateMatrix}
                                            disabled={loading}
                                            className="btn-primary w-full sm:w-auto py-3 px-6 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <div className="spinner w-5 h-5 border-white" /> : <><Wand2 className="w-5 h-5" /> Tạo ma trận ngay</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // STATE: Missing Config
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-500/20 rounded-2xl p-6 max-w-2xl mx-auto text-center">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mx-auto mb-4">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa cấu hình API</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Bạn cần thiết lập API Key (OpenAI, Google Gemini, v.v.) trước khi sử dụng tính năng tạo đề tự động.
                                    </p>
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="btn-primary py-2.5 px-6"
                                    >
                                        Đi tới Cài đặt
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'matrix' && matrix && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ma trận đề thi</h2>
                                    <p className="text-gray-500 text-sm">Xem và điều chỉnh ma trận trước khi sinh đề</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-500/20">
                                        Chuẩn 7991
                                    </div>
                                </div>
                            </div>

                            {/* Editable Matrix */}
                            <div className="bg-gray-50 dark:bg-black/30 rounded-xl p-1 overflow-x-auto">
                                <MatrixEditor
                                    matrix={matrix}
                                    onChange={(newMatrix) => {
                                        setMatrix(newMatrix);
                                        sendMessage('MATRIX_UPDATE', newMatrix);
                                    }}
                                />
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'MCQ', color: 'primary', val: matrix.summary?.MCQ?.points },
                                    { label: 'Đúng/Sai', color: 'accent', val: matrix.summary?.TF?.points },
                                    { label: 'Trả lời ngắn', color: 'green', val: matrix.summary?.SHORT?.points },
                                    { label: 'Tự luận', color: 'yellow', val: matrix.summary?.ESSAY?.points },
                                ].map((item) => (
                                    <div key={item.label} className={`p-4 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/10 border border-${item.color}-200 dark:border-${item.color}-500/20`}>
                                        <p className={`text-xs font-bold uppercase tracking-wider text-${item.color}-600 dark:text-${item.color}-400 mb-1`}>{item.label}</p>
                                        <p className={`text-2xl font-bold text-${item.color}-700 dark:text-${item.color}-300`}>{item.val || 0}<span className="text-sm font-normal ml-1">đ</span></p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-white/10">
                                <button onClick={() => setStep('config')} className="btn-secondary">
                                    <ChevronLeft className="w-4 h-4" />
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleGenerateExam}
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading ? (
                                        <div className="spinner" />
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" />
                                            Tiếp tục: Sinh đề thi
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'exam' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center py-8">
                                <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đề thi đã sẵn sàng!</h2>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {exam?.sections?.length > 0
                                        ? `Hệ thống đã sinh thành công ${exam.sections.length} phần của đề thi.`
                                        : 'Đã sinh ma trận. Bạn có thể lưu ngay bây giờ.'}
                                </p>
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-white/10">
                                <button onClick={() => setStep('matrix')} className="btn-secondary">
                                    <ChevronLeft className="w-4 h-4" />
                                    Quay lại
                                </button>
                                <button onClick={handleSaveAndExport} disabled={loading} className="btn-primary w-full md:w-auto md:px-12">
                                    {loading ? <div className="spinner" /> : 'Lưu và Xuất bản'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'export' && (
                        <div className="text-center space-y-8 animate-fade-in py-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-xl shadow-green-500/20 animate-scale-up">
                                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thành công!</h2>
                                <p className="text-gray-500 text-lg">Đề thi của bạn đã được lưu vào thư viện.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => exportMatrixToExcel(matrix, `Ma_tran_${matrix?.subject}_${matrix?.grade}`)}
                                    className="btn-primary py-3 px-6 shadow-lg shadow-primary-500/20"
                                >
                                    <Download className="w-5 h-5" />
                                    Tải về Excel (Ma trận)
                                </button>
                                <button
                                    onClick={() => exportExamToWord(exam || { sections: [] }, `De_thi_${matrix?.subject}_${matrix?.grade}`)}
                                    className="btn-accent py-3 px-6 shadow-lg shadow-accent-500/20 text-white"
                                >
                                    <Download className="w-5 h-5" />
                                    Tải về Word (Đề thi)
                                </button>
                                <button
                                    onClick={handleExportLatex}
                                    disabled={exportingLatex}
                                    className="btn-secondary py-3 px-6 shadow-lg"
                                >
                                    {exportingLatex ? (
                                        <div className="spinner" />
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Tải về LaTeX (.tex)
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={() => navigate(libraryId ? `/libraries/${libraryId}` : '/libraries')}
                                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                                >
                                    Quay về thư viện
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
