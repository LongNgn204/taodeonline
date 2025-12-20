export interface Rubric {
    id: string;
    criteria: RubricCriterion[];
}

export interface RubricCriterion {
    description: string;
    maxScore: number;
    level?: 'NB' | 'TH' | 'VD' | 'VDC';
}
