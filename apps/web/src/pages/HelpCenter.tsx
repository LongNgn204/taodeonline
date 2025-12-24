// Chú thích: Help Center - Trung tâm trợ giúp với FAQ, keyboard shortcuts, và contact
// Route: /help

import { useState } from 'react';
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Keyboard,
    MessageCircle,
    Book,
    FileText,
    Sparkles,
    ExternalLink,
    Mail,
    Phone,
    Check
} from 'lucide-react';

// Chú thích: FAQ data
const faqCategories = [
    {
        id: 'getting-started',
        title: 'Bắt đầu',
        icon: Book,
        faqs: [
            {
                q: 'Làm sao để tạo đề thi đầu tiên?',
                a: 'Vào menu "Tạo đề thi", chọn thư viện câu hỏi, sau đó nhấn "Tạo ma trận" để hệ thống tự động phân bố câu hỏi theo CV 7991.'
            },
            {
                q: 'Tôi cần API key không?',
                a: 'Có. Vào Cài đặt > AI & Models > Nhập API key từ OpenRouter, Google Gemini, hoặc OpenAI để sử dụng tính năng AI.'
            },
            {
                q: 'Dữ liệu có được lưu trữ an toàn không?',
                a: 'Có. API key được mã hóa trước khi lưu. Dữ liệu đề thi được lưu trong trình duyệt và có thể xuất ra file.'
            }
        ]
    },
    {
        id: 'exam',
        title: 'Đề thi',
        icon: FileText,
        faqs: [
            {
                q: 'CV 7991 là gì?',
                a: 'Công văn 7991/BGDĐT-GDTrH quy định cấu trúc đề kiểm tra định kỳ với 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.'
            },
            {
                q: 'Làm sao để tạo nhiều phiên bản đề?',
                a: 'Sử dụng tính năng "Tạo hàng loạt" (Batch Exam) để tạo nhiều phiên bản cùng lúc với tùy chọn xáo trộn câu hỏi.'
            },
            {
                q: 'Có thể xuất đề ra Word không?',
                a: 'Có. Sau khi tạo đề, nhấn nút "Xuất Word" để tải về file .docx định dạng sẵn.'
            }
        ]
    },
    {
        id: 'ai',
        title: 'AI & Models',
        icon: Sparkles,
        faqs: [
            {
                q: 'Nên dùng model AI nào?',
                a: 'Khuyến nghị: GPT-4o, Claude 3.5, hoặc Gemini 1.5 Pro cho chất lượng tốt nhất. Gemini Flash cho tốc độ nhanh và chi phí thấp.'
            },
            {
                q: 'Tại sao AI trả lời chậm?',
                a: 'Tốc độ phụ thuộc vào model. Thử chuyển sang Gemini Flash hoặc Groq để có phản hồi nhanh hơn.'
            },
            {
                q: 'Chi phí sử dụng AI thế nào?',
                a: 'Chi phí tùy thuộc nhà cung cấp. OpenRouter có nhiều model miễn phí. Xem trang Token Usage để theo dõi.'
            }
        ]
    }
];

// Chú thích: Keyboard shortcuts
const shortcuts = [
    { keys: ['Ctrl', 'N'], action: 'Tạo đề thi mới' },
    { keys: ['Ctrl', 'S'], action: 'Lưu tài liệu' },
    { keys: ['Ctrl', 'E'], action: 'Xuất Word' },
    { keys: ['Ctrl', 'K'], action: 'Mở tìm kiếm' },
    { keys: ['Ctrl', '/'], action: 'Mở trợ giúp' },
    { keys: ['Esc'], action: 'Đóng modal' },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('getting-started');
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('support@kientaoviet.edu.vn');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter FAQs by search
    const filteredCategories = faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
            faq =>
                faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.faqs.length > 0);

    const currentCategory = searchQuery
        ? filteredCategories
        : faqCategories.filter(c => c.id === activeCategory);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Trung tâm trợ giúp
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Tìm câu trả lời nhanh hoặc liên hệ hỗ trợ
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Category Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Danh mục</h3>
                        <div className="space-y-1">
                            {faqCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeCategory === cat.id && !searchQuery
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Keyboard className="w-4 h-4" />
                            Phím tắt
                        </h3>
                        <div className="space-y-2">
                            {shortcuts.map((sc, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{sc.action}</span>
                                    <div className="flex gap-1">
                                        {sc.keys.map((key, j) => (
                                            <kbd
                                                key={j}
                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono"
                                            >
                                                {key}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="lg:col-span-2 space-y-4">
                    {currentCategory.map(cat => (
                        <div key={cat.id}>
                            {searchQuery && (
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <cat.icon className="w-5 h-5 text-primary-500" />
                                    {cat.title}
                                </h3>
                            )}
                            <div className="space-y-3">
                                {cat.faqs.map((faq, i) => {
                                    const faqId = `${cat.id}-${i}`;
                                    const isExpanded = expandedFaq === faqId;

                                    return (
                                        <div
                                            key={faqId}
                                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 dark:text-white pr-4">
                                                    {faq.q}
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                                )}
                                            </button>
                                            {isExpanded && (
                                                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {searchQuery && filteredCategories.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Không tìm thấy kết quả cho "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Vẫn cần hỗ trợ?</h3>
                            <p className="text-white/80 text-sm">Đội ngũ của chúng tôi sẵn sàng giúp đỡ</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleCopyEmail}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            {copied ? 'Đã copy' : 'support@kientaoviet.edu.vn'}
                        </button>
                        <a
                            href="https://zalo.me/kientaoviet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            Zalo
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: 'Hướng dẫn CV 7991', desc: 'Xem chi tiết công văn', href: '/guide-7991', icon: Book },
                    { title: 'Cộng đồng', desc: 'Chia sẻ và học hỏi', href: '/community', icon: MessageCircle },
                    { title: 'Changelog', desc: 'Xem các cập nhật mới', href: '#', icon: FileText },
                ].map((link, i) => (
                    <a
                        key={i}
                        href={link.href}
                        className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                <link.icon className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{link.title}</p>
                                <p className="text-sm text-gray-500">{link.desc}</p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
