// Chú thích: Resource Card component for AI Hub

import { FileText, Video, BookOpen, FileCode, ExternalLink, Eye } from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    category: string;
    url?: string;
}

interface ResourceCardProps {
    resource: Resource;
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
    document: {
        icon: FileText,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'Tài liệu',
    },
    video: {
        icon: Video,
        color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        label: 'Video',
    },
    example: {
        icon: BookOpen,
        color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        label: 'Ví dụ',
    },
    template: {
        icon: FileCode,
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        label: 'Template',
    },
};

export default function ResourceCard({ resource }: ResourceCardProps) {
    const config = typeConfig[resource.resource_type] || typeConfig.document;
    const Icon = config.icon;

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${config.color}`}>
                    <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            {config.label}
                        </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {resource.description}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Eye className="w-4 h-4" />
                    Xem
                </button>
                {resource.url && (
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Mở
                    </a>
                )}
            </div>
        </div>
    );
}
