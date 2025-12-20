import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Libraries page - danh sách và tạo thư viện
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, ChevronRight, Trash2 } from 'lucide-react';
import { SUBJECTS, GRADES, BOOKSETS } from '@exam-matrix/shared';
import { api } from '../lib/api';
export default function Libraries() {
    const [libraries, setLibraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    // Form state
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [grade, setGrade] = useState(10);
    const [bookset, setBookset] = useState(BOOKSETS[0]);
    const [term, setTerm] = useState(1);
    useEffect(() => {
        fetchLibraries();
    }, []);
    async function fetchLibraries() {
        try {
            const res = await api.get('/libraries');
            const data = await res.json();
            setLibraries(data.libraries || []);
        }
        catch (e) {
            console.error('Failed to fetch libraries', e);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleCreate(e) {
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
        }
        catch (e) {
            console.error('Failed to create library', e);
        }
        finally {
            setCreating(false);
        }
    }
    async function handleDelete(id) {
        if (!confirm('Bạn có chắc muốn xóa thư viện này?'))
            return;
        try {
            await api.delete(`/libraries/${id}`);
            setLibraries((prev) => prev.filter((l) => l.id !== id));
        }
        catch (e) {
            console.error('Failed to delete library', e);
        }
    }
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "spinner w-8 h-8 border-primary-500" }) }));
    }
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Th\u01B0 vi\u1EC7n" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: "Qu\u1EA3n l\u00FD c\u00E1c b\u1ED9 s\u00E1ch v\u00E0 t\u00E0i li\u1EC7u c\u1EE7a b\u1EA1n" })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { className: "w-4 h-4" }), "T\u1EA1o th\u01B0 vi\u1EC7n m\u1EDBi"] })] }), showCreate && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up", children: [_jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "T\u1EA1o th\u01B0 vi\u1EC7n m\u1EDBi" }) }), _jsxs("form", { onSubmit: handleCreate, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "M\u00F4n h\u1ECDc" }), _jsx("select", { value: subject, onChange: (e) => setSubject(e.target.value), className: "select", children: SUBJECTS.map((s) => (_jsx("option", { value: s, children: s }, s))) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "L\u1EDBp" }), _jsx("select", { value: grade, onChange: (e) => setGrade(Number(e.target.value)), className: "select", children: GRADES.map((g) => (_jsxs("option", { value: g, children: ["L\u1EDBp ", g] }, g))) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "B\u1ED9 s\u00E1ch" }), _jsx("select", { value: bookset, onChange: (e) => setBookset(e.target.value), className: "select", children: BOOKSETS.map((b) => (_jsx("option", { value: b, children: b }, b))) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "H\u1ECDc k\u1EF3" }), _jsxs("select", { value: term, onChange: (e) => setTerm(Number(e.target.value)), className: "select", children: [_jsx("option", { value: 1, children: "H\u1ECDc k\u1EF3 1" }), _jsx("option", { value: 2, children: "H\u1ECDc k\u1EF3 2" })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setShowCreate(false), className: "btn-secondary flex-1", children: "H\u1EE7y" }), _jsx("button", { type: "submit", disabled: creating, className: "btn-primary flex-1", children: creating ? _jsx("div", { className: "spinner" }) : 'Tạo thư viện' })] })] })] }) })), libraries.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4", children: _jsx(BookOpen, { className: "w-8 h-8 text-gray-400" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "Ch\u01B0a c\u00F3 th\u01B0 vi\u1EC7n n\u00E0o" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mb-4", children: "T\u1EA1o th\u01B0 vi\u1EC7n \u0111\u1EA7u ti\u00EAn \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u" }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { className: "w-4 h-4" }), "T\u1EA1o th\u01B0 vi\u1EC7n"] })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: libraries.map((lib) => (_jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-hover group", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold", children: lib.subject[0] }), _jsx("button", { onClick: () => handleDelete(lib.id), className: "opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-1", children: [lib.subject, " - L\u1EDBp ", lib.grade] }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: [lib.bookset, " \u2022 HK", lib.term] }), _jsxs(Link, { to: `/libraries/${lib.id}`, className: "flex items-center justify-between text-primary-600 hover:text-primary-700 font-medium", children: ["Xem chi ti\u1EBFt", _jsx(ChevronRight, { className: "w-4 h-4" })] })] }, lib.id))) }))] }));
}
//# sourceMappingURL=Libraries.js.map