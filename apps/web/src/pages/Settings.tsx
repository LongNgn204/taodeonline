// Chú thích: Settings page - Revamped with BYOK & Dynamic Model Fetching
import { useState, useEffect } from 'react';
import { Key, Trash2, Check, Eye, EyeOff, Cpu, Zap, Box, Layers, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

interface AIModel {
    id: string;
    displayName: string;
    providerId: string;
}

// Configuration for AI Providers (metadata only)
const AI_PROVIDERS = [
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'Industry leader. Best for complex reasoning.',
        keyPrefix: 'sk-',
        color: 'from-green-500 to-emerald-600',
        icon: Box,
        fetchUrl: 'https://api.openai.com/v1/models',
        headers: (key: string) => ({ 'Authorization': `Bearer ${key}` })
    },
    {
        id: 'google',
        name: 'Google AI',
        description: 'Multimodal capabilities. Supports Gemini 1.5/3.0.',
        keyPrefix: 'AIza',
        color: 'from-blue-500 to-cyan-600',
        icon: Zap,
        fetchUrl: (key: string) => `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        headers: () => ({})
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Safe, high-context models.',
        keyPrefix: 'sk-ant-',
        color: 'from-orange-500 to-amber-600',
        icon: Layers
    },
    {
        id: 'groq',
        name: 'Groq',
        description: 'Extremely fast inference.',
        keyPrefix: 'gsk_',
        color: 'from-red-500 to-orange-600',
        icon: Cpu
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
    const [detectedProvider, setDetectedProvider] = useState<any>(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const key = localStorage.getItem('ai_api_key') || '';
        const savedModel = localStorage.getItem('ai_selected_model') || '';
        const savedVisionModel = localStorage.getItem('ai_vision_model') || '';
        const providerId = localStorage.getItem('ai_provider_id');

        setApiKey(key);
        setSavedKey(key);
        setSelectedModel(savedModel);
        setVisionModel(savedVisionModel);

        if (key && providerId) {
            const provider = AI_PROVIDERS.find(p => p.id === providerId);
            if (provider) setDetectedProvider(provider);
        }
    }, []);

    // Detect provider on input change
    useEffect(() => {
        if (!apiKey) {
            setDetectedProvider(null);
            return;
        }
        const provider = AI_PROVIDERS.find(p => apiKey.startsWith(p.keyPrefix));
        if (provider) setDetectedProvider(provider);
    }, [apiKey]);

    const fetchModels = async () => {
        if (!detectedProvider) return;
        setIsVerifying(true);
        setError('');
        setFetchedModels([]);
        setSuccessMsg('');

        try {
            let models: AIModel[] = [];

            if (detectedProvider.id === 'google') {
                const url = typeof detectedProvider.fetchUrl === 'function' ? detectedProvider.fetchUrl(apiKey) : '';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Key không hợp lệ hoặc lỗi kết nối Google API');
                const data = await res.json();

                // Filter for generateContent supported models
                models = (data.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                    .map((m: any) => ({
                        id: m.name.replace('models/', ''), // Remove 'models/' prefix
                        displayName: m.displayName || m.name,
                        providerId: 'google'
                    }));

            } else if (detectedProvider.id === 'openai') {
                const res = await fetch(detectedProvider.fetchUrl as string, {
                    headers: detectedProvider.headers(apiKey)
                });
                if (!res.ok) throw new Error('Key không hợp lệ hoặc lỗi kết nối OpenAI API');
                const data = await res.json();

                models = (data.data || [])
                    .filter((m: any) => m.id.startsWith('gpt')) // Basic filtering
                    .map((m: any) => ({
                        id: m.id,
                        displayName: m.id,
                        providerId: 'openai'
                    }))
                    .sort((a: any, b: any) => b.id.localeCompare(a.id)); // Newer first roughly
            } else {
                // Fallback for others not implemented yet
                setSuccessMsg('Đã lưu Key. (Chưa hỗ trợ lấy danh sách model tự động cho provider này)');
                saveConfig(null, null); // Save without model list
                return;
            }

            if (models.length > 0) {
                setFetchedModels(models);
                setSuccessMsg(`Đã tìm thấy ${models.length} hình mẫu AI.`);
                // Auto select first if none selected
                if (!selectedModel) setSelectedModel(models[0].id);
                if (!visionModel) setVisionModel(models[0].id);
            } else {
                setError('Không tìm thấy model nào phù hợp.');
            }

        } catch (err: any) {
            setError(err.message || 'Lỗi khi kiểm tra Key');
        } finally {
            setIsVerifying(false);
        }
    };

    const saveConfig = (modelId: string | null, visionModelId: string | null) => {
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_provider_id', detectedProvider?.id || '');
        if (modelId) localStorage.setItem('ai_selected_model', modelId);
        if (visionModelId) localStorage.setItem('ai_vision_model', visionModelId);

        setSavedKey(apiKey);
        if (modelId) setSelectedModel(modelId);
        if (visionModelId) setVisionModel(visionModelId);

        // Visual confirmation
        if (!successMsg) setSuccessMsg('Đã lưu cấu hình thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleAction = async () => {
        if (fetchedModels.length > 0) {
            // If already fetched, just save
            saveConfig(selectedModel, visionModel);
        } else {
            // Verification flow
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
    }

    function maskKey(key: string): string {
        if (key.length < 10) return '••••••••';
        return key.slice(0, 8) + '••••••••' + key.slice(-4);
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Cấu hình hệ thống</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý kết nối AI và chọn lựa Model
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: API Key & Verification */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${detectedProvider
                                ? `bg-gradient-to-br ${detectedProvider.color} text-white`
                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                }`}>
                                {detectedProvider ? <detectedProvider.icon className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">API Gateway</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {detectedProvider ? `Phát hiện: ${detectedProvider.name}` : 'Bring Your Own Key'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Unified API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-mono text-sm"
                                        placeholder="AIza... or sk-..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Validation Messages */}
                            {savedKey && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-500/20 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Active Key: <span className="font-mono">{maskKey(savedKey)}</span>
                                </div>
                            )}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
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
                                    disabled={!apiKey || isVerifying}
                                    className={`flex-1 btn-primary py-2.5 flex items-center justify-center gap-2`}
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
                                            <RefreshCw className="w-4 h-4" /> Kiểm tra Key
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

                        <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-500/10">
                            <ShieldCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                Key được mã hóa và lưu trữ cục bộ (localStorage). Hệ thống sẽ tự động tải danh sách Model mới nhất từ nhà cung cấp.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Model Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 animate-fade-in-up">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Text Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Model Văn Bản (Text)</label>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto p-1 scrollbar-thin">
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
                                                <div>
                                                    <p className={`font-medium text-sm ${selectedModel === model.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {model.displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{model.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vision Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Model Hình Ảnh (Vision/OCR)</label>
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
                                                <div>
                                                    <p className={`font-medium text-sm ${visionModel === model.id ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                        {model.displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{model.id}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                        * Chọn model hỗ trợ xử lý hình ảnh (vd: gemini-pro-vision, gpt-4o)
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Placeholder
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 grayscale-[30%] pointer-events-none select-none">
                                {AI_PROVIDERS.filter(p => p.id === 'google' || p.id === 'openai').map((provider) => (
                                    <div
                                        key={provider.id}
                                        className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center text-white`}>
                                                <provider.icon className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Vui lòng nhập Key bắt đầu bằng <code className="bg-gray-100 dark:bg-white/10 px-1 rounded">{provider.keyPrefix}</code> để tải danh sách models.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 border-t border-gray-100 dark:border-white/10 flex justify-end mt-6">
                            <button onClick={() => saveConfig(selectedModel, visionModel)} className="btn-primary py-2 px-6">
                                Xác nhận cấu hình
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
