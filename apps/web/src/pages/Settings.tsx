import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Eye, EyeOff, Check, Cpu, Zap, Layers, Box, ShieldCheck, Sparkles, Trash2, Globe, Key, Loader2 } from 'lucide-react';
import { AIModel } from '@exam-matrix/shared';

// Configuration for AI Providers (metadata only)
const AI_PROVIDERS = [
    {
        id: 'openrouter',
        name: 'OpenRouter (Khuyên dùng)',
        description: 'Cổng kết nối tới 100+ models: GPT-4o, Claude 3.5, Llama 3...',
        keyPrefix: 'sk-or-',
        color: 'from-violet-500 to-fuchsia-600',
        icon: Box,
        fetchUrl: 'https://openrouter.ai/api/v1/models',
        headers: (key: string) => ({
            'Authorization': `Bearer ${key} `,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Kien Tao Viet'
        })
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo.',
        keyPrefix: 'sk-proj-', // New project keys start with sk-proj, old sk-
        keyPattern: /^sk-(proj-)?[a-zA-Z0-9]{20,}/,
        color: 'from-green-500 to-emerald-600',
        icon: Zap,
        fetchUrl: 'https://api.openai.com/v1/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key} ` })
    },
    {
        id: 'google',
        name: 'Google Gemini',
        description: 'Gemini 1.5 Pro/Flash, Gemini 1.0.',
        keyPrefix: 'AIza',
        color: 'from-blue-500 to-cyan-600',
        icon: ShieldCheck,
        fetchUrl: (key: string) => `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        headers: () => ({})
    },
    {
        id: 'anthropic',
        name: 'Anthropic (Claude)',
        description: 'Claude 3.5 Sonnet, Claude 3 Opus.',
        keyPrefix: 'sk-ant-',
        color: 'from-orange-500 to-amber-600',
        icon: Layers
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        description: 'DeepSeek-V2, Coder. Hiệu năng cao, giá rẻ.',
        keyPrefix: 'sk-', // Confles with OpenAI, requires manual selection or smart check
        color: 'from-blue-600 to-indigo-600',
        icon: Cpu,
        fetchUrl: 'https://api.deepseek.com/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    },
    {
        id: 'groq',
        name: 'Groq',
        description: 'Tốc độ siêu nhanh (Llama 3, Mixtral).',
        keyPrefix: 'gsk_',
        color: 'from-red-500 to-orange-600',
        icon: Zap,
        fetchUrl: 'https://api.groq.com/openai/v1/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    },
    {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'Mistral Large, Small, Codestral.',
        keyPrefix: '', // No standard prefix
        color: 'from-yellow-500 to-orange-400',
        icon: Cpu,
        fetchUrl: 'https://api.mistral.ai/v1/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        description: 'Online models, Llama 3 finetunes.',
        keyPrefix: 'pplx-',
        color: 'from-teal-500 to-emerald-500',
        icon: Sparkles,
        fetchUrl: 'https://api.perplexity.ai/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    },
    {
        id: 'together',
        name: 'Together AI',
        description: 'Serverless models: Qwen, Llama, Falcon.',
        keyPrefix: '',
        color: 'from-blue-400 to-indigo-500',
        icon: Box,
        fetchUrl: 'https://api.together.xyz/v1/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    }
];

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Model state
    const [fetchedModels, setFetchedModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [visionModel, setVisionModel] = useState('');
    const [detectedProvider, setDetectedProvider] = useState<any>(null); // Use this as "Selected Provider"
    const [manualProviderId, setManualProviderId] = useState(''); // User override
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        // Obfuscation decode
        const encodedKey = localStorage.getItem('ai_api_key');
        let key = '';
        if (encodedKey) {
            try {
                key = atob(encodedKey);
            } catch (e) {
                key = encodedKey;
            }
        }

        const savedModel = localStorage.getItem('ai_selected_model') || '';
        const savedVisionModel = localStorage.getItem('ai_vision_model') || '';
        const providerId = localStorage.getItem('ai_provider_id');

        setApiKey(key);
        setSavedKey(key);
        setSelectedModel(savedModel);
        setVisionModel(savedVisionModel);

        if (providerId) {
            const provider = AI_PROVIDERS.find(p => p.id === providerId);
            if (provider) {
                setDetectedProvider(provider);
                setManualProviderId(provider.id);
            }
        }
    }, []);

    // Detect provider logic
    useEffect(() => {
        if (!apiKey) {
            if (!savedKey) setDetectedProvider(null);
            return;
        }

        // If user manually selected a provider, prioritize it (unless it's empty)
        if (manualProviderId) {
            const manual = AI_PROVIDERS.find(p => p.id === manualProviderId);
            if (manual) {
                setDetectedProvider(manual);
                return;
            }
        }

        // Auto-detect based on prefix
        // Special handlings
        if (apiKey.startsWith('sk-or-')) {
            setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'openrouter'));
            setManualProviderId('openrouter');
            return;
        }
        if (apiKey.startsWith('sk-ant-')) {
            setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'anthropic'));
            setManualProviderId('anthropic');
            return;
        }
        if (apiKey.startsWith('AIza')) {
            setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'google'));
            setManualProviderId('google');
            return;
        }
        if (apiKey.startsWith('gsk_')) {
            setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'groq'));
            setManualProviderId('groq');
            return;
        }
        if (apiKey.startsWith('pplx-')) {
            setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'perplexity'));
            setManualProviderId('perplexity');
            return;
        }

        // Conflict: OpenAI vs DeepSeek (both can be sk-)
        // Default to OpenAI if starts with sk-, but let user change
        if (apiKey.startsWith('sk-')) {
            // Check if user hasn't explicitly chosen yet
            if (!manualProviderId || manualProviderId === 'openai') {
                setDetectedProvider(AI_PROVIDERS.find(p => p.id === 'openai'));
                setManualProviderId('openai');
            }
        }

    }, [apiKey, manualProviderId]);

    const fetchModels = async () => {
        if (!detectedProvider) return;
        setIsVerifying(true);
        setError('');
        setFetchedModels([]);
        setSuccessMsg('');

        try {
            let models: AIModel[] = [];

            // Standard OpenAI-compatible fetch
            if (['openrouter', 'openai', 'groq', 'deepseek', 'mistral', 'perplexity', 'together'].includes(detectedProvider.id)) {

                const fetchUrl = typeof detectedProvider.fetchUrl === 'function' ? detectedProvider.fetchUrl(apiKey) : detectedProvider.fetchUrl;

                if (!fetchUrl) throw new Error('Provider này chưa hỗ trợ lấy model tự động hoặc URL sai.');

                const res = await fetch(fetchUrl, {
                    headers: detectedProvider.headers(apiKey)
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Lỗi kết nối API (${res.status}): ${errText.slice(0, 100)}`);
                }

                const data = await res.json();
                const list = data.data || data.models || []; // Handle different formats

                models = list.map((m: any) => ({
                    id: m.id,
                    displayName: m.name || m.id,
                    providerId: detectedProvider.id
                }))
                    .sort((a: any, b: any) => a.id.localeCompare(b.id));

            } else if (detectedProvider.id === 'google') {
                const url = typeof detectedProvider.fetchUrl === 'function' ? detectedProvider.fetchUrl(apiKey) : '';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Key không hợp lệ hoặc lỗi Google API');
                const data = await res.json();

                models = (data.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                    .map((m: any) => ({
                        id: m.name.replace('models/', ''),
                        displayName: m.displayName || m.name.replace('models/', ''),
                        providerId: 'google'
                    }));
            } else {
                // Fallback (Anthropic)
                if (detectedProvider.id === 'anthropic') {
                    models = [
                        { id: 'claude-3-5-sonnet-20240620', displayName: 'Claude 3.5 Sonnet', providerId: 'anthropic' },
                        { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', providerId: 'anthropic' },
                        { id: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet', providerId: 'anthropic' },
                        { id: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', providerId: 'anthropic' },
                    ];
                    setSuccessMsg('Đã lưu Key (List mặc định).');
                } else {
                    setSuccessMsg('Đã lưu Key.');
                }
            }

            if (models.length > 0) {
                setFetchedModels(models);
                setSuccessMsg(`Tìm thấy ${models.length} hình mẫu.`);
                // Auto select if none or previous invalid
                if (!selectedModel || !models.find(m => m.id === selectedModel)) setSelectedModel(models[0].id);
                // Simple logic for vision override
                if (detectedProvider.id === 'google' && !visionModel) setVisionModel('gemini-1.5-flash');
                else if (!visionModel) setVisionModel(models[0].id);
            } else {
                if (!successMsg) setError('Không tìm thấy model nào.');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Lỗi kiểm tra Key');
        } finally {
            setIsVerifying(false);
        }
    };

    const saveConfig = (modelId: string | null, visionModelId: string | null) => {
        const encodedKey = btoa(apiKey);
        localStorage.setItem('ai_api_key', encodedKey);
        localStorage.setItem('ai_provider_id', detectedProvider?.id || '');
        if (modelId) localStorage.setItem('ai_selected_model', modelId);
        if (visionModelId) localStorage.setItem('ai_vision_model', visionModelId);

        setSavedKey(apiKey);
        if (modelId) setSelectedModel(modelId);
        if (visionModelId) setVisionModel(visionModelId);

        if (!successMsg) setSuccessMsg('Đã lưu cấu hình thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleAction = async () => {
        if (fetchedModels.length > 0) {
            saveConfig(selectedModel, visionModel);
        } else {
            await fetchModels();
        }
    };

    function handleClear() {
        if (!confirm('Bạn có chắc muốn xóa cấu hình?')) return;
        localStorage.removeItem('ai_api_key');
        localStorage.removeItem('ai_selected_model');
        localStorage.removeItem('ai_vision_model');
        localStorage.removeItem('ai_provider_id');
        setApiKey('');
        setSavedKey('');
        setSelectedModel('');
        setVisionModel('');
        setFetchedModels([]);
        setDetectedProvider(null);
        setManualProviderId('');
    }

    function maskKey(key: string): string {
        if (key.length < 10) return '••••••••';
        return key.slice(0, 8) + '••••••••' + key.slice(-4);
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Cấu hình hệ thống</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý kết nối AI đa nền tảng
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: API Key & Verification */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none sticky top-24">

                        {/* Header with Provider Icon */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${detectedProvider
                                ? `bg-gradient-to-br ${detectedProvider.color} text-white`
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                }`}>
                                {detectedProvider ? <detectedProvider.icon className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nhà cung cấp</label>
                                <select
                                    className="w-full bg-transparent font-bold text-gray-900 dark:text-white border-none p-0 focus:ring-0 cursor-pointer"
                                    value={manualProviderId}
                                    onChange={(e) => {
                                        setManualProviderId(e.target.value);
                                        const p = AI_PROVIDERS.find(pr => pr.id === e.target.value);
                                        if (p) {
                                            setDetectedProvider(p);
                                            setFetchedModels([]); // reset models when provider changes
                                        }
                                    }}
                                >
                                    <option value="" disabled>--- Chọn nhà cung cấp ---</option>
                                    {AI_PROVIDERS.map(p => (
                                        <option key={p.id} value={p.id} className="text-black">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono text-sm"
                                        placeholder={detectedProvider?.keyPrefix ? `${detectedProvider.keyPrefix}...` : "Nhập API key..."}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {detectedProvider && (
                                    <p className="text-xs text-gray-400 mt-2 px-1">
                                        {detectedProvider.description}
                                    </p>
                                )}
                            </div>

                            {/* Validation Messages */}
                            {savedKey && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-500/20 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Key đang hoạt động: <span className="font-mono">{maskKey(savedKey)}</span>
                                </div>
                            )}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20 break-words">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-500/20 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> {successMsg}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleAction}
                                    disabled={!apiKey || isVerifying || !detectedProvider}
                                    className={`flex-1 btn-primary py-2.5 flex items-center justify-center gap-2 ${(!apiKey || isVerifying || !detectedProvider) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Kiểm tra...
                                        </>
                                    ) : (fetchedModels.length > 0 ? (
                                        <>
                                            <Check className="w-4 h-4" /> Lưu cấu hình
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" /> Tải Models
                                        </>
                                    ))}
                                </button>
                                {savedKey && (
                                    <button onClick={handleClear} className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-500/10">
                            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                Key được mã hóa trước khi lưu vào trình duyệt. Kết nối trực tiếp từ máy bạn tới API nhà cung cấp, không qua trung gian.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Model Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 animate-fade-in-up md:min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-accent-500" />
                                Chọn Model
                            </h2>
                            {fetchedModels.length > 0 && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                {fetchedModels.length} Models Active
                            </span>}
                        </div>

                        {fetchedModels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                {/* Text Model */}
                                <div className="flex flex-col h-full">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                                        <span>Model Văn Bản (Text)</span>
                                        <span className="text-xs text-gray-400 font-normal">Cho Chat & Ma trận</span>
                                    </label>
                                    <div className="space-y-2 flex-1 max-h-[400px] overflow-y-auto p-1 scrollbar-thin">
                                        {fetchedModels.map((model) => (
                                            <button
                                                key={`text-${model.id}`}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedModel === model.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-500/50'
                                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${selectedModel === model.id ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm truncate ${selectedModel === model.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {model.displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{model.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vision Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                                        <span>Model Hình Ảnh (Vision)</span>
                                        <span className="text-xs text-gray-400 font-normal">Cho OCR & Digitizing</span>
                                    </label>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto p-1 scrollbar-thin">
                                        {fetchedModels.map((model) => (
                                            <button
                                                key={`vision-${model.id}`}
                                                onClick={() => setVisionModel(model.id)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${visionModel === model.id
                                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500/50'
                                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${visionModel === model.id ? 'border-purple-500' : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {visionModel === model.id && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm truncate ${visionModel === model.id ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {model.displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{model.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-xs text-gray-500 dark:text-gray-400 italic">
                                        Lưu ý: Chỉ chọn model có khả năng Vision (vd: gemini-pro-vision, gpt-4o, claude-3-5). Nếu chọn sai, tính năng OCR có thể bị lỗi.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Placeholder State
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8 opacity-50 pointer-events-none grayscale-[50%]">
                                    {AI_PROVIDERS.slice(0, 6).map((provider) => (
                                        <div
                                            key={provider.id}
                                            className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-4 flex flex-col items-center gap-2"
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center text-white`}>
                                                <provider.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold">{provider.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa tải danh sách Models</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                                    Vui lòng nhập API Key và nhấn "Tải Models" để hệ thống kết nối tới nhà cung cấp và lấy danh sách các mô hình trí tuệ nhân tạo khả dụng.
                                </p>
                            </div>
                        )}

                        <div className="p-4 border-t border-gray-100 dark:border-white/10 flex justify-end mt-6">
                            <button onClick={() => saveConfig(selectedModel, visionModel)} disabled={fetchedModels.length === 0} className="btn-primary py-2 px-6 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none">
                                Xác nhận cấu hình
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
