// Chú thích: Schema cho form template (định dạng đề thi)

import { z } from 'zod';
import { QuestionTypeSchema } from './matrix.js';

export const ExamFormIdSchema = z.enum(['standard_v1']);

export const FormHeaderLineSchema = z.object({
    text: z.string(),
    bold: z.boolean().optional(),
    italics: z.boolean().optional(),
    underline: z.boolean().optional(),
    size: z.number().int().positive().optional(),
});

export const FormHeaderLayoutSchema = z.object({
    leftLines: z.array(FormHeaderLineSchema),
    rightLines: z.array(FormHeaderLineSchema),
    showSeparatorLine: z.boolean().optional(),
    showStudentInfo: z.boolean().optional(),
});

export const FormSectionTemplateSchema = z.object({
    type: QuestionTypeSchema,
    title: z.string(),
    instructions: z.string().optional(),
});

export const FormNumberingRuleSchema = z.object({
    mode: z.enum(['global', 'per_section']),
    startAt: z.number().int().positive(),
    questionLabelTemplate: z.string(),
});

export const FormTypographySchema = z.object({
    fontFamily: z.string(),
    fontSize: z.number().int().positive(),
    headerFontSize: z.number().int().positive(),
    lineSpacing: z.number().int().positive(),
});

export const FormSpacingSchema = z.object({
    headerAfter: z.number().int().nonnegative(),
    sectionTitleBefore: z.number().int().nonnegative(),
    sectionTitleAfter: z.number().int().nonnegative(),
    questionBefore: z.number().int().nonnegative(),
    optionIndent: z.number().int().nonnegative(),
    columnGap: z.number().int().nonnegative(),
    footerBefore: z.number().int().nonnegative(),
});

export const FormLayoutSchema = z.object({
    columns: z.number().int().min(1),
});

export const FormTemplateSchema = z.object({
    formId: ExamFormIdSchema,
    header: FormHeaderLayoutSchema,
    sections: z.array(FormSectionTemplateSchema),
    numbering: FormNumberingRuleSchema,
    typography: FormTypographySchema,
    spacing: FormSpacingSchema,
    layout: FormLayoutSchema,
});

export type ExamFormId = z.infer<typeof ExamFormIdSchema>;
export type FormTemplate = z.infer<typeof FormTemplateSchema>;
