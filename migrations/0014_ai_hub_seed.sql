-- AI Hub Upgrade - Seed Data
-- Courses, Resources, Coach Tips cho AI Literacy Hub

-- ===== COURSES =====

INSERT OR REPLACE INTO ai_hub_courses (id, title, description, category, difficulty, duration_minutes, order_index, is_active, content_json) VALUES
-- Beginner Level
('course-prompt-101', 'Prompt Engineering 101', 'Học cách viết prompt hiệu quả để tạo câu hỏi chất lượng cao', 'prompt_engineering', 'beginner', 30, 1, 1, '{
    "sections": [
        {"title": "Prompt là gì?", "content": "Prompt là đoạn văn bản hướng dẫn AI thực hiện nhiệm vụ..."},
        {"title": "Cấu trúc prompt cơ bản", "content": "Vai trò - Nhiệm vụ - Ngữ cảnh - Định dạng output"},
        {"title": "Thực hành", "content": "Viết prompt tạo 5 câu hỏi trắc nghiệm mức Nhận biết"}
    ]
}'),

('course-matrix-basics', 'Ma trận đề theo CV 7991', 'Hiểu rõ cấu trúc ma trận đề chuẩn Bộ GD&ĐT', 'matrix', 'beginner', 45, 2, 1, '{
    "sections": [
        {"title": "Tổng quan CV 7991", "content": "Công văn 7991 quy định về ma trận đề kiểm tra định kỳ..."},
        {"title": "4 mức độ nhận thức", "content": "NB (Nhận biết) - TH (Thông hiểu) - VD (Vận dụng) - VDC (Vận dụng cao)"},
        {"title": "Phân bổ điểm", "content": "Tỷ lệ NB:TH:VD:VDC theo từng môn học"},
        {"title": "Thực hành", "content": "Lập ma trận đề Toán lớp 10 - 15 phút"}
    ]
}'),

('course-rag-intro', 'Giới thiệu RAG Context', 'Học cách dùng tài liệu gốc để AI tạo câu hỏi chính xác', 'rag', 'beginner', 25, 3, 1, '{
    "sections": [
        {"title": "RAG là gì?", "content": "Retrieval-Augmented Generation - AI đọc tài liệu trước khi trả lời"},
        {"title": "Upload SGK", "content": "Cách upload và chuẩn bị sách giáo khoa"},
        {"title": "Xem trước chunks", "content": "Kiểm tra AI đã hiểu đúng nội dung chưa"}
    ]
}'),

-- Intermediate Level
('course-mcq-quality', 'Câu hỏi trắc nghiệm chất lượng', 'Kỹ thuật tạo MCQ với đáp án nhiễu hay', 'question_design', 'intermediate', 40, 4, 1, '{
    "sections": [
        {"title": "Đáp án nhiễu (Distractor)", "content": "Tạo đáp án sai nhưng hợp lý..."},
        {"title": "Tránh lỗi thường gặp", "content": "Đáp án quá dễ đoán, câu hỏi phủ định kép..."},
        {"title": "Phân tích Item Analysis", "content": "Đánh giá độ khó và độ phân biệt"},
        {"title": "Thực hành", "content": "Cải thiện 5 câu hỏi MCQ có vấn đề"}
    ]
}'),

('course-tf-questions', 'Câu hỏi Đúng/Sai theo CV 4117', 'Thiết kế câu hỏi TF chuẩn thi TN THPT', 'question_design', 'intermediate', 35, 5, 1, '{
    "sections": [
        {"title": "Cấu trúc TF theo CV 4117", "content": "4 mệnh đề, học sinh chọn Đ/S cho từng mệnh đề"},
        {"title": "Tạo mệnh đề chất lượng", "content": "Một mệnh đề đúng nên rõ ràng, mệnh đề sai nên tinh tế"},
        {"title": "Prompt template", "content": "Mẫu prompt để AI tạo câu hỏi TF"},
        {"title": "Thực hành", "content": "Tạo 3 câu hỏi TF cho môn Ngữ văn"}
    ]
}'),

('course-policy-packs', 'Sử dụng Policy Packs', 'Chọn đúng bộ quy định cho từng loại đề', 'advanced', 'intermediate', 30, 6, 1, '{
    "sections": [
        {"title": "Policy Pack là gì?", "content": "Bộ quy định được nhóm sẵn theo mục đích sử dụng"},
        {"title": "KTĐG vs TN THPT", "content": "Khác biệt giữa đề kiểm tra định kỳ và thi tốt nghiệp"},
        {"title": "Chọn pack phù hợp", "content": "Dựa vào môn, lớp và mục đích"}
    ]
}'),

