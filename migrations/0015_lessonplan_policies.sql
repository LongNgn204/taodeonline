-- Chú thích: Migration cho Kế hoạch Bài dạy - CV 5512, 2345, 1001
-- Thêm regulations và policy packs cho lesson plan generation

-- =============================================
-- REGULATIONS: Công văn hướng dẫn KHBD
-- =============================================

INSERT OR IGNORE INTO regulations (id, code, title, type, issuer, mode, scope, issued_date, effective_from, summary, priority, status, rules_json) VALUES
-- CV 5512: KHBD cho THCS/THPT
(
    'cv5512-2020',
    'CV5512-2020',
    'Công văn 5512/BGDĐT-GDTrH - Hướng dẫn xây dựng KHGD nhà trường',
    'CV',
    'MOE',
    'lesson_plan',
    '["THCS", "THPT"]',
    '2020-12-18',
    '2021-01-01',
    'Phụ lục 4: Khung KHBD gồm 4 hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng). Mỗi hoạt động có: Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.',
    5,
    'active',
    '{
        "structure": {
            "sections": ["info", "objectives", "materials", "activities"],
            "activities_count": 4,
            "activity_phases": ["opening", "knowledge_formation", "practice", "application"]
        },
        "objectives": {
            "required": ["knowledge", "competencies", "qualities"],
            "competencies_types": ["general", "specific"]
        },
        "activity_components": ["goal", "content", "product", "organization"]
    }'
),

-- CV 2345: KHGD cho Tiểu học
(
    'cv2345-2021',
    'CV2345-2021',
    'Công văn 2345/BGDĐT-GDTH - Hướng dẫn xây dựng KHGD nhà trường cấp Tiểu học',
    'CV',
    'MOE',
    'lesson_plan_primary',
    '["Tiểu học"]',
    '2021-06-07',
    '2021-09-01',
    'Hướng dẫn xây dựng KHGD nhà trường cấp TH theo CTGDPT 2018. Phát huy tính chủ động, linh hoạt của nhà trường.',
    10,
    'active',
    '{
        "structure": {
            "sections": ["info", "objectives", "materials", "activities"],
            "activities_count": 4,
            "activity_phases": ["opening", "knowledge_formation", "practice", "application"]
        },
        "objectives": {
            "required": ["knowledge", "competencies", "qualities"]
        },
        "primary_focus": ["integration", "student_centered", "competency_based"]
    }'
),

-- CV 1001: KHBD chi tiết cho Tiểu học (cấp Sở)
(
    'cv1001-2025',
    'CV1001-2025',
    'Công văn 1001/SGDĐT-GDPT - Hướng dẫn KHBD Tiểu học chi tiết',
    'CV',
    'DOE',
    'lesson_plan_primary',
    '["Tiểu học"]',
    '2025-03-21',
    '2025-04-01',
    'Khung KHBD chi tiết cho Tiểu học: Mục tiêu (năng lực chung, năng lực đặc thù, phẩm chất), nội dung tích hợp, hoạt động dạy học chủ yếu.',
    15,
    'active',
    '{
        "structure": {
            "sections": ["info", "objectives", "integration", "materials", "activities"],
            "activities_count": 4
        },
        "objectives": {
            "detailed": true,
            "competencies_types": ["general", "specific"],
            "qualities_examples": ["trung thực", "trách nhiệm", "chăm chỉ", "nhân ái"]
        },
        "integration": {
            "required": true,
            "types": ["cross_subject", "life_skills", "local_content"]
        }
    }'
);

-- =============================================
-- POLICY PACKS: Gói quy tắc cho KHBD
-- =============================================

INSERT OR IGNORE INTO policy_packs (id, name, version, mode, scope, based_on_regulation_ids, resolved_rules_json, policy_text, status, is_default) VALUES
-- Pack cho THCS/THPT theo CV 5512
(
    'pack-lessonplan-5512-v1',
    'KHBD THCS/THPT theo CV5512',
    '1.0.0',
    'lesson_plan',
    '["THCS", "THPT"]',
    '["tt32-2018", "cv5512-2020"]',
    '{
        "structure": {
            "sections": ["info", "objectives", "materials", "activities"],
            "activities": [
                {"phase": "opening", "name": "Khởi động / Mở đầu", "typical_duration_percent": 10},
                {"phase": "knowledge_formation", "name": "Hình thành kiến thức mới", "typical_duration_percent": 45},
                {"phase": "practice", "name": "Luyện tập", "typical_duration_percent": 30},
                {"phase": "application", "name": "Vận dụng", "typical_duration_percent": 15}
            ]
        },
        "objectives": {
            "knowledge": {"required": true},
            "competencies": {
                "general": ["Tự chủ và tự học", "Giao tiếp và hợp tác", "Giải quyết vấn đề và sáng tạo"],
                "specific": "Theo đặc thù môn học"
            },
            "qualities": ["Trung thực", "Trách nhiệm", "Chăm chỉ", "Nhân ái", "Yêu nước"]
        },
        "activity_components": ["goal", "content", "product", "organization"]
    }',
    '## CẤU TRÚC KẾ HOẠCH BÀI DẠY THEO CV 5512/BGDĐT-GDTrH

