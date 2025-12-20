import { BarChart3, Download, Search, TrendingUp, Users } from 'lucide-react';

const mockStudents = [
    { id: 'HS001', name: 'Nguyễn Văn An', class: '10A1', score: 8.5, status: 'Giỏi' },
    { id: 'HS002', name: 'Trần Thị Bình', class: '10A1', score: 7.0, status: 'Khá' },
    { id: 'HS003', name: 'Lê Văn Cường', class: '10A1', score: 9.2, status: 'Xuất sắc' },
    { id: 'HS004', name: 'Phạm Thị Dung', class: '10A1', score: 6.5, status: 'Trung bình' },
    { id: 'HS005', name: 'Hoàng Văn Em', class: '10A1', score: 8.0, status: 'Giỏi' },
];

export default function Gradebook() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sổ điểm điện tử</h1>
                    <p className="text-gray-500">Quản lý điểm số và báo cáo kết quả học tập của học sinh.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" /> Xuất Excel
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tổng số học sinh</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">42</h3>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Điểm trung bình</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">7.8</h3>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tỉ lệ đạt</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">98%</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Danh sách điểm thi - Lớp 10A1</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Mã HS</th>
                                <th className="px-6 py-3">Họ và tên</th>
                                <th className="px-6 py-3">Lớp</th>
                                <th className="px-6 py-3">Điểm số</th>
                                <th className="px-6 py-3">Xếp loại</th>
                                <th className="px-6 py-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockStudents.map((s) => (
                                <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium">{s.id}</td>
                                    <td className="px-6 py-4">{s.name}</td>
                                    <td className="px-6 py-4">{s.class}</td>
                                    <td className="px-6 py-4 font-bold text-primary-600">{s.score}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${s.status === 'Xuất sắc' ? 'bg-yellow-100 text-yellow-800' :
                                                s.status === 'Giỏi' ? 'bg-green-100 text-green-800' :
                                                    s.status === 'Khá' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary-600 hover:underline">Chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
