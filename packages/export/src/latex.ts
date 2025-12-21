// Chú thích: LaTeX Export module - tạo đề thi chuẩn với công thức toán/hóa học
// Sử dụng KaTeX cho MVP, có thể nâng cấp lên PDF LaTeX sau

// @ts-ignore - katex sẽ được install khi npm install
import katex from 'katex';
import type { ExamContent, Question } from '@exam-matrix/shared';

// Map Unicode subscript/superscript về LaTeX
const SUBSCRIPT_MAP: Record<string, string> = {
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4',
    '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9',
    '₊': '_+', '₋': '_-',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
    '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4',
    '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
    '⁺': '^+', '⁻': '^-',
};

/**
 * Convert Unicode subscript/superscript thành LaTeX syntax
 */
export function unicodeToLatex(text: string): string {
    let result = '';
    for (const char of text) {
        if (SUBSCRIPT_MAP[char]) {
            result += SUBSCRIPT_MAP[char];
        } else if (SUPERSCRIPT_MAP[char]) {
            result += SUPERSCRIPT_MAP[char];
        } else {
            result += char;
        }
    }
    return result;
}

/**
 * Convert công thức hóa học sang LaTeX
 * Ví dụ: H₂O → H_2O, CO₂ → CO_2
 */
export function chemFormulaToLatex(formula: string): string {
    // Patterns cho công thức hóa học
    // Subscript cho số nguyên tử: H2O, CO2, etc.
    let latex = formula
        // Convert Unicode subscripts trước
        .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => SUBSCRIPT_MAP[m] || m)
        // Convert số sau chữ thành subscript
        .replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}')
        // Convert ion charges: Fe2+, SO4^2-
        .replace(/\^(\d+)([+-])/g, '^{$1$2}')
        .replace(/([+-])$/g, '^{$1}');

    return `\\ce{${latex}}`;
}

/**
 * Render công thức toán học bằng KaTeX (trả về HTML)
 */
export function renderMathToHtml(formula: string, displayMode = false): string {
    try {
        return katex.renderToString(formula, {
            displayMode,
            throwOnError: false,
            output: 'html',
        });
    } catch (e) {
        console.warn('[latex] KaTeX render error:', e);
        return formula;
    }
}

/**
 * Escape LaTeX special characters
 */
