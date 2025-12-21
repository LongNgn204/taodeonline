// Chú thích: Policy/Blueprint engine - resolve policy pack, derive constraints, validate outputs

import { safeJsonParse, type Matrix, type MatrixConstraints, type ExamContent } from '@exam-matrix/shared';
import { BlueprintSchema } from '@exam-matrix/core';
import { z } from 'zod';

export type ExamMode = 'SCHOOL_ASSESSMENT' | 'GRADUATION_2025';

type Blueprint = z.infer<typeof BlueprintSchema>;

type PolicyRules = {
    constraints?: {
        duration_minutes?: {
            by_subject?: Record<string, number>;
            default?: number;
        };
        question_counts?: {
            by_subject?: Record<string, number>;
        };
        total_score?: number;
        level_percent?: {
            NB?: number;
            TH?: number;
            VD?: number;
        };
    };
    question_types?: {
        allowed?: {
            by_subject?: Record<string, string[]>;
            default?: string[];
        };
    };
    matrix_template?: {
        summary?: {
            MCQ?: { count?: number; points?: number };
            TF?: { count?: number; points?: number };
            SHORT?: { count?: number; points?: number };
            ESSAY?: { count?: number; points?: number };
            levelPercent?: { NB?: number; TH?: number; VD?: number };
        };
    };
};

export type MatrixPolicySummary = {
    totalScore: number;
    durationMinutes: number;
    levelPercent: { NB: number; TH: number; VD: number };
    summary: {
        MCQ: { count: number; points: number };
        TF: { count: number; points: number };
        SHORT: { count: number; points: number };
        ESSAY: { count: number; points: number };
    };
    allowedQuestionTypes: string[];
};

export type PolicyContext = {
    mode: ExamMode;
    packId?: string;
    rules: PolicyRules;
    blueprint?: Blueprint | null;
    matrixPolicySummary: MatrixPolicySummary;
    matrixPolicyText: string;
    examPolicyText: string;
    matrixConstraints: MatrixConstraints;
};

const DEFAULT_MATRIX_POLICY: MatrixPolicySummary = {
    totalScore: 10,
    durationMinutes: 60,
    levelPercent: { NB: 40, TH: 30, VD: 30 },
    summary: {
        MCQ: { count: 12, points: 3 },
        TF: { count: 4, points: 2 },
        SHORT: { count: 4, points: 2 },
        ESSAY: { count: 2, points: 3 },
    },
    allowedQuestionTypes: ['MCQ', 'TF', 'SHORT', 'ESSAY'],
};

const SUBJECT_MAP: Record<string, string> = {
    'Toán': 'MATH',
    'Toan': 'MATH',
    'Ngữ văn': 'LITERATURE',
    'Ngu van': 'LITERATURE',
    'Văn': 'LITERATURE',
    'Van': 'LITERATURE',
    'Tiếng Anh': 'ENGLISH',
    'Tieng Anh': 'ENGLISH',
    'Anh': 'ENGLISH',
    'Vật lý': 'PHYSICS',
    'Vat ly': 'PHYSICS',
    'Lý': 'PHYSICS',
    'Ly': 'PHYSICS',
    'Hóa': 'CHEMISTRY',
    'Hoa': 'CHEMISTRY',
    'Sinh': 'BIOLOGY',
    'Lịch sử': 'HISTORY',
    'Lich su': 'HISTORY',
    'Sử': 'HISTORY',
    'Su': 'HISTORY',
    'Địa': 'GEOGRAPHY',
    'Dia': 'GEOGRAPHY',
    'GDCD': 'CIVIC_EDUCATION',
    'Giáo dục công dân': 'CIVIC_EDUCATION',
    'Giao duc cong dan': 'CIVIC_EDUCATION',
};

function normalizeSubjectKey(subject: string) {
    return SUBJECT_MAP[subject] || subject.toUpperCase().replace(/\s+/g, '_');
}

