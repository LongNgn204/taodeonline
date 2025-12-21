// Chú thích: Các helper cho form template và validate cấu trúc đề thi

import type { ExamContent } from '../schemas/exam.js';
import type {
    FormTemplate,
    ExamFormId,
    FormValidationResult,
    FormValidationIssue,
} from '../types/index.js';

const DEFAULT_FORM_ID: ExamFormId = 'standard_v1';

export const EXAM_FORM_TEMPLATES: Record<ExamFormId, FormTemplate> = {
    standard_v1: {
        formId: 'standard_v1',
        header: {
            leftLines: [
                { text: 'SỞ GD&ĐT ....................', bold: true },
                { text: 'TRƯỜNG THPT ....................', bold: true },
            ],
            rightLines: [
                { text: '{examTitleUpper}', bold: true },
                { text: 'Môn: {subject} - Lớp {grade}', bold: true },
                { text: 'Thời gian làm bài: {duration} phút', italics: true },
                { text: '(Không kể thời gian phát đề)', italics: true, size: 20 },
            ],
            showSeparatorLine: true,
            showStudentInfo: true,
        },
        sections: [
            {
                type: 'MCQ',
                title: 'PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN',
            },
            {
                type: 'TF',
                title: 'PHẦN II. ĐÚNG/SAI',
            },
            {
                type: 'SHORT',
                title: 'PHẦN III. TRẢ LỜI NGẮN',
            },
            {
                type: 'ESSAY',
                title: 'PHẦN IV. TỰ LUẬN',
            },
        ],
        numbering: {
            mode: 'global',
            startAt: 1,
            questionLabelTemplate: 'Câu {n}: ',
        },
        typography: {
            fontFamily: 'Times New Roman',
            fontSize: 24,
            headerFontSize: 26,
            lineSpacing: 240,
        },
        spacing: {
            headerAfter: 400,
            sectionTitleBefore: 200,
            sectionTitleAfter: 200,
            questionBefore: 200,
            optionIndent: 720,
            columnGap: 720,
            footerBefore: 400,
        },
        layout: {
            columns: 2,
        },
    },
};

export function getFormTemplate(formId?: ExamFormId | string | null): FormTemplate {
    if (!formId) return EXAM_FORM_TEMPLATES[DEFAULT_FORM_ID];
    return (EXAM_FORM_TEMPLATES as Record<string, FormTemplate>)[formId] || EXAM_FORM_TEMPLATES[DEFAULT_FORM_ID];
}

function normalizeTitle(value: string): string {
    return value.replace(/\s+/g, ' ').trim().toUpperCase();
}

function pushIssue(issues: FormValidationIssue[], code: string, message: string) {
    issues.push({ code, message });
}

export function validateExamForm(exam: ExamContent, template?: FormTemplate): FormValidationResult {
    const form = template ?? getFormTemplate(exam.formId);
    const issues: FormValidationIssue[] = [];

    // 1) Header bắt buộc
    if (!exam.title?.trim()) {
        pushIssue(issues, 'header.title_missing', 'Thiếu tiêu đề đề thi (title).');
    }
    if (!exam.subject?.trim()) {
        pushIssue(issues, 'header.subject_missing', 'Thiếu môn học (subject).');
    }
    if (!Number.isFinite(exam.grade)) {
        pushIssue(issues, 'header.grade_missing', 'Thiếu lớp (grade).');
    }
    if (!Number.isFinite(exam.duration)) {
        pushIssue(issues, 'header.duration_missing', 'Thiếu thời lượng (duration).');
    }

    // 2) Số phần & tên phần theo form
    if (exam.sections.length !== form.sections.length) {
        pushIssue(
            issues,
            'sections.count_mismatch',
            `Số phần không khớp form: hiện có ${exam.sections.length}, cần ${form.sections.length}.`
        );
    }

    form.sections.forEach((expected, idx) => {
        const actual = exam.sections[idx];
        if (!actual) return;

        if (actual.type !== expected.type) {
            pushIssue(
                issues,
                'sections.type_mismatch',
                `Phần ${idx + 1} sai loại câu hỏi: ${actual.type} (kỳ vọng ${expected.type}).`
            );
        }

        const expectedTitle = normalizeTitle(expected.title);
        const actualTitle = normalizeTitle(actual.title);
        if (expectedTitle !== actualTitle) {
            pushIssue(
                issues,
                'sections.title_mismatch',
                `Tên phần ${idx + 1} không khớp: "${actual.title}".`
            );
        }
    });

    // 3) Quy tắc đánh số câu (đảm bảo không trùng ID + không rỗng)
    if (!form.numbering.questionLabelTemplate.includes('{n}')) {
        pushIssue(
            issues,
            'numbering.invalid_template',
            'Mẫu đánh số câu thiếu biến {n}.'
        );
    }

    const seenIds = new Set<string>();
    exam.sections.forEach((section, idx) => {
        if (section.questions.length === 0) {
            pushIssue(
                issues,
                'questions.empty_section',
                `Phần ${idx + 1} không có câu hỏi.`
            );
        }

        section.questions.forEach((q) => {
            if (seenIds.has(q.id)) {
                pushIssue(
                    issues,
                    'questions.duplicate_id',
                    `Câu hỏi bị trùng ID: ${q.id}.`
                );
            }
            seenIds.add(q.id);
        });
    });

    return { valid: issues.length === 0, issues };
}
