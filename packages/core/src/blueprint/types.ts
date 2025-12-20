export interface Blueprint {
    id: string;
    name: string;
    packId?: string; // Links to Policy Pack
    structure: BlueprintStructure;
    constraints?: BlueprintConstraints;
}

export interface BlueprintStructure {
    parts: BlueprintPart[];
}

export interface BlueprintPart {
    name: string; // e.g., "Phần 1: Trắc nghiệm"
    type: 'MCQ_4' | 'TF_4' | 'SHORT_ANS' | 'ESSAY';
    questionCount: number;
    scorePerQuestion?: number; // Điểm từng câu
    totalScore?: number;
    topics?: string[]; // Allowed topics
}

export interface BlueprintConstraints {
    levels?: {
        NB: number; // % or count
        TH: number;
        VD: number;
        VDC: number;
    };
    difficultyDistribution?: number[]; // [NB, TH, VD, VDC] e.g [4, 3, 2, 1]
    excludedTopics?: string[];
}

// Input to generation pipeline
export interface ExamSpec {
    blueprintId: string;
    subject: string;
    topicIds: string[]; // Content to cover
    mode: 'TN_2025' | 'KTDG';
    seed?: number;
}
