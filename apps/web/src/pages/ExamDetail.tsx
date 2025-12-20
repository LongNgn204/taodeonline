// Chú thích: Exam detail page - xem và export đề thi

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Download, FileSpreadsheet, FileText, Edit } from 'lucide-react';
import { api } from '../lib/api';
import { safeJsonParse } from '@exam-matrix/shared';

interface Exam {
    id: string;
    title: string;
    matrix_json: string;
    exam_json?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function ExamDetail() {
    const { id } = useParams<{ id: string }>();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchExam();
    }, [id]);

    async function fetchExam() {
        try {
            const res = await api.get(`/exams/${id}`);
            const data = await res.json();
            setExam(data.exam);
        } catch (e) {
            console.error('Failed to fetch exam', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleExport(type: 'matrix-xlsx' | 'exam-docx') {
        if (!id) return;
        setExporting(type);

        try {
            const res = await api.post(`/exports/${id}/${type}`);
            const data = await res.json();

            if (res.ok && data.downloadUrl) {
                // Trigger download
                window.open(`/api${data.downloadUrl}`, '_blank');
            } else {
                alert(data.message || 'Export thất bại');
            }
        } catch (e) {
            console.error('Export failed', e);
        } finally {
            setExporting(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-8 h-8 border-primary-500"></div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500">Không tìm thấy đề thi</p>
            </div>
        );
    }

    const matrix = safeJsonParse<any>(exam.matrix_json, null);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-primary-600">
                    Tổng quan
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">{exam.title}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`badge ${exam.status === 'final' ? 'badge-success' : 'badge-warning'}`}>
                            {exam.status === 'final' ? 'Hoàn thành' : 'Nháp'}
                        </span>
                        <span className="text-sm text-gray-500">
                            Cập nhật: {new Date(exam.updated_at).toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary">
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                    </button>
                </div>
            </div>

            {/* Export buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleExport('matrix-xlsx')}
                    disabled={exporting !== null}
                    className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors card-hover"
                >
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Export Ma trận</h3>
                        <p className="text-sm text-gray-500">File Excel (.xlsx)</p>
                    </div>
                    {exporting === 'matrix-xlsx' ? (
                        <div className="spinner" />
                    ) : (
                        <Download className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                <button
                    onClick={() => handleExport('exam-docx')}
                    disabled={exporting !== null || !exam.exam_json}
                    className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors card-hover disabled:opacity-50"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Export Đề thi</h3>
                        <p className="text-sm text-gray-500">File Word (.docx)</p>
                    </div>
                    {exporting === 'exam-docx' ? (
                        <div className="spinner" />
                    ) : (
                        <Download className="w-5 h-5 text-gray-400" />
                    )}
                </button>
            </div>

            {/* Matrix preview */}
            {matrix && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ma trận đề</h2>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Chủ đề</th>
                                    <th className="text-center">MCQ (3đ)</th>
                                    <th className="text-center">Đ/S (2đ)</th>
                                    <th className="text-center">Ngắn (2đ)</th>
                                    <th className="text-center">TL (3đ)</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.topics?.map((topic: any, i: number) => (
                                    <tr key={topic.id || i}>
                                        <td className="font-medium">{topic.name}</td>
                                        <td className="text-center">
                                            {topic.units?.reduce(
                                                (sum: number, u: any) =>
                                                    sum + (u.MCQ?.NB || 0) + (u.MCQ?.TH || 0) + (u.MCQ?.VD || 0),
                                                0
                                            ) || '-'}
                                        </td>
                                        <td className="text-center">
                                            {topic.units?.reduce(
                                                (sum: number, u: any) =>
                                                    sum + (u.TF?.NB || 0) + (u.TF?.TH || 0) + (u.TF?.VD || 0),
                                                0
                                            ) || '-'}
                                        </td>
                                        <td className="text-center">
                                            {topic.units?.reduce(
                                                (sum: number, u: any) =>
                                                    sum + (u.SHORT?.NB || 0) + (u.SHORT?.TH || 0) + (u.SHORT?.VD || 0),
                                                0
                                            ) || '-'}
                                        </td>
                                        <td className="text-center">
                                            {topic.units?.reduce(
                                                (sum: number, u: any) =>
                                                    sum + (u.ESSAY?.NB || 0) + (u.ESSAY?.TH || 0) + (u.ESSAY?.VD || 0),
                                                0
                                            ) || '-'}
                                        </td>
                                        <td className="text-center font-medium">{topic.percentScore}%</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <td className="font-bold">Tổng</td>
                                    <td className="text-center font-bold">{matrix.summary?.MCQ?.count || 0} câu</td>
                                    <td className="text-center font-bold">{matrix.summary?.TF?.count || 0} câu</td>
                                    <td className="text-center font-bold">{matrix.summary?.SHORT?.count || 0} câu</td>
                                    <td className="text-center font-bold">{matrix.summary?.ESSAY?.count || 0} câu</td>
                                    <td className="text-center font-bold">100%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
