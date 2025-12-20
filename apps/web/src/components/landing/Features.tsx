import {
    TableProperties,
    Share2,
    BarChart3,
    FileOutput,
    Lightbulb,
    ShieldCheck
} from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
    {
        icon: TableProperties,
        title: "Ma trận Chuẩn 7991",
        desc: "Xây dựng ma trận đề kiểm tra chi tiết đến từng đơn vị kiến thức, đáp ứng chuẩn Công văn mới nhất."
    },
    {
        icon: Share2,
        title: "LMS Integration",
        desc: "Xuất đề thi ra định dạng Moodle XML, QTI, Google Forms để import vào các hệ thống E-learning."
    },
    {
        icon: BarChart3,
        title: "Phân tích Nâng cao",
        desc: "Item Analysis giúp đánh giá độ khó, độ phân biệt của câu hỏi để cải thiện chất lượng đề."
    },
    {
        icon: FileOutput,
        title: "Export Đa dạng",
        desc: "Xuất file Word (.docx) và Excel (.xlsx) với định dạng đẹp, sẵn sàng in ấn."
    },
    {
        icon: Lightbulb,
        title: "AI Literacy Hub",
        desc: "Trung tâm bồi dưỡng kiến thức AI cho giáo viên, tích hợp trực tiếp vào quy trình làm việc."
    },
    {
        icon: ShieldCheck,
        title: "Ngân hàng Câu hỏi",
        desc: "Quản lý, phân loại và chia sẻ ngân hàng câu hỏi dùng chung giữa các tổ chuyên môn."
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                        Tất cả tính năng bạn cần
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Hệ sinh thái đầy đủ cho việc kiểm tra đánh giá thời đại số.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-none shadow-md">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
