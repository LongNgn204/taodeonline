// Chú thích: Policy Registry - quản lý và load các văn bản pháp lý
// Hỗ trợ merge policies theo precedence hierarchy

// Import các policy JSON tĩnh
import tt32_2018 from './tt32-2018.json';
import tt22_2021 from './tt22-2021.json';
import tt17_2025 from './tt17-2025.json';
import tt24_2024 from './tt24-2024.json';
import cv7991_2024 from './cv7991-2024.json';
import tn_thpt_2025 from './tn-thpt-2025.json';

// Type definitions inline để tránh circular dependencies
type Issuer = 'MOE' | 'DOE' | 'School';

const ISSUER_PRECEDENCE: Record<Issuer, number> = {
    MOE: 10,
    DOE: 20,
    School: 30,
};

// PolicyRules type inline
interface PolicyRules {
    constraints: Record<string, unknown>;
    question_types: Record<string, unknown>;
    matrix_template?: unknown;
}

// PolicyDocument type inline
interface PolicyDocument {
    id: string;
    code: string;
    title: string;
    issuer: Issuer;
    issuedDate: string;
    effectiveFrom: string;
    effectiveTo?: string;
    scope: string[];
    mode: string;
    rules: PolicyRules;
    evidenceRefs?: unknown[];
    summary?: string;
}

// Registry các policy có sẵn
const BUILTIN_POLICIES: PolicyDocument[] = [
    tt32_2018 as PolicyDocument,
    tt22_2021 as PolicyDocument,
    tt17_2025 as PolicyDocument,
    tt24_2024 as PolicyDocument,
    cv7991_2024 as PolicyDocument,
    tn_thpt_2025 as PolicyDocument,
];

/**
 * Lấy tất cả policies
 */
export function getAllPolicies(): PolicyDocument[] {
    return [...BUILTIN_POLICIES];
}

/**
 * Lấy policy theo ID
 */
export function getPolicyById(id: string): PolicyDocument | undefined {
    return BUILTIN_POLICIES.find(p => p.id === id);
}

/**
 * Lấy policy theo code (vd: "CV7991-2024")
 */
export function getPolicyByCode(code: string): PolicyDocument | undefined {
    return BUILTIN_POLICIES.find(p => p.code === code);
}

/**
 * Lấy policies theo mode
 */
export function getPoliciesByMode(mode: string): PolicyDocument[] {
    return BUILTIN_POLICIES.filter(p => p.mode === mode);
}

/**
 * Lấy policies đang có hiệu lực tính đến ngày
 */
export function getEffectivePolicies(asOfDate?: string): PolicyDocument[] {
    const checkDate = asOfDate || new Date().toISOString().split('T')[0];

    return BUILTIN_POLICIES.filter(p => {
        const effective = p.effectiveFrom <= checkDate;
        const notExpired = !p.effectiveTo || p.effectiveTo >= checkDate;
        return effective && notExpired;
    });
}

// Hàm deep merge cho objects
function deepMerge<T extends object>(base: T, override: Partial<T>): T {
    const result = { ...base };

    for (const key in override) {
        const overrideValue = override[key];
        const baseValue = result[key];

        if (
            overrideValue !== undefined &&
            typeof overrideValue === 'object' &&
            overrideValue !== null &&
            !Array.isArray(overrideValue) &&
            typeof baseValue === 'object' &&
            baseValue !== null &&
            !Array.isArray(baseValue)
        ) {
            // Recursive merge cho nested objects
            result[key] = deepMerge(baseValue as object, overrideValue as object) as T[Extract<keyof T, string>];
        } else if (overrideValue !== undefined) {
            // Override trực tiếp
            result[key] = overrideValue as T[Extract<keyof T, string>];
        }
    }

    return result;
}

/**
 * Conflict khi merge policies
 */
export interface MergeConflict {
    field: string;
    values: { policyId: string; value: unknown }[];
    resolution: string;
}

/**
 * Kết quả merge policies
 */
export interface MergeResult {
    rules: PolicyRules;
    conflicts: MergeConflict[];
    appliedPolicies: string[];
}

/**
 * Merge nhiều policies theo precedence
 * Policies có precedence cao hơn sẽ override policies thấp hơn
 */
export function mergePolicies(policyIds: string[]): MergeResult {
    const conflicts: MergeConflict[] = [];
    const appliedPolicies: string[] = [];

    // Lấy và sort policies theo precedence (thấp đến cao)
    const policies = policyIds
        .map(id => getPolicyById(id))
        .filter((p): p is PolicyDocument => p !== undefined)
        .sort((a, b) => ISSUER_PRECEDENCE[a.issuer] - ISSUER_PRECEDENCE[b.issuer]);

    if (policies.length === 0) {
        throw new Error('No valid policies found');
    }

    // Base rules từ policy đầu tiên
    let mergedRules: PolicyRules = JSON.parse(JSON.stringify(policies[0].rules));
    appliedPolicies.push(policies[0].id);

    // Merge từng policy tiếp theo
    for (let i = 1; i < policies.length; i++) {
        const policy = policies[i];
        appliedPolicies.push(policy.id);

        // Merge constraints
        mergedRules.constraints = deepMerge(
            mergedRules.constraints,
            policy.rules.constraints
        );

        // Merge question_types
        mergedRules.question_types = deepMerge(
            mergedRules.question_types,
            policy.rules.question_types
        );

        // Matrix template: replace hoàn toàn nếu có
        if (policy.rules.matrix_template) {
            mergedRules.matrix_template = policy.rules.matrix_template;
        }
    }

    return {
        rules: mergedRules,
        conflicts,
        appliedPolicies,
    };
}

/**
 * Tạo Policy Pack từ danh sách policy IDs
 */
export function createPolicyPack(
    name: string,
    mode: string,
    scope: string,
    policyIds: string[]
): {
    id: string;
    name: string;
    mode: string;
    scope: string;
    policyIds: string[];
    resolvedRules: PolicyRules;
    conflicts: MergeConflict[];
    createdAt: string;
    updatedAt: string;
} {
    const mergeResult = mergePolicies(policyIds);
    const now = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        name,
        mode,
        scope,
        policyIds,
        resolvedRules: mergeResult.rules,
        conflicts: mergeResult.conflicts,
        createdAt: now,
        updatedAt: now,
    };
}

// Default packs cho convenience
export const DEFAULT_PACKS = {
    // Pack cho KTĐG trong trường theo CV7991
    SCHOOL_ASSESSMENT_CV7991: ['tt32-2018', 'tt22-2021', 'cv7991-2024'],

    // Pack cho TN THPT 2025
    GRADUATION_EXAM_2025: ['tt32-2018', 'tt17-2025', 'tt24-2024', 'tn-thpt-2025'],
};
