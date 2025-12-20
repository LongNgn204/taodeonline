import { Camera, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function CameraGrading() {
    const [image, setImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                simulateGrading();
            };
            reader.readAsDataURL(file);
        }
    };

    const simulateGrading = () => {
        setProcessing(true);
        // Mock processing delay
        setTimeout(() => {
            setProcessing(false);
            setResult({
                score: 8.5,
                correct: 34,
                total: 40,
                studentId: "HS00123",
                studentName: "Nguyễn Văn A"
            });
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-8 h-8 text-primary-600" />
                    Chấm thi bằng Camera (Beta)
                </h1>
                <p className="text-gray-500">Chụp ảnh phiếu trả lời trắc nghiệm để chấm điểm tự động bằng AI.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-4">
                    <div className={`relative aspect-[3/4] rounded-xl border-2 border-dashed ${image ? 'border-primary-500' : 'border-gray-300 dark:border-gray-700'} flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden`}>
                        {image ? (
                            <img src={image} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-6">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Kéo thả hoặc click để tải ảnh phiếu thi</p>
                                <p className="text-xs text-gray-400 mt-2">Hỗ trợ JPG, PNG</p>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUpload}
                        />

                        {processing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                <div className="spinner w-10 h-10 border-white mb-4"></div>
                                <p>Đang phân tích hình ảnh...</p>
                            </div>
                        )}
                    </div>

                    {image && (
                        <button onClick={() => { setImage(null); setResult(null); }} className="btn-secondary w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                            <X className="w-4 h-4 mr-2" /> Xóa ảnh
                        </button>
                    )}
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    {result ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kết quả chấm</h3>
                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                    Đã hoàn thành
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
                                    {result.score}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Điểm số</div>
                                    <div className="font-bold text-gray-900 dark:text-white">{result.correct}/{result.total} câu đúng</div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mã sinh viên</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{result.studentId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Họ tên</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{result.studentName}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button className="btn-primary flex-1">Lưu kết quả</button>
                                <button className="btn-secondary flex-1">Chấm lại</button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-l border-gray-100 dark:border-gray-800 pl-8">
                            <Camera className="w-16 h-16 mb-4 opacity-20" />
                            <p>Tải ảnh lên để xem kết quả</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