export function escapeLatex(text: string): string {
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Format câu hỏi MCQ sang LaTeX
 */
function formatMCQLatex(q: Question, _index: number): string {
    const lines: string[] = [];

    lines.push(`\\question[${q.points}] ${escapeLatex(unicodeToLatex(q.prompt))}`);
    lines.push('\\begin{choices}');

    if (q.options) {
        for (const opt of q.options) {
            const marker = opt.label === q.answerKey ? '\\CorrectChoice' : '\\choice';
            lines.push(`  ${marker} ${escapeLatex(unicodeToLatex(opt.content))}`);
        }
    }

    lines.push('\\end{choices}');
    return lines.join('\n');
}

/**
 * Format câu hỏi True/False sang LaTeX
 */
function formatTFLatex(q: Question, _index: number): string {
    const lines: string[] = [];

    lines.push(`\\question[${q.points}] ${escapeLatex(unicodeToLatex(q.prompt))}`);
    lines.push('');
    lines.push('\\begin{parts}');

    if (q.tfItems) {
        for (const item of q.tfItems) {
            const answer = item.isTrue ? 'Đ' : 'S';
            lines.push(`  \\part ${escapeLatex(unicodeToLatex(item.statement))} \\hfill \\framebox[1cm]{${answer}}`);
        }
    }

    lines.push('\\end{parts}');
    return lines.join('\n');
}

/**
 * Format câu hỏi Short Answer sang LaTeX
 */
function formatShortLatex(q: Question, _index: number): string {
    const lines: string[] = [];

    lines.push(`\\question[${q.points}] ${escapeLatex(unicodeToLatex(q.prompt))}`);
    lines.push('');
    lines.push('\\fillwithlines{1cm}');

    return lines.join('\n');
}

/**
 * Format câu hỏi Essay sang LaTeX
 */
function formatEssayLatex(q: Question, _index: number): string {
    const lines: string[] = [];

    lines.push(`\\question[${q.points}] ${escapeLatex(unicodeToLatex(q.prompt))}`);
    lines.push('');
    lines.push('\\fillwithlines{5cm}');

    return lines.join('\n');
}

/**
 * Export đề thi sang LaTeX document
 */
export async function exportExamToLatex(exam: ExamContent): Promise<string> {
    const lines: string[] = [];

    // Preamble
    lines.push('\\documentclass[12pt,a4paper]{exam}');
    lines.push('\\usepackage[utf8]{inputenc}');
    lines.push('\\usepackage[vietnamese]{babel}');
    lines.push('\\usepackage{amsmath,amssymb}');
    lines.push('\\usepackage[version=4]{mhchem}'); // Cho công thức hóa học
    lines.push('\\usepackage{graphicx}');
    lines.push('\\usepackage{multicol}');
    lines.push('');

    // Header/Footer
    lines.push('\\header{}{\\textbf{' + escapeLatex(exam.title) + '}}{}');
    lines.push('\\footer{}{\\thepage/\\numpages}{}');
    lines.push('');

    // Exam info
    lines.push('\\begin{document}');
    lines.push('');
    lines.push('\\begin{center}');
    lines.push(`\\textbf{\\large ${escapeLatex(exam.title).toUpperCase()}}\\\\[0.5em]`);
    lines.push(`Môn: \\textbf{${escapeLatex(exam.subject)}} -- Lớp: \\textbf{${exam.grade}}\\\\[0.3em]`);
    lines.push(`Thời gian làm bài: \\textbf{${exam.duration} phút} (Không kể thời gian phát đề)\\\\[0.3em]`);
    lines.push(`Mã đề: \\textbf{${exam.versionCode || 'A'}}`);
    lines.push('\\end{center}');
    lines.push('');

    // Student info
    lines.push('\\vspace{0.5cm}');
    lines.push('Họ và tên thí sinh: \\dotfill\\quad Số báo danh: \\dotfill');
    lines.push('');
    lines.push('\\vspace{0.5cm}');
    lines.push('\\hrule');
    lines.push('\\vspace{0.5cm}');

    // Questions
    lines.push('\\begin{questions}');
    lines.push('');

    for (const section of exam.sections) {
        // Section header
        lines.push(`\\section*{${escapeLatex(section.title)}}`);

        if (section.instructions) {
            lines.push(`\\textit{${escapeLatex(section.instructions)}}`);
            lines.push('');
        }

        // Use 2 columns for MCQ
        if (section.type === 'MCQ') {
            lines.push('\\begin{multicols}{2}');
        }

        for (const q of section.questions) {
            switch (q.type) {
                case 'MCQ':
                    lines.push(formatMCQLatex(q, 0));
                    break;
                case 'TF':
                    lines.push(formatTFLatex(q, 0));
                    break;
                case 'SHORT':
                    lines.push(formatShortLatex(q, 0));
                    break;
                case 'ESSAY':
                    lines.push(formatEssayLatex(q, 0));
                    break;
            }
            lines.push('');
        }

        if (section.type === 'MCQ') {
            lines.push('\\end{multicols}');
        }
    }

    lines.push('\\end{questions}');
    lines.push('');

    // Footer
    lines.push('\\begin{center}');
    lines.push('\\textbf{----------- HẾT -----------}');
    lines.push('\\end{center}');
    lines.push('');
    lines.push('\\end{document}');

    return lines.join('\n');
}

/**
 * Export đáp án sang LaTeX
 */
export async function exportAnswerKeyToLatex(exam: ExamContent): Promise<string> {
    const lines: string[] = [];

    lines.push('\\documentclass[12pt,a4paper]{article}');
    lines.push('\\usepackage[utf8]{inputenc}');
    lines.push('\\usepackage[vietnamese]{babel}');
    lines.push('\\usepackage{longtable}');
    lines.push('');

    lines.push('\\begin{document}');
    lines.push('');
    lines.push('\\begin{center}');
    lines.push(`\\textbf{\\large ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM}\\\\[0.5em]`);
    lines.push(`Môn: \\textbf{${escapeLatex(exam.subject)}} -- Lớp: \\textbf{${exam.grade}}\\\\[0.3em]`);
    lines.push(`Mã đề: \\textbf{${exam.versionCode || 'A'}}`);
    lines.push('\\end{center}');
    lines.push('');

    let questionIndex = 1;

    for (const section of exam.sections) {
        lines.push(`\\section*{${escapeLatex(section.title)}}`);
        lines.push('');
        lines.push('\\begin{longtable}{|c|c|c|p{8cm}|}');
        lines.push('\\hline');
        lines.push('\\textbf{Câu} & \\textbf{Đáp án} & \\textbf{Điểm} & \\textbf{Hướng dẫn} \\\\');
        lines.push('\\hline');

        for (const q of section.questions) {
            const answer = escapeLatex(q.answerKey);
            const solution = q.solution ? escapeLatex(q.solution) : '';
            lines.push(`${questionIndex} & ${answer} & ${q.points} & ${solution} \\\\`);
            lines.push('\\hline');
            questionIndex++;
        }

        lines.push('\\end{longtable}');
        lines.push('');
    }

    lines.push('\\end{document}');

    return lines.join('\n');
}

// Version tracking
export const LATEX_EXPORT_VERSION = 'latex-export-v1.0.0';
