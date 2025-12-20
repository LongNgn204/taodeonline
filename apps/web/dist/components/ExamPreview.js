import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Chú thích: ExamPreview component - hiển thị đề thi và đáp án
import { useState } from 'react';
import { RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
export default function ExamPreview({ exam, showAnswers = false, showSources = false, onRegenerateQuestion, }) {
    const [answersVisible, setAnswersVisible] = useState(showAnswers);
    const [sourcesVisible, setSourcesVisible] = useState(showSources);
    const [expandedSources, setExpandedSources] = useState(new Set());
    const toggleSourceExpand = (qId) => {
        setExpandedSources((prev) => {
            const next = new Set(prev);
            if (next.has(qId))
                next.delete(qId);
            else
                next.add(qId);
            return next;
        });
    };
    const levelBadge = (level) => {
        const colors = {
            NB: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            TH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            VD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[level] || 'bg-gray-100 text-gray-700';
    };
    let questionNumber = 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center border-b border-gray-200 dark:border-gray-700 pb-6", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: exam.title }), _jsxs("p", { className: "text-gray-500", children: [exam.subject, " - L\u1EDBp ", exam.grade, " | Th\u1EDDi gian: ", exam.duration, " ph\u00FAt | T\u1ED5ng \u0111i\u1EC3m:", ' ', exam.totalScore] })] }), _jsxs("div", { className: "flex gap-4 justify-end", children: [_jsxs("button", { onClick: () => setAnswersVisible(!answersVisible), className: `btn-secondary ${answersVisible ? 'bg-primary-50 text-primary-600' : ''}`, children: [answersVisible ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }), answersVisible ? 'Ẩn đáp án' : 'Hiện đáp án'] }), onRegenerateQuestion && (_jsx("button", { onClick: () => setSourcesVisible(!sourcesVisible), className: `btn-secondary ${sourcesVisible ? 'bg-accent-50 text-accent-600' : ''}`, children: sourcesVisible ? 'Ẩn nguồn' : 'Hiện nguồn' }))] }), exam.sections.map((section, sectionIdx) => (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white border-b pb-2", children: section.title }), section.questions.map((question) => {
                        questionNumber++;
                        return (_jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-start gap-3 mb-3", children: [_jsxs("span", { className: "font-bold text-gray-500 w-8", children: ["C\u00E2u ", questionNumber, "."] }), _jsx("span", { className: `badge ${levelBadge(question.level)}`, children: question.level }), _jsxs("span", { className: "text-sm text-gray-400", children: ["(", question.points, " \u0111i\u1EC3m)"] }), onRegenerateQuestion && (_jsx("button", { onClick: () => onRegenerateQuestion(question.id), className: "ml-auto p-1 text-gray-400 hover:text-primary-500", title: "Sinh l\u1EA1i c\u00E2u h\u1ECFi", children: _jsx(RefreshCw, { className: "w-4 h-4" }) }))] }), _jsx("p", { className: "text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap", children: question.prompt }), question.type === 'MCQ' && question.options && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mb-3", children: question.options.map((opt) => (_jsxs("div", { className: `p-2 rounded-lg border ${answersVisible && opt.label === question.answerKey
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-gray-200 dark:border-gray-700'}`, children: [_jsxs("span", { className: "font-medium mr-2", children: [opt.label, "."] }), opt.content, answersVisible && opt.label === question.answerKey && (_jsx(CheckCircle, { className: "inline w-4 h-4 text-green-500 ml-2" }))] }, opt.label))) })), question.type === 'TF' && question.tfItems && (_jsx("div", { className: "space-y-2 mb-3", children: question.tfItems.map((item, idx) => (_jsxs("div", { className: `p-2 rounded-lg border flex items-center ${answersVisible
                                            ? item.isTrue
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-gray-700'}`, children: [_jsxs("span", { className: "font-medium mr-3", children: [String.fromCharCode(97 + idx), ")"] }), _jsx("span", { className: "flex-1", children: item.statement }), answersVisible && (item.isTrue ? (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" })) : (_jsx(XCircle, { className: "w-4 h-4 text-red-500" })))] }, item.id))) })), (question.type === 'SHORT' || question.type === 'ESSAY') && (_jsx("div", { className: "mb-3", children: _jsx("div", { className: "h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400", children: question.type === 'SHORT' ? 'Trả lời ngắn...' : 'Bài làm tự luận...' }) })), answersVisible && (_jsxs("div", { className: "p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg", children: [_jsxs("p", { className: "text-sm font-medium text-primary-700 dark:text-primary-300", children: ["\u0110\u00E1p \u00E1n: ", question.answerKey] }), question.solution && (_jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: ["H\u01B0\u1EDBng d\u1EABn: ", question.solution] }))] })), sourcesVisible && question.sources.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsxs("button", { onClick: () => toggleSourceExpand(question.id), className: "flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700", children: [expandedSources.has(question.id) ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })), question.sources.length, " ngu\u1ED3n tr\u00EDch d\u1EABn"] }), expandedSources.has(question.id) && (_jsx("div", { className: "mt-2 space-y-2", children: question.sources.map((src, idx) => (_jsxs("div", { className: "p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm", children: [_jsxs("span", { className: "text-xs text-gray-400", children: ["[", src.chunkId, "]"] }), _jsxs("p", { className: "italic text-gray-600 dark:text-gray-400", children: ["\"", src.quote, "\""] })] }, idx))) }))] }))] }, question.id));
                    })] }, sectionIdx))), _jsx("div", { className: "text-center text-sm text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700", children: "\u0110\u1EC1 thi \u0111\u01B0\u1EE3c t\u1EA1o b\u1EDFi Exam Matrix Generator - CV 7991/BGD\u0110T-GDTrH" })] }));
}
//# sourceMappingURL=ExamPreview.js.map