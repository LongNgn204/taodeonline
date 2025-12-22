// Chú thích: Progress Bar Component cho Job Manager
// M1: UI hiển thị progress với stages

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showPercent?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'error';
    className?: string;
}

export function ProgressBar({
    value,
    label,
    showPercent = true,
    size = 'md',
    variant = 'default',
    className = '',
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variantClasses = {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    return (
        <div className={`w-full ${className}`}>
            {(label || showPercent) && (
                <div className="flex justify-between items-center mb-1">
                    {label && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {label}
                        </span>
                    )}
                    {showPercent && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                            {Math.round(clampedValue)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    );
}

// ===== Job Progress Card Component =====

interface JobProgressCardProps {
    isRunning: boolean;
    progress: number;
    stage: string;
    error: string | null;
    onCancel?: () => void;
    onRetry?: () => void;
    className?: string;
}

export function JobProgressCard({
    isRunning,
    progress,
    stage,
    error,
    onCancel,
    onRetry,
    className = '',
}: JobProgressCardProps) {
    const variant = error ? 'error' : progress === 100 ? 'success' : 'default';

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            {/* Status Icon */}
            <div className="flex items-center gap-3 mb-3">
                {isRunning && (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                )}
                {!isRunning && !error && progress === 100 && (
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {error && (
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                <span className={`font-medium ${error ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {stage || 'Đang xử lý...'}
                </span>
            </div>

            {/* Progress Bar */}
            <ProgressBar value={progress} showPercent={true} variant={variant} />

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
                {isRunning && onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                    >
                        Hủy
                    </button>
                )}
                {error && onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProgressBar;
