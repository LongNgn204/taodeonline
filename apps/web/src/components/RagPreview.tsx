// Chú thích: RagPreview component - Preview và test RAG context
// F2.3: Search test với /rag/context API

import { useState } from 'react';
import { Search, FileText, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

interface Chunk {
    id: string;
    text: string;
    document_id: string;
    similarity?: number;
    metadata?: {
        topic?: string;
        page?: number;
    };
}

interface RagPreviewProps {
    libraryId: string;
    onChunkSelect?: (chunk: Chunk) => void;
}

export default function RagPreview({ libraryId, onChunkSelect }: RagPreviewProps) {
    const [query, setQuery] = useState('');
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/rag/context', {
                libraryId,
                query: query.trim(),
                topK: 5,
            });
            const data = await res.json();

            if (res.ok) {
                setChunks(data.chunks || []);
                setHasSearched(true);
            } else {
                setError(data.error || 'Lỗi khi tìm kiếm');
            }
        } catch (e: any) {
            console.error('RAG search failed', e);
            setError(e.message || 'Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const loadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get(`/rag/preview/${libraryId}`);
            const data = await res.json();

            if (res.ok) {
                setChunks(data.chunks || []);
                setHasSearched(true);
            } else {
                setError(data.error || 'Lỗi khi tải preview');
            }
        } catch (e: any) {
            console.error('RAG preview failed', e);
            setError(e.message || 'Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Tìm kiếm trong tài liệu..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tìm'}
                </button>
            </div>

            {/* Quick Preview Button */}
            {!hasSearched && (
                <button
                    onClick={loadPreview}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                    <BookOpen className="w-4 h-4" />
                    Xem tất cả chunks
                </button>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Results */}
            {chunks.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-medium">
                        {chunks.length} kết quả
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {chunks.map((chunk) => (
                            <button
                                key={chunk.id}
                                onClick={() => onChunkSelect?.(chunk)}
                                className="w-full p-3 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary-500/30 transition-colors text-left group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-gray-500 font-mono">
                                                #{chunk.id.slice(0, 8)}
                                            </span>
                                            {chunk.similarity && (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                                    {Math.round(chunk.similarity * 100)}% match
                                                </span>
                                            )}
                                            {chunk.metadata?.topic && (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                    {chunk.metadata.topic}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                            {chunk.text}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {hasSearched && chunks.length === 0 && !error && (
                <div className="p-6 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Không tìm thấy kết quả</p>
                </div>
            )}
        </div>
    );
}