### I. THÔNG TIN CHUNG
- Tên bài dạy, Môn học, Lớp, Thời gian thực hiện

### II. MỤC TIÊU
1. **Kiến thức**: Nội dung cần đạt theo yêu cầu chương trình
2. **Năng lực**:
   - Năng lực chung: Tự chủ, Giao tiếp hợp tác, Sáng tạo
   - Năng lực đặc thù: Theo đặc thù môn học
3. **Phẩm chất**: Trung thực, Trách nhiệm, Chăm chỉ...

### III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Thiết bị: SGK, máy chiếu, phiếu học tập...
- Học liệu: Video, tranh ảnh, tài liệu...

### IV. CHUỖI HOẠT ĐỘNG HỌC (4 hoạt động)

**Mỗi hoạt động gồm:**
- Mục tiêu: Học sinh đạt được gì
- Nội dung: Hoạt động cụ thể
- Sản phẩm: Kết quả mong đợi
- Tổ chức thực hiện: Cách triển khai

1. **KHỞI ĐỘNG** (~10% thời lượng): Xác định vấn đề học tập
2. **HÌNH THÀNH KIẾN THỨC** (~45%): Tiếp thu kiến thức mới
3. **LUYỆN TẬP** (~30%): Củng cố, rèn kỹ năng
4. **VẬN DỤNG** (~15%): Áp dụng vào thực tiễn',
    'active',
    1
),

-- Pack cho Tiểu học theo CV 2345 + 1001
(
    'pack-lessonplan-primary-v1',
    'KHBD Tiểu học theo CV2345+1001',
    '1.0.0',
    'lesson_plan_primary',
    '["Tiểu học"]',
    '["tt32-2018", "cv2345-2021", "cv1001-2025"]',
    '{
        "structure": {
            "sections": ["info", "objectives", "integration", "materials", "activities"],
            "activities": [
                {"phase": "opening", "name": "Hoạt động mở đầu", "typical_duration_percent": 10},
                {"phase": "knowledge_formation", "name": "Hình thành kiến thức mới", "typical_duration_percent": 40},
                {"phase": "practice", "name": "Luyện tập, thực hành", "typical_duration_percent": 35},
                {"phase": "application", "name": "Vận dụng, mở rộng", "typical_duration_percent": 15}
            ]
        },
        "objectives": {
            "knowledge": {"required": true, "align_with_curriculum": true},
            "competencies": {
                "general": ["Tự chủ và tự học", "Giao tiếp và hợp tác", "Giải quyết vấn đề và sáng tạo"],
                "specific": "Năng lực đặc thù theo môn"
            },
            "qualities": ["Yêu nước", "Nhân ái", "Chăm chỉ", "Trung thực", "Trách nhiệm"]
        },
        "integration": {
            "types": ["Liên môn", "Kỹ năng sống", "Nội dung địa phương"],
            "required": true
        },
        "primary_specific": {
            "student_centered": true,
            "activity_based": true,
            "differentiation": true
        }
    }',
    '## CẤU TRÚC KẾ HOẠCH BÀI DẠY TIỂU HỌC THEO CV 2345 + CV 1001

### I. THÔNG TIN CHUNG
- Tên bài dạy, Môn học/HĐGD, Lớp, Thời gian

### II. MỤC TIÊU (theo CTGDPT 2018)
1. **Kiến thức**: Yêu cầu cần đạt của bài học
2. **Năng lực**:
   - Năng lực chung: Tự chủ, Giao tiếp, Sáng tạo
   - Năng lực đặc thù: Theo môn học (VD: Năng lực toán học, Năng lực ngôn ngữ...)
3. **Phẩm chất**: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm

### III. NỘI DUNG TÍCH HỢP (nếu có)
- Tích hợp liên môn
- Kỹ năng sống
- Nội dung địa phương

### IV. ĐỒ DÙNG DẠY HỌC
- GV: SGK, tranh ảnh, phiếu học tập...
- HS: SGK, vở, đồ dùng học tập...

### V. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU

1. **HOẠT ĐỘNG MỞ ĐẦU** (~10%): Khơi gợi hứng thú, kết nối bài học
2. **HÌNH THÀNH KIẾN THỨC MỚI** (~40%): Khám phá, tiếp thu kiến thức
3. **LUYỆN TẬP, THỰC HÀNH** (~35%): Củng cố, rèn kỹ năng
4. **VẬN DỤNG, MỞ RỘNG** (~15%): Áp dụng thực tế, bài về nhà

**Lưu ý cho Tiểu học:**
- Lấy học sinh làm trung tâm
- Hoạt động hóa người học
- Phân hóa đối tượng học sinh',
    'active',
    1
);

-- =============================================
-- INDEX để tối ưu query
-- =============================================
CREATE INDEX IF NOT EXISTS idx_regulations_lesson_plan ON regulations(mode) WHERE mode LIKE 'lesson_plan%';
CREATE INDEX IF NOT EXISTS idx_policy_packs_lesson_plan ON policy_packs(mode) WHERE mode LIKE 'lesson_plan%';
