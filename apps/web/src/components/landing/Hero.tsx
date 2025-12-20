import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        Công nghệ AI Sinh Đề Mới Nhất 2025
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-display text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
                >
                    Tạo Đề Thi Chuẩn Bộ GD <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                        Bằng Sức Mạnh AI
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10"
                >
                    Tự động hóa 90% quy trình ra đề. Phân tích sách giáo khoa, xây dựng ma trận và sinh câu hỏi trắc nghiệm/tự luận theo đúng chuẩn CV 7991/BGDĐT-GDTrH.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full">
                            Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full border-gray-300 shadow-md">
                            Đăng nhập
                        </Button>
                    </Link>
                </motion.div>

                {/* Simulated Interface Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 relative mx-auto max-w-4xl"
                >
                    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden aspect-[16/9]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black" />

                        {/* Fake UI Elements */}
                        <div className="relative p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="ml-4 w-64 h-2 rounded-full bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <div className="flex-1 flex gap-6">
                                <div className="w-1/4 space-y-3">
                                    <div className="w-full h-8 rounded-lg bg-primary-100 dark:bg-primary-900/20" />
                                    <div className="w-full h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                                    <div className="w-full h-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/3 h-24 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-primary-100 dark:border-primary-900/30" />
                                        <div className="w-1/3 h-24 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                        <div className="w-1/3 h-24 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                    </div>
                                    <div className="w-full h-40 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -top-10 -right-10 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 animate-bounce-slow">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Độ chính xác AI</p>
                                <p className="text-lg font-bold">98.5%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
