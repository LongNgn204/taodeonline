// Chú thích: ValidationWarnings component - Hiển thị cảnh báo validation từ server
// F3.3: Show warnings và errors từ /validate/exam API

import { AlertTriangle, XCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ValidationIssue {
    code: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    path?: string;
    suggestion?: string;
}

interface ValidationWarningsProps {
    issues: ValidationIssue[];
    collapsed?: boolean;
}

export default function ValidationWarnings({ issues, collapsed = true }: ValidationWarningsProps) {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    if (!issues || issues.length === 0) {
        return (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/20 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Không có cảnh báo. Đề thi hợp lệ theo quy định.
            </div>
        );
    }

    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const infos = issues.filter(i => i.severity === 'info');

    const hasErrors = errors.length > 0;

    return (
        <div className={`rounded-xl border ${hasErrors
            ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10'
            : 'border-yellow-200 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/10'
            }`}>
            {/* Header */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full p-4 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3">
                    {hasErrors ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                        <p className={`font-medium ${hasErrors ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                            {hasErrors ? 'Có lỗi cần sửa' : 'Có cảnh báo'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {errors.length > 0 && `${errors.length} lỗi`}
                            {errors.length > 0 && warnings.length > 0 && ' • '}
                            {warnings.length > 0 && `${warnings.length} cảnh báo`}
                            {(errors.length > 0 || warnings.length > 0) && infos.length > 0 && ' • '}
                            {infos.length > 0 && `${infos.length} ghi chú`}
                        </p>
                    </div>
                </div>
                {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
            </button>

            {/* Content */}
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-3">
                    {/* Errors */}
                    {errors.map((issue, idx) => (
                        <div key={`err-${idx}`} className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        {issue.message}
                                    </p>
                                    {issue.path && (
                                        <p className="text-xs text-red-500/70 font-mono mt-1">
                                            @ {issue.path}
                                        </p>
                                    )}
                                    {issue.suggestion && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
                                            💡 {issue.suggestion}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Warnings */}
                    {warnings.map((issue, idx) => (
                        <div key={`warn-${idx}`} className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500/30">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                        {issue.message}
                                    </p>
                                    {issue.path && (
                                        <p className="text-xs text-yellow-500/70 font-mono mt-1">
                                            @ {issue.path}
                                        </p>
                                    )}
                                    {issue.suggestion && (
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 italic">
                                            💡 {issue.suggestion}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Infos */}
                    {infos.map((issue, idx) => (
                        <div key={`info-${idx}`} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {issue.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
