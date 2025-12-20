import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Exam detail page - xem và export đề thi
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Download, FileSpreadsheet, FileText, Edit } from 'lucide-react';
import { api } from '../lib/api';
import { safeJsonParse } from '@exam-matrix/shared';
export default function ExamDetail() {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);
    useEffect(() => {
        if (id)
            fetchExam();
    }, [id]);
    async function fetchExam() {
        try {
            const res = await api.get(`/exams/${id}`);
            const data = await res.json();
            setExam(data.exam);
        }
        catch (e) {
            console.error('Failed to fetch exam', e);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleExport(type) {
        if (!id)
            return;
        setExporting(type);
        try {
            const res = await api.post(`/exports/${id}/${type}`);
            const data = await res.json();
            if (res.ok && data.downloadUrl) {
                // Trigger download
                window.open(`/api${data.downloadUrl}`, '_blank');
            }
            else {
                alert(data.message || 'Export thất bại');
            }
        }
        catch (e) {
            console.error('Export failed', e);
        }
        finally {
            setExporting(null);
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "spinner w-8 h-8 border-primary-500" }) }));
    }
    if (!exam) {
        return (_jsx("div", { className: "text-center py-16", children: _jsx("p", { className: "text-gray-500", children: "Kh\u00F4ng t\u00ECm th\u1EA5y \u0111\u1EC1 thi" }) }));
    }
    const matrix = safeJsonParse(exam.matrix_json, null);
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("nav", { className: "flex items-center gap-2 text-sm text-gray-500", children: [_jsx(Link, { to: "/", className: "hover:text-primary-600", children: "T\u1ED5ng quan" }), _jsx(ChevronRight, { className: "w-4 h-4" }), _jsx("span", { className: "text-gray-900 dark:text-white font-medium", children: exam.title })] }), _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: exam.title }), _jsxs("div", { className: "flex items-center gap-3 mt-2", children: [_jsx("span", { className: `badge ${exam.status === 'final' ? 'badge-success' : 'badge-warning'}`, children: exam.status === 'final' ? 'Hoàn thành' : 'Nháp' }), _jsxs("span", { className: "text-sm text-gray-500", children: ["C\u1EADp nh\u1EADt: ", new Date(exam.updated_at).toLocaleString('vi-VN')] })] })] }), _jsx("div", { className: "flex gap-3", children: _jsxs("button", { className: "btn-secondary", children: [_jsx(Edit, { className: "w-4 h-4" }), "Ch\u1EC9nh s\u1EEDa"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => handleExport('matrix-xlsx'), disabled: exporting !== null, className: "flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors card-hover", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center", children: _jsx(FileSpreadsheet, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "text-left flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Export Ma tr\u1EADn" }), _jsx("p", { className: "text-sm text-gray-500", children: "File Excel (.xlsx)" })] }), exporting === 'matrix-xlsx' ? (_jsx("div", { className: "spinner" })) : (_jsx(Download, { className: "w-5 h-5 text-gray-400" }))] }), _jsxs("button", { onClick: () => handleExport('exam-docx'), disabled: exporting !== null || !exam.exam_json, className: "flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors card-hover disabled:opacity-50", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center", children: _jsx(FileText, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "text-left flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Export \u0110\u1EC1 thi" }), _jsx("p", { className: "text-sm text-gray-500", children: "File Word (.docx)" })] }), exporting === 'exam-docx' ? (_jsx("div", { className: "spinner" })) : (_jsx(Download, { className: "w-5 h-5 text-gray-400" }))] })] }), matrix && (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Ma tr\u1EADn \u0111\u1EC1" }), _jsx("div", { className: "table-container", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Ch\u1EE7 \u0111\u1EC1" }), _jsx("th", { className: "text-center", children: "MCQ (3\u0111)" }), _jsx("th", { className: "text-center", children: "\u0110/S (2\u0111)" }), _jsx("th", { className: "text-center", children: "Ng\u1EAFn (2\u0111)" }), _jsx("th", { className: "text-center", children: "TL (3\u0111)" }), _jsx("th", { className: "text-center", children: "T\u1EF7 l\u1EC7" })] }) }), _jsx("tbody", { children: matrix.topics?.map((topic, i) => (_jsxs("tr", { children: [_jsx("td", { className: "font-medium", children: topic.name }), _jsx("td", { className: "text-center", children: topic.units?.reduce((sum, u) => sum + (u.MCQ?.NB || 0) + (u.MCQ?.TH || 0) + (u.MCQ?.VD || 0), 0) || '-' }), _jsx("td", { className: "text-center", children: topic.units?.reduce((sum, u) => sum + (u.TF?.NB || 0) + (u.TF?.TH || 0) + (u.TF?.VD || 0), 0) || '-' }), _jsx("td", { className: "text-center", children: topic.units?.reduce((sum, u) => sum + (u.SHORT?.NB || 0) + (u.SHORT?.TH || 0) + (u.SHORT?.VD || 0), 0) || '-' }), _jsx("td", { className: "text-center", children: topic.units?.reduce((sum, u) => sum + (u.ESSAY?.NB || 0) + (u.ESSAY?.TH || 0) + (u.ESSAY?.VD || 0), 0) || '-' }), _jsxs("td", { className: "text-center font-medium", children: [topic.percentScore, "%"] })] }, topic.id || i))) }), _jsx("tfoot", { children: _jsxs("tr", { className: "bg-gray-50 dark:bg-gray-700/50", children: [_jsx("td", { className: "font-bold", children: "T\u1ED5ng" }), _jsxs("td", { className: "text-center font-bold", children: [matrix.summary?.MCQ?.count || 0, " c\u00E2u"] }), _jsxs("td", { className: "text-center font-bold", children: [matrix.summary?.TF?.count || 0, " c\u00E2u"] }), _jsxs("td", { className: "text-center font-bold", children: [matrix.summary?.SHORT?.count || 0, " c\u00E2u"] }), _jsxs("td", { className: "text-center font-bold", children: [matrix.summary?.ESSAY?.count || 0, " c\u00E2u"] }), _jsx("td", { className: "text-center font-bold", children: "100%" })] }) })] }) })] }))] }));
}
//# sourceMappingURL=ExamDetail.js.map