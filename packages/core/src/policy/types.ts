export interface Policy {
    id: string;
    code: string; // RULE_...
    description: string;
    type: 'CONSTRAINT' | 'FORMAT' | 'STRUCTURE';
    logic: any; // JSON Logic rule or custom function reference
}

export interface PolicyPack {
    id: string;
    policies: Policy[];
    mode: 'TN_2025' | 'KTDG';
}
