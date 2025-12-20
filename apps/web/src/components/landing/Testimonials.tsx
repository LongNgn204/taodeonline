import { Star } from 'lucide-react';
import { CardGlass } from '../ui/Card';

const REVIEWS = [
    {
        name: "Cô Nguyễn Thị Lan",
        role: "GV Toán - THPT Chu Văn An",
        content: "Từ khi dùng Kiến Tạo Việt, tổ bộ môn Toán chúng tôi tiết kiệm được 70% thời gian ra đề. Ma trận rất chuẩn và sát thực tế.",
        stars: 5
    },
    {
        name: "Thầy Trần Văn Minh",
        role: "GV Hóa - THPT Chuyên KHTN",
        content: "Tính năng nhập công thức Hóa học từ ảnh chụp hoạt động quá tuyệt vời. Không còn phải gõ LaTeX thủ công nữa.",
        stars: 5
    },
    {
        name: "Cô Lê Thu Hà",
        role: "GV Anh - THPT Yên Hòa",
        content: "Mình thích nhất tính năng cộng tác. Cả nhóm cùng sửa đề trực tiếp như Google Docs nhưng chuyên biệt cho đề thi.",
        stars: 5
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <h2 className="text-primary-500 font-medium mb-2 uppercase tracking-wider">Cộng đồng Giáo viên</h2>
                    <h3 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Đồng nghiệp nói gì về chúng tôi?
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {REVIEWS.map((review, idx) => (
                        <CardGlass key={idx} className="p-8 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex gap-1 mb-4">
                                {[...Array(review.stars)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{review.content}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                                    {review.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{review.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.role}</p>
                                </div>
                            </div>
                        </CardGlass>
                    ))}
                </div>
            </div>
        </section>
    );
}
