// Chú thích: Libraries page - danh sách và tạo thư viện

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, ChevronRight, Trash2 } from 'lucide-react';
import { SUBJECTS, GRADES, BOOKSETS } from '@exam-matrix/shared';
import { api } from '../lib/api';

interface Library {
    id: string;
    subject: string;
    grade: number;
    bookset?: string;
    term?: number;
    duration_minutes: number;
    created_at: string;
}

export default function Libraries() {
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [subject, setSubject] = useState<string>(SUBJECTS[0]);
    const [grade, setGrade] = useState<number>(10);
    const [bookset, setBookset] = useState<string>(BOOKSETS[0]);
    const [term, setTerm] = useState<number>(1);

    useEffect(() => {
        fetchLibraries();
    }, []);

    async function fetchLibraries() {
        try {
            const res = await api.get('/libraries');
            const data = await res.json();
            setLibraries(data.libraries || []);
        } catch (e) {
            console.error('Failed to fetch libraries', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await api.post('/libraries', {
                subject,
                grade,
                bookset,
                term,
                durationMinutes: 60,
            });

            if (res.ok) {
                setShowCreate(false);
                fetchLibraries();
            }
        } catch (e) {
            console.error('Failed to create library', e);
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Bạn có chắc muốn xóa thư viện này?')) return;

        try {
            await api.delete(`/libraries/${id}`);
            setLibraries((prev) => prev.filter((l) => l.id !== id));
        } catch (e) {
            console.error('Failed to delete library', e);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-8 h-8 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thư viện</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý các bộ sách và tài liệu của bạn
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Tạo thư viện mới
                </button>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo thư viện mới</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="label">Môn học</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="select"
                                >
                                    {SUBJECTS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Lớp</label>
                                <select
                                    value={grade}
                                    onChange={(e) => setGrade(Number(e.target.value))}
                                    className="select"
                                >
                                    {GRADES.map((g) => (
                                        <option key={g} value={g}>
                                            Lớp {g}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Bộ sách</label>
                                <select
                                    value={bookset}
                                    onChange={(e) => setBookset(e.target.value)}
                                    className="select"
                                >
                                    {BOOKSETS.map((b) => (
                                        <option key={b} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Học kỳ</label>
                                <select
                                    value={term}
                                    onChange={(e) => setTerm(Number(e.target.value))}
                                    className="select"
                                >
                                    <option value={1}>Học kỳ 1</option>
                                    <option value={2}>Học kỳ 2</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                                    Hủy
                                </button>
                                <button type="submit" disabled={creating} className="btn-primary flex-1">
                                    {creating ? <div className="spinner" /> : 'Tạo thư viện'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Libraries grid */}
            {libraries.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Chưa có thư viện nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Tạo thư viện đầu tiên để bắt đầu
                    </p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        <Plus className="w-4 h-4" />
                        Tạo thư viện
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {libraries.map((lib) => (
                        <div
                            key={lib.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                                    {lib.subject[0]}
                                </div>
                                <button
                                    onClick={() => handleDelete(lib.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {lib.subject} - Lớp {lib.grade}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {lib.bookset} • HK{lib.term}
                            </p>

                            <Link
                                to={`/libraries/${lib.id}`}
                                className="flex items-center justify-between text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Xem chi tiết
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
