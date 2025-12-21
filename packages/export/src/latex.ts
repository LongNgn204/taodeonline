// Chú thích: Export đề thi sang LaTeX (.tex) theo form cơ bản

import type { ExamContent, Question } from '@exam-matrix/shared';

const LATEX_SPECIAL_CHARS: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '#': '\\#',
    '$': '\\$',
    '%': '\\%',
    '&': '\\&',
    '_': '\\_',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
};

// Chú thích: Escape ký tự đặc biệt để tránh vỡ cú pháp LaTeX
function escapeLatex(text: string): string {
    return text
        .split('')
        .map((char) => LATEX_SPECIAL_CHARS[char] ?? char)
        .join('')
        .replace(/\r\n|\r|\n/g, '\\\\');
}

function formatQuestionPrompt(prefix: string, prompt: string): string {
    return `\\textbf{${prefix}} ${escapeLatex(prompt)}`;
}

function renderMCQ(question: Question, index: number): string[] {
    const lines: string[] = [];
    lines.push(formatQuestionPrompt(`Câu ${index}:`, question.prompt));

    if (question.options?.length) {
        lines.push('\\begin{enumerate}[label=\\Alph*.]');
        for (const option of question.options) {
            lines.push(`\\item ${escapeLatex(option.content)}`);
        }
        lines.push('\\end{enumerate}');
    }

    return lines;
}

function renderTF(question: Question, index: number): string[] {
    const lines: string[] = [];
    lines.push(formatQuestionPrompt(`Câu ${index}:`, question.prompt));

    if (question.tfItems?.length) {
        lines.push('\\begin{enumerate}[label=\\alph*)]');
        for (const item of question.tfItems) {
            lines.push(`\\item ${escapeLatex(item.statement)}`);
        }
        lines.push('\\end{enumerate}');
    }

    return lines;
}

function renderShort(question: Question, index: number): string[] {
    return [
        formatQuestionPrompt(`Câu ${index}:`, question.prompt),
        '\\textit{Trả lời:} \\dotfill',
    ];
}

function renderEssay(question: Question, index: number): string[] {
    return [
        `\\textbf{Câu ${index}:} \\textit{(${question.points} điểm)} ${escapeLatex(question.prompt)}`,
    ];
}

// Chú thích: Render câu hỏi theo loại để tái sử dụng cho đề và đáp án
function renderQuestion(question: Question, index: number): string[] {
    switch (question.type) {
        case 'MCQ':
            return renderMCQ(question, index);
        case 'TF':
            return renderTF(question, index);
        case 'SHORT':
            return renderShort(question, index);
        case 'ESSAY':
            return renderEssay(question, index);
        default:
            return [formatQuestionPrompt(`Câu ${index}:`, question.prompt)];
    }
}

export function exportExamToLatex(exam: ExamContent): string {
    const lines: string[] = [];

    lines.push('\\documentclass[12pt]{article}');
    lines.push('\\usepackage[utf8]{inputenc}');
    lines.push('\\usepackage[T5]{fontenc}');
    lines.push('\\usepackage[vietnamese]{babel}');
    lines.push('\\usepackage{geometry}');
    lines.push('\\usepackage{enumitem}');
    lines.push('\\geometry{a4paper, margin=2cm}');
    lines.push('\\setlength{\\parindent}{0pt}');
    lines.push('\\setlist{nosep}');
    lines.push('\\begin{document}');

    // Header form
    lines.push('\\begin{tabular}{p{0.45\\textwidth} p{0.55\\textwidth}}');
    lines.push('\\begin{minipage}[t]{0.45\\textwidth}\\centering');
    lines.push('\\textbf{SỞ GD\&ĐT ....................} \\\\');
    lines.push('\\textbf{TRƯỜNG THPT ....................} \\\\');
    lines.push('\\textbf{\\rule{6cm}{0.4pt}}');
    lines.push('\\end{minipage} &');
    lines.push('\\begin{minipage}[t]{0.55\\textwidth}\\centering');
    lines.push(`\\textbf{${escapeLatex(exam.title.toUpperCase())}} \\\\`);
    lines.push(`\\textbf{Môn: ${escapeLatex(exam.subject)} - Lớp ${exam.grade}} \\\\`);
    lines.push(`\\textit{Thời gian làm bài: ${exam.duration} phút} \\\\`);
    lines.push('\\textit{(Không kể thời gian phát đề)}');
    lines.push('\\end{minipage} \\\\');
    lines.push('\\end{tabular}');

    lines.push('');
    lines.push('Họ và tên thí sinh: ..............................................................');
    lines.push('Số báo danh: .....................');
    lines.push('\\vspace{0.5cm}');

    let questionIndex = 1;
    for (const section of exam.sections) {
        lines.push(`\\section*{${escapeLatex(section.title)}}`);
        if (section.instructions) {
            lines.push(`\\textit{${escapeLatex(section.instructions)}}`);
        }
        lines.push('');

        for (const question of section.questions) {
            lines.push(...renderQuestion(question, questionIndex));
            lines.push('');
            questionIndex += 1;
        }
    }

    lines.push('\\begin{center}');
    lines.push('\\textbf{----------- HẾT -----------}');
    lines.push('\\end{center}');

    lines.push('\\newpage');
    lines.push('\\section*{ĐÁP ÁN}');

    for (const section of exam.sections) {
        lines.push(`\\textbf{${escapeLatex(section.title)}}`);
        lines.push('\\begin{enumerate}[label=\\textbf{Câu \\arabic*:}, leftmargin=*]');
        for (const question of section.questions) {
            lines.push(`\\item ${escapeLatex(question.answerKey)} \\textit{(${question.points} điểm)}`);
        }
        lines.push('\\end{enumerate}');
        lines.push('');
    }

    lines.push('\\end{document}');

    return lines.join('\n');
}
