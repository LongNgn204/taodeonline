// Chú thích: Settings page - cấu hình AI và user preferences

import { useState, useEffect } from 'react';
import { Key, Trash2, Check, Eye, EyeOff } from 'lucide-react';

const AI_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', keyPrefix: 'sk-' },
    { id: 'anthropic', name: 'Anthropic', keyPrefix: 'sk-ant-' },
    { id: 'google', name: 'Google AI', keyPrefix: 'AIza' },
    { id: 'groq', name: 'Groq', keyPrefix: 'gsk_' },
    { id: 'deepseek', name: 'DeepSeek', keyPrefix: 'sk-' },
    { id: 'mistral', name: 'Mistral', keyPrefix: '' },
    { id: 'cohere', name: 'Cohere', keyPrefix: '' },
    { id: 'together', name: 'Together AI', keyPrefix: '' },
];

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const key = localStorage.getItem('ai_api_key') || '';
        setSavedKey(key);
        setApiKey(key);
    }, []);

    function handleSave() {
        localStorage.setItem('ai_api_key', apiKey);
        setSavedKey(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function handleClear() {
        if (!confirm('Bạn có chắc muốn xóa API key?')) return;
        localStorage.removeItem('ai_api_key');
        setApiKey('');
        setSavedKey('');
    }

    function maskKey(key: string): string {
        if (key.length < 10) return '••••••••';
        return key.slice(0, 8) + '••••••••' + key.slice(-4);
    }

    return (
        <div className="max-w-2xl animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cài đặt</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Cấu hình API key và tùy chọn</p>

            {/* API Key section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Key</h2>
                        <p className="text-sm text-gray-500">Key được lưu trên trình duyệt của bạn</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label">API Key (OpenAI, Anthropic, Google, ...)</label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="input pr-20"
                                placeholder="sk-..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {savedKey && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Check className="w-4 h-4 text-green-500" />
                            Đã lưu: {maskKey(savedKey)}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={handleSave} disabled={!apiKey} className="btn-primary">
                            {saved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Đã lưu
                                </>
                            ) : (
                                'Lưu API Key'
                            )}
                        </button>
                        {savedKey && (
                            <button onClick={handleClear} className="btn-ghost text-red-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                                Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Supported providers */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Provider được hỗ trợ
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AI_PROVIDERS.map((provider) => (
                        <div
                            key={provider.id}
                            className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center"
                        >
                            <p className="font-medium text-gray-900 dark:text-white">{provider.name}</p>
                            {provider.keyPrefix && (
                                <p className="text-xs text-gray-400 mt-1">{provider.keyPrefix}...</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Security notice */}
            <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Bảo mật:</strong> API key được lưu trong localStorage của trình duyệt. Hệ thống chỉ
                    sử dụng key để gọi API và không lưu trữ trên server. Không chia sẻ key với người khác.
                </p>
            </div>
        </div>
    );
}
