// Chú thích: Digitize Exam - OCR + AI Parse
// Sử dụng Tesseract.js cho OCR và AI Vision để parse cấu trúc đề thi
// Output: JSON có cấu trúc câu hỏi, đáp án

import { useState, useCallback } from 'react';
import {
    Upload,
    FileText,
    ArrowRight,
    Loader2,
    ScanLine,
    Copy,
    RefreshCw,
    Check,
    Sparkles,
    AlertCircle,
    Download,
    Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getAIConfig } from '../lib/ai-config';
import { callAI } from '../lib/frontend-ai';
import Tesseract from 'tesseract.js';

// Interface cho câu hỏi đã parse
interface ParsedQuestion {
    id: string;
    type: 'MCQ' | 'TF' | 'SHORT' | 'ESSAY';
    prompt: string;
    options?: { label: string; content: string }[];
    answer?: string;
    points?: number;
}

interface ParsedExam {
    title: string;
    subject?: string;
    grade?: number;
    duration?: number;
    questions: ParsedQuestion[];
    rawText: string;
}

export default function DigitizeExam() {
    // States
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [currentPreview, setCurrentPreview] = useState(0);

    const [step, setStep] = useState<'upload' | 'ocr' | 'parse' | 'edit'>('upload');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [parsedExam, setParsedExam] = useState<ParsedExam | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle file selection
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setPreviewUrls(prev => [
                ...prev,
                ...newFiles.map(f => URL.createObjectURL(f))
            ]);
            setError(null);
            setStep('upload');
        }
    }, []);

    // Handle drag & drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(
                f => f.type.startsWith('image/') || f.type === 'application/pdf'
            );
            setFiles(prev => [...prev, ...newFiles]);
            setPreviewUrls(prev => [
                ...prev,
                ...newFiles.map(f => URL.createObjectURL(f))
            ]);
        }
    }, []);

    // Remove file
    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
        if (currentPreview >= index && currentPreview > 0) {
            setCurrentPreview(prev => prev - 1);
        }
    }, [currentPreview]);

    // Step 1: OCR với Tesseract.js
    const runOCR = async () => {
        if (files.length === 0) return;

        setStep('ocr');
        setOcrProgress(0);
        setError(null);

        try {
            let fullText = '';
            const totalFiles = files.length;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Chú thích: Tesseract.js recognize với tiếng Việt
                const result = await Tesseract.recognize(file, 'vie+eng', {
                    logger: (info) => {
                        if (info.status === 'recognizing text') {
                            const fileProgress = (i / totalFiles) * 100;
                            const subProgress = (info.progress || 0) * (100 / totalFiles);
                            setOcrProgress(Math.round(fileProgress + subProgress));
                        }
                    },
                });

                fullText += `--- Trang ${i + 1} ---\n${result.data.text}\n\n`;
            }

            setOcrProgress(100);
            setStep('parse');

            // Auto-parse sau OCR
            await parseWithAI(fullText.trim());
        } catch (err) {
            console.error('OCR failed:', err);
            setError('Lỗi OCR. Vui lòng thử lại với ảnh rõ hơn.');
            setStep('upload');
        }
    };

    // Step 2: Parse với AI
    const parseWithAI = async (text: string) => {
        const config = getAIConfig();
        if (!config.apiKey) {
            setError('Vui lòng cấu hình API Key trong Settings.');
            return;
        }

        try {
            const systemPrompt = `Bạn là chuyên gia phân tích đề thi giáo dục Việt Nam.
Nhiệm vụ: Parse văn bản OCR thành JSON cấu trúc.

Output JSON schema:
{
  "title": "Tên đề thi",
  "subject": "Môn học",
  "grade": 10,
  "duration": 45,
  "questions": [
    {
      "id": "q1",
      "type": "MCQ" | "TF" | "SHORT" | "ESSAY",
      "prompt": "Nội dung câu hỏi",
      "options": [{"label": "A", "content": "Đáp án A"}, ...],
      "answer": "A",
      "points": 0.25
    }
  ]
}

Quy tắc:
1. MCQ: 4 options A,B,C,D
2. TF: Đúng/Sai, không có options
3. SHORT: Trả lời ngắn
4. ESSAY: Tự luận
5. Nếu không xác định được answer, để null
6. Giữ nguyên công thức toán/hóa học`;

            const userPrompt = `Parse đề thi sau thành JSON:

${text.slice(0, 15000)}

Trả về JSON hợp lệ, KHÔNG có markdown hay giải thích.`;

            const response = await callAI({
                systemPrompt,
                userPrompt,
                jsonMode: true,
            });

            // Parse JSON từ response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as ParsedExam;
                parsed.rawText = text;
                setParsedExam(parsed);
                setStep('edit');
            } else {
                throw new Error('Không tìm thấy JSON trong response');
            }
        } catch (err) {
            console.error('AI parse failed:', err);
            setError('Lỗi parse AI. Vui lòng kiểm tra và chỉnh sửa thủ công.');
            // Fallback: cho phép chỉnh sửa raw text
            setParsedExam({
                title: 'Đề thi (chưa parse)',
                questions: [],
                rawText: text,
            });
            setStep('edit');
        }
    };

    // Copy to clipboard
    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        // TODO: show toast
    }, []);

    // Export JSON
    const exportJSON = useCallback(() => {
        if (!parsedExam) return;
        const blob = new Blob([JSON.stringify(parsedExam, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${parsedExam.title.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [parsedExam]);

    // Reset
    const reset = useCallback(() => {
        files.forEach((_, i) => previewUrls[i] && URL.revokeObjectURL(previewUrls[i]));
        setFiles([]);
        setPreviewUrls([]);
        setCurrentPreview(0);
        setStep('upload');
        setOcrProgress(0);
        setParsedExam(null);
        setError(null);
    }, [files, previewUrls]);

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ScanLine className="w-7 h-7 text-purple-500" />
                        Số hóa Đề thi (OCR + AI)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Chuyển ảnh đề thi → Văn bản → JSON có cấu trúc
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                    {['upload', 'ocr', 'parse', 'edit'].map((s, i) => (
                        <div
                            key={s}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${step === s
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : i < ['upload', 'ocr', 'parse', 'edit'].indexOf(step)
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}
                        >
                            {i < ['upload', 'ocr', 'parse', 'edit'].indexOf(step) ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <span className="w-4 text-center">{i + 1}</span>
                            )}
                            {s === 'upload' ? 'Upload' : s === 'ocr' ? 'OCR' : s === 'parse' ? 'Parse' : 'Edit'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
                {/* Left: Upload & Preview */}
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Ảnh đề thi ({files.length} file)
                        </h3>
                        <label className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1">
                            <Upload className="w-4 h-4" />
                            Thêm file
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Preview Area */}
                    <div
                        className="flex-1 relative flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {previewUrls.length > 0 ? (
                            <div className="w-full h-full flex flex-col">
                                {/* Main Preview */}
                                <div className="flex-1 flex items-center justify-center relative">
                                    <img
                                        src={previewUrls[currentPreview]}
                                        alt={`Preview ${currentPreview + 1}`}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow"
                                    />

                                    {/* OCR Progress Overlay */}
                                    {step === 'ocr' && (
                                        <div className="absolute inset-0 bg-white/90 dark:bg-black/90 flex items-center justify-center rounded-lg">
                                            <div className="text-center">
                                                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Đang OCR... {ocrProgress}%
                                                </p>
                                                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-500 transition-all"
                                                        style={{ width: `${ocrProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {previewUrls.length > 1 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {previewUrls.map((url, i) => (
                                            <div
                                                key={i}
                                                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${currentPreview === i
                                                    ? 'border-purple-500'
                                                    : 'border-gray-200 dark:border-gray-600'
                                                    }`}
                                                onClick={() => setCurrentPreview(i)}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Thumb ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile(i);
                                                    }}
                                                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg text-xs flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12">
                                <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="font-medium text-gray-500">Kéo thả ảnh vào đây</p>
                                <p className="text-sm text-gray-400 mt-1">hoặc click để chọn file</p>
                                <label className="mt-4 inline-block">
                                    <span className="btn-secondary cursor-pointer">
                                        Chọn ảnh
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {files.length > 0 && step === 'upload' && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Button onClick={runOCR} className="w-full flex items-center justify-center gap-2">
                                <ScanLine className="w-5 h-5" />
                                Bắt đầu OCR ({files.length} ảnh)
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Result */}
                <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {step === 'edit' ? (
                                <>
                                    <Check className="w-4 h-4 text-green-500" />
                                    Kết quả ({parsedExam?.questions.length || 0} câu)
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 text-purple-500" />
                                    Kết quả
                                </>
                            )}
                        </h3>
                        {step === 'edit' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(parsedExam, null, 2))}
                                    className="p-2 text-gray-500 hover:text-purple-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Copy JSON"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={exportJSON}
                                    className="p-2 text-gray-500 hover:text-purple-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Download JSON"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={reset}
                                    className="p-2 text-gray-500 hover:text-purple-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Làm mới"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {step === 'edit' && parsedExam ? (
                            <div className="space-y-4">
                                {/* Exam Info */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        {parsedExam.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {parsedExam.subject && (
                                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                {parsedExam.subject}
                                            </span>
                                        )}
                                        {parsedExam.grade && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                Lớp {parsedExam.grade}
                                            </span>
                                        )}
                                        {parsedExam.duration && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                                {parsedExam.duration} phút
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Questions List */}
                                {parsedExam.questions.length > 0 ? (
                                    <div className="space-y-3">
                                        {parsedExam.questions.map((q, i) => (
                                            <div
                                                key={q.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center font-medium text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${q.type === 'MCQ'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : q.type === 'TF'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : q.type === 'ESSAY'
                                                                        ? 'bg-orange-100 text-orange-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {q.type}
                                                            </span>
                                                            {q.points && (
                                                                <span className="text-xs text-gray-500">
                                                                    {q.points} điểm
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-900 dark:text-white text-sm">
                                                            {q.prompt}
                                                        </p>
                                                        {q.options && (
                                                            <div className="mt-2 space-y-1">
                                                                {q.options.map((opt) => (
                                                                    <div
                                                                        key={opt.label}
                                                                        className={`text-sm px-2 py-1 rounded ${q.answer === opt.label
                                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                            }`}
                                                                    >
                                                                        <span className="font-medium">{opt.label}.</span> {opt.content}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Không parse được câu hỏi.</p>
                                        <p className="text-sm">Xem Raw Text bên dưới để chỉnh sửa thủ công.</p>
                                    </div>
                                )}

                                {/* Raw Text Collapsible */}
                                <details className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Xem Raw Text
                                    </summary>
                                    <textarea
                                        value={parsedExam.rawText}
                                        onChange={(e) => setParsedExam(prev => prev ? { ...prev, rawText: e.target.value } : null)}
                                        className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 font-mono text-sm resize-none"
                                    />
                                </details>
                            </div>
                        ) : step === 'parse' ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Sparkles className="w-12 h-12 animate-pulse text-purple-500 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        AI đang phân tích...
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Đang nhận diện cấu trúc câu hỏi
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500">Kết quả sẽ hiển thị tại đây</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Upload ảnh và nhấn "Bắt đầu OCR"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    {step === 'edit' && parsedExam && parsedExam.questions.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Button className="w-full flex items-center justify-center gap-2">
                                <ArrowRight className="w-5 h-5" />
                                Lưu vào Ngân hàng câu hỏi
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
