// Chú thích: Exam History Page - List of all created exams
import { useState } from 'react';
import { Search, Filter, Calendar, FileText, MoreVertical, Trash2, Edit, Download, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportExamToWord } from '../lib/exportUtils';

// Mock Data
const MOCK_EXAMS = [
    {
        id: 'EX-2024-001',
        title: 'Đề kiểm tra 1 tiết - Chương 1: Hàm số',
        subject: 'Toán học',
        grade: '12',
        createdAt: '2024-05-20T08:30:00',
        questionCount: 25,
        status: 'ready', // ready, draft
        type: 'Trắc nghiệm 100%'
    },
    {
        id: 'EX-2024-002',
        title: 'Đề thi thử THPT Quốc gia Lần 1',
        subject: 'Vật lí',
        grade: '12',
        createdAt: '2024-05-18T14:00:00',
        questionCount: 40,
        status: 'ready',
        type: 'Hỗn hợp'
    },
    {
        id: 'EX-2024-003',
        title: 'Kiểm tra 15 phút - Este Lipit',
        subject: 'Hóa học',
        grade: '12',
        createdAt: '2024-05-15T09:15:00',
        questionCount: 10,
        status: 'draft',
        type: 'Trắc nghiệm 100%'
    },
    {
        id: 'EX-2024-004',
        title: 'Đề ôn tập giữa kì 1 - Đại số',
        subject: 'Toán học',
        grade: '10',
        createdAt: '2024-05-10T10:00:00',
        questionCount: 35,
        status: 'ready',
        type: 'Tự luận'
    },
    {
        id: 'EX-2024-005',
        title: 'Đề khảo sát chất lượng đầu năm',
        subject: 'Tiếng Anh',
        grade: '11',
        createdAt: '2024-05-05T08:00:00',
        questionCount: 50,
        status: 'ready',
        type: 'Trắc nghiệm 100%'
    }
];

export default function ExamHistory() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, ready, draft

    // Filter Logic
    const filteredExams = MOCK_EXAMS.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'ready') {
            return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium border border-yellow-200 dark:border-yellow-500/20">
                <AlertCircle className="w-3.5 h-3.5" /> Bản nháp
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary-500" />
                        Lịch sử tạo đề
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý và xem lại tất cả các đề thi đã tạo
                    </p>
                </div>
                <button
                    onClick={() => navigate('/create-exam')}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20"
                >
                    <FileText className="w-4 h-4" />
                    Tạo đề mới
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên đề hoặc mã đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer font-medium text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="ready">Sẵn sàng</option>
                            <option value="draft">Bản nháp</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Exam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                    <div
                        key={exam.id}
                        className="group bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${exam.subject === 'Toán học' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                    exam.subject === 'Vật lí' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                                        exam.subject === 'Hóa học' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                            'bg-gradient-to-br from-orange-500 to-red-500'
                                    }`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-mono text-gray-400 block">{exam.id}</span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                        Lớp {exam.grade} • {exam.subject}
                                    </span>
                                </div>
                            </div>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
                            {exam.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                {exam.questionCount} câu
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(exam.createdAt)}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            {getStatusBadge(exam.status)}

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                <button title="Xem chi tiết" className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button title="Chỉnh sửa" className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    title="Tải xuống"
                                    onClick={() => exportExamToWord(exam, exam.title)}
                                    className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button title="Xóa" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredExams.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Không tìm thấy kết quả</h3>
                        <p className="text-gray-500 dark:text-gray-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
