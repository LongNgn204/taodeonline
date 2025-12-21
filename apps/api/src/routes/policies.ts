// Chú thích: API routes cho Policy Documents
// CRUD policies và resolve policy packs

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// Built-in policies data (từ core package)
const BUILTIN_POLICIES = [
    {
        id: 'tt32-2018',
        code: 'TT32-2018',
        title: 'Thông tư 32/2018 - CTGDPT 2018',
        issuer: 'MOE',
        mode: 'curriculum',
        effectiveFrom: '2019-02-15',
        summary: 'Chương trình giáo dục phổ thông 2018 baseline',
    },
    {
        id: 'tt22-2021',
        code: 'TT22-2021',
        title: 'Thông tư 22/2021 - Quy định KTĐG THCS/THPT',
        issuer: 'MOE',
        mode: 'school_assessment',
        effectiveFrom: '2021-09-05',
        summary: 'Quy định đánh giá học sinh THCS và THPT',
    },
    {
        id: 'tt17-2025',
        code: 'TT17-2025',
        title: 'Thông tư 17/2025 - Sửa đổi CTGDPT',
        issuer: 'MOE',
        mode: 'curriculum',
        effectiveFrom: '2025-09-12',
        summary: 'Sửa đổi, bổ sung CTGDPT 2018',
    },
    {
        id: 'tt24-2024',
        code: 'TT24-2024',
        title: 'Thông tư 24/2024 - Quy chế TN THPT',
        issuer: 'MOE',
        mode: 'graduation_exam',
        effectiveFrom: '2025-02-08',
        summary: 'Quy chế thi TN THPT từ 2025',
    },
    {
        id: 'cv7991-2024',
        code: 'CV7991-2024',
        title: 'Công văn 7991 - Hướng dẫn KTĐG định kỳ',
        issuer: 'MOE',
        mode: 'school_assessment',
        effectiveFrom: '2025-01-01',
        summary: 'Đề 60 phút: TN 7đ (MCQ 3đ + Đ/S 2đ + TLN 2đ), TL 3đ. Tỷ lệ 40/30/30.',
        rules: {
            constraints: {
                duration: { default: 60 },
                score_distribution: { MCQ: 3, TF: 2, SHORT: 2, ESSAY: 3 },
                total_score: 10,
                cognitive_levels: { NB: 40, TH: 30, VD: 30 },
            },
            question_types: {
                allowed: ['MCQ', 'TF', 'SHORT', 'ESSAY'],
                tf_items_count: 4,
            },
        },
    },
    {
        id: 'tn-thpt-2025',
        code: 'TN-THPT-2025',
        title: 'Cấu trúc đề thi TN THPT 2025',
        issuer: 'MOE',
        mode: 'graduation_exam',
        effectiveFrom: '2025-01-01',
        summary: 'Toán 90\' 34 câu, Ngoại ngữ 50\' 40 câu, 3 dạng trắc nghiệm mới.',
        rules: {
            constraints: {
                duration: {
                    by_subject: { 'Ngữ văn': 120, 'Toán': 90, default: 50 },
                },
                question_counts: {
                    by_subject: { 'Toán': 34, 'Tiếng Anh': 40, default: 40 },
                },
                total_score: 10,
            },
            question_types: {
                allowed: ['MCQ', 'TF', 'SHORT', 'ESSAY'],
                tf_items_count: 4,
            },
        },
    },
];

// Issuer precedence cho merge
const ISSUER_PRECEDENCE: Record<string, number> = {
    MOE: 10,
    DOE: 20,
    School: 30,
};

/**
 * GET /policies - List all policies
 */
app.get('/', async (c) => {
    const mode = c.req.query('mode');

    let policies = [...BUILTIN_POLICIES];

    // Filter by mode if specified
    if (mode) {
        policies = policies.filter(p => p.mode === mode || p.mode === 'curriculum');
    }

    // Group by issuer
    const grouped: Record<string, typeof BUILTIN_POLICIES> = {};
    for (const p of policies) {
        if (!grouped[p.issuer]) grouped[p.issuer] = [];
        grouped[p.issuer].push(p);
    }

    return c.json({
        policies,
        grouped,
        total: policies.length,
    });
});

/**
 * GET /policies/:id - Get policy detail
 */
app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const policy = BUILTIN_POLICIES.find(p => p.id === id);

    if (!policy) {
        return c.json({ error: 'Policy not found' }, 404);
    }

    return c.json({ policy });
});

/**
 * POST /policies/resolve - Resolve policy pack (merge rules)
 */
app.post('/resolve', async (c) => {
    const body = await c.req.json<{ policyIds: string[] }>();
    const { policyIds } = body;

    if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
        return c.json({ error: 'policyIds array required' }, 400);
    }

    // Get policies and sort by precedence
    const policies = policyIds
        .map(id => BUILTIN_POLICIES.find(p => p.id === id))
        .filter((p): p is (typeof BUILTIN_POLICIES)[0] => p !== undefined)
        .sort((a, b) => ISSUER_PRECEDENCE[a.issuer] - ISSUER_PRECEDENCE[b.issuer]);

    if (policies.length === 0) {
        return c.json({ error: 'No valid policies found' }, 400);
    }

    // Merge rules - higher precedence overrides
    interface MergedRules {
        constraints: Record<string, unknown>;
        question_types: Record<string, unknown>;
    }

    let mergedRules: MergedRules = { constraints: {}, question_types: {} };
    const appliedPolicies: string[] = [];

    for (const policy of policies) {
        appliedPolicies.push(policy.id);

        if ('rules' in policy && policy.rules) {
            const rules = policy.rules as MergedRules;
            // Deep merge constraints
            mergedRules.constraints = { ...mergedRules.constraints, ...rules.constraints };
            mergedRules.question_types = { ...mergedRules.question_types, ...rules.question_types };
        }
    }

    return c.json({
        resolvedRules: mergedRules,
        appliedPolicies,
        conflicts: [], // TODO: detect actual conflicts
    });
});

/**
 * GET /policies/defaults/:mode - Get default policy pack for mode
 */
app.get('/defaults/:mode', async (c) => {
    const mode = c.req.param('mode');

    const defaults: Record<string, string[]> = {
        school_assessment: ['tt32-2018', 'tt22-2021', 'cv7991-2024'],
        graduation_exam: ['tt32-2018', 'tt17-2025', 'tt24-2024', 'tn-thpt-2025'],
    };

    const policyIds = defaults[mode];
    if (!policyIds) {
        return c.json({ error: 'Invalid mode' }, 400);
    }

    const policies = policyIds
        .map(id => BUILTIN_POLICIES.find(p => p.id === id))
        .filter(Boolean);

    return c.json({
        mode,
        policyIds,
        policies,
    });
});

export const policyRoutes = app;
export default app;