function normalizeMode(mode?: string | null): ExamMode {
    if (!mode) return 'SCHOOL_ASSESSMENT';
    const normalized = mode.toUpperCase();
    if (normalized.includes('GRADUATION')) return 'GRADUATION_2025';
    if (normalized.includes('SCHOOL')) return 'SCHOOL_ASSESSMENT';
    if (normalized.includes('ASSESSMENT')) return 'SCHOOL_ASSESSMENT';
    return 'SCHOOL_ASSESSMENT';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
    const output = { ...target };
    for (const [key, value] of Object.entries(source)) {
        if (isPlainObject(value) && isPlainObject(output[key])) {
            output[key] = deepMerge(output[key] as Record<string, unknown>, value as Record<string, unknown>);
        } else {
            output[key] = value;
        }
    }
    return output;
}

export async function resolvePolicyPack(db: D1Database, packId?: string) {
    if (!packId) return null;

    const pack = await db.prepare('SELECT * FROM policy_packs WHERE id = ?')
        .bind(packId)
        .first<{ id: string; mode: string }>();

    if (!pack) return null;

    const items = await db.prepare(
        `SELECT p.rules_json, p.evidence_json, ppi.override_strategy
         FROM policy_pack_items ppi
         JOIN policies p ON ppi.policy_id = p.id
         WHERE ppi.pack_id = ?
         ORDER BY ppi.precedence ASC`
    )
        .bind(packId)
        .all<{ rules_json: string; evidence_json: string; override_strategy: string }>();

    let mergedRules: Record<string, unknown> = {};
    const evidenceMap: Record<string, unknown> = {};

    for (const item of items.results || []) {
        if (item.override_strategy === 'disable') continue;

        const rules = safeJsonParse<Record<string, unknown>>(item.rules_json, {});
        const evidence = safeJsonParse<Record<string, unknown>>(item.evidence_json, {});

        if (item.override_strategy === 'override') {
            mergedRules = { ...mergedRules, ...rules };
        } else {
            mergedRules = deepMerge(mergedRules, rules);
        }

        Object.assign(evidenceMap, evidence);
    }

    return {
        packId: pack.id,
        mode: normalizeMode(pack.mode),
        rules: mergedRules as PolicyRules,
        evidenceMap,
    };
}

export async function loadBlueprint(
    db: D1Database,
    mode: ExamMode,
    subject: string,
    blueprintId?: string
) {
    if (blueprintId) {
        const row = await db.prepare('SELECT blueprint_json FROM exam_blueprints WHERE id = ?')
            .bind(blueprintId)
            .first<{ blueprint_json: string }>();
        if (!row) return null;
        const parsed = safeJsonParse(row.blueprint_json, null);
        return parsed ? BlueprintSchema.parse(parsed) : null;
    }

    const subjectKey = normalizeSubjectKey(subject);
    const row = await db.prepare(
        'SELECT blueprint_json FROM exam_blueprints WHERE mode = ? AND subject = ? ORDER BY created_at DESC LIMIT 1'
    )
        .bind(mode, subjectKey)
        .first<{ blueprint_json: string }>();

    if (!row) return null;
    const parsed = safeJsonParse(row.blueprint_json, null);
    return parsed ? BlueprintSchema.parse(parsed) : null;
}

function applySummaryOverrides(
    base: MatrixPolicySummary['summary'],
    overrides?: PolicyRules['matrix_template']
) {
    if (!overrides?.summary) return base;

    return {
        MCQ: {
            count: overrides.summary.MCQ?.count ?? base.MCQ.count,
            points: overrides.summary.MCQ?.points ?? base.MCQ.points,
        },
        TF: {
            count: overrides.summary.TF?.count ?? base.TF.count,
            points: overrides.summary.TF?.points ?? base.TF.points,
        },
        SHORT: {
            count: overrides.summary.SHORT?.count ?? base.SHORT.count,
            points: overrides.summary.SHORT?.points ?? base.SHORT.points,
        },
        ESSAY: {
            count: overrides.summary.ESSAY?.count ?? base.ESSAY.count,
            points: overrides.summary.ESSAY?.points ?? base.ESSAY.points,
        },
    };
}

