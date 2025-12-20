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
        MCQ: {
            count: number;
            points: number;
        };
        TF: {
            count: number;
            points: number;
        };
        SHORT: {
            count: number;
            points: number;
        };
        ESSAY: {
            count: number;
            points: number;
        };
        levelPercent: {
            NB: number;
            TH: number;
            VD: number;
        };
        totalByLevel: {
            NB: {
                count: number;
                points: number;
            };
            TH: {
                count: number;
                points: number;
            };
            VD: {
                count: number;
                points: number;
            };
        };
    };
}
interface MatrixEditorProps {
    matrix: Matrix;
    onChange: (matrix: Matrix) => void;
    readOnly?: boolean;
}
export default function MatrixEditor({ matrix, onChange, readOnly }: MatrixEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MatrixEditor.d.ts.map