-- Advanced Level
('course-byok', 'BYOK - Bring Your Own Key', 'Tự dùng API key riêng để tối ưu chi phí', 'advanced', 'advanced', 45, 7, 1, '{
    "sections": [
        {"title": "Tại sao BYOK?", "content": "Kiểm soát chi phí, quyền riêng tư, model mới nhất"},
        {"title": "Lấy API key", "content": "OpenRouter, Google AI, OpenAI..."},
        {"title": "Cấu hình Settings", "content": "Nhập key, chọn model, test kết nối"},
        {"title": "Best practices", "content": "Rate limiting, caching, fallback"}
    ]
}'),

('course-citations', 'Citations và Trích nguồn', 'Đảm bảo câu hỏi có căn cứ từ SGK', 'advanced', 'advanced', 25, 8, 1, '{
    "sections": [
        {"title": "Citations là gì?", "content": "Mỗi câu hỏi AI tạo đính kèm nguồn trích dẫn"},
        {"title": "Đọc citations", "content": "Hiểu quote, page, chunk_id"},
        {"title": "Verify accuracy", "content": "Kiểm tra lại với SGK gốc"}
    ]
}');

-- ===== RESOURCES =====

INSERT OR REPLACE INTO ai_hub_resources (id, title, description, resource_type, category, url, created_at) VALUES
-- Templates
('res-prompt-cv7991', 'Template Prompt CV 7991', 'Bộ prompt mẫu cho tất cả mức độ nhận thức', 'template', 'prompts', NULL, datetime('now')),
('res-prompt-cv4117', 'Template Prompt CV 4117', 'Prompt mẫu cho câu hỏi TF và MCQ theo chuẩn TN THPT', 'template', 'prompts', NULL, datetime('now')),
('res-matrix-template', 'Ma trận đề mẫu Excel', 'File Excel ma trận đề theo CV 7991', 'template', 'matrix', NULL, datetime('now')),

-- Guides
('res-guide-upload', 'Hướng dẫn Upload SGK', 'Các bước chuẩn bị và upload sách giáo khoa', 'guide', 'how-to', NULL, datetime('now')),
('res-guide-export', 'Hướng dẫn Xuất đề Word', 'Xuất đề ra file Word chuẩn in ấn', 'guide', 'how-to', NULL, datetime('now')),
('res-guide-collab', 'Làm việc nhóm', 'Chia sẻ và cộng tác soạn đề với đồng nghiệp', 'guide', 'collaboration', NULL, datetime('now')),

-- Cheatsheets
('res-cheat-levels', 'Cheatsheet 4 Mức độ', 'Phân biệt nhanh NB-TH-VD-VDC', 'cheatsheet', 'reference', NULL, datetime('now')),
('res-cheat-verbs', 'Động từ hành động', 'Danh sách động từ theo mức độ Bloom', 'cheatsheet', 'reference', NULL, datetime('now'));

-- ===== COACH TIPS =====

INSERT OR REPLACE INTO ai_hub_coach_tips (id, trigger_context, tip_title, tip_content, tip_type, priority, is_active) VALUES
-- Matrix creation
('tip-matrix-1', 'matrix_creation', 'Cân bằng tỷ lệ', 'Đảm bảo tỷ lệ NB:TH:VD:VDC phù hợp với hướng dẫn Bộ', 'info', 1, 1),
('tip-matrix-2', 'matrix_creation', 'Kiểm tra tổng điểm', 'Tổng điểm các câu phải bằng 10 (hoặc 100%)', 'warning', 2, 1),

-- Exam generation
('tip-exam-1', 'exam_generation', 'Upload tài liệu trước', 'Để có câu hỏi chính xác, hãy upload SGK/tài liệu nguồn', 'tip', 1, 1),
('tip-exam-2', 'exam_generation', 'Review đáp án', 'AI có thể tạo đáp án sai, luôn kiểm tra với nguồn gốc', 'warning', 2, 1),
('tip-exam-3', 'exam_generation', 'Citations', 'Xem mục "Nguồn" để biết AI trích từ đoạn nào trong tài liệu', 'info', 3, 1),

-- Settings
('tip-settings-1', 'settings_page', 'Thử nhiều model', 'GPT-4o tốt cho logic, Gemini Pro tốt cho ngôn ngữ', 'tip', 1, 1),
('tip-settings-2', 'settings_page', 'BYOK tiết kiệm', 'Dùng API key riêng để kiểm soát chi phí tốt hơn', 'info', 2, 1),

-- Library
('tip-library-1', 'library_page', 'Chia nhỏ file', 'File PDF lớn nên chia thành từng chương để AI xử lý tốt hơn', 'tip', 1, 1),
('tip-library-2', 'library_page', 'RAG Preview', 'Dùng nút "Xem Chunks" để kiểm tra AI đã hiểu đúng nội dung', 'info', 2, 1);

-- Update courses bảng để ensure có content
UPDATE ai_hub_courses SET is_active = 1 WHERE id LIKE 'course-%';
