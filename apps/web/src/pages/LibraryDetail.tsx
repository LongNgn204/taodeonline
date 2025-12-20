// Chú thích: Library detail page - upload docs, view chunks, create exam - Revamped UI

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Plus, ChevronRight, File as FileIcon, Check, FileText, ArrowRight, Library, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

interface Document {
    id: string;
    filename: string;
    file_type: string;
    extracted_text_status: string;
    created_at: string;
}

interface Library {
    id: string;
    subject: string;
    grade: number;
    bookset?: string;
    term?: number;
}

export default function LibraryDetail() {
    const { id } = useParams<{ id: string }>();
    const [library, setLibrary] = useState<Library | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchLibrary();
            fetchDocuments();
        }
    }, [id]);

    async function fetchLibrary() {
        try {
            const res = await api.get(`/libraries/${id}`);
            const data = await res.json();
            setLibrary(data.library);
        } catch (e) {
            console.error('Failed to fetch library', e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchDocuments() {
        try {
            const res = await api.get(`/documents/${id}`);
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (e) {
            console.error('Failed to fetch documents', e);
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'docx', 'xlsx'].includes(ext || '')) {
            alert('Chỉ hỗ trợ file PDF, DOCX, XLSX');
            return;
        }

        setUploading(true);

        try {
            // 1. Initiate upload
            const initRes = await api.post(`/documents/${id}/upload`, {
                filename: file.name,
                fileType: ext,
            });
            const initData = await initRes.json();

            if (!initRes.ok) {
                throw new Error(initData.message);
            }

            // 2. Upload file content
            const buffer = await file.arrayBuffer();
            await api.uploadFile(`/documents/${initData.documentId}/upload`, buffer);

            // 3. Extract text (client-side mock)
            const mockText = `Nội dung trích xuất từ file ${file.name}.\n\nĐây là nội dung mẫu để test chunking.`;

            // 4. Complete upload với extracted text
            await api.post(`/documents/${initData.documentId}/complete`, {
                extractedText: mockText,
            });

            // Refresh documents list
            fetchDocuments();
        } catch (e) {
            console.error('Upload failed', e);
            alert('Upload thất bại');
        } finally {
            setUploading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    if (!library) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Library className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy thư viện</h3>
                <p className="text-gray-500 mt-2">Thư viện này không tồn tại hoặc đã bị xóa.</p>
                <Link to="/libraries" className="btn-primary mt-6">
                    Quay về danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/libraries" className="hover:text-primary-500 hover:underline transition-all">
                    Thư viện
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">
                    {library.subject} {library.grade}
                </span>
            </nav>

            {/* Header */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 text-white font-bold text-2xl shrink-0">
                            {library.subject[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                                {library.subject} - Lớp {library.grade}
                            </h1>
                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full">
                                    {library.bookset}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full">
                                    Học kỳ {library.term}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        to={`/libraries/${id}/create-exam`}
                        className="btn-accent shadow-lg shadow-accent-500/20 py-3 px-6 text-base"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo đề kiểm tra
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Document List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary-500" />
                            Tài liệu nguồn
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {documents.length} tài liệu
                        </span>
                    </div>

                    {documents.length === 0 ? (
                        <div className="bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FileIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Chưa có tài liệu nào</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                Tải lên sách giáo khoa, chuyên đề hoặc đề thi cũ để AI học và sinh ngân hàng câu hỏi.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary-500/30 transition-all hover:shadow-lg hover:shadow-primary-500/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                            {doc.file_type === 'pdf' ? <FileText className="w-6 h-6" /> : <FileIcon className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                                {doc.filename}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {doc.file_type.toUpperCase()} • {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {doc.extracted_text_status === 'done' ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-500/20">
                                                <Check className="w-3 h-3" />
                                                Đã học
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium border border-yellow-100 dark:border-yellow-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                                Đang xử lý
                                            </div>
                                        )}
                                        <button className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="sr-only">Delete</span>
                                            {/* TrashIcon here if needed */}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Upload & Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Tải lên tài liệu</h3>

                        <label className="block group cursor-pointer">
                            <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${uploading
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                                    }`}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center py-4">
                                        <div className="spinner w-8 h-8 border-primary-500 mb-3"></div>
                                        <p className="text-sm font-medium text-primary-600">Đang tải lên và xử lý...</p>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <p className="text-base font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                            Click để tải lên
                                        </p>
                                        <p className="text-xs text-gray-500 px-4">
                                            Hỗ trợ PDF, DOCX tối đa 20MB. Hệ thống sẽ tự động trích xuất nội dung.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.docx,.xlsx"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {documents.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
                            <h3 className="text-lg font-bold mb-2">Đã sẵn sàng!</h3>
                            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                Dữ liệu từ {documents.length} tài liệu đã được index. Bạn có thể tạo ma trận đề thi ngay bây giờ.
                            </p>
                            <Link
                                to={`/libraries/${id}/create-exam`}
                                className="flex items-center justify-center w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                                Bắt đầu tạo đề
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
