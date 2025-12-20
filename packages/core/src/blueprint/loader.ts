import { Blueprint } from './types';

// In real app, this fetches from D1 or JSON file
export class BlueprintLoader {
    private static mockBlueprints: AbstractMockMap = {
        'BP_MATH_2025': {
            id: 'BP_MATH_2025',
            name: 'Đề minh hoạ Toán 2025',
            packId: 'TN_THPT_2025_MATH',
            structure: {
                parts: [
                    { name: 'Phần I', type: 'MCQ_4', questionCount: 12, scorePerQuestion: 0.25 },
                    { name: 'Phần II', type: 'TF_4', questionCount: 4, scorePerQuestion: 1.0 }, // Cần logic tính điểm riêng cho TF
                    { name: 'Phần III', type: 'SHORT_ANS', questionCount: 6, scorePerQuestion: 0.5 }
                ]
            },
            constraints: {
                levels: { NB: 10, TH: 8, VD: 3, VDC: 1 } // Sample count
            }
        }
    };

    static async load(id: string): Promise<Blueprint | null> {
        // TODO: Connect to D1 or R2
        return this.mockBlueprints[id] || null;
    }
}

type AbstractMockMap = { [key: string]: Blueprint };
