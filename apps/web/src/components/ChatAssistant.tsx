// Chú thích: ChatAssistant component - Floating AI helper
// Gọi AI trực tiếp từ frontend, không qua backend
import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { getAIConfig, AI_ENDPOINTS } from '../lib/ai-config';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

// System prompt cho trợ lý giáo dục Việt Nam
const SYSTEM_PROMPT = `Bạn là "Trợ lý Kiến Tạo Việt", một chuyên gia giáo dục Việt Nam thân thiện và hữu ích.

NHIỆM VỤ:
- Hỗ trợ giáo viên tạo ma trận đề kiểm tra theo Công văn 7991/BGDĐT-GDTrH
- Giải đáp thắc mắc về quy định kiểm tra đánh giá
- Tư vấn về cấu trúc đề thi, phân bổ điểm, mức độ nhận thức

KIẾN THỨC CHÍNH:
- CV 7991 (17/12/2024): Ma trận đề với 4 mức nhận thức (NB 40%, TH 30%, VD 30%)
- Cấu trúc đề: MCQ 3đ + Đúng/Sai 2đ + Trả lời ngắn 2đ + Tự luận 3đ = 10đ
- Thời gian: 45-60 phút cho bài kiểm tra định kỳ

PHONG CÁCH:
- Xưng hô: "tôi" và "thầy/cô"
- Ngắn gọn, dễ hiểu, thực tế
- Đưa ra ví dụ cụ thể khi cần
- Nếu không chắc, thành thật nói không biết

Trả lời bằng tiếng Việt, ngắn gọn (2-4 câu trừ khi cần giải thích chi tiết).`;

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Xin chào! Tôi là Trợ lý Kiến Tạo Việt. Tôi có thể giúp gì cho thầy/cô trong việc tạo ma trận và đề thi hôm nay?',
            timestamp: Date.now()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Chú thích: Gọi AI trực tiếp từ frontend, sử dụng API key của user
    const callAI = async (userMessage: string): Promise<string> => {
        const { apiKey, providerId, modelId } = getAIConfig();

        if (!apiKey || !modelId) {
            throw new Error('Vui lòng cấu hình API Key và chọn Model trong phần Cài đặt.');
        }

        // Build messages array cho API (bao gồm lịch sử chat)
        const chatHistory = messages
            .filter(m => m.id !== 'welcome') // Bỏ welcome message
            .slice(-10) // Giữ 10 tin nhắn gần nhất để tránh quá dài
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            }));

        const apiMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...chatHistory,
            { role: 'user' as const, content: userMessage }
        ];

        // Chú thích: Xác định endpoint và headers dựa trên provider
        let url: string;
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (providerId === 'openrouter') {
            url = 'https://openrouter.ai/api/v1/chat/completions';
            headers['Authorization'] = `Bearer ${apiKey}`;
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'Kiến Tạo Việt';
        } else if (providerId === 'google') {
            // Google Gemini có format khác, cần xử lý riêng
            url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            const googleBody = {
                contents: apiMessages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                })),
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            };
            const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(googleBody) });
            if (!res.ok) throw new Error(`Google API lỗi: ${res.status}`);
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi.';
        } else {
            // OpenAI-compatible providers (openai, groq, deepseek, mistral, etc.)
            const baseUrl = AI_ENDPOINTS[providerId] || AI_ENDPOINTS.openai;
            url = `${baseUrl}/chat/completions`;
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // Standard OpenAI-compatible request
        const body = {
            model: modelId,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1024,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ChatAssistant] API error:', response.status, errorText);
            throw new Error(`API lỗi (${response.status}): ${errorText.slice(0, 100)}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Không có phản hồi từ AI.';
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const aiContent = await callAI(input);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error('[ChatAssistant] Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `⚠️ ${error.message || 'Không thể kết nối tới AI. Vui lòng kiểm tra API Key trong Cài đặt.'}`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 shadow-lg shadow-primary-600/30 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-bounce-subtle group"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            </button>
        );
    }

    return (
        <div
            className={`fixed z-50 transition-all duration-300 ease-in-out bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col
                ${isMinimized
                    ? 'bottom-6 right-6 w-72 h-16 rounded-2xl'
                    : 'bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] rounded-3xl'
                }
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Trợ lý Kiến Tạo</h3>
                        {!isMinimized && <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                        </p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                    : 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-3 rounded-bl-none flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="relative flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Hỏi về cách tạo ma trận..."
                                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            AI có thể mắc lỗi. Vui lòng kiểm chứng thông tin quan trọng.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
