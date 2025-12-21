// Chú thích: Schema cho Teacher Preferences - ghi chú mong muốn của giáo viên
// Lưu preferences để AI generation phù hợp với yêu cầu cá nhân GV

import { z } from 'zod';

// Độ khó mong muốn
export const DifficultyBiasSchema = z.enum(['easy', 'balanced', 'hard']);
export type DifficultyBias = z.infer<typeof DifficultyBiasSchema>;

// Style câu hỏi
export const QuestionStyleSchema = z.enum([
    'formal',      // Formal/academic style
    'practical',   // Ứng dụng thực tế
    'contextual',  // Có ngữ cảnh/tình huống
]);
export type QuestionStyle = z.infer<typeof QuestionStyleSchema>;

// Format xuất file
export const ExportFormatSchema = z.enum(['word', 'latex', 'pdf']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

// Preferences chi tiết của giáo viên
export const TeacherPreferencesDetailSchema = z.object({
    // Độ khó mong muốn
    difficultyBias: DifficultyBiasSchema.default('balanced'),

    // Ưu tiên topics/units cụ thể (IDs)
    focusTopics: z.array(z.string()).optional(),
    excludeTopics: z.array(z.string()).optional(),

    // Style câu hỏi ưa thích
    questionStyle: QuestionStyleSchema.default('formal'),

    // Yêu cầu đặc biệt (text tự do)
    specialRequests: z.array(z.string()).optional(),

    // Format output mong muốn
    exportFormat: ExportFormatSchema.default('word'),

    // Có muốn AI thêm hints/gợi ý trong đáp án không
    includeHints: z.boolean().default(true),

    // Có muốn shuffle câu hỏi khi tạo nhiều mã đề
    shuffleQuestions: z.boolean().default(true),

    // Có muốn shuffle đáp án MCQ
    shuffleOptions: z.boolean().default(false),
});
export type TeacherPreferencesDetail = z.infer<typeof TeacherPreferencesDetailSchema>;

// Teacher Preferences record đầy đủ
export const TeacherPreferencesSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),

    // Optional: gắn với library cụ thể
    libraryId: z.string().optional(),

    // Ghi chú tự do của giáo viên
    notes: z.string().max(2000).optional(),

    // Preferences chi tiết
    preferences: TeacherPreferencesDetailSchema,

    // Timestamps
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TeacherPreferences = z.infer<typeof TeacherPreferencesSchema>;

// Schema cho API request tạo/update preferences
export const CreateTeacherPreferencesRequestSchema = z.object({
    libraryId: z.string().optional(),
    notes: z.string().max(2000).optional(),
    preferences: TeacherPreferencesDetailSchema.partial(),
});
export type CreateTeacherPreferencesRequest = z.infer<typeof CreateTeacherPreferencesRequestSchema>;

// Default preferences
export const DEFAULT_TEACHER_PREFERENCES: TeacherPreferencesDetail = {
    difficultyBias: 'balanced',
    questionStyle: 'formal',
    exportFormat: 'word',
    includeHints: true,
    shuffleQuestions: true,
    shuffleOptions: false,
};
