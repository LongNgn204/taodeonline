// Chú thích: Community page - Chia sẻ và khám phá tài liệu từ cộng đồng
// Hỗ trợ: Đề thi, KHBD, SKKN với rating, comments, share

import { useEffect, useState, useCallback } from 'react';
import {
    Download,
    Search,
    Share2,
    User,
    Globe,
    Star,
    MessageCircle,
    Eye,
    Heart,
    BookOpen,
    FileText,
    Lightbulb,
    X,
    Send,
    ThumbsUp,
    Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Types
interface SharedResource {
    id: string;
    type: 'exam' | 'lesson_plan' | 'skkn';
    title: string;
    subject: string;
    grade: number;
    description: string;
    downloads: number;
    rating: number;
    ratingCount: number;
    views: number;
    likes: number;
    commentsCount: number;
    createdAt: Date;
    author: {
        id: string;
        name: string;
        avatar?: string;
        verified?: boolean;
    };
    tags: string[];
    preview?: string;
}

interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: Date;
    likes: number;
}

// Mock data generator
function generateMockResources(): SharedResource[] {
    const types: ('exam' | 'lesson_plan' | 'skkn')[] = ['exam', 'lesson_plan', 'skkn'];
    const subjects = ['Toán', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh', 'Sinh học', 'Lịch sử', 'Địa lý'];
    const grades = [10, 11, 12];
    const authors = [
        { id: 'u1', name: 'Nguyễn Văn Anh', verified: true },
        { id: 'u2', name: 'Trần Thị Bình', verified: true },
        { id: 'u3', name: 'Lê Hoàng Cường', verified: false },
        { id: 'u4', name: 'Phạm Minh Đức', verified: true },
        { id: 'u5', name: 'Vũ Thị E', verified: false },
    ];

    return Array.from({ length: 20 }, (_, i) => {
        const type = types[i % 3];
        const subject = subjects[i % subjects.length];
        const grade = grades[i % grades.length];

        return {
            id: `res${i + 1}`,
            type,
            title: type === 'exam'
                ? `Đề kiểm tra ${subject} lớp ${grade} - ${i % 2 === 0 ? 'HK1' : 'HK2'}`
                : type === 'lesson_plan'
                    ? `KHBD ${subject} lớp ${grade} - Bài ${i + 1}`
                    : `SKKN: Đổi mới phương pháp dạy ${subject}`,
            subject,
            grade,
            description: type === 'exam'
                ? 'Đề kiểm tra theo chuẩn CV 7991 với ma trận đầy đủ, bao gồm trắc nghiệm và tự luận.'
                : type === 'lesson_plan'
                    ? 'Kế hoạch bài dạy theo CV 5512 với đầy đủ các hoạt động học tập.'
                    : 'Sáng kiến kinh nghiệm về đổi mới phương pháp dạy học tích cực.',
            downloads: Math.floor(Math.random() * 1000) + 100,
            rating: 3.5 + Math.random() * 1.5,
            ratingCount: Math.floor(Math.random() * 100) + 10,
            views: Math.floor(Math.random() * 5000) + 500,
            likes: Math.floor(Math.random() * 200) + 20,
            commentsCount: Math.floor(Math.random() * 50) + 5,
            createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
            author: authors[i % authors.length],
            tags: [subject, `Lớp ${grade}`, type === 'exam' ? 'Đề thi' : type === 'lesson_plan' ? 'KHBD' : 'SKKN'],
            preview: type === 'exam' ? '40 câu hỏi • 60 phút' : type === 'lesson_plan' ? '3 tiết • 5 hoạt động' : '~5000 từ',
        };
    });
}

export default function Community() {
    // State
    const [resources, setResources] = useState<SharedResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState<'all' | 'exam' | 'lesson_plan' | 'skkn'>('all');
    const [activeSubject, setActiveSubject] = useState<string>('');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('popular');
    const [selectedResource, setSelectedResource] = useState<SharedResource | null>(null);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    // Load resources
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // TODO: Replace with API
                // const res = await api.get('/community/resources');
                // const data = await res.json();
                // setResources(data.resources);

                // Mock data
                await new Promise(r => setTimeout(r, 500));
                setResources(generateMockResources());
            } catch (e) {
                console.error('Failed to load resources:', e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Filter & Sort
    const filteredResources = resources
        .filter(r => activeType === 'all' || r.type === activeType)
        .filter(r => !activeSubject || r.subject === activeSubject)
        .filter(r =>
            !searchQuery ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.author.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'recent') return b.createdAt.getTime() - a.createdAt.getTime();
            if (sortBy === 'rating') return b.rating - a.rating;
            return b.downloads - a.downloads;
        });

    // Handlers
    const handleLike = useCallback((id: string) => {
        setLikedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleDownload = async (resource: SharedResource) => {
        // TODO: Implement actual download
        alert(`Đang tải về: ${resource.title}`);
    };

    // Type icon & color
    const getTypeInfo = (type: SharedResource['type']) => {
        switch (type) {
            case 'exam':
                return { icon: FileText, color: 'blue', label: 'Đề thi' };
            case 'lesson_plan':
                return { icon: BookOpen, color: 'green', label: 'KHBD' };
            case 'skkn':
                return { icon: Lightbulb, color: 'amber', label: 'SKKN' };
        }
    };

    // Subjects
    const subjects = ['Toán', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD'];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Globe className="w-7 h-7 text-primary-500" />
                        Cộng đồng Kiến Tạo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Khám phá và chia sẻ đề thi, KHBD, SKKN với giáo viên toàn quốc
                    </p>
                </div>

                <Button onClick={() => setShowShareDialog(true)} className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ tài liệu
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm tài liệu, tác giả..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        <option value="popular">Phổ biến nhất</option>
                        <option value="recent">Mới nhất</option>
                        <option value="rating">Đánh giá cao</option>
                    </select>
                </div>

                {/* Type Tabs */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveType('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeType === 'all'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    {[
                        { type: 'exam' as const, icon: FileText, label: 'Đề thi', color: 'blue' },
                        { type: 'lesson_plan' as const, icon: BookOpen, label: 'KHBD', color: 'green' },
                        { type: 'skkn' as const, icon: Lightbulb, label: 'SKKN', color: 'amber' },
                    ].map(item => (
                        <button
                            key={item.type}
                            onClick={() => setActiveType(item.type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeType === item.type
                                ? `bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Subject Chips */}
                <div className="flex gap-2 flex-wrap">
                    {subjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => setActiveSubject(activeSubject === subj ? '' : subj)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${activeSubject === subj
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                        >
                            {subj}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tài liệu', value: resources.length, icon: FileText, color: 'blue' },
                    { label: 'Lượt tải', value: resources.reduce((a, r) => a + r.downloads, 0), icon: Download, color: 'green' },
                    { label: 'Lượt xem', value: resources.reduce((a, r) => a + r.views, 0), icon: Eye, color: 'purple' },
                    { label: 'Tác giả', value: new Set(resources.map(r => r.author.id)).size, icon: User, color: 'amber' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className={`p-4 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 border border-${stat.color}-200 dark:border-${stat.color}-700`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                            <span className="text-sm text-gray-500">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>
                            {stat.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner w-8 h-8" />
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Không tìm thấy tài liệu
                    </h3>
                    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(resource => {
                        const typeInfo = getTypeInfo(resource.type);
                        const isLiked = likedIds.has(resource.id);

                        return (
                            <div
                                key={resource.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
                            >
                                {/* Header */}
                                <div className={`p-4 bg-gradient-to-r from-${typeInfo.color}-50 to-${typeInfo.color}-100/50 dark:from-${typeInfo.color}-900/20 dark:to-${typeInfo.color}-900/10`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-300`}>
                                            {typeInfo.label}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-medium">{resource.rating.toFixed(1)}</span>
                                            <span className="text-xs text-gray-400">({resource.ratingCount})</span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {resource.title}
                                    </h3>
                                </div>

                                {/* Body */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                        {resource.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {resource.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Author */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs">
                                            {resource.author.name.charAt(0)}
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {resource.author.name}
                                        </span>
                                        {resource.author.verified && (
                                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {resource.views.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {resource.downloads.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {resource.commentsCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {resource.createdAt.toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleLike(resource.id)}
                                            className={`p-2 rounded-lg transition-colors ${isLiked
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedResource(resource)}
                                            className="flex-1 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleDownload(resource)}
                                            className="flex items-center gap-1"
                                        >
                                            <Download className="w-4 h-4" />
                                            Tải về
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedResource && (
                <ResourceDetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onDownload={() => handleDownload(selectedResource)}
                    isLiked={likedIds.has(selectedResource.id)}
                    onLike={() => handleLike(selectedResource.id)}
                />
            )}

            {/* Share Dialog */}
            {showShareDialog && (
                <ShareDialog onClose={() => setShowShareDialog(false)} />
            )}
        </div>
    );
}

// ===== RESOURCE DETAIL MODAL =====
interface ResourceDetailModalProps {
    resource: SharedResource;
    onClose: () => void;
    onDownload: () => void;
    isLiked: boolean;
    onLike: () => void;
}

function ResourceDetailModal({ resource, onClose, onDownload, isLiked, onLike }: ResourceDetailModalProps) {
    const [comments, setComments] = useState<Comment[]>([
        { id: 'c1', userId: 'u1', userName: 'Nguyễn Văn A', content: 'Tài liệu rất hay, cảm ơn tác giả!', createdAt: new Date(), likes: 5 },
        { id: 'c2', userId: 'u2', userName: 'Trần Thị B', content: 'Đã dùng cho lớp tôi, học sinh thích lắm.', createdAt: new Date(Date.now() - 3600000), likes: 3 },
    ]);
    const [newComment, setNewComment] = useState('');
    const [userRating, setUserRating] = useState(0);

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        setComments(prev => [...prev, {
            id: `c${Date.now()}`,
            userId: 'me',
            userName: 'Tôi',
            content: newComment,
            createdAt: new Date(),
            likes: 0,
        }]);
        setNewComment('');
    };

    const typeInfo = {
        exam: { icon: FileText, color: 'blue', label: 'Đề thi' },
        lesson_plan: { icon: BookOpen, color: 'green', label: 'KHBD' },
        skkn: { icon: Lightbulb, color: 'amber', label: 'SKKN' },
    }[resource.type];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-${typeInfo.color}-50 to-${typeInfo.color}-100/50 dark:from-${typeInfo.color}-900/20 dark:to-${typeInfo.color}-900/10`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-300`}>
                                {typeInfo.label}
                            </span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                                {resource.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm">
                            {resource.author.name.charAt(0)}
                        </div>
                        <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {resource.author.name}
                            </span>
                            {resource.author.verified && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mô tả</h4>
                        <p className="text-gray-600 dark:text-gray-300">{resource.description}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { icon: Star, value: resource.rating.toFixed(1), label: 'Đánh giá' },
                            { icon: Download, value: resource.downloads.toLocaleString(), label: 'Lượt tải' },
                            { icon: Eye, value: resource.views.toLocaleString(), label: 'Lượt xem' },
                            { icon: Heart, value: resource.likes.toLocaleString(), label: 'Yêu thích' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <stat.icon className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                <p className="font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* User Rating */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Đánh giá của bạn</h4>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= userRating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Bình luận ({comments.length})
                        </h4>

                        {/* Comment Input */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                            />
                            <Button onClick={handleSubmitComment} size="sm">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-[200px] overflow-y-auto">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                                        {comment.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {comment.userName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {comment.createdAt.toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            {comment.content}
                                        </p>
                                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 mt-1">
                                            <ThumbsUp className="w-3 h-3" />
                                            {comment.likes}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onLike}
                        className={`p-3 rounded-lg transition-colors ${isLiked
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Đóng
                    </Button>
                    <Button onClick={onDownload} className="flex-1 flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" />
                        Tải về
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ===== SHARE DIALOG =====
interface ShareDialogProps {
    onClose: () => void;
}

function ShareDialog({ onClose }: ShareDialogProps) {
    const [type, setType] = useState<'exam' | 'lesson_plan' | 'skkn'>('exam');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('Toán');
    const [grade, setGrade] = useState(10);

    const handleSubmit = () => {
        // TODO: Implement share API
        alert(`Đã chia sẻ: ${title}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary-500" />
                        Chia sẻ tài liệu
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Loại tài liệu
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'exam' as const, label: 'Đề thi' },
                                { value: 'lesson_plan' as const, label: 'KHBD' },
                                { value: 'skkn' as const, label: 'SKKN' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setType(opt.value)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${type === opt.value
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                            placeholder="VD: Đề kiểm tra Toán 10 - HK1"
                        />
                    </div>

                    {/* Subject & Grade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Môn học
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                {['Toán', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lớp
                            </label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                            >
                                {[10, 11, 12].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none"
                            placeholder="Mô tả ngắn về tài liệu..."
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={!title} className="flex-1">
                        Chia sẻ
                    </Button>
                </div>
            </div>
        </div>
    );
}
