import { motion } from 'framer-motion';
import { Database, BrainCircuit, ArrowRight, Layers } from 'lucide-react';
import { CardGlass } from '../ui/Card';

export default function TechShowcase() {
    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="container relative mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-primary-400 font-medium mb-2 uppercase tracking-wider">Công nghệ lõi Tiên phong</h2>
                    <h3 className="font-display text-4xl md:text-5xl font-bold mb-6">Sức mạnh AI & Dữ liệu lớn</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Hệ thống mở đầu tiên tại Việt Nam ứng dụng RAG để hiểu sâu sách giáo khoa, hỗ trợ giáo viên soạn đề chuẩn xác hoàn toàn miễn phí.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                    {/* Step 1: Ingestion */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <CardGlass className="p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                                <Database className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">1. Nạp dữ liệu kiến thức</h4>
                            <p className="text-gray-400 mb-4">
                                Hệ thống nạp dữ liệu từ SGK (PDF/DOCX), phân tích ngữ nghĩa và vector hóa kiến thức vào Vector DB.
                            </p>
                            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4" />
                            </div>
                        </CardGlass>
                    </motion.div>

                    {/* Arrow */}
                    <div className="hidden md:flex justify-center text-gray-600">
                        <ArrowRight className="w-8 h-8" />
                    </div>

                    {/* Step 2: Generation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-start-2 md:row-start-1"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full" />
                            <CardGlass className="relative p-8 border-primary-500/30 bg-gray-900/80">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
                                    <BrainCircuit className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-2xl font-bold mb-3">2. Sinh nội dung theo ngữ cảnh</h4>
                                <p className="text-gray-300 mb-6">
                                    AI truy xuất ngữ cảnh chính xác (Retrieval) và sinh câu hỏi (Generation) dựa trên Bloom Taxonomy.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-primary-300 border border-white/10">GPT-4o</span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-accent-300 border border-white/10">Claude 3.5</span>
                                </div>
                            </CardGlass>
                        </div>
                    </motion.div>

                    {/* Arrow */}
                    <div className="hidden md:flex justify-center text-gray-600 md:col-start-3 md:row-start-1 rotate-90 md:rotate-0">
                        {/* No arrow here actually, grid alignment makes it tricky, cleaner without or absolutely positioned */}
                    </div>

                    {/* Step 3: Matrix */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-start-3 md:row-start-1"
                    >
                        <CardGlass className="p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">3. Ma trận thông minh</h4>
                            <p className="text-gray-400 mb-4">
                                Tự động mapping câu hỏi vào ma trận đặc tả. Cân bằng tỉ lệ NB-TH-VD một cách hoàn hảo.
                            </p>
                            <div className="flex gap-2 text-xs font-mono text-gray-500">
                                <div className="bg-green-500/20 px-2 py-1 rounded text-green-400">NB: 40%</div>
                                <div className="bg-yellow-500/20 px-2 py-1 rounded text-yellow-400">TH: 30%</div>
                            </div>
                        </CardGlass>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
