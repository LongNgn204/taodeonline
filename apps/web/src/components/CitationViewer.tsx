// Chú thích: CitationViewer component - Hiển thị citations/sources cho câu hỏi
// F2.2: Show sources array từ AI output với links đến document chunks

import { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, Quote, FileText } from 'lucide-react';

interface Source {
    doc_id: string;
    chunk_id?: string;
    title?: string;
    quote?: string;
    page?: number;
    relevance?: number;
}

interface CitationViewerProps {
    sources: Source[];
    compact?: boolean;
    maxDisplay?: number;
}

export default function CitationViewer({
    sources,
    compact = false,
    maxDisplay = 3
}: CitationViewerProps) {
    const [expanded, setExpanded] = useState(false);

    if (!sources || sources.length === 0) {
        return null;
    }

    const displaySources = expanded ? sources : sources.slice(0, maxDisplay);
    const hasMore = sources.length > maxDisplay;

    if (compact) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span>{sources.length} nguồn tham khảo</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Nguồn tham khảo ({sources.length})
                </h4>
            </div>

            <div className="space-y-2">
                {displaySources.map((source, index) => (
                    <div
                        key={`${source.doc_id}-${source.chunk_id || index}`}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary-500/30 transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {source.title || `Tài liệu ${source.doc_id.slice(0, 8)}...`}
                                    </p>
                                    {source.page && (
                                        <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10">
                                            Tr. {source.page}
                                        </span>
                                    )}
                                    {source.relevance && (
                                        <span className="text-xs text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/20">
                                            {Math.round(source.relevance * 100)}%
                                        </span>
                                    )}
                                </div>

                                {source.quote && (
                                    <div className="mt-2 flex items-start gap-2">
                                        <Quote className="w-3 h-3 text-gray-400 shrink-0 mt-1" />
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2">
                                            "{source.quote}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-400 hover:text-primary-500"
                                title="Xem tài liệu gốc"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && !expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                    <ChevronDown className="w-3.5 h-3.5" />
                    Xem thêm {sources.length - maxDisplay} nguồn khác
                </button>
            )}

            {expanded && hasMore && (
                <button
                    onClick={() => setExpanded(false)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:underline"
                >
                    Thu gọn
                </button>
            )}
        </div>
    );
}
