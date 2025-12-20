import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Chú thích: Library detail page - upload docs, view chunks, create exam
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Plus, ChevronRight, File, Check } from 'lucide-react';
import { api } from '../lib/api';
export default function LibraryDetail() {
    const { id } = useParams();
    const [library, setLibrary] = useState(null);
    const [documents, setDocuments] = useState([]);
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
        }
        catch (e) {
            console.error('Failed to fetch library', e);
        }
        finally {
            setLoading(false);
        }
    }
    async function fetchDocuments() {
        try {
            const res = await api.get(`/documents/${id}`);
            const data = await res.json();
            setDocuments(data.documents || []);
        }
        catch (e) {
            console.error('Failed to fetch documents', e);
        }
    }
    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
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
        }
        catch (e) {
            console.error('Upload failed', e);
            alert('Upload thất bại');
        }
        finally {
            setUploading(false);
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "spinner w-8 h-8 border-primary-500" }) }));
    }
    if (!library) {
        return (_jsx("div", { className: "text-center py-16", children: _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng t\u00ECm th\u1EA5y th\u01B0 vi\u1EC7n" }) }));
    }
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("nav", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx(Link, { to: "/libraries", className: "hover:text-primary-600", children: "Th\u01B0 vi\u1EC7n" }), _jsx(ChevronRight, { className: "w-4 h-4" }), _jsxs("span", { className: "text-gray-900 dark:text-white font-medium", children: [library.subject, " - L\u1EDBp ", library.grade] })] }), _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: [library.subject, " - L\u1EDBp ", library.grade] }), _jsxs("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: [library.bookset, " \u2022 H\u1ECDc k\u1EF3 ", library.term] })] }), _jsxs(Link, { to: `/libraries/${id}/create-exam`, className: "btn-accent", children: [_jsx(Plus, { className: "w-4 h-4" }), "T\u1EA1o \u0111\u1EC1 ki\u1EC3m tra"] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "T\u00E0i li\u1EC7u" }), _jsxs("label", { className: "block", children: [_jsx("div", { className: `border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploading
                                    ? 'border-primary-300 bg-primary-50/50'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'}`, children: uploading ? (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "spinner w-8 h-8 border-primary-500 mb-3" }), _jsx("p", { className: "text-gray-500", children: "\u0110ang upload..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-8 h-8 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 font-medium mb-1", children: "K\u00E9o th\u1EA3 ho\u1EB7c click \u0111\u1EC3 upload" }), _jsx("p", { className: "text-sm text-gray-400", children: "H\u1ED7 tr\u1EE3 PDF, DOCX, XLSX" })] })) }), _jsx("input", { type: "file", accept: ".pdf,.docx,.xlsx", onChange: handleFileUpload, className: "hidden", disabled: uploading })] }), documents.length > 0 && (_jsx("div", { className: "mt-6 space-y-3", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center", children: _jsx(File, { className: "w-5 h-5 text-primary-600 dark:text-primary-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: doc.filename }), _jsxs("p", { className: "text-sm text-gray-500", children: [doc.file_type.toUpperCase(), " \u2022 ", new Date(doc.created_at).toLocaleDateString('vi-VN')] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: doc.extracted_text_status === 'done' ? (_jsxs("span", { className: "badge-success", children: [_jsx(Check, { className: "w-3 h-3 mr-1" }), "\u0110\u00E3 x\u1EED l\u00FD"] })) : (_jsx("span", { className: "badge-warning", children: "\u0110ang x\u1EED l\u00FD" })) })] }, doc.id))) }))] }), documents.length > 0 && (_jsxs("div", { className: "bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 text-white", children: [_jsx("h3", { className: "text-lg font-bold mb-2", children: "S\u1EB5n s\u00E0ng t\u1EA1o \u0111\u1EC1?" }), _jsxs("p", { className: "text-primary-100 mb-4", children: ["B\u1EA1n \u0111\u00E3 upload ", documents.length, " t\u00E0i li\u1EC7u. B\u1EAFt \u0111\u1EA7u t\u1EA1o ma tr\u1EADn v\u00E0 \u0111\u1EC1 ki\u1EC3m tra ngay!"] }), _jsxs(Link, { to: `/libraries/${id}/create-exam`, className: "btn bg-white text-primary-600 hover:bg-gray-100", children: ["T\u1EA1o \u0111\u1EC1 ki\u1EC3m tra", _jsx(ChevronRight, { className: "w-4 h-4" })] })] }))] }));
}
//# sourceMappingURL=LibraryDetail.js.map