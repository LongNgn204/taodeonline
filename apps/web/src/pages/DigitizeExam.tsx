// Chú thích: Digitize Exam (OCR) page - Revamped UI

import { useState } from 'react';
import { Upload, FileText, ArrowRight, Loader2, ScanLine, Copy, RefreshCw } from 'lucide-react';
// Button removed
// Reverting to standard transparent UI to ensure consistent look
// import { Card } from '../components/ui/Card'; 

export default function DigitizeExam() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Mock API delay for effect
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Real fetch call
            /*
            const res = await fetch('/api/ocr/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setResult(data.extractedText);
            } */

            setResult("ĐỀ THI THỬ TỐT NGHIỆP THPT QUỐC GIA NĂM 2024\nMôn: TOÁN\nThời gian làm bài: 90 phút\n\nCâu 1: Hàm số nào dưới đây đồng biến trên R?\nA. y = x^3 - x\nB. y = x^3 + x\nC. y = x^4 + 1\nD. y = (x+1)/(x-1)\n\n(Đây là kết quả demo OCR từ hệ thống AI)");

        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload thất bại');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ScanLine className="w-8 h-8 text-primary-500" />
                        Số hóa Đề thi (OCR)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Chuyển đổi ảnh chụp đề thi thành văn bản có thể chỉnh sửa bằng AI
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left: Upload & Preview */}
                <div className="flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl">
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">File gốc</h3>
                        <label className="btn-secondary py-1.5 px-3 text-sm cursor-pointer shadow-none">
                            <Upload className="w-4 h-4" />
                            Chọn file
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center bg-gray-100/50 dark:bg-black/20 p-4">
                        {previewUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                />
                                {/* Scanning Effect Overlay */}
                                {isProcessing && (
                                    <div className="absolute inset-0 z-10 overflow-hidden rounded-lg">
                                        <div className="w-full h-1 bg-primary-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-down absolute top-0" />
                                        <div className="absolute inset-0 bg-primary-500/10 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="font-medium">Chưa có file nào được chọn</p>
                                <p className="text-sm mt-1">Hỗ trợ JPG, PNG, PDF</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">AI đang đọc đề thi...</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vui lòng đợi trong giây lát</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {file && !isProcessing && !result && (
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                            <button
                                onClick={handleUpload}
                                className="w-full btn-primary py-3 text-lg font-bold shadow-lg shadow-primary-500/20"
                            >
                                <ScanLine className="w-5 h-5" />
                                Bắt đầu quét AI
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Editor */}
                <div className="flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-xl">
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <FileText className="w-4 h-4 text-green-500" />
                            Kết quả nhận diện
                        </h3>
                        {result && (
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:text-primary-500 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors" title="Copy">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-500 hover:text-primary-500 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors"
                                    title="Làm mới"
                                    onClick={() => setResult(null)}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-0 relative">
                        {result ? (
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                className="w-full h-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 outline-none"
                                spellCheck={false}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Kết quả sẽ hiển thị tại đây</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mt-2">
                                    Sau khi AI quét xong, bạn có thể chỉnh sửa trực tiếp nội dung trước khi lưu.
                                </p>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                            <button className="w-full btn-accent py-3 font-bold shadow-lg shadow-accent-500/20">
                                Lưu vào Ngân hàng câu hỏi
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
