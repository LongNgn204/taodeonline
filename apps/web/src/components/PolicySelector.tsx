// Chú thích: PolicySelector component - cho phép chọn công văn/policy áp dụng
// Grouped theo issuer (Bộ/Sở/Trường) với preview rules

import { useState, useMemo } from 'react';

// Mock data - sẽ load từ API sau
const POLICIES = [
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
        id: 'cv7991-2024',
        code: 'CV7991-2024',
        title: 'Công văn 7991 - Hướng dẫn KTĐG định kỳ',
        issuer: 'MOE',
        mode: 'school_assessment',
        effectiveFrom: '2025-01-01',
        summary: 'Đề 60 phút: TN 7đ (MCQ 3đ + Đ/S 2đ + TLN 2đ), TL 3đ. Tỷ lệ 40/30/30.',
    },
    {
        id: 'tn-thpt-2025',
        code: 'TN-THPT-2025',
        title: 'Cấu trúc TN THPT 2025',
        issuer: 'MOE',
        mode: 'graduation_exam',
        effectiveFrom: '2025-01-01',
        summary: 'Toán 90\' 34 câu, Ngoại ngữ 50\' 40 câu, 3 dạng trắc nghiệm mới.',
    },
];

const ISSUER_LABELS: Record<string, string> = {
    MOE: '📋 Bộ GD&ĐT',
    DOE: '🏛️ Sở GD&ĐT',
    School: '🏫 Trường',
};

const MODE_LABELS: Record<string, string> = {
    curriculum: 'Chương trình',
    school_assessment: 'KTĐG trong trường',
    graduation_exam: 'Thi TN THPT',
};

interface PolicySelectorProps {
    selectedPolicyId?: string;
    onSelect: (policyId: string) => void;
    mode?: 'school_assessment' | 'graduation_exam';
    showPreview?: boolean;
}

export function PolicySelector({
    selectedPolicyId,
    onSelect,
    mode,
    showPreview = true
}: PolicySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Filter và group policies
    const groupedPolicies = useMemo(() => {
        const filtered = mode
            ? POLICIES.filter(p => p.mode === mode || p.mode === 'curriculum')
            : POLICIES;

        const groups: Record<string, typeof POLICIES> = {};
        for (const policy of filtered) {
            if (!groups[policy.issuer]) {
                groups[policy.issuer] = [];
            }
            groups[policy.issuer].push(policy);
        }
        return groups;
    }, [mode]);

    const selectedPolicy = POLICIES.find(p => p.id === selectedPolicyId);
    const hoveredPolicy = POLICIES.find(p => p.id === hoveredId);

    return (
        <div className="policy-selector">
            <label className="policy-selector__label">
                Công văn/Văn bản áp dụng
            </label>

            <div className="policy-selector__container">
                {/* Dropdown button */}
                <button
                    type="button"
                    className="policy-selector__button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="policy-selector__selected">
                        {selectedPolicy ? (
                            <>
                                <span className="policy-selector__code">{selectedPolicy.code}</span>
                                <span className="policy-selector__title">{selectedPolicy.title}</span>
                            </>
                        ) : (
                            <span className="policy-selector__placeholder">Chọn công văn...</span>
                        )}
                    </span>
                    <span className="policy-selector__arrow">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="policy-selector__dropdown">
                        {Object.entries(groupedPolicies).map(([issuer, policies]) => (
                            <div key={issuer} className="policy-selector__group">
                                <div className="policy-selector__group-header">
                                    {ISSUER_LABELS[issuer] || issuer}
                                </div>
                                {policies.map(policy => (
                                    <button
                                        key={policy.id}
                                        type="button"
                                        className={`policy-selector__option ${policy.id === selectedPolicyId ? 'policy-selector__option--selected' : ''
                                            }`}
                                        onClick={() => {
                                            onSelect(policy.id);
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => setHoveredId(policy.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <div className="policy-selector__option-content">
                                            <span className="policy-selector__option-code">{policy.code}</span>
                                            <span className="policy-selector__option-mode">
                                                {MODE_LABELS[policy.mode]}
                                            </span>
                                        </div>
                                        <div className="policy-selector__option-title">{policy.title}</div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview panel */}
            {showPreview && (hoveredPolicy || selectedPolicy) && (
                <div className="policy-selector__preview">
                    <div className="policy-selector__preview-header">
                        {(hoveredPolicy || selectedPolicy)?.code}
                    </div>
                    <div className="policy-selector__preview-summary">
                        {(hoveredPolicy || selectedPolicy)?.summary}
                    </div>
                    <div className="policy-selector__preview-date">
                        Hiệu lực từ: {(hoveredPolicy || selectedPolicy)?.effectiveFrom}
                    </div>
                </div>
            )}

            <style>{`
                .policy-selector {
                    margin-bottom: 1rem;
                }
                .policy-selector__label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary, #1a1a2e);
                }
                .policy-selector__container {
                    position: relative;
                }
                .policy-selector__button {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid var(--border-color, #e0e0e0);
                    border-radius: 8px;
                    background: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .policy-selector__button:hover {
                    border-color: var(--primary, #6366f1);
                }
                .policy-selector__selected {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .policy-selector__code {
                    background: var(--primary-light, #eef2ff);
                    color: var(--primary, #6366f1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .policy-selector__placeholder {
                    color: #999;
                }
                .policy-selector__dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 2px solid var(--border-color, #e0e0e0);
                    border-radius: 8px;
                    margin-top: 4px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 100;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .policy-selector__group-header {
                    padding: 0.5rem 1rem;
                    background: #f5f5f5;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #666;
                    border-bottom: 1px solid #e0e0e0;
                }
                .policy-selector__option {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: white;
                    text-align: left;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f0f0f0;
                }
                .policy-selector__option:hover {
                    background: var(--primary-light, #eef2ff);
                }
                .policy-selector__option--selected {
                    background: var(--primary-light, #eef2ff);
                    border-left: 3px solid var(--primary, #6366f1);
                }
                .policy-selector__option-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .policy-selector__option-code {
                    font-weight: 600;
                    color: var(--primary, #6366f1);
                }
                .policy-selector__option-mode {
                    font-size: 0.75rem;
                    color: #666;
                    background: #f0f0f0;
                    padding: 0.125rem 0.5rem;
                    border-radius: 12px;
                }
                .policy-selector__option-title {
                    font-size: 0.85rem;
                    color: #333;
                }
                .policy-selector__preview {
                    margin-top: 0.5rem;
                    padding: 0.75rem;
                    background: #f8f9fc;
                    border-radius: 8px;
                    border-left: 3px solid var(--primary, #6366f1);
                }
                .policy-selector__preview-header {
                    font-weight: 600;
                    color: var(--primary, #6366f1);
                    margin-bottom: 0.25rem;
                }
                .policy-selector__preview-summary {
                    font-size: 0.9rem;
                    color: #333;
                    line-height: 1.4;
                }
                .policy-selector__preview-date {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
}

export default PolicySelector;
