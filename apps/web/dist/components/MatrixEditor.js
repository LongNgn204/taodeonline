import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: Matrix Editor component - inline edit ma trận
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
// Generate unique ID
function genId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
export default function MatrixEditor({ matrix, onChange, readOnly = false }) {
    const [expandedTopics, setExpandedTopics] = useState(new Set(matrix.topics.map((t) => t.id)));
    const toggleTopic = (id) => {
        setExpandedTopics((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const updateTopicName = (topicId, name) => {
        if (readOnly)
            return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => (t.id === topicId ? { ...t, name } : t)),
        });
    };
    const updateTopicPercent = (topicId, percent) => {
        if (readOnly)
            return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => (t.id === topicId ? { ...t, percentScore: percent } : t)),
        });
    };
    const updateUnitName = (topicId, unitId, name) => {
        if (readOnly)
            return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => t.id === topicId
                ? { ...t, units: t.units.map((u) => (u.id === unitId ? { ...u, name } : u)) }
                : t),
        });
    };
    const updateUnitQuestions = (topicId, unitId, type, level, count) => {
        if (readOnly)
            return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => t.id === topicId
                ? {
                    ...t,
                    units: t.units.map((u) => u.id === unitId
                        ? {
                            ...u,
                            [type]: { ...(u[type] || { NB: 0, TH: 0, VD: 0 }), [level]: Math.max(0, count) },
                        }
                        : u),
                }
                : t),
        });
    };
    const addTopic = () => {
        if (readOnly)
            return;
        const newTopic = {
            id: genId('topic'),
            name: `Chủ đề ${matrix.topics.length + 1}`,
            units: [{ id: genId('unit'), name: 'Nội dung mới' }],
            percentScore: 0,
        };
        onChange({ ...matrix, topics: [...matrix.topics, newTopic] });
        setExpandedTopics((prev) => new Set(prev).add(newTopic.id));
    };
    const removeTopic = (topicId) => {
        if (readOnly || matrix.topics.length <= 1)
            return;
        onChange({ ...matrix, topics: matrix.topics.filter((t) => t.id !== topicId) });
    };
    const addUnit = (topicId) => {
        if (readOnly)
            return;
        const newUnit = { id: genId('unit'), name: 'Nội dung mới' };
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => t.id === topicId ? { ...t, units: [...t.units, newUnit] } : t),
        });
    };
    const removeUnit = (topicId, unitId) => {
        if (readOnly)
            return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => t.id === topicId && t.units.length > 1
                ? { ...t, units: t.units.filter((u) => u.id !== unitId) }
                : t),
        });
    };
    // Calculate totals
    const calculateTotals = () => {
        let mcq = 0, tf = 0, short = 0, essay = 0;
        let nb = 0, th = 0, vd = 0;
        matrix.topics.forEach((topic) => {
            topic.units.forEach((unit) => {
                if (unit.MCQ) {
                    mcq += unit.MCQ.NB + unit.MCQ.TH + unit.MCQ.VD;
                    nb += unit.MCQ.NB;
                    th += unit.MCQ.TH;
                    vd += unit.MCQ.VD;
                }
                if (unit.TF) {
                    tf += unit.TF.NB + unit.TF.TH + unit.TF.VD;
                    nb += unit.TF.NB;
                    th += unit.TF.TH;
                    vd += unit.TF.VD;
                }
                if (unit.SHORT) {
                    short += unit.SHORT.NB + unit.SHORT.TH + unit.SHORT.VD;
                    nb += unit.SHORT.NB;
                    th += unit.SHORT.TH;
                    vd += unit.SHORT.VD;
                }
                if (unit.ESSAY) {
                    essay += unit.ESSAY.NB + unit.ESSAY.TH + unit.ESSAY.VD;
                    nb += unit.ESSAY.NB;
                    th += unit.ESSAY.TH;
                    vd += unit.ESSAY.VD;
                }
            });
        });
        return { mcq, tf, short, essay, nb, th, vd, total: mcq + tf + short + essay };
    };
    const totals = calculateTotals();
    const totalPercent = matrix.topics.reduce((sum, t) => sum + t.percentScore, 0);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "M\u00F4n" }), _jsx("p", { className: "font-medium", children: matrix.subject })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "L\u1EDBp" }), _jsx("p", { className: "font-medium", children: matrix.grade })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "Th\u1EDDi gian" }), _jsxs("p", { className: "font-medium", children: [matrix.duration, " ph\u00FAt"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500", children: "T\u1ED5ng \u0111i\u1EC3m" }), _jsx("p", { className: "font-medium", children: matrix.totalScore })] })] }), _jsx("div", { className: "space-y-3", children: matrix.topics.map((topic, topicIdx) => (_jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-3 p-4 bg-white dark:bg-gray-800 cursor-pointer", onClick: () => toggleTopic(topic.id), children: [_jsx("button", { className: "p-1", children: expandedTopics.has(topic.id) ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })) }), _jsxs("span", { className: "text-sm font-medium text-gray-400 w-8", children: ["#", topicIdx + 1] }), _jsx("input", { type: "text", value: topic.name, onChange: (e) => updateTopicName(topic.id, e.target.value), onClick: (e) => e.stopPropagation(), className: "flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none px-1 py-0.5", disabled: readOnly }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", value: topic.percentScore, onChange: (e) => updateTopicPercent(topic.id, Number(e.target.value)), onClick: (e) => e.stopPropagation(), className: "w-16 text-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm", disabled: readOnly, min: 0, max: 100 }), _jsx("span", { className: "text-sm text-gray-500", children: "%" })] }), !readOnly && matrix.topics.length > 1 && (_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        removeTopic(topic.id);
                                    }, className: "p-1 text-gray-400 hover:text-red-500", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }), expandedTopics.has(topic.id) && (_jsxs("div", { className: "border-t border-gray-100 dark:border-gray-700", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsxs("thead", { children: [_jsxs("tr", { className: "bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500", children: [_jsx("th", { className: "px-4 py-2 text-left w-1/3", children: "N\u1ED9i dung" }), _jsx("th", { className: "px-2 py-2 text-center", colSpan: 3, children: "MCQ" }), _jsx("th", { className: "px-2 py-2 text-center", colSpan: 3, children: "\u0110/S" }), _jsx("th", { className: "px-2 py-2 text-center", colSpan: 3, children: "Ng\u1EAFn" }), _jsx("th", { className: "px-2 py-2 text-center", colSpan: 3, children: "TL" }), _jsx("th", { className: "w-10" })] }), _jsxs("tr", { className: "bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400", children: [_jsx("th", {}), _jsx("th", { className: "px-1", children: "NB" }), _jsx("th", { className: "px-1", children: "TH" }), _jsx("th", { className: "px-1", children: "VD" }), _jsx("th", { className: "px-1", children: "NB" }), _jsx("th", { className: "px-1", children: "TH" }), _jsx("th", { className: "px-1", children: "VD" }), _jsx("th", { className: "px-1", children: "NB" }), _jsx("th", { className: "px-1", children: "TH" }), _jsx("th", { className: "px-1", children: "VD" }), _jsx("th", { className: "px-1", children: "NB" }), _jsx("th", { className: "px-1", children: "TH" }), _jsx("th", { className: "px-1", children: "VD" }), _jsx("th", {})] })] }), _jsx("tbody", { children: topic.units.map((unit) => (_jsxs("tr", { className: "border-t border-gray-100 dark:border-gray-800", children: [_jsx("td", { className: "px-4 py-2", children: _jsx("input", { type: "text", value: unit.name, onChange: (e) => updateUnitName(topic.id, unit.id, e.target.value), className: "w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none", disabled: readOnly }) }), ['MCQ', 'TF', 'SHORT', 'ESSAY'].map((type) => ['NB', 'TH', 'VD'].map((level) => (_jsx("td", { className: "px-1 py-2 text-center", children: _jsx("input", { type: "number", value: unit[type]?.[level] || 0, onChange: (e) => updateUnitQuestions(topic.id, unit.id, type, level, Number(e.target.value)), className: "w-8 text-center bg-gray-50 dark:bg-gray-700 rounded text-xs", disabled: readOnly, min: 0 }) }, `${type}-${level}`)))), _jsx("td", { className: "px-2 py-2", children: !readOnly && topic.units.length > 1 && (_jsx("button", { onClick: () => removeUnit(topic.id, unit.id), className: "p-1 text-gray-400 hover:text-red-500", children: _jsx(Trash2, { className: "w-3 h-3" }) })) })] }, unit.id))) })] }), !readOnly && (_jsx("button", { onClick: () => addUnit(topic.id), className: "w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20", children: "+ Th\u00EAm n\u1ED9i dung" }))] }))] }, topic.id))) }), !readOnly && (_jsxs("button", { onClick: addTopic, className: "btn-secondary w-full", children: [_jsx(Plus, { className: "w-4 h-4" }), "Th\u00EAm ch\u1EE7 \u0111\u1EC1"] })), _jsxs("div", { className: "p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl", children: [_jsx("h3", { className: "font-semibold mb-3", children: "T\u1ED5ng h\u1EE3p" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "MCQ:" }), _jsxs("span", { className: "ml-2 font-medium", children: [totals.mcq, " c\u00E2u (3\u0111)"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "\u0110/S:" }), _jsxs("span", { className: "ml-2 font-medium", children: [totals.tf, " c\u00E2u (2\u0111)"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Ng\u1EAFn:" }), _jsxs("span", { className: "ml-2 font-medium", children: [totals.short, " c\u00E2u (2\u0111)"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "TL:" }), _jsxs("span", { className: "ml-2 font-medium", children: [totals.essay, " c\u00E2u (3\u0111)"] })] })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between", children: [_jsxs("span", { children: ["NB: ", _jsx("strong", { children: totals.nb }), " | TH: ", _jsx("strong", { children: totals.th }), " | VD: ", _jsx("strong", { children: totals.vd })] }), _jsxs("span", { className: totalPercent === 100 ? 'text-green-600' : 'text-red-500', children: ["T\u1ED5ng %: ", totalPercent, "%"] })] })] })] }));
}
//# sourceMappingURL=MatrixEditor.js.map