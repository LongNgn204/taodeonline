// Chú thích: ExamPreview component - hiển thị đề thi và đáp án

import { useState } from 'react';
import { RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface MCQOption {
    label: string;
    content: string;
}

interface TFItem {
    id: string;
    statement: string;
    isTrue: boolean;
}

interface Source {
    chunkId: string;
    quote: string;
}

interface Question {
    id: string;
    type: 'MCQ' | 'TF' | 'SHORT' | 'ESSAY';
    level: 'NB' | 'TH' | 'VD';
    prompt: string;
    options?: MCQOption[];
    tfItems?: TFItem[];
    answerKey: string;
    solution?: string;
    points: number;
    sources: Source[];
}

interface Section {
    type: string;
    title: string;
    totalPoints: number;
    questions: Question[];
}

interface ExamContent {
    version: string;
    title: string;
    subject: string;
    grade: number;
    duration: number;
    totalScore: number;
    sections: Section[];
}

interface ExamPreviewProps {
    exam: ExamContent;
    showAnswers?: boolean;
    showSources?: boolean;
    onRegenerateQuestion?: (questionId: string) => void;
}

export default function ExamPreview({
    exam,
    showAnswers = false,
    showSources = false,
    onRegenerateQuestion,
}: ExamPreviewProps) {
    const [answersVisible, setAnswersVisible] = useState(showAnswers);
    const [sourcesVisible, setSourcesVisible] = useState(showSources);
    const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

    const toggleSourceExpand = (qId: string) => {
        setExpandedSources((prev) => {
            const next = new Set(prev);
            if (next.has(qId)) next.delete(qId);
            else next.add(qId);
            return next;
        });
    };

    const levelBadge = (level: string) => {
        const colors = {
            NB: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            TH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            VD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    let questionNumber = 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
                <p className="text-gray-500">
                    {exam.subject} - Lớp {exam.grade} | Thời gian: {exam.duration} phút | Tổng điểm:{' '}
                    {exam.totalScore}
                </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-end">
                <button
                    onClick={() => setAnswersVisible(!answersVisible)}
                    className={`btn-secondary ${answersVisible ? 'bg-primary-50 text-primary-600' : ''}`}
                >
                    {answersVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {answersVisible ? 'Ẩn đáp án' : 'Hiện đáp án'}
                </button>
                {onRegenerateQuestion && (
                    <button
                        onClick={() => setSourcesVisible(!sourcesVisible)}
                        className={`btn-secondary ${sourcesVisible ? 'bg-accent-50 text-accent-600' : ''}`}
                    >
                        {sourcesVisible ? 'Ẩn nguồn' : 'Hiện nguồn'}
                    </button>
                )}
            </div>

            {/* Sections */}
            {exam.sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-2">
                        {section.title}
                    </h2>

                    {section.questions.map((question) => {
                        questionNumber++;
                        return (
                            <div
                                key={question.id}
                                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                            >
                                {/* Question header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="font-bold text-gray-500 w-8">Câu {questionNumber}.</span>
                                    <span className={`badge ${levelBadge(question.level)}`}>{question.level}</span>
                                    <span className="text-sm text-gray-400">({question.points} điểm)</span>
                                    {onRegenerateQuestion && (
                                        <button
                                            onClick={() => onRegenerateQuestion(question.id)}
                                            className="ml-auto p-1 text-gray-400 hover:text-primary-500"
                                            title="Sinh lại câu hỏi"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Question prompt */}
                                <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
                                    {question.prompt}
                                </p>

                                {/* MCQ options */}
                                {question.type === 'MCQ' && question.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                        {question.options.map((opt) => (
                                            <div
                                                key={opt.label}
                                                className={`p-2 rounded-lg border ${answersVisible && opt.label === question.answerKey
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <span className="font-medium mr-2">{opt.label}.</span>
                                                {opt.content}
                                                {answersVisible && opt.label === question.answerKey && (
                                                    <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TF items */}
                                {question.type === 'TF' && question.tfItems && (
                                    <div className="space-y-2 mb-3">
                                        {question.tfItems.map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className={`p-2 rounded-lg border flex items-center ${answersVisible
                                                    ? item.isTrue
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <span className="font-medium mr-3">{String.fromCharCode(97 + idx)})</span>
                                                <span className="flex-1">{item.statement}</span>
                                                {answersVisible && (
                                                    item.isTrue ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SHORT / ESSAY */}
                                {(question.type === 'SHORT' || question.type === 'ESSAY') && (
                                    <div className="mb-3">
                                        <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                            {question.type === 'SHORT' ? 'Trả lời ngắn...' : 'Bài làm tự luận...'}
                                        </div>
                                    </div>
                                )}

                                {/* Answer key */}
                                {answersVisible && (
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                            Đáp án: {question.answerKey}
                                        </p>
                                        {question.solution && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Hướng dẫn: {question.solution}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Sources */}
                                {sourcesVisible && question.sources.length > 0 && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => toggleSourceExpand(question.id)}
                                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            {expandedSources.has(question.id) ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                            {question.sources.length} nguồn trích dẫn
                                        </button>
                                        {expandedSources.has(question.id) && (
                                            <div className="mt-2 space-y-2">
                                                {question.sources.map((src, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
                                                    >
                                                        <span className="text-xs text-gray-400">[{src.chunkId}]</span>
                                                        <p className="italic text-gray-600 dark:text-gray-400">
                                                            "{src.quote}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Footer */}
            <div className="text-center text-sm text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
                Đề thi được tạo bởi Hệ thống Tạo Đề Thi Nhờ Sử Dụng Trí Tuệ Nhân Tạo - CV 7991/BGDĐT-GDTrH
            </div>
        </div>
    );
}
