import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
        if (!confirm('Bạn có chắc muốn xóa API key?'))
            return;
        localStorage.removeItem('ai_api_key');
        setApiKey('');
        setSavedKey('');
    }
    function maskKey(key) {
        if (key.length < 10)
            return '••••••••';
        return key.slice(0, 8) + '••••••••' + key.slice(-4);
    }
    return (_jsxs("div", { className: "max-w-2xl animate-fade-in", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "C\u00E0i \u0111\u1EB7t" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-8", children: "C\u1EA5u h\u00ECnh API key v\u00E0 t\u00F9y ch\u1ECDn" }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center", children: _jsx(Key, { className: "w-5 h-5 text-primary-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "API Key" }), _jsx("p", { className: "text-sm text-gray-500", children: "Key \u0111\u01B0\u1EE3c l\u01B0u tr\u00EAn tr\u00ECnh duy\u1EC7t c\u1EE7a b\u1EA1n" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "API Key (OpenAI, Anthropic, Google, ...)" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showKey ? 'text' : 'password', value: apiKey, onChange: (e) => setApiKey(e.target.value), className: "input pr-20", placeholder: "sk-..." }), _jsx("button", { type: "button", onClick: () => setShowKey(!showKey), className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600", children: showKey ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] })] }), savedKey && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx(Check, { className: "w-4 h-4 text-green-500" }), "\u0110\u00E3 l\u01B0u: ", maskKey(savedKey)] })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleSave, disabled: !apiKey, className: "btn-primary", children: saved ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4" }), "\u0110\u00E3 l\u01B0u"] })) : ('Lưu API Key') }), savedKey && (_jsxs("button", { onClick: handleClear, className: "btn-ghost text-red-500 hover:text-red-600", children: [_jsx(Trash2, { className: "w-4 h-4" }), "X\u00F3a"] }))] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Provider \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: AI_PROVIDERS.map((provider) => (_jsxs("div", { className: "p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center", children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: provider.name }), provider.keyPrefix && (_jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [provider.keyPrefix, "..."] }))] }, provider.id))) })] }), _jsx("div", { className: "mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800", children: _jsxs("p", { className: "text-sm text-yellow-800 dark:text-yellow-200", children: [_jsx("strong", { children: "B\u1EA3o m\u1EADt:" }), " API key \u0111\u01B0\u1EE3c l\u01B0u trong localStorage c\u1EE7a tr\u00ECnh duy\u1EC7t. H\u1EC7 th\u1ED1ng ch\u1EC9 s\u1EED d\u1EE5ng key \u0111\u1EC3 g\u1ECDi API v\u00E0 kh\u00F4ng l\u01B0u tr\u1EEF tr\u00EAn server. Kh\u00F4ng chia s\u1EBB key v\u1EDBi ng\u01B0\u1EDDi kh\u00E1c."] }) })] }));
}
//# sourceMappingURL=Settings.js.map