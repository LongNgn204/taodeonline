# Hướng dẫn Sử dụng

Hệ thống Ma Trận Đề Thông Minh - Tạo đề kiểm tra theo Công văn 7991/BGDĐT-GDTrH.

## Mục lục

1. [Đăng nhập và Đăng ký](#1-đăng-nhập-và-đăng-ký)
2. [Quản lý Thư viện](#2-quản-lý-thư-viện)
3. [Upload Tài liệu](#3-upload-tài-liệu)
4. [Tạo Ma trận Đề](#4-tạo-ma-trận-đề)
5. [Sinh Đề thi](#5-sinh-đề-thi)
6. [Xuất File](#6-xuất-file)
7. [Chấm điểm](#7-chấm-điểm)
8. [Cấu hình AI](#8-cấu-hình-ai)

---

## 1. Đăng nhập và Đăng ký

### Đăng ký tài khoản
- Truy cập trang chủ, chọn "Đăng ký"
- Nhập email và mật khẩu
- Xác nhận đăng ký

### Đăng nhập
- Nhập email và mật khẩu đã đăng ký
- Hệ thống sẽ chuyển đến Dashboard

---

## 2. Quản lý Thư viện

Thư viện (Library) là nơi lưu trữ bộ sách và tài liệu theo môn học.

### Tạo thư viện mới
1. Từ Dashboard, chọn "Thư viện" > "Tạo mới"
2. Điền thông tin:
   - Môn học (Toán, Vật lý, Hóa học, Sinh học...)
   - Khối lớp (1-12)
   - Bộ sách (Kết nối tri thức, Chân trời sáng tạo, Cánh diều)
   - Học kỳ (1 hoặc 2)
   - Thời lượng kiểm tra (mặc định 60 phút)

---

## 3. Upload Tài liệu

Hệ thống hỗ trợ upload các định dạng:
- PDF (sách giáo khoa, tài liệu)
- DOCX (đề thi mẫu, câu hỏi)
- XLSX (mẫu ma trận theo CV 7991)

### Quy trình upload
1. Chọn thư viện cần upload
2. Click "Upload tài liệu"
3. Kéo thả hoặc chọn file
4. Hệ thống sẽ tự động:
   - Trích xuất text
   - Chia nhỏ thành chunks
   - Lưu vào database để phục vụ RAG

---

## 4. Tạo Ma trận Đề

Ma trận đề theo Công văn 7991 bao gồm:
- 4 chủ đề/nội dung kiểm tra
- Phân bổ điểm: Trắc nghiệm 7đ + Tự luận 3đ
- Tỉ lệ nhận thức: Nhận biết 40% / Thông hiểu 30% / Vận dụng 30%

### Các bước tạo ma trận
1. Chọn thư viện
2. Click "Tạo đề mới"
3. Chọn phạm vi kiểm tra (chương/bài)
4. Xác nhận cấu trúc điểm (có thể tuỳ chỉnh)
5. Click "Sinh ma trận"
6. Xem preview và chỉnh sửa nếu cần
7. Click "Khoá ma trận" để tiếp tục

### Cấu trúc câu hỏi mặc định
| Dạng câu | Điểm | Ghi chú |
|----------|------|---------|
| MCQ (Nhiều lựa chọn) | 3đ | 4 đáp án A-B-C-D |
| Đúng/Sai | 2đ | 4 mệnh đề |
| Trả lời ngắn | 2đ | Đáp án số/ngắn |
| Tự luận | 3đ | Có rubric chấm |

---

## 5. Sinh Đề thi

Từ ma trận đã tạo, hệ thống sẽ sinh đề thi dựa trên:
- Tài liệu đã upload (RAG)
- Ràng buộc số câu/dạng câu từ ma trận
- Mức độ nhận thức yêu cầu

### Các bước sinh đề
1. Từ ma trận đã khoá, click "Sinh đề"
2. Chờ AI xử lý (có thể mất 30s - 2 phút)
3. Xem preview đề
4. Chỉnh sửa từng câu nếu cần
5. Click "Regenerate" để sinh lại câu không ưng ý
6. Click "Lưu đề" khi hoàn tất

### Kiểm tra chất lượng
- Mỗi câu hỏi kèm nguồn tham chiếu (trích từ tài liệu nào)
- Validator tự động kiểm tra tổng điểm, phân bổ, số câu

---

## 6. Xuất File

Hệ thống hỗ trợ xuất:

### Excel - Ma trận
- Đúng template Công văn 7991
- Giữ nguyên cấu trúc merge cell
- Có thể in ngay

### Word - Đề thi
- Layout chuẩn, font Times New Roman
- Đánh số câu tự động
- Hỗ trợ ký hiệu toán học/hoá học (H₂O, CO₂, m³...)
- Tuỳ chọn tách: Đề + Đáp án + Hướng dẫn chấm

---

## 7. Chấm điểm

### Chấm tự động
Hỗ trợ chấm tự động cho:
- MCQ (nhiều lựa chọn)
- Đúng/Sai
- Trả lời ngắn (theo key)

### Chấm thủ công
- Tự luận: Chấm thủ công theo rubric
- Tuỳ chọn: AI gợi ý điểm (giai đoạn phát triển)

---

## 8. Cấu hình AI

### Thêm API Key
1. Vào "Cài đặt" > "AI Models"
2. Chọn provider (OpenAI, Anthropic, Google)
3. Nhập API key
4. Key được lưu LOCAL trên trình duyệt (bảo mật)

### Chọn Model
- GPT-4o / GPT-4o-mini (OpenAI)
- Claude 3.5 Sonnet (Anthropic)
- Gemini Pro (Google)

Khuyến nghị: Dùng model mạnh (GPT-4o, Claude 3.5) cho sinh đề, model nhẹ cho validate.

---

## Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo Issue trên GitHub hoặc liên hệ:
- Email: support@example.com
- GitHub Issues: [Link to issues]

---

© 2024 Exam Matrix & Test Generator
