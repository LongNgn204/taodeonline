// Chú thích: Coach Overlay component - hiện gợi ý khi thao tác

import { useState, useEffect } from 'react';
import { X, Lightbulb, AlertTriangle, Info, ChevronRight } from 'lucide-react';

interface CoachTip {
    id: string;
    tip_title: string;
    tip_content: string;
    tip_type: 'info' | 'warning' | 'suggestion';
}

interface CoachOverlayProps {
    context: string; // 'matrix_creation' | 'question_generation' | 'level_selection'
    isVisible: boolean;
    onClose: () => void;
    position?: 'bottom-right' | 'bottom-left' | 'top-right';
}

const tipStyles = {
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Info,
        iconColor: 'text-blue-500',
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
    },
    suggestion: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: Lightbulb,
        iconColor: 'text-green-500',
    },
};

export default function CoachOverlay({
    context,
    isVisible,
    onClose,
    position = 'bottom-right'
}: CoachOverlayProps) {
    const [tips, setTips] = useState<CoachTip[]>([]);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (isVisible && context) {
            fetchTips();
        }
    }, [isVisible, context]);

    const fetchTips = async () => {
        try {
            const res = await fetch(`/api/ai-hub/coach-tips?context=${context}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setTips(data.tips || []);
                setCurrentTipIndex(0);
            }
        } catch (error) {
            console.error('Error fetching coach tips:', error);
        }
    };

    const handleNext = () => {
        if (currentTipIndex < tips.length - 1) {
            setCurrentTipIndex(prev => prev + 1);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        onClose();
    };

    if (!isVisible || dismissed || tips.length === 0) return null;

    const currentTip = tips[currentTipIndex];
    const style = tipStyles[currentTip.tip_type] || tipStyles.info;
    const Icon = style.icon;

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-20 right-4',
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 w-80 animate-slide-up`}
        >
            <div className={`
                ${style.bg} ${style.border}
                border rounded-xl shadow-xl overflow-hidden
            `}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${style.iconColor}`} />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {currentTip.tip_title}
                        </span>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 py-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {currentTip.tip_content}
                    </p>
                </div>

                {/* Footer */}
                {tips.length > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5">
                        <span className="text-xs text-gray-500">
                            {currentTipIndex + 1} / {tips.length}
                        </span>
                        {currentTipIndex < tips.length - 1 && (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Tiếp theo
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
