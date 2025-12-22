// Chú thích: PolicyPackPicker component - Dropdown chọn policy pack từ API
// F2.1: Cho phép user xem và chọn policy pack với preview rules

import { useState, useEffect } from 'react';
import { Shield, ChevronDown, Check, Info } from 'lucide-react';
import { api } from '../lib/api';

interface PolicyPack {
    id: string;
    name: string;
    version: string;
    status: 'active' | 'deprecated' | 'draft';
    based_on: string[];
    assessment_mode: string;
    is_default: boolean;
}

interface PolicyPackPickerProps {
    mode: 'school_assessment' | 'graduation_exam';
    selectedPackId?: string;
    onSelect?: (pack: PolicyPack) => void;
    showPreview?: boolean;
}

export default function PolicyPackPicker({
    mode,
    selectedPackId,
    onSelect,
    showPreview = true
}: PolicyPackPickerProps) {
    const [packs, setPacks] = useState<PolicyPack[]>([]);
    const [selectedPack, setSelectedPack] = useState<PolicyPack | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        async function fetchPacks() {
            try {
                const res = await api.get(`/policy-packs?mode=${mode}&status=active`);
                const data = await res.json();
                setPacks(data.packs || []);

                // Auto-select default or first pack
                if (data.packs?.length > 0) {
                    const defaultPack = data.packs.find((p: PolicyPack) => p.is_default) || data.packs[0];
                    if (!selectedPackId) {
                        setSelectedPack(defaultPack);
                    } else {
                        const found = data.packs.find((p: PolicyPack) => p.id === selectedPackId);
                        setSelectedPack(found || defaultPack);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch policy packs', e);
            } finally {
                setLoading(false);
            }
        }
        fetchPacks();
    }, [mode, selectedPackId]);

    const handleSelect = (pack: PolicyPack) => {
        setSelectedPack(pack);
        setIsOpen(false);
        onSelect?.(pack);
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Đang tải policy packs...
            </div>
        );
    }

    return (
        <div className="relative">
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                Policy Pack
            </label>

            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:border-primary-500/50 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {selectedPack?.name || 'Chọn policy pack'}
                        </p>
                        {selectedPack && (
                            <p className="text-xs text-gray-500">
                                v{selectedPack.version} • {selectedPack.based_on?.join(', ')}
                            </p>
                        )}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && packs.length > 0 && (
                <div className="absolute z-50 w-full mt-2 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {packs.map((pack) => (
                        <button
                            key={pack.id}
                            onClick={() => handleSelect(pack)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedPack?.id === pack.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm text-left">
                                        {pack.name}
                                    </p>
                                    <p className="text-xs text-gray-500 text-left">
                                        v{pack.version} • {pack.based_on?.join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {pack.is_default && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        Mặc định
                                    </span>
                                )}
                                {selectedPack?.id === pack.id && (
                                    <Check className="w-4 h-4 text-primary-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Preview */}
            {showPreview && selectedPack && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">Quy định áp dụng:</p>
                            <p>{selectedPack.based_on?.map(b => b.toUpperCase()).join(' + ')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
