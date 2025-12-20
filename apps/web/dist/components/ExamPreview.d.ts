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
export default function ExamPreview({ exam, showAnswers, showSources, onRegenerateQuestion, }: ExamPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExamPreview.d.ts.map