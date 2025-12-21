// Chú thích: Golden tests cho Multi-Policy Validator
// Test merge policies, KTĐG mode, TN THPT mode

import { describe, test, expect } from 'vitest';

// Import từ policy-registry
import {
    getAllPolicies,
    getPolicyById,
    getPolicyByCode,
    getPoliciesByMode,
    mergePolicies,
    createPolicyPack,
    DEFAULT_PACKS,
} from '../src/policies/policy-registry';

describe('Policy Registry', () => {
    test('getAllPolicies returns 6 built-in policies', () => {
        const policies = getAllPolicies();
        expect(policies.length).toBe(6);
    });

    test('getPolicyById works', () => {
        const policy = getPolicyById('cv7991-2024');
        expect(policy).toBeDefined();
        expect(policy?.code).toBe('CV7991-2024');
    });

    test('getPolicyByCode works', () => {
        const policy = getPolicyByCode('TT32-2018');
        expect(policy).toBeDefined();
        expect(policy?.id).toBe('tt32-2018');
    });

    test('getPoliciesByMode returns correct policies', () => {
        const ktdg = getPoliciesByMode('school_assessment');
        expect(ktdg.length).toBeGreaterThanOrEqual(2); // cv7991, tt22

        const tnthpt = getPoliciesByMode('graduation_exam');
        expect(tnthpt.length).toBeGreaterThanOrEqual(2); // tt24, tn-thpt-2025
    });
});

describe('Policy Merge', () => {
    test('mergePolicies returns merged rules', () => {
        const result = mergePolicies(['tt32-2018', 'cv7991-2024']);

        expect(result.appliedPolicies).toContain('tt32-2018');
        expect(result.appliedPolicies).toContain('cv7991-2024');
        expect(result.rules).toBeDefined();
    });

    test('higher precedence policy overrides lower', () => {
        const result = mergePolicies(['tt32-2018', 'cv7991-2024']);

        // cv7991 should override base rules from tt32
        expect(result.rules.constraints).toBeDefined();
    });

    test('throws on empty policyIds', () => {
        expect(() => mergePolicies([])).toThrow('No valid policies found');
    });
});

describe('Policy Packs', () => {
    test('createPolicyPack creates valid pack', () => {
        const pack = createPolicyPack(
            'KTĐG Trường THPT Test',
            'school_assessment',
            'THPT',
            ['tt32-2018', 'cv7991-2024']
        );

        expect(pack.id).toBeDefined();
        expect(pack.name).toBe('KTĐG Trường THPT Test');
        expect(pack.resolvedRules).toBeDefined();
        expect(pack.policyIds.length).toBe(2);
    });

    test('DEFAULT_PACKS contain correct policy IDs', () => {
        expect(DEFAULT_PACKS.SCHOOL_ASSESSMENT_CV7991).toContain('cv7991-2024');
        expect(DEFAULT_PACKS.GRADUATION_EXAM_2025).toContain('tn-thpt-2025');
        expect(DEFAULT_PACKS.GRADUATION_EXAM_2025).toContain('tt24-2024');
    });
});

describe('Golden Tests - KTĐG Mode (CV 7991)', () => {
    const pack = createPolicyPack(
        'KTĐG Golden Test',
        'school_assessment',
        'THPT',
        DEFAULT_PACKS.SCHOOL_ASSESSMENT_CV7991
    );

    test('resolved rules have correct duration', () => {
        const duration = pack.resolvedRules.constraints?.duration;
        expect(duration).toBeDefined();
        if (typeof duration === 'object' && duration !== null) {
            expect((duration as { default: number }).default).toBe(60);
        }
    });

    test('resolved rules have score distribution', () => {
        const scores = pack.resolvedRules.constraints?.score_distribution;
        expect(scores).toBeDefined();
    });

    test('resolved rules have cognitive levels', () => {
        const levels = pack.resolvedRules.constraints?.cognitive_levels;
        expect(levels).toBeDefined();
    });

    test('question types include MCQ, TF, SHORT, ESSAY', () => {
        const types = pack.resolvedRules.question_types?.allowed;
        expect(types).toContain('MCQ');
        expect(types).toContain('TF');
        expect(types).toContain('SHORT');
        expect(types).toContain('ESSAY');
    });
});

describe('Golden Tests - TN THPT 2025 Mode', () => {
    const pack = createPolicyPack(
        'TN THPT 2025 Golden Test',
        'graduation_exam',
        'THPT',
        DEFAULT_PACKS.GRADUATION_EXAM_2025
    );

    test('resolved rules have by_subject durations', () => {
        const duration = pack.resolvedRules.constraints?.duration;
        expect(duration).toBeDefined();

        if (typeof duration === 'object' && duration !== null) {
            const bySubject = (duration as { by_subject?: Record<string, number> }).by_subject;
            if (bySubject) {
                expect(bySubject['Toán']).toBe(90);
                expect(bySubject['Ngữ văn']).toBe(120);
            }
        }
    });

    test('resolved rules have question counts', () => {
        const counts = pack.resolvedRules.constraints?.question_counts;
        expect(counts).toBeDefined();
    });

    test('question types include TN 3 dạng mới', () => {
        const types = pack.resolvedRules.question_types?.allowed;
        expect(types).toContain('MCQ');
        expect(types).toContain('TF');
    });

    test('TF items count is 4', () => {
        const tfCount = pack.resolvedRules.question_types?.tf_items_count;
        expect(tfCount).toBe(4);
    });
});
