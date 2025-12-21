// Chú thích: PDF Export Service - Compile LaTeX to PDF
// Sử dụng external API (TeXLive.net hoặc Overleaf API) cho MVP

import type { ExamContent } from '@exam-matrix/shared';
import { exportExamToLatex, exportAnswerKeyToLatex } from './latex.js';

// TeXLive.net public API endpoint
const TEXLIVE_API = 'https://texlive.net/cgi-bin/latexcgi';

/**
 * Compile LaTeX source thành PDF bằng TeXLive.net API
 */
export async function compileLatexToPdf(latexSource: string): Promise<Blob> {
    try {
        const formData = new FormData();
        formData.append('filecontents[]', latexSource);
        formData.append('filename[]', 'document.tex');
        formData.append('engine', 'pdflatex');
        formData.append('return', 'pdf');

        const response = await fetch(TEXLIVE_API, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`LaTeX compilation failed: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('[pdf-export] Compilation error:', error);
        throw new Error('Không thể compile LaTeX sang PDF. Vui lòng thử lại sau.');
    }
}

/**
 * Export đề thi sang PDF
 */
export async function exportExamToPdf(exam: ExamContent): Promise<Blob> {
    const latexSource = await exportExamToLatex(exam);
    return compileLatexToPdf(latexSource);
}

/**
 * Export đáp án sang PDF
 */
export async function exportAnswerKeyToPdf(exam: ExamContent): Promise<Blob> {
    const latexSource = await exportAnswerKeyToLatex(exam);
    return compileLatexToPdf(latexSource);
}

/**
 * Utility: Download PDF blob as file
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Fallback: Download LaTeX source trực tiếp nếu PDF compile fail
 */
export function downloadLatexSource(source: string, filename: string): void {
    const blob = new Blob([source], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.tex') ? filename : `${filename}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const PDF_EXPORT_VERSION = 'pdf-export-v1.0.0';
