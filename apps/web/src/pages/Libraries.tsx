// Chú thích: Libraries page - danh sách và tạo thư viện - Revamped UI

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, ChevronRight, Trash2, Library as LibraryIcon, Search, Filter } from 'lucide-react';
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
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <LibraryIcon className="w-8 h-8 text-primary-500" />
                        Thư viện đề thi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        Quản lý các bộ sách và ngân hàng câu hỏi của bạn
                    </p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Tạo thư viện mới
                </button>
            </div>

            {/* Filter / Search Bar (Mockup for UI visuals) */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thư viện..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Lọc môn học
                    </button>
                </div>
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md animate-scale-up overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo thư viện mới</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Thiết lập thông tin cơ bản cho thư viện đề thi
                            </p>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
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

                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={creating} className="btn-primary flex-1">
                                    {creating ? <div className="spinner" /> : 'Tạo ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Libraries grid */}
            {libraries.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Chưa có thư viện nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        Hãy tạo thư viện đầu tiên để bắt đầu xây dựng ngân hàng câu hỏi và tạo đề thi.
                    </p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Tạo thư viện mới
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* New Library Card button */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 flex items-center justify-center mb-4 transition-colors">
                            <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Tạo thư viện mới</span>
                    </button>

                    {libraries.map((lib) => (
                        <div
                            key={lib.id}
                            className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/10 transition-all group relative overflow-hidden"
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-[1px] shadow-lg shadow-primary-500/20">
                                        <div className="w-full h-full rounded-2xl bg-white dark:bg-black/90 flex items-center justify-center">
                                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary-500 to-accent-500">
                                                {lib.subject[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Tooltip or simple delete */}
                                        <button
                                            onClick={() => handleDelete(lib.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Xóa thư viện"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                                    {lib.subject}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 font-medium text-gray-700 dark:text-gray-300">
                                        Lớp {lib.grade}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10">
                                        HK{lib.term}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-xs">
                                        {lib.bookset}
                                    </span>
                                </div>

                                <Link
                                    to={`/libraries/${lib.id}`}
                                    className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary-600/20 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30"
                                >
                                    Truy cập
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
