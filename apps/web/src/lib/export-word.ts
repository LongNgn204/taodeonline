// Chú thích: Export utilities cho browser - LessonPlan và SKKN sang Word
// Dùng docx library + file-saver

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

// ===== LESSON PLAN EXPORT =====

interface LessonPlanData {
    title: string;
    subject: string;
    grade: number;
    duration: number;
    authorName?: string;
    schoolName?: string;
    content: Record<string, string>;
    policyRef?: string;
}

/**
 * Export Kế hoạch Bài dạy sang Word và download
 */
export async function exportLessonPlanToWord(data: LessonPlanData): Promise<void> {
    const sections: Paragraph[] = [];

    // Header
    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: data.schoolName || 'TRƯỜNG .......................', bold: true }),
            ],
            alignment: AlignmentType.CENTER,
        })
    );
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '_______________' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
        })
    );

    // Title
    sections.push(
        new Paragraph({
            text: 'KẾ HOẠCH BÀI DẠY',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: `Môn học: ${data.subject} - Lớp ${data.grade}`, bold: true }),
            ],
            alignment: AlignmentType.CENTER,
        })
    );
    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: `Thời lượng: ${data.duration} phút`, italics: true }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Tên bài
    if (data.content['info.title']) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Tên bài dạy: ', bold: true }),
                    new TextRun({ text: data.content['info.title'] }),
                ],
                spacing: { before: 200, after: 200 },
            })
        );
    }

    // I. MỤC TIÊU
    sections.push(
        new Paragraph({
            text: 'I. MỤC TIÊU',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
        })
    );

    if (data.content['objectives.knowledge']) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: '1. Về kiến thức', bold: true })],
                spacing: { before: 100 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['objectives.knowledge'] })],
                indent: { left: 360 },
            })
        );
    }

    if (data.content['objectives.competencies']) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: '2. Về năng lực', bold: true })],
                spacing: { before: 100 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['objectives.competencies'] })],
                indent: { left: 360 },
            })
        );
    }

    if (data.content['objectives.qualities']) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: '3. Về phẩm chất', bold: true })],
                spacing: { before: 100 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['objectives.qualities'] })],
                indent: { left: 360 },
            })
        );
    }

    // II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
    sections.push(
        new Paragraph({
            text: 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
        })
    );

    if (data.content['materials.teacher']) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '- Giáo viên: ', bold: true }),
                    new TextRun({ text: data.content['materials.teacher'] }),
                ],
            })
        );
    }
    if (data.content['materials.student']) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '- Học sinh: ', bold: true }),
                    new TextRun({ text: data.content['materials.student'] }),
                ],
            })
        );
    }

    // III. TIẾN TRÌNH DẠY HỌC
    sections.push(
        new Paragraph({
            text: 'III. TIẾN TRÌNH DẠY HỌC',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
        })
    );

    // 4 hoạt động
    const activities = [
        { id: 'opening', title: 'Hoạt động 1: Khởi động/Mở đầu' },
        { id: 'knowledge', title: 'Hoạt động 2: Hình thành kiến thức mới' },
        { id: 'practice', title: 'Hoạt động 3: Luyện tập' },
        { id: 'application', title: 'Hoạt động 4: Vận dụng' },
    ];

    for (const act of activities) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: act.title, bold: true })],
                spacing: { before: 200 },
            })
        );

        const prefix = `activities.${act.id}`;

        if (data.content[`${prefix}.goal`]) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'a) Mục tiêu: ', bold: true }),
                        new TextRun({ text: data.content[`${prefix}.goal`] }),
                    ],
                    indent: { left: 360 },
                })
            );
        }
        if (data.content[`${prefix}.content`]) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'b) Nội dung: ', bold: true }),
                        new TextRun({ text: data.content[`${prefix}.content`] }),
                    ],
                    indent: { left: 360 },
                })
            );
        }
        if (data.content[`${prefix}.product`]) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'c) Sản phẩm: ', bold: true }),
                        new TextRun({ text: data.content[`${prefix}.product`] }),
                    ],
                    indent: { left: 360 },
                })
            );
        }
        if (data.content[`${prefix}.organization`]) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'd) Tổ chức thực hiện:', bold: true }),
                    ],
                    indent: { left: 360 },
                })
            );
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: data.content[`${prefix}.organization`] })],
                    indent: { left: 720 },
                })
            );
        }
    }

    // Footer
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '----------- HẾT -----------' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
        })
    );

    if (data.authorName) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Người soạn: ', italics: true }),
                    new TextRun({ text: data.authorName }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 300 },
            })
        );
    }

    const doc = new Document({
        sections: [{ children: sections }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `KHBD_${data.subject}_Lop${data.grade}_${data.title.replace(/\s+/g, '_').slice(0, 30)}.docx`;
    saveAs(blob, filename);
}

// ===== SKKN EXPORT =====

interface SkknData {
    title: string;
    category: string;
    subject?: string;
    authorName?: string;
    authorTitle?: string;
    schoolName?: string;
    year?: number;
    content: Record<string, string>;
}

/**
 * Export Sáng kiến Kinh nghiệm sang Word và download
 */
export async function exportSkknToWord(data: SkknData): Promise<void> {
    const sections: Paragraph[] = [];

    // Header
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: data.schoolName || 'TRƯỜNG .......................', bold: true })],
            alignment: AlignmentType.CENTER,
        })
    );
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '_______________' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Title
    sections.push(
        new Paragraph({
            text: 'SÁNG KIẾN KINH NGHIỆM',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [new TextRun({ text: data.title, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        })
    );

    if (data.subject) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: `Lĩnh vực/Môn: ${data.subject}`, italics: true })],
                alignment: AlignmentType.CENTER,
            })
        );
    }

    sections.push(
        new Paragraph({
            children: [new TextRun({ text: `Năm học: ${data.year || new Date().getFullYear()}`, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // PHẦN I. MỞ ĐẦU
    sections.push(
        new Paragraph({
            text: 'PHẦN I. MỞ ĐẦU',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
        })
    );

    const openingSections = [
        { id: 'opening.title', title: '1.1. Tên sáng kiến' },
        { id: 'opening.author', title: '1.2. Tác giả' },
        { id: 'opening.reason', title: '1.3. Lý do chọn đề tài' },
        { id: 'opening.objectives', title: '1.4. Mục đích nghiên cứu' },
        { id: 'opening.tasks', title: '1.5. Nhiệm vụ nghiên cứu' },
        { id: 'opening.subject', title: '1.6. Đối tượng và phạm vi nghiên cứu' },
        { id: 'opening.methods', title: '1.7. Phương pháp nghiên cứu' },
    ];

    for (const s of openingSections) {
        if (data.content[s.id]) {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: s.title, bold: true })],
                    spacing: { before: 150 },
                })
            );
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: data.content[s.id] })],
                    indent: { left: 360 },
                })
            );
        }
    }

    // PHẦN II. NỘI DUNG
    sections.push(
        new Paragraph({
            text: 'PHẦN II. NỘI DUNG',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
        })
    );

    if (data.content['content.theory']) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: '2.1. Cơ sở lý luận của vấn đề', bold: true })],
                spacing: { before: 150 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['content.theory'] })],
                indent: { left: 360 },
            })
        );
    }

    // Thực trạng
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '2.2. Thực trạng của vấn đề', bold: true })],
            spacing: { before: 150 },
        })
    );

    for (const sub of ['advantages', 'difficulties', 'data']) {
        const key = `content.situation.${sub}`;
        if (data.content[key]) {
            const labels: Record<string, string> = {
                advantages: 'a) Thuận lợi',
                difficulties: 'b) Khó khăn',
                data: 'c) Số liệu khảo sát',
            };
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: labels[sub], italics: true })],
                    indent: { left: 360 },
                })
            );
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: data.content[key] })],
                    indent: { left: 720 },
                })
            );
        }
    }

    // Giải pháp
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '2.3. Các giải pháp đã sử dụng', bold: true })],
            spacing: { before: 150 },
        })
    );

    for (let i = 1; i <= 5; i++) {
        const key = `content.solutions.s${i}`;
        if (data.content[key]) {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: `Giải pháp ${i}:`, italics: true })],
                    indent: { left: 360 },
                    spacing: { before: 100 },
                })
            );
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: data.content[key] })],
                    indent: { left: 720 },
                })
            );
        }
    }

    if (data.content['content.results']) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: '2.4. Hiệu quả của sáng kiến', bold: true })],
                spacing: { before: 150 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['content.results'] })],
                indent: { left: 360 },
            })
        );
    }

    // PHẦN III. KẾT LUẬN VÀ KIẾN NGHỊ
    sections.push(
        new Paragraph({
            text: 'PHẦN III. KẾT LUẬN VÀ KIẾN NGHỊ',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
        })
    );

    const conclusionSections = [
        { id: 'conclusion.summary', title: '3.1. Kết luận' },
        { id: 'conclusion.lessons', title: '3.2. Bài học kinh nghiệm' },
        { id: 'conclusion.recommendations', title: '3.3. Kiến nghị' },
    ];

    for (const s of conclusionSections) {
        if (data.content[s.id]) {
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: s.title, bold: true })],
                    spacing: { before: 150 },
                })
            );
            sections.push(
                new Paragraph({
                    children: [new TextRun({ text: data.content[s.id] })],
                    indent: { left: 360 },
                })
            );
        }
    }

    // PHẦN IV. TÀI LIỆU THAM KHẢO
    if (data.content['references.list']) {
        sections.push(
            new Paragraph({
                text: 'PHẦN IV. TÀI LIỆU THAM KHẢO',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 200 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.content['references.list'] })],
                indent: { left: 360 },
            })
        );
    }

    // Footer
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: '----------- HẾT -----------' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
        })
    );

    if (data.authorName) {
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: 'Người viết', italics: true })],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 300 },
            })
        );
        sections.push(
            new Paragraph({
                children: [new TextRun({ text: data.authorName, bold: true })],
                alignment: AlignmentType.RIGHT,
            })
        );
    }

    const doc = new Document({
        sections: [{ children: sections }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `SKKN_${data.title.replace(/\s+/g, '_').slice(0, 40)}_${data.year || new Date().getFullYear()}.docx`;
    saveAs(blob, filename);
}
