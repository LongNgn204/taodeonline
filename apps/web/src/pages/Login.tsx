// Chú thích: Login page với form đăng nhập

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await login(email, password);
        if (success) {
            navigate('/');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-12 flex-col justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <FileSpreadsheet className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Hệ thống Tạo Đề Thi Nhờ Sử Dụng Trí Tuệ Nhân Tạo</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Tạo đề kiểm tra
                        <br />
                        theo Công văn 7991
                    </h1>
                    <p className="text-primary-100 text-lg max-w-md">
                        Công cụ hỗ trợ giáo viên tạo ma trận đề và đề thi theo chuẩn của Bộ GD&ĐT, bám sát
                        Chương trình GDPT 2018.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                        ✓ Ma trận chuẩn CV 7991
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                        ✓ Export Excel/Word
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                        ✓ Hỗ trợ AI
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold">Hệ thống Tạo Đề Thi AI</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đăng nhập</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Chào mừng bạn quay lại! Đăng nhập để tiếp tục.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="teacher@school.edu.vn"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                            {isLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    Đăng nhập
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary-600 hover:underline font-medium">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
