
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Timer, CheckCircle, AlertCircle, EyeOff } from 'lucide-react';
import { calculateSubmissionHash } from '../lib/security';

export default function StudentExam() {
    const { code } = useParams();
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45 * 60); // Default, will update from API
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [scoreInfo, setScoreInfo] = useState<any>(null);

    // Security state
    const [cheatCount, setCheatCount] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Real questions from API
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!code) return;
        fetch(`/api/public/exams/${code}`)
            .then(res => {
                if (!res.ok) throw new Error('Không tìm thấy đề thi');
                return res.json();
            })
            .then(data => {
                setExam(data);
                if (data.duration) setTimeLeft(data.duration * 60);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [code]);

    const progress = exam?.examContent?.questions ? Math.round((Object.keys(answers).length / exam.examContent.questions.length) * 100) : 0;

    useEffect(() => {
        if (started && !startTime) {
            setStartTime(Date.now());
        }

        if (started && timeLeft > 0 && !submitted) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && started && !submitted) {
            handleSubmit(true); // Auto submit
        }
    }, [started, timeLeft, submitted, startTime]);

    // Anti-cheat: Detect tab switching
    useEffect(() => {
        if (!started || submitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setCheatCount(prev => prev + 1);
                alert('Cảnh báo: Bạn đã rời khỏi màn hình làm bài! Hành động này đã được ghi lại.');
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [started, submitted]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async (auto: boolean | React.MouseEvent<HTMLButtonElement> = false) => {
        const isAuto = typeof auto === 'boolean' ? auto : false;
        if (!isAuto && !confirm('Bạn có chắc chắn muốn nộp bài?')) return;

        const submissionData = {
            examCode: code,
            answers,
            startTime,
            endTime: Date.now(),
            cheatCount
        };

        // Client-side signing (demo purpose)
        try {
            await calculateSubmissionHash(submissionData);
        } catch (e) {
            console.warn("Signing failed", e);
        }

        try {
            const res = await fetch(`/api/public/exams/${code}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });
            const result = await res.json();
            if (result.success) {
                setScoreInfo(result);
                setSubmitted(true);
            } else {
                alert('Nộp bài thất bại: ' + result.error);
            }
        } catch (e) {
            alert('Lỗi kết nối khi nộp bài');
        }
    };

    if (loading) return <div className="p-10 text-center"><div className="spinner mx-auto mb-4"></div>Đang tải đề thi...</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-bold">Lỗi: {error}</div>;

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto text-center pt-20">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đã nộp bài thành công!</h1>
                <p className="text-gray-500 mb-4">Điểm số của bạn: <span className="text-2xl font-bold text-primary-600">{scoreInfo?.score?.toFixed(1) || 0}</span></p>
                <p className="text-sm text-gray-400 mb-8">Số câu đúng: {scoreInfo?.correctCount}/{scoreInfo?.totalQuestions}</p>
                <Button onClick={() => window.location.reload()}>Làm lại / Về trang chủ</Button>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-xl mx-auto pt-20 animate-fade-in">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">{exam.title || 'Bài kiểm tra'}</h1>
                    <p className="text-gray-500 mb-6 font-mono text-xs">ID: {exam.id}</p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-left mb-8 border border-yellow-200 dark:border-yellow-700/50">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" /> Lưu ý:
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                            <li>Thời gian làm bài: {exam.duration} phút.</li>
                            <li>Không thoát khỏi màn hình toàn thời gian.</li>
                            <li>Hệ thống sẽ tự động nộp bài khi hết giờ.</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={() => setStarted(true)} className="w-full shadow-lg shadow-primary-500/20">
                        Bắt đầu làm bài
                    </Button>
                </Card>
            </div>
        );
    }

    const questions = exam?.examContent?.questions || [];

    return (
        <div className="grid gap-6">
            <div className="sticky top-20 z-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        {cheatCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1" title="Số lần rời màn hình">
                                <EyeOff className="w-3 h-3" /> {cheatCount}
                            </span>
                        )}
                        Câu hỏi: {Object.keys(answers).length}/{questions.length}
                    </div>
                    <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft < 300 ? 'text-red-500' : 'text-primary-600'}`}>
                        <Timer className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <Button onClick={(e) => handleSubmit(e)}>Nộp bài</Button>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q: any, idx: number) => (
                    <Card key={idx} className="p-6">
                        <h3 className="font-medium text-lg mb-4">
                            <span className="font-bold text-gray-500 mr-2">Câu {idx + 1}:</span>
                            {q.content || q.text}
                        </h3>
                        <div className="space-y-2">
                            {q.options && q.options.map((opt: string, i: number) => (
                                <label
                                    key={i}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                                        ${answers[idx] === opt
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${idx}`}
                                        value={opt}
                                        checked={answers[idx] === opt}
                                        onChange={() => setAnswers(prev => ({ ...prev, [idx]: opt }))}
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
