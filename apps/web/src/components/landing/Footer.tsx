import { FileSpreadsheet, Github, Facebook, Mail } from 'lucide-react';


export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-gray-900 dark:text-white">Exam Matrix</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Hệ thống tạo đề thi thông minh, hỗ trợ giáo viên xây dựng ngân hàng câu hỏi và đề kiểm tra chuẩn hóa.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Sản phẩm</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-primary-600">Tính năng</a></li>
                            <li><a href="#" className="hover:text-primary-600">Bảng giá</a></li>
                            <li><a href="#" className="hover:text-primary-600">Roadmap</a></li>
                            <li><a href="#" className="hover:text-primary-600">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Tài nguyên</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-primary-600">Hướng dẫn sử dụng</a></li>
                            <li><a href="#" className="hover:text-primary-600">AI Literacy Hub</a></li>
                            <li><a href="#" className="hover:text-primary-600">Cộng đồng</a></li>
                            <li><a href="#" className="hover:text-primary-600">Blog giáo dục</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Liên hệ</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@exammatrix.ai</li>
                            <li className="flex items-center gap-2 mt-4">
                                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-primary-100 transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-blue-100 transition-colors"><Facebook className="w-5 h-5" /></a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2024 Exam Matrix Generator. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">Điều khoản</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white">Bảo mật</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
