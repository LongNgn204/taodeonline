
import { ArrowLeft, BookOpen, CheckCircle, FileText, HelpCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/landing/Footer';

export default function Guide7991() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                        <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-bold text-lg font-display tracking-tight text-gray-900 dark:text-white">
                            Quay lại
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/10">
                        <span className="text-primary-600 dark:text-primary-400">CV 7991/BGDĐT-GDTrH</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-5xl animate-fade-in">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 mb-6">
                        <GraduationCap className="w-10 h-10 text-primary-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-primary-800 to-accent-800 dark:from-white dark:via-primary-200 dark:to-accent-200">
                        Hướng dẫn Xây dựng Ma trận & Đặc tả đề kiểm tra
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                        Chuẩn hóa quy trình đánh giá năng lực học sinh theo chương trình GDPT 2018 với sự hỗ trợ của AI.
                    </p>
                </div>

                <div className="grid gap-12">
                    {/* Section 1: Intro Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="group bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-primary-500/30 transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cấu trúc Ma trận</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-600 dark:text-gray-300"><strong>4 Mức độ:</strong> Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-600 dark:text-gray-300"><strong>Tỉ lệ vàng:</strong> Phổ biến 4:3:2:1 hoặc 40-30-20-10.</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-600 dark:text-gray-300"><strong>Hình thức:</strong> Kết hợp Trắc nghiệm (70%) và Tự luận (30%).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="group bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quy trình 4 Bước</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    'Xác định Mục tiêu & Nội dung (Chương/Bài)',
                                    'Xây dựng Ma trận tổng thể (Số câu, điểm số)',
                                    'Viết Đặc tả chi tiết (Hành vi cần đánh giá)',
                                    'Biên soạn câu hỏi theo ma trận và đặc tả'
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Levels Table */}
                    <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-lg">
                        <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                <HelpCircle className="w-6 h-6 text-accent-500" />
                                Giải mã Mức độ Nhận thức
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="p-6 font-semibold border-b border-gray-100 dark:border-white/10">Mức độ</th>
                                        <th className="p-6 font-semibold border-b border-gray-100 dark:border-white/10">Định nghĩa</th>
                                        <th className="p-6 font-semibold border-b border-gray-100 dark:border-white/10">Động từ gợi ý</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-bold text-green-600 dark:text-green-400">Nhận biết</td>
                                        <td className="p-6 text-gray-600 dark:text-gray-300">Nhận ra, nhớ lại các khái niệm đã học.</td>
                                        <td className="p-6 text-gray-500 dark:text-gray-400 italic">Nêu, kể, liệt kê, xác định...</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-bold text-blue-600 dark:text-blue-400">Thông hiểu</td>
                                        <td className="p-6 text-gray-600 dark:text-gray-300">Giải thích, diễn giải được ý nghĩa.</td>
                                        <td className="p-6 text-gray-500 dark:text-gray-400 italic">Giải thích, phân biệt, so sánh...</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-bold text-orange-600 dark:text-orange-400">Vận dụng</td>
                                        <td className="p-6 text-gray-600 dark:text-gray-300">Áp dụng kiến thức giải quyết vấn đề.</td>
                                        <td className="p-6 text-gray-500 dark:text-gray-400 italic">Áp dụng, tính toán, thực hiện...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: CTA */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 p-10 text-center text-white shadow-2xl shadow-primary-500/30">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold mb-4">Sẵn sàng áp dụng Công văn 7991?</h3>
                            <p className="text-primary-100 text-lg mb-8">
                                Hệ thống Kiến Tạo Việt đã tích hợp sẵn quy chuẩn này. Bạn chỉ cần chọn nội dung, AI sẽ lo phần ma trận và đặc tả.
                            </p>
                            <Link to="/libraries" className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                                Bắt đầu tạo đề ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
