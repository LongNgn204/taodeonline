import {
    TableProperties,
    Share2,
    BarChart3,
    FileOutput,
    Lightbulb,
    Smartphone,
    BookOpen,
    Quote
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features() {
    return (
        <section className="py-24 bg-black text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-blue-400 font-medium mb-2 uppercase tracking-wider">Hệ sinh thái toàn diện</h2>
                    <h3 className="font-display text-4xl md:text-5xl font-bold mb-6">
                        Công cụ mạnh mẽ cho <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Giáo dục 4.0</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                    {/* Feature 1: Matrix + Data-Driven Policy - Large Span */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TableProperties className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <TableProperties className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                                    🆕 Data-Driven Policy
                                </div>
                            </div>
                            <h4 className="text-2xl font-bold mb-3">Ma trận Đa Công Văn</h4>
                            <p className="text-gray-400 max-w-md">
                                Hỗ trợ CV7991 (KTĐK), CV4117 (TN THPT). Policy Engine tự động áp dụng quy định phù hợp theo môn/lớp. Không còn hardcode - 100% data-driven.
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 2: AI Vision */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1 p-8 rounded-3xl bg-gradient-to-br from-purple-900/50 to-blue-900/20 border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Chấm thi Camera AI</h4>
                        <p className="text-gray-400 text-sm">
                            Chấm phiếu trắc nghiệm bằng điện thoại. Tốc độ 1s/bài. Độ chính xác &gt;99%.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[99%]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 3: LMS Integration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 text-green-400">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Tích hợp LMS</h4>
                        <p className="text-gray-400 text-sm">
                            Xuất Moodle XML, QTI, Google Forms chỉ với 1 click.
                        </p>
                    </motion.div>

                    {/* Feature 4: Analysis - Wide */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative overflow-hidden"
                    >
                        <div className="absolute -bottom-10 -right-10 opacity-20">
                            <BarChart3 className="w-48 h-48 text-yellow-500" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 text-yellow-400">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-bold mb-3">Phân tích Item Analysis</h4>
                                <p className="text-gray-400">
                                    Đánh giá chất lượng câu hỏi dựa trên phổ điểm thực tế. Xác định độ khó, độ phân biệt để cải tiến ngân hàng câu hỏi.
                                </p>
                            </div>
                            {/* Mini Chart Mockup */}
                            <div className="w-full md:w-1/3 bg-black/50 rounded-xl p-4 border border-white/5 flex items-end gap-1 h-32">
                                <div className="flex-1 bg-yellow-500/20 h-[40%] rounded-t-sm" />
                                <div className="flex-1 bg-yellow-500/40 h-[70%] rounded-t-sm" />
                                <div className="flex-1 bg-yellow-500/60 h-[50%] rounded-t-sm" />
                                <div className="flex-1 bg-yellow-500/80 h-[90%] rounded-t-sm" />
                                <div className="flex-1 bg-yellow-500 h-[60%] rounded-t-sm" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 5: Export */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-3 text-pink-400">
                            <FileOutput className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Xuất Word/Excel</h4>
                        <p className="text-gray-400 text-sm">
                            Định dạng chuẩn in ấn. Header/Footer tùy chỉnh.
                        </p>
                    </motion.div>

                    {/* Feature 6: RAG Context - NEW */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="md:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-indigo-600/50 to-purple-600/30 border border-indigo-500/30 hover:border-indigo-400/50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center mb-3 text-indigo-300">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold">RAG Context</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300">MỚI</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Upload SGK, AI học từ tài liệu thực để sinh câu hỏi chính xác với nguồn trích dẫn.
                        </p>
                    </motion.div>

                    {/* Feature 7: Citations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3 text-amber-400">
                            <Quote className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold">Citations</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">MỚI</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Mỗi câu hỏi đính kèm nguồn trích dẫn từ tài liệu gốc.
                        </p>
                    </motion.div>

                    {/* Feature 8: AI Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        className="md:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-white">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Trung tâm AI</h4>
                        <p className="text-blue-100 text-sm">
                            BYOK: Dùng API key riêng (OpenRouter, Google, OpenAI...)
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
