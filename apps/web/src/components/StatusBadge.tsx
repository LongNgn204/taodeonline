
import { AlertCircle, CheckCircle, Clock, FileEdit, Globe } from 'lucide-react';

export type ExamStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'final';

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    switch (status as ExamStatus) {
        case 'draft':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    <FileEdit className="w-3.5 h-3.5" />
                    Nháp
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Clock className="w-3.5 h-3.5" />
                    Chờ duyệt
                </span>
            );
        case 'approved':
        case 'final':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Đã duyệt
                </span>
            );
        case 'published':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Globe className="w-3.5 h-3.5" />
                    Đã xuất bản
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Từ chối
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>
            );
    }
}
