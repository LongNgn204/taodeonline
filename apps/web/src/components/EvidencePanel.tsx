// Chú thích: EvidencePanel - Hiển thị nguồn văn bản pháp lý áp dụng
// Hiển thị trích dẫn từ công văn/thông tư đang được dùng

import { useState } from 'react';

interface EvidenceItem {
    policyId: string;
    policyCode: string;
    policyTitle: string;
    rulePath: string;
    excerpt: string;
    page?: number;
    articleNo?: string;
}

interface EvidencePanelProps {
    evidences: EvidenceItem[];
    onEvidenceClick?: (evidence: EvidenceItem) => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

// Mock evidence data cho demo
const MOCK_EVIDENCES: EvidenceItem[] = [
    {
        policyId: 'cv7991-2024',
        policyCode: 'CV 7991/BGDĐT-GDTrH',
        policyTitle: 'Hướng dẫn KTĐG định kỳ THCS/THPT',
        rulePath: 'constraints.duration',
        excerpt: 'Thời gian làm bài là 60 phút (không tính thời gian giao đề)',
        page: 2,
        articleNo: 'Mục II.1',
    },
    {
        policyId: 'cv7991-2024',
        policyCode: 'CV 7991/BGDĐT-GDTrH',
        policyTitle: 'Hướng dẫn KTĐG định kỳ THCS/THPT',
        rulePath: 'constraints.score_distribution',
        excerpt: 'Phần trắc nghiệm: 7,0 điểm (MCQ 3,0đ + Đ/S 2,0đ + TLN 2,0đ). Phần tự luận: 3,0 điểm.',
        page: 3,
        articleNo: 'Mục II.2',
    },
    {
        policyId: 'cv7991-2024',
        policyCode: 'CV 7991/BGDĐT-GDTrH',
        policyTitle: 'Hướng dẫn KTĐG định kỳ THCS/THPT',
        rulePath: 'constraints.cognitive_levels',
        excerpt: 'Tỷ lệ các mức độ nhận thức: Nhận biết 40%, Thông hiểu 30%, Vận dụng 30%.',
        page: 4,
        articleNo: 'Mục II.3',
    },
    {
        policyId: 'tt32-2018',
        policyCode: 'TT 32/2018/TT-BGDĐT',
        policyTitle: 'Chương trình GDPT 2018',
        rulePath: 'curriculum.competencies',
        excerpt: 'Phát triển 5 phẩm chất và 10 năng lực cốt lõi cho học sinh.',
        page: 15,
        articleNo: 'Điều 4',
    },
];

export function EvidencePanel({
    evidences = MOCK_EVIDENCES,
    onEvidenceClick,
    isOpen = false,
    onToggle,
}: EvidencePanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Group by policy
    const groupedEvidences = evidences.reduce((acc, ev) => {
        if (!acc[ev.policyId]) {
            acc[ev.policyId] = {
                code: ev.policyCode,
                title: ev.policyTitle,
                items: [],
            };
        }
        acc[ev.policyId].items.push(ev);
        return acc;
    }, {} as Record<string, { code: string; title: string; items: EvidenceItem[] }>);

    return (
        <div className="evidence-panel">
            {/* Toggle button */}
            <button
                className="evidence-toggle"
                onClick={onToggle}
                title="Xem nguồn văn bản"
            >
                <span className="evidence-toggle__icon">📜</span>
                <span className="evidence-toggle__label">
                    Nguồn ({evidences.length})
                </span>
            </button>

            {/* Panel content */}
            {isOpen && (
                <div className="evidence-content">
                    <div className="evidence-header">
                        <h3>📋 Văn bản áp dụng</h3>
                        <button className="evidence-close" onClick={onToggle}>×</button>
                    </div>

                    <div className="evidence-list">
                        {Object.entries(groupedEvidences).map(([policyId, group]) => (
                            <div key={policyId} className="evidence-group">
                                <div
                                    className="evidence-group__header"
                                    onClick={() => setExpandedId(expandedId === policyId ? null : policyId)}
                                >
                                    <span className="evidence-group__code">{group.code}</span>
                                    <span className="evidence-group__count">{group.items.length}</span>
                                    <span className="evidence-group__arrow">
                                        {expandedId === policyId ? '▼' : '▶'}
                                    </span>
                                </div>

                                {expandedId === policyId && (
                                    <div className="evidence-group__items">
                                        {group.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="evidence-item"
                                                onClick={() => onEvidenceClick?.(item)}
                                            >
                                                <div className="evidence-item__meta">
                                                    <span className="evidence-item__article">{item.articleNo}</span>
                                                    {item.page && <span className="evidence-item__page">Trang {item.page}</span>}
                                                </div>
                                                <blockquote className="evidence-item__excerpt">
                                                    "{item.excerpt}"
                                                </blockquote>
                                                <div className="evidence-item__rule">
                                                    → {item.rulePath}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="evidence-footer">
                        <a href="/policies" className="evidence-link">
                            Xem tất cả văn bản →
                        </a>
                    </div>
                </div>
            )}

            <style>{`
                .evidence-panel {
                    position: relative;
                }
                .evidence-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: #0369a1;
                    transition: all 0.2s;
                }
                .evidence-toggle:hover {
                    background: #e0f2fe;
                    border-color: #7dd3fc;
                }
                .evidence-toggle__icon {
                    font-size: 1.25rem;
                }
                .evidence-content {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    width: 400px;
                    max-height: 500px;
                    overflow-y: auto;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    z-index: 100;
                }
                .evidence-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f8fafc;
                    border-radius: 12px 12px 0 0;
                }
                .evidence-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e293b;
                }
                .evidence-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                }
                .evidence-close:hover {
                    color: #475569;
                }
                .evidence-list {
                    padding: 0.5rem;
                }
                .evidence-group {
                    margin-bottom: 0.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .evidence-group__header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: #f1f5f9;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .evidence-group__header:hover {
                    background: #e2e8f0;
                }
                .evidence-group__code {
                    font-weight: 600;
                    color: #0f172a;
                    flex: 1;
                }
                .evidence-group__count {
                    background: #6366f1;
                    color: white;
                    padding: 0.125rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .evidence-group__arrow {
                    color: #64748b;
                    font-size: 0.75rem;
                }
                .evidence-group__items {
                    border-top: 1px solid #e5e7eb;
                }
                .evidence-item {
                    padding: 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .evidence-item:last-child {
                    border-bottom: none;
                }
                .evidence-item:hover {
                    background: #faf5ff;
                }
                .evidence-item__meta {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .evidence-item__article {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .evidence-item__page {
                    color: #64748b;
                    font-size: 0.75rem;
                }
                .evidence-item__excerpt {
                    margin: 0;
                    padding: 0.5rem;
                    background: #fffbeb;
                    border-left: 3px solid #fbbf24;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    color: #78350f;
                    font-style: italic;
                }
                .evidence-item__rule {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: #6366f1;
                    font-family: monospace;
                }
                .evidence-footer {
                    padding: 0.75rem;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                }
                .evidence-link {
                    color: #6366f1;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .evidence-link:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}

export default EvidencePanel;
