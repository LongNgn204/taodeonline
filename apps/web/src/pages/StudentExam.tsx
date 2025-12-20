
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Timer, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentExam() {
    const { code } = useParams();
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    // Mock questions
    const questions = [
        { id: 'q1', text: 'Thủ đô của Việt Nam là gì?', options: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng'] },
        { id: 'q2', text: '1 + 1 = ?', options: ['1', '2', '3', '4'] },
        { id: 'q3', text: 'Ai là người sáng tạo ra thuyết tương đối?', options: ['Newton', 'Einstein', 'Tesla', 'Edison'] },
    ];

    useEffect(() => {
        if (started && timeLeft > 0 && !submitted) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [started, timeLeft, submitted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = () => {
        if (confirm('Bạn có chắc chắn muốn nộp bài?')) {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto text-center pt-20">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đã nộp bài thành công!</h1>
                <p className="text-gray-500 mb-8">Cảm ơn bạn đã hoàn thành bài thi. Kết quả sẽ được gửi về email.</p>
                <Button onClick={() => window.location.reload()}>Về trang chủ</Button>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-xl mx-auto pt-20">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Kiểm tra 15 phút (Mã: {code})</h1>
                    <p className="text-gray-500 mb-6">Môn Toán - Lớp 10</p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-left mb-8 border border-yellow-200 dark:border-yellow-700/50">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" /> Lưu ý:
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                            <li>Thời gian làm bài: 45 phút.</li>
                            <li>Không thoát khỏi màn hình toàn thời gian.</li>
                            <li>Hệ thống sẽ tự động nộp bài khi hết giờ.</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={() => setStarted(true)} className="w-full">
                        Bắt đầu làm bài
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {/* Header / Timer */}
            <div className="sticky top-20 z-10 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="font-semibold">Câu hỏi: {Object.keys(answers).length}/{questions.length}</div>
                <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft < 300 ? 'text-red-500' : 'text-primary-600'}`}>
                    <Timer className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
                <Button onClick={handleSubmit}>Nộp bài</Button>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <Card key={q.id} className="p-6">
                        <h3 className="font-medium text-lg mb-4">
                            <span className="font-bold text-gray-500 mr-2">Câu {idx + 1}:</span>
                            {q.text}
                        </h3>
                        <div className="space-y-2">
                            {q.options.map((opt, i) => (
                                <label
                                    key={i}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                                        ${answers[q.id] === opt
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={opt}
                                        checked={answers[q.id] === opt}
                                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                    />
                                    <span className="ml-3">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
