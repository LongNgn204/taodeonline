
import { useState } from 'react';
import { BadgeCheck, Clock, FileEdit, Send, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export type ExamStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';

export default function ExamWorkflow({ status, onChange }: { status: ExamStatus, onChange: (s: ExamStatus) => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = (newStatus: ExamStatus) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onChange(newStatus);
            setIsLoading(false);
        }, 1000);
    };

    const statusConfig = {
        draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700', icon: FileEdit },
        pending_review: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: BadgeCheck },
        published: { label: 'Đã xuất bản', color: 'bg-blue-100 text-blue-700', icon: Send },
        rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
    };

    const currentConfig = statusConfig[status];
    const Icon = currentConfig.icon;

    return (
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentConfig.color}`}>
                    <Icon className="w-3 h-3" />
                    {currentConfig.label}
                </span>
            </div>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex gap-2">
                {status === 'draft' && (
                    <Button
                        size="sm"
                        isLoading={isLoading}
                        onClick={() => handleStatusChange('pending_review')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        Gửi duyệt
                    </Button>
                )}

                {status === 'pending_review' && (
                    <>
                        <Button
                            size="sm"
                            variant="primary"
                            isLoading={isLoading}
                            onClick={() => handleStatusChange('approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Duyệt đề
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            isLoading={isLoading}
                            onClick={() => handleStatusChange('rejected')}
                            className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                            Từ chối
                        </Button>
                    </>
                )}

                {status === 'approved' && (
                    <Button
                        size="sm"
                        variant="primary"
                        isLoading={isLoading}
                        onClick={() => handleStatusChange('published')}
                    >
                        Xuất bản (Public)
                    </Button>
                )}
            </div>
        </div>
    );
}
