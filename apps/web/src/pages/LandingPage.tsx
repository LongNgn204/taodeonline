import Hero from '../components/landing/Hero';
import TechShowcase from '../components/landing/TechShowcase';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';
import TrustedBy from '../components/landing/TrustedBy';
import Testimonials from '../components/landing/Testimonials';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
    const { user } = useAuth();

    // Nếu đã đăng nhập, chuyển hướng vào dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30">
            {/* Navigation Header for Landing Page */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-white font-bold">K</span>
                        </div>
                        <span className="font-bold text-lg font-display">Kiến Tạo Việt</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <a href="#" className="hover:text-primary-500 transition-colors">Tính năng</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Công nghệ</a>
                        <a href="/community" className="hover:text-primary-500 transition-colors">Cộng đồng</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <a href="/login" className="text-sm font-medium hover:text-primary-500">Đăng nhập</a>
                        <a
                            href="/register"
                            className="px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            Đăng ký
                        </a>
                    </div>
                </div>
            </header>

            <main>
                <Hero />
                <TrustedBy />
                <TechShowcase />
                <Features />
                <Testimonials />
            </main>

            <Footer />
        </div>
    );
}
