import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Chú thích: Create Exam page - wizard tạo ma trận và đề thi
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wand2, ChevronLeft, Check, Download } from 'lucide-react';
import { api } from '../lib/api';
const AI_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
    { id: 'google', name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
];
export default function CreateExam() {
    const { id: libraryId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('config');
    const [loading, setLoading] = useState(false);
    // Config state
    const [provider, setProvider] = useState('openai');
    const [model, setModel] = useState('gpt-4o-mini');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '');
    const [numTopics, setNumTopics] = useState(4);
    // Generated data
    const [matrix, setMatrix] = useState(null);
    const [exam, setExam] = useState(null);
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
            }
            else {
                alert(data.message || 'Lỗi khi tạo ma trận');
            }
        }
        catch (e) {
            console.error('Failed to generate matrix', e);
            alert('Lỗi kết nối');
        }
        finally {
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
            }
            else {
                alert(data.message || 'Lỗi khi tạo đề');
            }
        }
        catch (e) {
            console.error('Failed to generate exam', e);
        }
        finally {
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
        }
        catch (e) {
            console.error('Failed to save', e);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto animate-fade-in", children: [_jsx("div", { className: "flex items-center justify-between mb-8", children: ['config', 'matrix', 'exam', 'export'].map((s, i) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${step === s
                                ? 'bg-primary-600 text-white'
                                : i < ['config', 'matrix', 'exam', 'export'].indexOf(step)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`, children: i < ['config', 'matrix', 'exam', 'export'].indexOf(step) ? (_jsx(Check, { className: "w-5 h-5" })) : (i + 1) }), i < 3 && (_jsx("div", { className: `w-16 md:w-24 h-1 ${i < ['config', 'matrix', 'exam', 'export'].indexOf(step)
                                ? 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-700'}` }))] }, s))) }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8", children: [step === 'config' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "C\u1EA5u h\u00ECnh AI" }), _jsx("p", { className: "text-gray-500", children: "Ch\u1ECDn provider v\u00E0 nh\u1EADp API key c\u1EE7a b\u1EA1n" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Provider" }), _jsx("select", { value: provider, onChange: (e) => {
                                                    setProvider(e.target.value);
                                                    const newModels = AI_PROVIDERS.find((p) => p.id === e.target.value)?.models || [];
                                                    setModel(newModels[0] || '');
                                                }, className: "select", children: AI_PROVIDERS.map((p) => (_jsx("option", { value: p.id, children: p.name }, p.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Model" }), _jsx("select", { value: model, onChange: (e) => setModel(e.target.value), className: "select", children: currentProviderModels.map((m) => (_jsx("option", { value: m, children: m }, m))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "API Key" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "input", placeholder: "sk-... ho\u1EB7c key t\u01B0\u01A1ng \u1EE9ng" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Key \u0111\u01B0\u1EE3c l\u01B0u tr\u00EAn tr\u00ECnh duy\u1EC7t c\u1EE7a b\u1EA1n, kh\u00F4ng g\u1EEDi l\u00EAn server \u0111\u1EC3 l\u01B0u tr\u1EEF" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "S\u1ED1 ch\u1EE7 \u0111\u1EC1 trong ma tr\u1EADn" }), _jsx("select", { value: numTopics, onChange: (e) => setNumTopics(Number(e.target.value)), className: "select w-32", children: [2, 3, 4, 5, 6].map((n) => (_jsxs("option", { value: n, children: [n, " ch\u1EE7 \u0111\u1EC1"] }, n))) })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx("button", { onClick: handleGenerateMatrix, disabled: loading || !apiKey, className: "btn-accent", children: loading ? (_jsx("div", { className: "spinner" })) : (_jsxs(_Fragment, { children: [_jsx(Wand2, { className: "w-4 h-4" }), "T\u1EA1o ma tr\u1EADn"] })) }) })] })), step === 'matrix' && matrix && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "Ma tr\u1EADn \u0111\u1EC1" }), _jsx("p", { className: "text-gray-500", children: "Xem v\u00E0 \u0111i\u1EC1u ch\u1EC9nh ma tr\u1EADn tr\u01B0\u1EDBc khi sinh \u0111\u1EC1" })] }), _jsx("div", { className: "table-container", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Ch\u1EE7 \u0111\u1EC1" }), _jsx("th", { children: "MCQ" }), _jsx("th", { children: "\u0110/S" }), _jsx("th", { children: "Ng\u1EAFn" }), _jsx("th", { children: "TL" }), _jsx("th", { children: "T\u1EF7 l\u1EC7" })] }) }), _jsx("tbody", { children: matrix.topics?.map((topic) => (_jsxs("tr", { children: [_jsx("td", { className: "font-medium", children: topic.name }), _jsx("td", { children: topic.units?.reduce((sum, u) => sum + (u.MCQ?.NB || 0) + (u.MCQ?.TH || 0) + (u.MCQ?.VD || 0), 0) || '-' }), _jsx("td", { children: topic.units?.reduce((sum, u) => sum + (u.TF?.NB || 0) + (u.TF?.TH || 0) + (u.TF?.VD || 0), 0) || '-' }), _jsx("td", { children: topic.units?.reduce((sum, u) => sum + (u.SHORT?.NB || 0) + (u.SHORT?.TH || 0) + (u.SHORT?.VD || 0), 0) || '-' }), _jsx("td", { children: topic.units?.reduce((sum, u) => sum + (u.ESSAY?.NB || 0) + (u.ESSAY?.TH || 0) + (u.ESSAY?.VD || 0), 0) || '-' }), _jsxs("td", { children: [topic.percentScore, "%"] })] }, topic.id))) })] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "MCQ" }), _jsxs("p", { className: "text-xl font-bold text-primary-600", children: [matrix.summary?.MCQ?.points, " \u0111i\u1EC3m"] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u0110\u00FAng/Sai" }), _jsxs("p", { className: "text-xl font-bold text-accent-600", children: [matrix.summary?.TF?.points, " \u0111i\u1EC3m"] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-green-50 dark:bg-green-900/20", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Tr\u1EA3 l\u1EDDi ng\u1EAFn" }), _jsxs("p", { className: "text-xl font-bold text-green-600", children: [matrix.summary?.SHORT?.points, " \u0111i\u1EC3m"] })] }), _jsxs("div", { className: "p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "T\u1EF1 lu\u1EADn" }), _jsxs("p", { className: "text-xl font-bold text-yellow-600", children: [matrix.summary?.ESSAY?.points, " \u0111i\u1EC3m"] })] })] }), _jsxs("div", { className: "flex justify-between pt-4", children: [_jsxs("button", { onClick: () => setStep('config'), className: "btn-secondary", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Quay l\u1EA1i"] }), _jsx("button", { onClick: handleGenerateExam, disabled: loading, className: "btn-accent", children: loading ? (_jsx("div", { className: "spinner" })) : (_jsxs(_Fragment, { children: [_jsx(Wand2, { className: "w-4 h-4" }), "Sinh \u0111\u1EC1 thi"] })) })] })] })), step === 'exam' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "Xem tr\u01B0\u1EDBc \u0111\u1EC1 thi" }), _jsx("p", { className: "text-gray-500", children: "Ki\u1EC3m tra v\u00E0 l\u01B0u \u0111\u1EC1 thi" })] }), _jsx("div", { className: "p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center", children: _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: exam?.sections?.length > 0
                                        ? `Đề thi có ${exam.sections.length} phần`
                                        : 'Chức năng sinh đề đang được phát triển. Vui lòng lưu ma trận và export.' }) }), _jsxs("div", { className: "flex justify-between pt-4", children: [_jsxs("button", { onClick: () => setStep('matrix'), className: "btn-secondary", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Quay l\u1EA1i"] }), _jsx("button", { onClick: handleSaveAndExport, disabled: loading, className: "btn-primary", children: loading ? _jsx("div", { className: "spinner" }) : 'Lưu và Export' })] })] })), step === 'export' && (_jsxs("div", { className: "text-center space-y-6", children: [_jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center", children: _jsx(Check, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "\u0110\u00E3 l\u01B0u th\u00E0nh c\u00F4ng!" }), _jsx("p", { className: "text-gray-500", children: "B\u1EA1n c\u00F3 th\u1EC3 export ma tr\u1EADn v\u00E0 \u0111\u1EC1 thi" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs("button", { className: "btn-primary", children: [_jsx(Download, { className: "w-4 h-4" }), "Export Excel (Ma tr\u1EADn)"] }), _jsxs("button", { className: "btn-secondary", children: [_jsx(Download, { className: "w-4 h-4" }), "Export Word (\u0110\u1EC1 thi)"] })] }), _jsx("button", { onClick: () => navigate(`/libraries/${libraryId}`), className: "btn-ghost text-primary-600", children: "Quay v\u1EC1 th\u01B0 vi\u1EC7n" })] }))] })] }));
}
//# sourceMappingURL=CreateExam.js.map