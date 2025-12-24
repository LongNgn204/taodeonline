// Chú thích: Onboarding Tour - Hướng dẫn người dùng mới qua các bước
// Hiển thị lần đầu hoặc khi user click "Xem hướng dẫn"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, FileText, BookOpen, Settings } from 'lucide-react';
import { Button } from './ui/Button';

// Chú thích: Các bước onboarding
const onboardingSteps = [
    {
        id: 'welcome',
        title: 'Chào mừng đến Kiến Tạo Việt! 🎉',
        description: 'Hệ thống hỗ trợ giáo viên tạo đề thi, kế hoạch bài dạy và SKKN theo chuẩn Bộ GDĐT.',
        icon: Sparkles,
        image: null,
    },
    {
        id: 'api-key',
        title: 'Cài đặt AI',
        description: 'Để sử dụng tính năng AI, bạn cần thêm API key. Vào Cài đặt > AI & Models và nhập key từ OpenRouter, Google, hoặc OpenAI.',
        icon: Settings,
        action: { label: 'Đến Cài đặt', href: '/settings' },
    },
    {
        id: 'library',
        title: 'Thêm thư viện câu hỏi',
        description: 'Upload file Word/Excel chứa câu hỏi vào Thư viện. Hệ thống sẽ tự động phân loại theo mức độ nhận thức.',
        icon: BookOpen,
        action: { label: 'Mở Thư viện', href: '/libraries' },
    },
    {
        id: 'create-exam',
        title: 'Tạo đề thi đầu tiên',
        description: 'Chọn thư viện, nhấn "Tạo ma trận" để hệ thống tự động phân bố câu hỏi theo CV 7991. Sau đó xuất ra Word.',
        icon: FileText,
        action: { label: 'Tạo đề thi', href: '/create-exam' },
    },
    {
        id: 'done',
        title: 'Sẵn sàng!',
        description: 'Bạn đã biết các tính năng cơ bản. Khám phá thêm KHBD, SKKN, và Cộng đồng. Chúc bạn làm việc hiệu quả!',
        icon: Check,
        image: null,
    },
];

// Context
interface OnboardingContextType {
    isOpen: boolean;
    currentStep: number;
    openOnboarding: () => void;
    closeOnboarding: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
}

interface OnboardingProviderProps {
    children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Check if first visit
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
        if (!hasSeenOnboarding) {
            // Delay để không hiện ngay khi load
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const openOnboarding = () => {
        setCurrentStep(0);
        setIsOpen(true);
    };

    const closeOnboarding = () => {
        setIsOpen(false);
    };

    const nextStep = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Hoàn thành
            localStorage.setItem('onboarding_complete', 'true');
            setIsOpen(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const skipOnboarding = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setIsOpen(false);
    };

    return (
        <OnboardingContext.Provider
            value={{
                isOpen,
                currentStep,
                openOnboarding,
                closeOnboarding,
                nextStep,
                prevStep,
                skipOnboarding,
            }}
        >
            {children}
            {isOpen && <OnboardingModal />}
        </OnboardingContext.Provider>
    );
}

// Modal Component
function OnboardingModal() {
    const { currentStep, nextStep, prevStep, skipOnboarding, closeOnboarding } = useOnboarding();
    const step = onboardingSteps[currentStep];
    const isLast = currentStep === onboardingSteps.length - 1;
    const isFirst = currentStep === 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeOnboarding}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Progress */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={closeOnboarding}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
                        <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Step Number */}
                    <p className="text-sm text-gray-400 mb-2">
                        Bước {currentStep + 1} / {onboardingSteps.length}
                    </p>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {step.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {step.description}
                    </p>

                    {/* Action button */}
                    {step.action && (
                        <a
                            href={step.action.href}
                            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                        >
                            {step.action.label}
                        </a>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-6 flex items-center justify-between">
                    <div>
                        {!isFirst && (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Quay lại
                            </button>
                        )}
                        {isFirst && (
                            <button
                                onClick={skipOnboarding}
                                className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                                Bỏ qua
                            </button>
                        )}
                    </div>

                    <Button onClick={nextStep} className="flex items-center gap-2">
                        {isLast ? (
                            <>
                                <Check className="w-4 h-4" />
                                Hoàn thành
                            </>
                        ) : (
                            <>
                                Tiếp tục
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Step Dots */}
                <div className="flex justify-center gap-2 pb-6">
                    {onboardingSteps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentStep
                                ? 'bg-primary-500'
                                : i < currentStep
                                    ? 'bg-primary-300'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Chú thích: Component để trigger onboarding từ bất kỳ đâu
export function OnboardingTrigger() {
    const { openOnboarding } = useOnboarding();

    return (
        <button
            onClick={openOnboarding}
            className="text-sm text-primary-600 hover:underline"
        >
            Xem hướng dẫn
        </button>
    );
}
