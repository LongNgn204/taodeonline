import { Policy, PolicyPack } from './types';
import { ExamCandidate, ValidationResult, ValidationError } from '../validator/base';

export class PolicyEngine {
    constructor(private packs: Map<string, PolicyPack>) { }

    registerPack(pack: PolicyPack) {
        this.packs.set(pack.id, pack);
    }

    getPack(id: string): PolicyPack | undefined {
        return this.packs.get(id);
    }

    // Placeholder for advanced rule extraction from text (Future AI feature)
    static extractRulesFromText(text: string): Policy[] {
        // TODO: Implement AI extraction or regex parsing
        return [];
    }

    // Check if an exam complies with a specific policy pack (High level check beyond validator)
    // Validator checks technical specs (structure, time). Policy checks compliance (content constraints).
    checkCompliance(exam: ExamCandidate, packId: string): ValidationResult {
        const pack = this.packs.get(packId);
        if (!pack) {
            return { isValid: false, errors: [{ code: 'PACK_NOT_FOUND', message: `Policy pack ${packId} not found`, severity: 'ERROR' }] };
        }

        // This logic would interpret `policy.logic` against `exam` content.
        // For now, we delegate structure checks to Validator, this is for future extension.
        return { isValid: true, errors: [] };
    }
}