function summaryFromBlueprint(blueprint: Blueprint) {
    const summary = {
        MCQ: { count: 0, points: 0 },
        TF: { count: 0, points: 0 },
        SHORT: { count: 0, points: 0 },
        ESSAY: { count: 0, points: 0 },
    };

    for (const section of blueprint.sections) {
        const type = mapBlueprintType(section.question_type ?? 'MCQ_SINGLE');
        summary[type].count += section.count;
        if (section.score_per_question !== undefined) {
            summary[type].points += section.count * section.score_per_question;
        }
    }

    return summary;
}

function mapBlueprintType(type: string) {
    switch (type) {
        case 'MCQ_SINGLE':
            return 'MCQ';
        case 'TRUE_FALSE_4':
            return 'TF';
        case 'SHORT_ANSWER':
            return 'SHORT';
        case 'ESSAY':
            return 'ESSAY';
        default:
            return 'MCQ';
    }
}

function resolveAllowedTypes(rules: PolicyRules, subjectKey: string, blueprint?: Blueprint | null) {
    const allowedFromRules =
        rules.question_types?.allowed?.by_subject?.[subjectKey] ||
        rules.question_types?.allowed?.default;

    if (allowedFromRules && allowedFromRules.length > 0) {
        return allowedFromRules;
    }

    if (blueprint) {
        return [...new Set(blueprint.sections.map((s) => mapBlueprintType(s.question_type ?? 'MCQ_SINGLE')))];
    }

    return DEFAULT_MATRIX_POLICY.allowedQuestionTypes;
}

function resolveDuration(
    rules: PolicyRules,
    subjectKey: string,
    fallback: number,
    blueprint?: Blueprint | null
) {
    return (
        rules.constraints?.duration_minutes?.by_subject?.[subjectKey] ||
        rules.constraints?.duration_minutes?.default ||
        blueprint?.duration_minutes ||
        fallback
    );
}

function resolveLevelPercent(rules: PolicyRules) {
    const fromRules = rules.constraints?.level_percent || rules.matrix_template?.summary?.levelPercent;
    if (fromRules?.NB !== undefined && fromRules?.TH !== undefined && fromRules?.VD !== undefined) {
        return {
            NB: fromRules.NB,
            TH: fromRules.TH,
            VD: fromRules.VD,
        };
    }

    return DEFAULT_MATRIX_POLICY.levelPercent;
}

export async function buildPolicyContext(input: {
    db: D1Database;
    packId?: string;
    examMode?: ExamMode | string;
    subject: string;
    grade: number;
    numTopics: number;
    scope?: string[];
    fallbackDuration: number;
    blueprintId?: string;
}) {
    const resolvedPack = await resolvePolicyPack(input.db, input.packId);
    const mode = resolvedPack?.mode || normalizeMode(input.examMode);
    const rules = resolvedPack?.rules || {};
    const blueprint = await loadBlueprint(input.db, mode, input.subject, input.blueprintId);
    const subjectKey = normalizeSubjectKey(input.subject);

    const baseSummary = blueprint ? summaryFromBlueprint(blueprint) : DEFAULT_MATRIX_POLICY.summary;
    const summary = applySummaryOverrides(baseSummary, rules.matrix_template);
    const durationMinutes = resolveDuration(rules, subjectKey, input.fallbackDuration, blueprint);
    const levelPercent = resolveLevelPercent(rules);
    const totalScore = rules.constraints?.total_score ?? DEFAULT_MATRIX_POLICY.totalScore;
    const allowedQuestionTypes = resolveAllowedTypes(rules, subjectKey, blueprint);

    const matrixPolicySummary: MatrixPolicySummary = {
        totalScore,
        durationMinutes,
        levelPercent,
        summary,
        allowedQuestionTypes,
    };

    const matrixConstraints: MatrixConstraints = {
        subject: input.subject,
        grade: input.grade,
        duration: durationMinutes,
        numTopics: input.numTopics,
        scope: input.scope,
    };

    const matrixPolicyText = formatMatrixPolicyText(matrixPolicySummary, mode, blueprint);
    const examPolicyText = formatExamPolicyText(matrixPolicySummary, mode, blueprint);

    return {
        mode,
        packId: resolvedPack?.packId,
        rules,
        blueprint,
        matrixPolicySummary,
        matrixPolicyText,
        examPolicyText,
        matrixConstraints,
    } satisfies PolicyContext;
}

