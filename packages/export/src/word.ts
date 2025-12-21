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
    SectionType,
} from 'docx';
import {
    type ExamContent,
    type Question,
    type FormTemplate,
    getFormTemplate,
    validateExamForm,
} from '@exam-matrix/shared';

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

type TextStyle = {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
    font?: string;
};

function buildRunStyle(template: FormTemplate, style?: TextStyle) {
    return {
        bold: style?.bold,
        italics: style?.italics,
        underline: style?.underline ? {} : undefined,
        size: style?.size ?? template.typography.fontSize,
        font: style?.font ?? template.typography.fontFamily,
    };
}

/**
 * Parse text và tạo TextRun với subscript/superscript
 */
function parseChemicalText(text: string, template: FormTemplate, style?: TextStyle): TextRun[] {
    const runs: TextRun[] = [];
    let currentText = '';
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (SUBSCRIPT_MAP[char]) {
            // Flush text hiện tại
            if (currentText) {
                runs.push(new TextRun({ text: currentText, ...buildRunStyle(template, style) }));
                currentText = '';
            }
            // Add subscript
            runs.push(
                new TextRun({
                    text: SUBSCRIPT_MAP[char],
                    subScript: true,
                    ...buildRunStyle(template, style),
                })
            );
        } else if (SUPERSCRIPT_MAP[char]) {
            if (currentText) {
                runs.push(new TextRun({ text: currentText, ...buildRunStyle(template, style) }));
                currentText = '';
            }
            runs.push(
                new TextRun({
                    text: SUPERSCRIPT_MAP[char],
                    superScript: true,
                    ...buildRunStyle(template, style),
                })
            );
        } else {
            currentText += char;
        }
        i++;
    }

    // Flush remaining text
    if (currentText) {
        runs.push(new TextRun({ text: currentText, ...buildRunStyle(template, style) }));
    }

    return runs.length > 0
        ? runs
        : [new TextRun({ text, ...buildRunStyle(template, style) })];
}

/**
 * Tạo paragraph cho câu hỏi MCQ
 */
function createMCQParagraphs(
    q: Question,
    label: string,
    template: FormTemplate
): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Câu hỏi
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: label, ...buildRunStyle(template, { bold: true }) }),
                ...parseChemicalText(q.prompt, template),
            ],
            spacing: { before: template.spacing.questionBefore, line: template.typography.lineSpacing },
        })
    );

    // Options
    if (q.options) {
        for (const opt of q.options) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${opt.label}. `, ...buildRunStyle(template) }),
                        ...parseChemicalText(opt.content, template),
                    ],
                    indent: { left: template.spacing.optionIndent },
                    spacing: { line: template.typography.lineSpacing },
                })
            );
        }
    }

    return paragraphs;
}

/**
 * Tạo paragraph cho câu hỏi True/False (4 ý)
 */
function createTFParagraphs(
    q: Question,
    label: string,
    template: FormTemplate
): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Câu hỏi chính
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: label, ...buildRunStyle(template, { bold: true }) }),
                ...parseChemicalText(q.prompt, template),
            ],
            spacing: { before: template.spacing.questionBefore, line: template.typography.lineSpacing },
        })
    );

    // 4 ý a, b, c, d
    if (q.tfItems) {
        for (const item of q.tfItems) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${item.id}) `, ...buildRunStyle(template) }),
                        ...parseChemicalText(item.statement, template),
                    ],
                    indent: { left: template.spacing.optionIndent },
                    spacing: { line: template.typography.lineSpacing },
                })
            );
        }
    }

    return paragraphs;
}

/**
 * Tạo paragraph cho câu hỏi Short Answer
 */
function createShortParagraphs(
    q: Question,
    label: string,
    template: FormTemplate
): Paragraph[] {
    return [
        new Paragraph({
            children: [
                new TextRun({ text: label, ...buildRunStyle(template, { bold: true }) }),
                ...parseChemicalText(q.prompt, template),
            ],
            spacing: { before: template.spacing.questionBefore, line: template.typography.lineSpacing },
        }),
        new Paragraph({
            children: [new TextRun({ text: 'Trả lời: ____________', ...buildRunStyle(template) })],
            indent: { left: template.spacing.optionIndent },
            spacing: { line: template.typography.lineSpacing },
        }),
    ];
}

