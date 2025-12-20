// Chú thích: Matrix Editor component - inline edit ma trận

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface LevelDistribution {
    NB: number;
    TH: number;
    VD: number;
}

interface Unit {
    id: string;
    name: string;
    MCQ?: LevelDistribution;
    TF?: LevelDistribution;
    SHORT?: LevelDistribution;
    ESSAY?: LevelDistribution;
}

interface Topic {
    id: string;
    name: string;
    units: Unit[];
    percentScore: number;
}

interface Matrix {
    version: string;
    subject: string;
    grade: number;
    duration: number;
    totalScore: number;
    topics: Topic[];
    summary: {
        MCQ: { count: number; points: number };
        TF: { count: number; points: number };
        SHORT: { count: number; points: number };
        ESSAY: { count: number; points: number };
        levelPercent: { NB: number; TH: number; VD: number };
        totalByLevel: {
            NB: { count: number; points: number };
            TH: { count: number; points: number };
            VD: { count: number; points: number };
        };
    };
}

interface MatrixEditorProps {
    matrix: Matrix;
    onChange: (matrix: Matrix) => void;
    readOnly?: boolean;
}

// Generate unique ID
function genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function MatrixEditor({ matrix, onChange, readOnly = false }: MatrixEditorProps) {
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(matrix.topics.map((t) => t.id)));

    const toggleTopic = (id: string) => {
        setExpandedTopics((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const updateTopicName = (topicId: string, name: string) => {
        if (readOnly) return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => (t.id === topicId ? { ...t, name } : t)),
        });
    };

    const updateTopicPercent = (topicId: string, percent: number) => {
        if (readOnly) return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) => (t.id === topicId ? { ...t, percentScore: percent } : t)),
        });
    };

    const updateUnitName = (topicId: string, unitId: string, name: string) => {
        if (readOnly) return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) =>
                t.id === topicId
                    ? { ...t, units: t.units.map((u) => (u.id === unitId ? { ...u, name } : u)) }
                    : t
            ),
        });
    };

    const updateUnitQuestions = (
        topicId: string,
        unitId: string,
        type: 'MCQ' | 'TF' | 'SHORT' | 'ESSAY',
        level: 'NB' | 'TH' | 'VD',
        count: number
    ) => {
        if (readOnly) return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) =>
                t.id === topicId
                    ? {
                        ...t,
                        units: t.units.map((u) =>
                            u.id === unitId
                                ? {
                                    ...u,
                                    [type]: { ...(u[type] || { NB: 0, TH: 0, VD: 0 }), [level]: Math.max(0, count) },
                                }
                                : u
                        ),
                    }
                    : t
            ),
        });
    };

    const addTopic = () => {
        if (readOnly) return;
        const newTopic: Topic = {
            id: genId('topic'),
            name: `Chủ đề ${matrix.topics.length + 1}`,
            units: [{ id: genId('unit'), name: 'Nội dung mới' }],
            percentScore: 0,
        };
        onChange({ ...matrix, topics: [...matrix.topics, newTopic] });
        setExpandedTopics((prev) => new Set(prev).add(newTopic.id));
    };

    const removeTopic = (topicId: string) => {
        if (readOnly || matrix.topics.length <= 1) return;
        onChange({ ...matrix, topics: matrix.topics.filter((t) => t.id !== topicId) });
    };

    const addUnit = (topicId: string) => {
        if (readOnly) return;
        const newUnit: Unit = { id: genId('unit'), name: 'Nội dung mới' };
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) =>
                t.id === topicId ? { ...t, units: [...t.units, newUnit] } : t
            ),
        });
    };

    const removeUnit = (topicId: string, unitId: string) => {
        if (readOnly) return;
        onChange({
            ...matrix,
            topics: matrix.topics.map((t) =>
                t.id === topicId && t.units.length > 1
                    ? { ...t, units: t.units.filter((u) => u.id !== unitId) }
                    : t
            ),
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

    return (
        <div className="space-y-4">
            {/* Header info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                    <span className="text-sm text-gray-500">Môn</span>
                    <p className="font-medium">{matrix.subject}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Lớp</span>
                    <p className="font-medium">{matrix.grade}</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Thời gian</span>
                    <p className="font-medium">{matrix.duration} phút</p>
                </div>
                <div>
                    <span className="text-sm text-gray-500">Tổng điểm</span>
                    <p className="font-medium">{matrix.totalScore}</p>
                </div>
            </div>

            {/* Topics */}
            <div className="space-y-3">
                {matrix.topics.map((topic, topicIdx) => (
                    <div
                        key={topic.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                    >
                        {/* Topic header */}
                        <div
                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 cursor-pointer"
                            onClick={() => toggleTopic(topic.id)}
                        >
                            <button className="p-1">
                                {expandedTopics.has(topic.id) ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            <span className="text-sm font-medium text-gray-400 w-8">#{topicIdx + 1}</span>

                            <input
                                type="text"
                                value={topic.name}
                                onChange={(e) => updateTopicName(topic.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none px-1 py-0.5"
                                disabled={readOnly}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={topic.percentScore}
                                    onChange={(e) => updateTopicPercent(topic.id, Number(e.target.value))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-16 text-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm"
                                    disabled={readOnly}
                                    min={0}
                                    max={100}
                                />
                                <span className="text-sm text-gray-500">%</span>
                            </div>

                            {!readOnly && matrix.topics.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTopic(topic.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Units */}
                        {expandedTopics.has(topic.id) && (
                            <div className="border-t border-gray-100 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
                                            <th className="px-4 py-2 text-left w-1/3">Nội dung</th>
                                            <th className="px-2 py-2 text-center" colSpan={3}>MCQ</th>
                                            <th className="px-2 py-2 text-center" colSpan={3}>Đ/S</th>
                                            <th className="px-2 py-2 text-center" colSpan={3}>Ngắn</th>
                                            <th className="px-2 py-2 text-center" colSpan={3}>TL</th>
                                            <th className="w-10"></th>
                                        </tr>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400">
                                            <th></th>
                                            <th className="px-1">NB</th>
                                            <th className="px-1">TH</th>
                                            <th className="px-1">VD</th>
                                            <th className="px-1">NB</th>
                                            <th className="px-1">TH</th>
                                            <th className="px-1">VD</th>
                                            <th className="px-1">NB</th>
                                            <th className="px-1">TH</th>
                                            <th className="px-1">VD</th>
                                            <th className="px-1">NB</th>
                                            <th className="px-1">TH</th>
                                            <th className="px-1">VD</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topic.units.map((unit) => (
                                            <tr key={unit.id} className="border-t border-gray-100 dark:border-gray-800">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={unit.name}
                                                        onChange={(e) => updateUnitName(topic.id, unit.id, e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none"
                                                        disabled={readOnly}
                                                    />
                                                </td>
                                                {(['MCQ', 'TF', 'SHORT', 'ESSAY'] as const).map((type) =>
                                                    (['NB', 'TH', 'VD'] as const).map((level) => (
                                                        <td key={`${type}-${level}`} className="px-1 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                value={unit[type]?.[level] || 0}
                                                                onChange={(e) =>
                                                                    updateUnitQuestions(topic.id, unit.id, type, level, Number(e.target.value))
                                                                }
                                                                className="w-8 text-center bg-gray-50 dark:bg-gray-700 rounded text-xs"
                                                                disabled={readOnly}
                                                                min={0}
                                                            />
                                                        </td>
                                                    ))
                                                )}
                                                <td className="px-2 py-2">
                                                    {!readOnly && topic.units.length > 1 && (
                                                        <button
                                                            onClick={() => removeUnit(topic.id, unit.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!readOnly && (
                                    <button
                                        onClick={() => addUnit(topic.id)}
                                        className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                        + Thêm nội dung
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add topic button */}
            {!readOnly && (
                <button onClick={addTopic} className="btn-secondary w-full">
                    <Plus className="w-4 h-4" />
                    Thêm chủ đề
                </button>
            )}

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
                <h3 className="font-semibold mb-3">Tổng hợp</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">MCQ:</span>
                        <span className="ml-2 font-medium">{totals.mcq} câu (3đ)</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Đ/S:</span>
                        <span className="ml-2 font-medium">{totals.tf} câu (2đ)</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Ngắn:</span>
                        <span className="ml-2 font-medium">{totals.short} câu (2đ)</span>
                    </div>
                    <div>
                        <span className="text-gray-500">TL:</span>
                        <span className="ml-2 font-medium">{totals.essay} câu (3đ)</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <span>
                        NB: <strong>{totals.nb}</strong> | TH: <strong>{totals.th}</strong> | VD: <strong>{totals.vd}</strong>
                    </span>
                    <span className={totalPercent === 100 ? 'text-green-600' : 'text-red-500'}>
                        Tổng %: {totalPercent}%
                    </span>
                </div>
            </div>
        </div>
    );
}