export function formatMatrixPolicyText(
    summary: MatrixPolicySummary,
    mode: ExamMode,
    blueprint?: Blueprint | null
) {
    const parts = [
        `- Chế độ: ${mode === 'GRADUATION_2025' ? 'TN THPT 2025' : 'KTĐG trong trường'}`,
        `- Tổng điểm: ${summary.totalScore}`,
        `- Thời gian: ${summary.durationMinutes} phút`,
        `- Phân bổ: MCQ ${summary.summary.MCQ.points}đ (${summary.summary.MCQ.count} câu), TF ${summary.summary.TF.points}đ (${summary.summary.TF.count} câu), SHORT ${summary.summary.SHORT.points}đ (${summary.summary.SHORT.count} câu), ESSAY ${summary.summary.ESSAY.points}đ (${summary.summary.ESSAY.count} câu)`,
        `- Tỷ lệ mức độ: NB ${summary.levelPercent.NB}% / TH ${summary.levelPercent.TH}% / VD ${summary.levelPercent.VD}%`,
        `- Loại câu hỏi cho phép: ${summary.allowedQuestionTypes.join(', ')}`,
    ];

    if (blueprint) {
        parts.push(`- Blueprint: ${blueprint.sections.map((s) => `${s.title} (${s.question_type ?? 'MCQ_SINGLE'} - ${s.count})`).join('; ')}`);
    }

    return parts.join('\n');
}

export function formatExamPolicyText(
    summary: MatrixPolicySummary,
    mode: ExamMode,
    blueprint?: Blueprint | null
) {
    const parts = [
        `- Chế độ: ${mode === 'GRADUATION_2025' ? 'TN THPT 2025' : 'KTĐG trong trường'}`,
        `- Thời gian: ${summary.durationMinutes} phút`,
        `- Tổng điểm: ${summary.totalScore}`,
        `- Loại câu hỏi cho phép: ${summary.allowedQuestionTypes.join(', ')}`,
    ];

    if (blueprint) {
        parts.push(`- Cấu trúc đề (blueprint): ${blueprint.sections.map((s) => `${s.title} (${s.question_type ?? 'MCQ_SINGLE'} - ${s.count})`).join('; ')}`);
    } else {
        parts.push(`- Cấu trúc theo ma trận: MCQ ${summary.summary.MCQ.count}, TF ${summary.summary.TF.count}, SHORT ${summary.summary.SHORT.count}, ESSAY ${summary.summary.ESSAY.count}`);
    }

    return parts.join('\n');
}