/**
 * Tạo paragraph cho câu hỏi Essay
 */
function createEssayParagraphs(
    q: Question,
    label: string,
    template: FormTemplate
): Paragraph[] {
    return [
        new Paragraph({
            children: [
                new TextRun({ text: label, ...buildRunStyle(template, { bold: true }) }),
                new TextRun({
                    text: `(${q.points} điểm) `,
                    ...buildRunStyle(template, { italics: true }),
                }),
                ...parseChemicalText(q.prompt, template),
            ],
            spacing: { before: template.spacing.questionBefore, line: template.typography.lineSpacing },
        }),
    ];
}

function applyHeaderTokens(text: string, exam: ExamContent): string {
    return text
        .replace(/\{examTitleUpper\}/g, exam.title.toUpperCase())
        .replace(/\{examTitle\}/g, exam.title)
        .replace(/\{subject\}/g, exam.subject)
        .replace(/\{grade\}/g, String(exam.grade))
        .replace(/\{duration\}/g, String(exam.duration));
}

function formatQuestionLabel(template: FormTemplate, index: number): string {
    return template.numbering.questionLabelTemplate.replace(/\{n\}/g, String(index));
}

function orderSections(exam: ExamContent, template: FormTemplate) {
    const remaining = [...exam.sections];
    const ordered = template.sections.map((sectionTemplate) => {
        const matchIndex = remaining.findIndex((s) => s.type === sectionTemplate.type);
        if (matchIndex >= 0) {
            const [section] = remaining.splice(matchIndex, 1);
            return { section, template: sectionTemplate };
        }
        return {
            section: {
                type: sectionTemplate.type,
                title: sectionTemplate.title,
                instructions: sectionTemplate.instructions,
                questions: [],
                totalPoints: 0,
            },
            template: sectionTemplate,
        };
    });

    for (const section of remaining) {
        ordered.push({ section, template: { type: section.type, title: section.title } });
    }

    return ordered;
}

/**
 * Export đề thi sang Word document
 */

/**
 * Export đề thi sang Word document (Chuẩn form thi)
 */
