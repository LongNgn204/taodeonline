// Chú thích: Create Exam page - wizard tạo ma trận và đề thi

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wand2, ChevronLeft, Check, Download } from 'lucide-react';
import { api } from '../lib/api';

type Step = 'config' | 'matrix' | 'exam' | 'export';

const AI_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
    { id: 'google', name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
];

export default function CreateExam() {
    const { id: libraryId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('config');
    const [loading, setLoading] = useState(false);

    // Config state
    const [provider, setProvider] = useState('openai');
    const [model, setModel] = useState('gpt-4o-mini');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '');
    const [numTopics, setNumTopics] = useState(4);

    // Generated data
    const [matrix, setMatrix] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);

    const currentProviderModels = AI_PROVIDERS.find((p) => p.id === provider)?.models || [];

    async function handleGenerateMatrix() {
        if (!apiKey) {
            alert('Vui lòng nhập API key');
            return;
        }

        // Save API key to localStorage
        localStorage.setItem('ai_api_key', apiKey);

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
            // Save exam
            const saveRes = await api.post('/exams', {
                libraryId,
                title: `Đề kiểm tra ${matrix?.subject} Lớp ${matrix?.grade}`,
                matrixJson: JSON.stringify(matrix),
                examJson: exam ? JSON.stringify(exam) : undefined,
                status: 'draft',
            });

            await saveRes.json();
            if (saveRes.ok) {
                setStep('export');
            }
        } catch (e) {
            console.error('Failed to save', e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
                {(['config', 'matrix', 'exam', 'export'] as Step[]).map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${step === s
                                ? 'bg-primary-600 text-white'
                                : i < ['config', 'matrix', 'exam', 'export'].indexOf(step)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}
                        >
                            {i < ['config', 'matrix', 'exam', 'export'].indexOf(step) ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < 3 && (
                            <div
                                className={`w-16 md:w-24 h-1 ${i < ['config', 'matrix', 'exam', 'export'].indexOf(step)
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                {step === 'config' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cấu hình AI</h2>
                            <p className="text-gray-500">Chọn provider và nhập API key của bạn</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Provider</label>
                                <select
                                    value={provider}
                                    onChange={(e) => {
                                        setProvider(e.target.value);
                                        const newModels = AI_PROVIDERS.find((p) => p.id === e.target.value)?.models || [];
                                        setModel(newModels[0] || '');
                                    }}
                                    className="select"
                                >
                                    {AI_PROVIDERS.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Model</label>
                                <select value={model} onChange={(e) => setModel(e.target.value)} className="select">
                                    {currentProviderModels.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label">API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="input"
                                placeholder="sk-... hoặc key tương ứng"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Key được lưu trên trình duyệt của bạn, không gửi lên server để lưu trữ
                            </p>
                        </div>

                        <div>
                            <label className="label">Số chủ đề trong ma trận</label>
                            <select
                                value={numTopics}
                                onChange={(e) => setNumTopics(Number(e.target.value))}
                                className="select w-32"
                            >
                                {[2, 3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>
                                        {n} chủ đề
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={handleGenerateMatrix} disabled={loading || !apiKey} className="btn-accent">
                                {loading ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Tạo ma trận
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'matrix' && matrix && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ma trận đề</h2>
                            <p className="text-gray-500">Xem và điều chỉnh ma trận trước khi sinh đề</p>
                        </div>

                        {/* Matrix preview table */}
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Chủ đề</th>
                                        <th>MCQ</th>
                                        <th>Đ/S</th>
                                        <th>Ngắn</th>
                                        <th>TL</th>
                                        <th>Tỷ lệ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.topics?.map((topic: any) => (
                                        <tr key={topic.id}>
                                            <td className="font-medium">{topic.name}</td>
                                            <td>
                                                {topic.units?.reduce(
                                                    (sum: number, u: any) => sum + (u.MCQ?.NB || 0) + (u.MCQ?.TH || 0) + (u.MCQ?.VD || 0),
                                                    0
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {topic.units?.reduce(
                                                    (sum: number, u: any) => sum + (u.TF?.NB || 0) + (u.TF?.TH || 0) + (u.TF?.VD || 0),
                                                    0
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {topic.units?.reduce(
                                                    (sum: number, u: any) => sum + (u.SHORT?.NB || 0) + (u.SHORT?.TH || 0) + (u.SHORT?.VD || 0),
                                                    0
                                                ) || '-'}
                                            </td>
                                            <td>
                                                {topic.units?.reduce(
                                                    (sum: number, u: any) => sum + (u.ESSAY?.NB || 0) + (u.ESSAY?.TH || 0) + (u.ESSAY?.VD || 0),
                                                    0
                                                ) || '-'}
                                            </td>
                                            <td>{topic.percentScore}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                                <p className="text-sm text-gray-500 dark:text-gray-400">MCQ</p>
                                <p className="text-xl font-bold text-primary-600">{matrix.summary?.MCQ?.points} điểm</p>
                            </div>
                            <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Đúng/Sai</p>
                                <p className="text-xl font-bold text-accent-600">{matrix.summary?.TF?.points} điểm</p>
                            </div>
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Trả lời ngắn</p>
                                <p className="text-xl font-bold text-green-600">{matrix.summary?.SHORT?.points} điểm</p>
                            </div>
                            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tự luận</p>
                                <p className="text-xl font-bold text-yellow-600">{matrix.summary?.ESSAY?.points} điểm</p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep('config')} className="btn-secondary">
                                <ChevronLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                            <button onClick={handleGenerateExam} disabled={loading} className="btn-accent">
                                {loading ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Sinh đề thi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'exam' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xem trước đề thi</h2>
                            <p className="text-gray-500">Kiểm tra và lưu đề thi</p>
                        </div>

                        <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {exam?.sections?.length > 0
                                    ? `Đề thi có ${exam.sections.length} phần`
                                    : 'Chức năng sinh đề đang được phát triển. Vui lòng lưu ma trận và export.'}
                            </p>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep('matrix')} className="btn-secondary">
                                <ChevronLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                            <button onClick={handleSaveAndExport} disabled={loading} className="btn-primary">
                                {loading ? <div className="spinner" /> : 'Lưu và Export'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'export' && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đã lưu thành công!</h2>
                            <p className="text-gray-500">Bạn có thể export ma trận và đề thi</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="btn-primary">
                                <Download className="w-4 h-4" />
                                Export Excel (Ma trận)
                            </button>
                            <button className="btn-secondary">
                                <Download className="w-4 h-4" />
                                Export Word (Đề thi)
                            </button>
                        </div>

                        <button onClick={() => navigate(`/libraries/${libraryId}`)} className="btn-ghost text-primary-600">
                            Quay về thư viện
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
