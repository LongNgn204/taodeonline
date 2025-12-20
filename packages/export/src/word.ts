// Chú thích: Export đề thi sang Word với subscript/superscript cho Hoá học
// Hỗ trợ ký hiệu: H₂O, CO₂, m³, cm², etc.

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from 'docx';
import type { ExamContent, Question } from '@exam-matrix/shared';

// Regex để detect subscript/superscript
const SUBSCRIPT_REGEX = /[₀₁₂₃₄₅₆₇₈₉₊₋]/g;
const SUPERSCRIPT_REGEX = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g;

// Map Unicode subscript về số thường
const SUBSCRIPT_MAP: Record<string, string> = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9',
    '₊': '+',
    '₋': '-',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
    '⁺': '+',
    '⁻': '-',
};

/**
 * Parse text và tạo TextRun với subscript/superscript
 */
function parseChemicalText(text: string): TextRun[] {
    const runs: TextRun[] = [];
    let currentText = '';
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (SUBSCRIPT_MAP[char]) {
            // Flush text hiện tại
            if (currentText) {
                runs.push(new TextRun({ text: currentText }));
                currentText = '';
            }
            // Add subscript
            runs.push(
                new TextRun({
                    text: SUBSCRIPT_MAP[char],
                    subScript: true,
                })
            );
        } else if (SUPERSCRIPT_MAP[char]) {
            if (currentText) {
                runs.push(new TextRun({ text: currentText }));
                currentText = '';
            }
            runs.push(
                new TextRun({
                    text: SUPERSCRIPT_MAP[char],
                    superScript: true,
                })
            );
        } else {
            currentText += char;
        }
        i++;
    }

    // Flush remaining text
    if (currentText) {
        runs.push(new TextRun({ text: currentText }));
    }

    return runs.length > 0 ? runs : [new TextRun({ text })];
}

/**
 * Tạo paragraph cho câu hỏi MCQ
 */
function createMCQParagraphs(q: Question, index: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Câu hỏi
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: `Câu ${index}: `, bold: true }),
                ...parseChemicalText(q.prompt),
            ],
            spacing: { before: 200 },
        })
    );

    // Options
    if (q.options) {
        for (const opt of q.options) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${opt.label}. ` }),
                        ...parseChemicalText(opt.content),
                    ],
                    indent: { left: 720 }, // 0.5 inch
                })
            );
        }
    }

    return paragraphs;
}

/**
 * Tạo paragraph cho câu hỏi True/False (4 ý)
 */
function createTFParagraphs(q: Question, index: number): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Câu hỏi chính
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: `Câu ${index}: `, bold: true }),
                ...parseChemicalText(q.prompt),
            ],
            spacing: { before: 200 },
        })
    );

    // 4 ý a, b, c, d
    if (q.tfItems) {
        for (const item of q.tfItems) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${item.id}) ` }),
                        ...parseChemicalText(item.statement),
                    ],
                    indent: { left: 720 },
                })
            );
        }
    }

    return paragraphs;
}

/**
 * Tạo paragraph cho câu hỏi Short Answer
 */
function createShortParagraphs(q: Question, index: number): Paragraph[] {
    return [
        new Paragraph({
            children: [
                new TextRun({ text: `Câu ${index}: `, bold: true }),
                ...parseChemicalText(q.prompt),
            ],
            spacing: { before: 200 },
        }),
        new Paragraph({
            children: [new TextRun({ text: 'Trả lời: ____________' })],
            indent: { left: 720 },
        }),
    ];
}

/**
 * Tạo paragraph cho câu hỏi Essay
 */
function createEssayParagraphs(q: Question, index: number): Paragraph[] {
    return [
        new Paragraph({
            children: [
                new TextRun({ text: `Câu ${index}: `, bold: true }),
                new TextRun({ text: `(${q.points} điểm) `, italics: true }),
                ...parseChemicalText(q.prompt),
            ],
            spacing: { before: 200 },
        }),
    ];
}

/**
 * Export đề thi sang Word document
 */
export async function exportExamToWord(exam: ExamContent): Promise<Buffer> {
    const sections: Paragraph[] = [];

    // Header
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: 'TRƯỜNG: ___________________', size: 24 })],
        })
    );

    sections.push(
        new Paragraph({
            text: exam.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Môn: ${exam.subject} - Lớp ${exam.grade}`,
                    bold: true,
                }),
            ],
            alignment: AlignmentType.CENTER,
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Thời gian: ${exam.duration} phút (không kể thời gian phát đề)`,
                    italics: true,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Sections
    let questionIndex = 1;

    for (const section of exam.sections) {
        // Section header
        sections.push(
            new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            })
        );

        if (section.instructions) {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: section.instructions, italics: true })],
                    spacing: { after: 200 },
                })
            );
        }

        // Questions
        for (const q of section.questions) {
            let questionParagraphs: Paragraph[] = [];

            switch (q.type) {
                case 'MCQ':
                    questionParagraphs = createMCQParagraphs(q, questionIndex);
                    break;
                case 'TF':
                    questionParagraphs = createTFParagraphs(q, questionIndex);
                    break;
                case 'SHORT':
                    questionParagraphs = createShortParagraphs(q, questionIndex);
                    break;
                case 'ESSAY':
                    questionParagraphs = createEssayParagraphs(q, questionIndex);
                    break;
            }

            sections.push(...questionParagraphs);
            questionIndex++;
        }
    }

    // Footer
    sections.push(
        new Paragraph({
            text: '--- HẾT ---',
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
        })
    );

    // Create document
    const doc = new Document({
        sections: [
            {
                children: sections,
            },
        ],
    });

    // Export to buffer
    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
}

/**
 * Export đáp án và hướng dẫn chấm
 */
export async function exportAnswerKeyToWord(
    exam: ExamContent,
    answerKey: { questionId: string; answer: string; rubric?: string }[]
): Promise<Buffer> {
    const sections: Paragraph[] = [];

    sections.push(
        new Paragraph({
            text: 'ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: `${exam.subject} - Lớp ${exam.grade}`, bold: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Answer table
    let questionIndex = 1;

    for (const section of exam.sections) {
        sections.push(
            new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300 },
            })
        );

        for (const q of section.questions) {
            const answer = answerKey.find((a) => a.questionId === q.id);

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `Câu ${questionIndex}: `, bold: true }),
                        new TextRun({ text: answer?.answer || q.answerKey }),
                        new TextRun({ text: ` (${q.points} điểm)`, italics: true }),
                    ],
                    spacing: { before: 100 },
                })
            );

            // Rubric cho tự luận
            if (q.type === 'ESSAY' && (answer?.rubric || q.solution)) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Hướng dẫn chấm: ', italics: true }),
                            new TextRun({ text: answer?.rubric || q.solution || '' }),
                        ],
                        indent: { left: 720 },
                    })
                );
            }

            questionIndex++;
        }
    }

    const doc = new Document({
        sections: [{ children: sections }],
    });

    return Buffer.from(await Packer.toBuffer(doc));
}