export async function exportExamToWord(exam: ExamContent): Promise<Buffer> {
    const template = getFormTemplate(exam.formId);
    const validation = validateExamForm(exam, template);
    if (!validation.valid) {
        console.warn('[export] form validation warnings:', validation.issues);
    }

    // 1. Header Section (1 Column)
    // Table 2 columns: Left = Department/School, Right = Exam Info
    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [
                            ...template.header.leftLines.map((line) => new Paragraph({
                                children: [
                                    new TextRun({
                                        text: applyHeaderTokens(line.text, exam),
                                        ...buildRunStyle(template, {
                                            bold: line.bold,
                                            italics: line.italics,
                                            underline: line.underline,
                                            size: line.size ?? template.typography.headerFontSize,
                                        }),
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            })),
                            ...(template.header.showSeparatorLine
                                ? [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: '__________________',
                                                ...buildRunStyle(template, { bold: true }),
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { after: 200 },
                                    }),
                                ]
                                : []),
                        ],
                    }),
                    new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: template.header.rightLines.map((line) => new Paragraph({
                            children: [
                                new TextRun({
                                    text: applyHeaderTokens(line.text, exam),
                                    ...buildRunStyle(template, {
                                        bold: line.bold,
                                        italics: line.italics,
                                        underline: line.underline,
                                        size: line.size ?? template.typography.headerFontSize,
                                    }),
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        })),
                    }),
                ],
            }),
        ],
    });

    // Student Info area
    const studentInfo = new Paragraph({
        children: [
            new TextRun({
                text: 'Họ và tên thí sinh: .............................................................. ',
                ...buildRunStyle(template),
            }),
            new TextRun({ text: 'Số báo danh: .....................', ...buildRunStyle(template, { bold: true }) }),
        ],
        spacing: { before: 200, after: template.spacing.headerAfter, line: template.typography.lineSpacing },
    });

    const headerChildren = template.header.showStudentInfo ? [headerTable, studentInfo] : [headerTable];

    // 2. Questions Section (2 Columns)
    const questionChildren: Paragraph[] = [];
    let questionIndex = template.numbering.startAt;
    const orderedSections = orderSections(exam, template);

    for (const { section, template: sectionTemplate } of orderedSections) {
        // Section Header
        questionChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: sectionTemplate.title,
                        ...buildRunStyle(template, { bold: true, underline: true }),
                    }),
                ],
                spacing: {
                    before: template.spacing.sectionTitleBefore,
                    after: template.spacing.sectionTitleAfter,
                    line: template.typography.lineSpacing,
                },
            })
        );

        const instructions = section.instructions || sectionTemplate.instructions;
        if (instructions) {
            questionChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: instructions,
                            ...buildRunStyle(template, { italics: true }),
                        }),
                    ],
                    spacing: { after: template.spacing.sectionTitleAfter, line: template.typography.lineSpacing },
                })
            );
        }

        // Questions
        for (const q of section.questions) {
            let questionParagraphs: Paragraph[] = [];
            const label = formatQuestionLabel(template, questionIndex);

            switch (q.type) {
                case 'MCQ':
                    questionParagraphs = createMCQParagraphs(q, label, template);
                    break;
                case 'TF':
                    questionParagraphs = createTFParagraphs(q, label, template);
                    break;
                case 'SHORT':
                    questionParagraphs = createShortParagraphs(q, label, template);
                    break;
                case 'ESSAY':
                    questionParagraphs = createEssayParagraphs(q, label, template);
                    break;
            }

            questionChildren.push(...questionParagraphs);

            if (template.numbering.mode === 'global') {
                questionIndex++;
            } else if (template.numbering.mode === 'per_section') {
                questionIndex++;
            }
        }

        if (template.numbering.mode === 'per_section') {
            questionIndex = template.numbering.startAt;
        }
    }

    // Footer content (End marker)
    questionChildren.push(
        new Paragraph({
            text: '----------- HẾT -----------',
            alignment: AlignmentType.CENTER,
            spacing: { before: template.spacing.footerBefore },
        })
    );

    // Create document with 2 sections: Header (1 col) and Body (2 cols)
    const doc = new Document({
        sections: [
            {
                properties: {
                    type: SectionType.CONTINUOUS, // Or NEXT_PAGE if separate, but usually on same page
                },
                children: headerChildren,
            },
            {
                properties: {
                    type: SectionType.CONTINUOUS,
                    column: {
                        count: template.layout.columns,
                        space: template.spacing.columnGap,
                        separate: true, // vertical line between columns? optional
                    },
                },
                children: questionChildren,
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
    const template = getFormTemplate(exam.formId);

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
                new TextRun({
                    text: `${exam.subject} - Lớp ${exam.grade}`,
                    ...buildRunStyle(template, { bold: true }),
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Answer table
    let questionIndex = template.numbering.startAt;

    for (const { section, template: sectionTemplate } of orderSections(exam, template)) {
        sections.push(
            new Paragraph({
                text: sectionTemplate.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300 },
            })
        );

        for (const q of section.questions) {
            const answer = answerKey.find((a) => a.questionId === q.id);
            const label = formatQuestionLabel(template, questionIndex);

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: label, ...buildRunStyle(template, { bold: true }) }),
                        new TextRun({ text: answer?.answer || q.answerKey, ...buildRunStyle(template) }),
                        new TextRun({
                            text: ` (${q.points} điểm)`,
                            ...buildRunStyle(template, { italics: true }),
                        }),
                    ],
                    spacing: { before: 100 },
                })
            );

            // Rubric cho tự luận
            if (q.type === 'ESSAY' && (answer?.rubric || q.solution)) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Hướng dẫn chấm: ',
                                ...buildRunStyle(template, { italics: true }),
                            }),
                            new TextRun({
                                text: answer?.rubric || q.solution || '',
                                ...buildRunStyle(template),
                            }),
                        ],
                        indent: { left: 720 },
                    })
                );
            }

            questionIndex++;
        }

        if (template.numbering.mode === 'per_section') {
            questionIndex = template.numbering.startAt;
        }
    }

    const doc = new Document({
        sections: [{ children: sections }],
    });

    return Buffer.from(await Packer.toBuffer(doc));
}
