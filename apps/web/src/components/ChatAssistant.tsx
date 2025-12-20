// Chú thích: ChatAssistant component - Floating AI helper
import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

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
            // Check for API Key
            const apiKey = localStorage.getItem('ai_api_key');
            if (!apiKey) {
                // throw new Error('Vui lòng nhập API Key trong phần Cài đặt để sử dụng trợ lý.');
            }

            // Simulated delay
            await new Promise(r => setTimeout(r, 1500));

            // Context-aware mock response for demo
            let aiContent = "Tôi đã hiểu yêu cầu của thầy/cô. ";
            if (input.toLowerCase().includes("ma trận")) {
                aiContent += "Theo công văn 7991, ma trận đề cần đảm bảo 4 mức độ nhận thức. Thầy/cô nên bắt đầu với tỉ lệ 40% Nhận biết và 30% Thông hiểu.";
            } else if (input.toLowerCase().includes("lỗi") || input.toLowerCase().includes("không được")) {
                aiContent += "Thầy/cô vui lòng kiểm tra lại kết nối hoặc reload trang. Nếu vẫn gặp lỗi, hãy thử kiểm tra lại API Key trong phần Cài đặt.";
            } else {
                aiContent += "Hệ thống đang sẵn sàng hỗ trợ. Thầy/cô cần tạo đề cho môn học nào?";
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Lỗi: ${error.message || 'Không thể kết nối tới AI.'}`,
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
