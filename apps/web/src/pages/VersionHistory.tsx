// Chú thích: Version History - Lịch sử phiên bản cho đề thi / KHBD / SKKN
// Cho phép GV xem và khôi phục các phiên bản trước

import { useState, useEffect } from 'react';
import {
    History,
    Clock,
    Eye,
    RotateCcw,
    FileText,
    ChevronRight,
    Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Version {
    id: string;
    version: number;
    createdAt: Date;
    createdBy: string;
    changeDescription: string;
    size: number;
    metadata?: {
        questionsCount?: number;
        wordsCount?: number;
        sections?: string[];
    };
}

interface VersionHistoryProps {
    resourceType: 'exam' | 'lesson_plan' | 'skkn';
    resourceId: string;
    onRestore?: (version: Version) => void;
}

export default function VersionHistory({
    resourceType,
    resourceId,
    onRestore
}: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [comparing, setComparing] = useState(false);

    // Load versions
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // TODO: Replace với API thực khi có backend
                // const res = await api.get(`/versions/${resourceType}/${resourceId}`);
                // const data = await res.json();
                // setVersions(data.versions);

                // Mock data
                setVersions([
                    {
                        id: 'v5',
                        version: 5,
                        createdAt: new Date(),
                        createdBy: 'Nguyễn Văn A',
                        changeDescription: 'Thêm 3 câu MCQ phần động học',
                        size: 24500,
                        metadata: { questionsCount: 40, sections: ['Trắc nghiệm', 'Tự luận'] },
                    },
                    {
                        id: 'v4',
                        version: 4,
                        createdAt: new Date(Date.now() - 3600000),
                        createdBy: 'Nguyễn Văn A',
                        changeDescription: 'Sửa đáp án câu 15 và 22',
                        size: 23800,
                        metadata: { questionsCount: 37, sections: ['Trắc nghiệm', 'Tự luận'] },
                    },
                    {
                        id: 'v3',
                        version: 3,
                        createdAt: new Date(Date.now() - 86400000),
                        createdBy: 'Nguyễn Văn A',
                        changeDescription: 'Bổ sung phần tự luận',
                        size: 22100,
                        metadata: { questionsCount: 35, sections: ['Trắc nghiệm', 'Tự luận'] },
                    },
                    {
                        id: 'v2',
                        version: 2,
                        createdAt: new Date(Date.now() - 172800000),
                        createdBy: 'Nguyễn Văn A',
                        changeDescription: 'Đảo thứ tự câu hỏi',
                        size: 18500,
                        metadata: { questionsCount: 30, sections: ['Trắc nghiệm'] },
                    },
                    {
                        id: 'v1',
                        version: 1,
                        createdAt: new Date(Date.now() - 604800000),
                        createdBy: 'Nguyễn Văn A',
                        changeDescription: 'Tạo đề lần đầu',
                        size: 15200,
                        metadata: { questionsCount: 25, sections: ['Trắc nghiệm'] },
                    },
                ]);
            } catch (e) {
                console.error('Failed to load versions:', e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [resourceType, resourceId]);

    // Format date
    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Format size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    // Handle restore
    const handleRestore = async (version: Version) => {
        if (!confirm(`Khôi phục về phiên bản ${version.version}? Các thay đổi chưa lưu sẽ bị mất.`)) {
            return;
        }

        try {
            // TODO: Call API to restore
            // await api.post(`/versions/${resourceType}/${resourceId}/restore`, { versionId: version.id });
            onRestore?.(version);
            alert(`Đã khôi phục về phiên bản ${version.version}`);
        } catch (e) {
            console.error('Failed to restore:', e);
            alert('Lỗi khôi phục phiên bản');
        }
    };

    // Resource type label
    const typeLabel = {
        exam: 'Đề thi',
        lesson_plan: 'KHBD',
        skkn: 'SKKN',
    }[resourceType];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Lịch sử phiên bản
                    </h3>
                    <span className="text-sm text-gray-500">
                        ({versions.length} phiên bản)
                    </span>
                </div>

                {comparing && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setComparing(false);
                        }}
                    >
                        Hủy so sánh
                    </Button>
                )}
            </div>

            {/* Version List */}
            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="spinner w-6 h-6 mx-auto mb-2" />
                        Đang tải...
                    </div>
                ) : versions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        Chưa có lịch sử phiên bản
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {versions.map((version, index) => (
                            <div
                                key={version.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedVersion?.id === version.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Timeline Indicator */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}
                                        >
                                            {version.version}
                                        </div>
                                        {index < versions.length - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-600 mt-2" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                v{version.version}
                                            </span>
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                                    Hiện tại
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            {version.changeDescription}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(version.createdAt)}
                                            </span>
                                            <span>{version.createdBy}</span>
                                            <span>{formatSize(version.size)}</span>
                                            {version.metadata?.questionsCount && (
                                                <span>{version.metadata.questionsCount} câu</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setSelectedVersion(
                                                selectedVersion?.id === version.id ? null : version
                                            )}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {index > 0 && (
                                            <button
                                                onClick={() => handleRestore(version)}
                                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                title="Khôi phục"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedVersion?.id === version.id && (
                                    <div className="mt-4 ml-12 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Chi tiết phiên bản
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Loại:</span>
                                                <span className="ml-2 font-medium">{typeLabel}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Kích thước:</span>
                                                <span className="ml-2 font-medium">{formatSize(version.size)}</span>
                                            </div>
                                            {version.metadata?.sections && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Các phần:</span>
                                                    <span className="ml-2 font-medium">
                                                        {version.metadata.sections.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    // TODO: Download version
                                                    alert('Download phiên bản...');
                                                }}
                                                className="flex items-center gap-1"
                                            >
                                                <Download className="w-3 h-3" />
                                                Tải về
                                            </Button>
                                            {index > 0 && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRestore(version)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Khôi phục
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== STANDALONE VERSION HISTORY PAGE =====

export function VersionHistoryPage() {
    const [activeTab, setActiveTab] = useState<'exam' | 'lesson_plan' | 'skkn'>('exam');
    const [resources, setResources] = useState<any[]>([]);
    const [selectedResource, setSelectedResource] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load resources based on tab
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // TODO: Replace with actual API
                // Mock data
                if (activeTab === 'exam') {
                    setResources([
                        { id: 'exam1', name: 'Đề kiểm tra Toán 10 - HK1', updatedAt: new Date() },
                        { id: 'exam2', name: 'Đề thi thử Vật lý 11', updatedAt: new Date(Date.now() - 86400000) },
                    ]);
                } else if (activeTab === 'lesson_plan') {
                    setResources([
                        { id: 'lp1', name: 'KHBD Đại số lớp 10', updatedAt: new Date() },
                        { id: 'lp2', name: 'KHBD Hóa học 11', updatedAt: new Date(Date.now() - 172800000) },
                    ]);
                } else {
                    setResources([
                        { id: 'skkn1', name: 'SKKN Đổi mới PPDH', updatedAt: new Date() },
                    ]);
                }
            } catch (e) {
                console.error('Failed to load resources:', e);
            } finally {
                setLoading(false);
            }
        }
        load();
        setSelectedResource(null);
    }, [activeTab]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <History className="w-7 h-7 text-blue-500" />
                    Lịch sử Phiên bản
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Xem và khôi phục các phiên bản trước của đề thi, KHBD, SKKN
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                    { id: 'exam', label: 'Đề thi', icon: FileText },
                    { id: 'lesson_plan', label: 'KHBD', icon: FileText },
                    { id: 'skkn', label: 'SKKN', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Resource List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Danh sách {activeTab === 'exam' ? 'Đề thi' : activeTab === 'lesson_plan' ? 'KHBD' : 'SKKN'}
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Đang tải...</div>
                        ) : resources.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">Chưa có dữ liệu</div>
                        ) : (
                            resources.map(resource => (
                                <button
                                    key={resource.id}
                                    onClick={() => setSelectedResource(resource.id)}
                                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedResource === resource.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-white truncate">
                                            {resource.name}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Cập nhật: {resource.updatedAt.toLocaleDateString('vi-VN')}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Version History Panel */}
                <div className="lg:col-span-2">
                    {selectedResource ? (
                        <VersionHistory
                            resourceType={activeTab}
                            resourceId={selectedResource}
                            onRestore={(version) => {
                                console.log('Restored to version:', version);
                            }}
                        />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                            <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Chọn một mục
                            </h3>
                            <p className="text-gray-500">
                                Chọn đề thi, KHBD hoặc SKKN từ danh sách bên trái để xem lịch sử phiên bản
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
