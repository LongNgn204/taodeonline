import { describe, it, expect } from 'vitest';
import { TN2025Validator } from '../src/validator/tn2025';
import { ExamCandidate } from '../src/validator/base';
import fixtureRaw from './fixtures/tn2025_math_pass.json';

const fixture = fixtureRaw as unknown as ExamCandidate;

describe('TN2025Validator', () => {
    const validator = new TN2025Validator();

    it('should pass for a valid Math 2025 exam fixture', async () => {
        const result = await validator.validate(fixture);
        expect(result.isValid).toBe(true);
        expect(result.complianceEvidence).toBeDefined();
        // Check specific evidence
        const durationCheck = result.complianceEvidence?.find(e => e.policyId === 'RULE_TIME_MATH');
        expect(durationCheck?.status).toBe('PASSED');
    });

    it('should fail if duration is incorrect', async () => {
        const badFixture = { ...fixture, duration: 60 };
        const result = await validator.validate(badFixture);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_DURATION');
    });

    it('should fail if total questions is incorrect', async () => {
        const badFixture = { ...fixture, parts: [fixture.parts[0]] }; // Missing parts
        const result = await validator.validate(badFixture);
        expect(result.isValid).toBe(false);
    })
});
