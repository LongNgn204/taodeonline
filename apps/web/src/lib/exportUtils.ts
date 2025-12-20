import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Helper to format date
const formatDate = () => {
    const d = new Date();
    return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
};

/**
 * Export Exam to Word (.docx)
 * Follows standard Vietnamese exam format
 */
export const exportExamToWord = async (exam: any, title: string = 'ĐỀ THI') => {
    // 1. Header Section (Sở GD&ĐT / Trường...)
    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'SỞ GD&ĐT TỈNH........',
                                        bold: true,
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'TRƯỜNG THPT........', // Replace with dynamic if avail
                                        bold: true,
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'ĐỀ KIỂM TRA....................',
                                        bold: true,
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({
                                text: 'Môn: ........................',
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({
                                text: 'Thời gian làm bài: ..... phút',
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });

    // 2. Exam Body Content
    const children: any[] = [
        headerTable,
        new Paragraph({ text: '' }), // Spacer
        new Paragraph({
            children: [
                new TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: `Ngày tạo: ${formatDate()}`,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
    ];

    // Process questions
    // Assuming exam structure: sections -> questions
    // Or flat questions array. Adjusting based on typical mock data structure.

    // Safety check for exam structure
    const sections = exam.sections || [exam];

    sections.forEach((section: any) => {
        if (section.title) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title,
                            bold: true,
                        })
                    ],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 }
                })
            );
        }

        const questions = section.questions || [];
        questions.forEach((q: any, qIdx: number) => {
            // Question Text
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Câu ${qIdx + 1}: `,
                            bold: true,
                        }),
                        new TextRun(q.content || q.text || ''),
                    ],
                    spacing: { before: 100, after: 100 }
                })
            );

            // Options (A, B, C, D)
            if (q.options && Array.isArray(q.options)) {
                // Try to put options in a grid if short, or list if long
                // For simplified Word gen, just new lines
                q.options.forEach((opt: any, oIdx: number) => {
                    const label = String.fromCharCode(65 + oIdx); // A, B, C...
                    children.push(
                        new Paragraph({
                            text: `${label}. ${opt.content || opt}`,
                            indent: { left: 720 }, // ~0.5 inch
                        })
                    );
                });
            }

            children.push(new Paragraph({ text: '' }));
        });
    });

    // Footer / End
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: '--- HẾT ---',
                    bold: true,
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 }
        })
    );

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
};

/**
 * Export Matrix to Excel (.xlsx)
 */
export const exportMatrixToExcel = (matrix: any, filename: string = 'Ma_tran_de_thi') => {
    // Transform matrix data into tabular format
    // Pivot: Topic | Level | Type | Count | Points
    const data: any[] = [];

    // Use matrix.topics or similar structure
    const topics = matrix.topics || [];

    topics.forEach((topic: any) => {
        // Assume topic has levels or questions
        // This depends heavily on matrix structure. 
        // fallback to simplified output if specific structure unknown
        data.push({
            'Chủ đề': topic.name,
            'Nhận biết': topic.levels?.nb || 0,
            'Thông hiểu': topic.levels?.th || 0,
            'Vận dụng': topic.levels?.vd || 0,
            'Vận dụng cao': topic.levels?.vdc || 0,
            'Tổng câu': topic.totalQuestions || 0,
            'Tổng điểm': topic.totalPoints || 0
        });
    });

    // Add summary row
    if (matrix.summary) {
        data.push({}); // spacer
        data.push({ 'Chủ đề': 'TỔNG KẾT' });
        // Add summary details if available
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ma trận");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(dataBlob, `${filename}.xlsx`);
};
