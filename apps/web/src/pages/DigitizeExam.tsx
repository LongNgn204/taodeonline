
import { useState } from 'react';
import { Upload, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
            const res = await fetch('/api/ocr/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setResult(data.extractedText);
            } else {
                alert('Có lỗi xảy ra: ' + data.error);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload thất bại');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Số hóa Đề thi (OCR)</h1>
                    <p className="text-gray-500 text-sm">Chuyển đổi ảnh chụp hoặc file PDF thành dữ liệu số.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
                {/* Left: Upload & Preview */}
                <Card className="flex flex-col p-4 h-full overflow-hidden">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tải lên đề thi (Ảnh/PDF)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-primary-50 file:text-primary-700
                                  hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isProcessing}
                                isLoading={isProcessing}
                            >
                                Xử lý AI
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <div className="text-center text-gray-400">
                                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Chưa có file nào được chọn</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" />
                                    <p className="text-primary-600 font-medium">AI đang đọc đề thi...</p>
                                    <p className="text-xs text-gray-500 mt-1">Việc này có thể mất vài giây</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right: Editor */}
                <Card className="flex flex-col p-0 h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Kết quả nhận diện
                        </h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!result}>
                                Làm mới
                            </Button>
                            <Button size="sm" disabled={!result}>
                                Lưu vào Ngân hàng <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        {result ? (
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                className="w-full h-full p-4 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                                spellCheck={false}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                Kết quả OCR sẽ hiện ở đây để bạn chỉnh sửa...
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
