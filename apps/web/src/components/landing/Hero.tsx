import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Cpu, Network } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

function KnowledgeMatrix() {
    return (
        <svg viewBox="0 0 800 600" className="w-full h-full opacity-60">
            <defs>
                <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {/* Grid */}
            <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />

            {/* Nodes */}
            {[
                { x: 100, y: 150, color: '#3b82f6' },
                { x: 300, y: 100, color: '#8b5cf6' },
                { x: 500, y: 200, color: '#ec4899' },
                { x: 200, y: 350, color: '#10b981' },
                { x: 600, y: 400, color: '#f59e0b' },
                { x: 400, y: 500, color: '#6366f1' },
            ].map((node, i) => (
                <motion.g
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                    <circle cx={node.x} cy={node.y} r="6" fill={node.color} className="animate-pulse" />
                    <circle cx={node.x} cy={node.y} r="12" fill={node.color} fillOpacity="0.3" />
                </motion.g>
            ))}

            {/* Connections */}
            <motion.path
                d="M100 150 L300 100 L500 200 L600 400 L400 500 L200 350 Z"
                fill="none"
                stroke="url(#grid-grad)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
                d="M300 100 L200 350 L400 500"
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    );
}

export default function Hero() {
    return (
        <section className="relative min-h-screen pt-32 pb-20 lg:pt-48 overflow-hidden bg-black text-white">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[#020617]">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px]" />
            </div>

            <div className="container relative mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10 text-cyan-300 text-sm font-bold mb-6 hover:bg-white/10 transition-colors cursor-default">
                            <Sparkles className="w-4 h-4" />
                            Cách mạng Công nghệ Giáo dục 2025
                        </span>

                        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                            Kiến Tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Tri Thức Việt</span>
                            <br />
                            bằng <span className="text-white">AI Gen-2</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                            Hệ thống mở đầu tiên ứng dụng RAG để thấu hiểu Sách giáo khoa. Soạn đề chuẩn ma trận, quản lý ngân hàng câu hỏi
                            <strong className="text-white ml-1">MIỄN PHÍ VĨNH VIỄN</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-lg shadow-blue-500/25">
                                    Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm">
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span>2,400+ Giáo viên đang online</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <span>AI Model: GPT-5.2 Thinking & Gemini 3 Pro, Claude Opus 4.5</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 3D Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-0 lg:h-[600px] flex items-center justify-center"
                >
                    <div className="relative w-full aspect-square max-w-lg">
                        {/* Floating Cards */}
                        <motion.div
                            className="absolute z-20 top-0 left-0 p-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Tốc độ xử lý</p>
                                    <p className="font-bold text-lg"><span className="text-blue-400">0.5s</span> / câu hỏi</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute z-20 bottom-10 right-0 p-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                                    <Network className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Ma trận kiến thức</p>
                                    <p className="font-bold text-lg text-purple-400">Đa Công Văn</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Graphic */}
                        <div className="absolute inset-4 bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <KnowledgeMatrix />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