export function validateMatrixAgainstPolicy(matrix: Matrix, policy: MatrixPolicySummary) {
    const errors: string[] = [];

    if (matrix.totalScore !== policy.totalScore) {
        errors.push(`Tổng điểm = ${matrix.totalScore}, phải = ${policy.totalScore}`);
    }

    if (matrix.duration !== policy.durationMinutes) {
        errors.push(`Thời gian = ${matrix.duration} phút, phải = ${policy.durationMinutes} phút`);
    }

    const summaryRules = policy.summary;
    if (matrix.summary.MCQ.count !== summaryRules.MCQ.count) {
        errors.push(`MCQ count = ${matrix.summary.MCQ.count}, phải = ${summaryRules.MCQ.count}`);
    }
    if (matrix.summary.TF.count !== summaryRules.TF.count) {
        errors.push(`TF count = ${matrix.summary.TF.count}, phải = ${summaryRules.TF.count}`);
    }
    if (matrix.summary.SHORT.count !== summaryRules.SHORT.count) {
        errors.push(`SHORT count = ${matrix.summary.SHORT.count}, phải = ${summaryRules.SHORT.count}`);
    }
    if (matrix.summary.ESSAY.count !== summaryRules.ESSAY.count) {
        errors.push(`ESSAY count = ${matrix.summary.ESSAY.count}, phải = ${summaryRules.ESSAY.count}`);
    }

    if (summaryRules.MCQ.points > 0 && matrix.summary.MCQ.points !== summaryRules.MCQ.points) {
        errors.push(`MCQ điểm = ${matrix.summary.MCQ.points}, phải = ${summaryRules.MCQ.points}`);
    }
    if (summaryRules.TF.points > 0 && matrix.summary.TF.points !== summaryRules.TF.points) {
        errors.push(`TF điểm = ${matrix.summary.TF.points}, phải = ${summaryRules.TF.points}`);
    }
    if (summaryRules.SHORT.points > 0 && matrix.summary.SHORT.points !== summaryRules.SHORT.points) {
        errors.push(`SHORT điểm = ${matrix.summary.SHORT.points}, phải = ${summaryRules.SHORT.points}`);
    }
    if (summaryRules.ESSAY.points > 0 && matrix.summary.ESSAY.points !== summaryRules.ESSAY.points) {
        errors.push(`ESSAY điểm = ${matrix.summary.ESSAY.points}, phải = ${summaryRules.ESSAY.points}`);
    }

    if (matrix.summary.levelPercent.NB !== policy.levelPercent.NB) errors.push(`NB phải = ${policy.levelPercent.NB}%`);
    if (matrix.summary.levelPercent.TH !== policy.levelPercent.TH) errors.push(`TH phải = ${policy.levelPercent.TH}%`);
    if (matrix.summary.levelPercent.VD !== policy.levelPercent.VD) errors.push(`VD phải = ${policy.levelPercent.VD}%`);

    const totalPercent = matrix.topics.reduce((sum, t) => sum + t.percentScore, 0);
    if (totalPercent !== 100) {
        errors.push(`Tổng % chủ đề = ${totalPercent}%, phải = 100%`);
    }

    return { valid: errors.length === 0, errors };
}

export function validateExamAgainstPolicy(
    exam: ExamContent,
    policy: MatrixPolicySummary,
    blueprint?: Blueprint | null
) {
    const errors: string[] = [];

    if (exam.duration !== policy.durationMinutes) {
        errors.push(`Thời gian đề = ${exam.duration} phút, phải = ${policy.durationMinutes} phút`);
    }

    const counts = {
        MCQ: 0,
        TF: 0,
        SHORT: 0,
        ESSAY: 0,
    };

    for (const section of exam.sections) {
        if (section.type === 'MCQ') counts.MCQ += section.questions.length;
        if (section.type === 'TF') counts.TF += section.questions.length;
        if (section.type === 'SHORT') counts.SHORT += section.questions.length;
        if (section.type === 'ESSAY') counts.ESSAY += section.questions.length;
    }

    if (counts.MCQ !== policy.summary.MCQ.count) errors.push(`MCQ count = ${counts.MCQ}, phải = ${policy.summary.MCQ.count}`);
    if (counts.TF !== policy.summary.TF.count) errors.push(`TF count = ${counts.TF}, phải = ${policy.summary.TF.count}`);
    if (counts.SHORT !== policy.summary.SHORT.count) errors.push(`SHORT count = ${counts.SHORT}, phải = ${policy.summary.SHORT.count}`);
    if (counts.ESSAY !== policy.summary.ESSAY.count) errors.push(`ESSAY count = ${counts.ESSAY}, phải = ${policy.summary.ESSAY.count}`);

    if (blueprint) {
        const expectedTypes = new Set(blueprint.sections.map((s) => mapBlueprintType(s.question_type ?? 'MCQ_SINGLE')));
        for (const section of exam.sections) {
            if (!expectedTypes.has(section.type)) {
                errors.push(`Section type ${section.type} không nằm trong blueprint`);
            }
        }
    }

    return { valid: errors.length === 0, errors };
}
