// Chú thích: Library detail page - upload docs, view chunks, create exam

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Plus, ChevronRight, File, Check } from 'lucide-react';
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

            // 3. Extract text (client-side mock - trong thực tế dùng pdfjs/mammoth)
            // Ở đây tạm mock text
            const mockText = `Nội dung trích xuất từ file ${file.name}.\n\nĐây là nội dung mẫu để test chunking. Trong thực tế, text sẽ được extract từ PDF/DOCX bằng thư viện phù hợp trên client.`;

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
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-8 h-8 border-primary-500"></div>
            </div>
        );
    }

    if (!library) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">Không tìm thấy thư viện</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/libraries" className="hover:text-primary-600">
                    Thư viện
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">
                    {library.subject} - Lớp {library.grade}
                </span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {library.subject} - Lớp {library.grade}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {library.bookset} • Học kỳ {library.term}
                    </p>
                </div>
                <Link to={`/libraries/${id}/create-exam`} className="btn-accent">
                    <Plus className="w-4 h-4" />
                    Tạo đề kiểm tra
                </Link>
            </div>

            {/* Upload section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tài liệu</h2>

                <label className="block">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploading
                            ? 'border-primary-300 bg-primary-50/50'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                            }`}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <div className="spinner w-8 h-8 border-primary-500 mb-3"></div>
                                <p className="text-gray-500">Đang upload...</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                                    Kéo thả hoặc click để upload
                                </p>
                                <p className="text-sm text-gray-400">Hỗ trợ PDF, DOCX, XLSX</p>
                            </>
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

                {/* Documents list */}
                {documents.length > 0 && (
                    <div className="mt-6 space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <File className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{doc.filename}</p>
                                        <p className="text-sm text-gray-500">
                                            {doc.file_type.toUpperCase()} • {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {doc.extracted_text_status === 'done' ? (
                                        <span className="badge-success">
                                            <Check className="w-3 h-3 mr-1" />
                                            Đã xử lý
                                        </span>
                                    ) : (
                                        <span className="badge-warning">Đang xử lý</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA */}
            {documents.length > 0 && (
                <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-2">Sẵn sàng tạo đề?</h3>
                    <p className="text-primary-100 mb-4">
                        Bạn đã upload {documents.length} tài liệu. Bắt đầu tạo ma trận và đề kiểm tra ngay!
                    </p>
                    <Link to={`/libraries/${id}/create-exam`} className="btn bg-white text-primary-600 hover:bg-gray-100">
                        Tạo đề kiểm tra
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
