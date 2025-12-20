
import { Outlet } from 'react-router-dom';

export default function StudentLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 justify-between">
                <div className="font-bold text-lg text-primary-600 dark:text-primary-400">
                    Kiến Tạo Việt <span className="text-gray-400 font-normal">| Cổng thông tin học sinh</span>
                </div>
                <div className="text-sm text-gray-500">
                    Đang làm bài thi
                </div>
            </header>
            <main className="container mx-auto max-w-4xl p-6">
                <Outlet />
            </main>
        </div>
    );
}
