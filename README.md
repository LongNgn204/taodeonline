
# Kiến Tạo Việt - Nền Tảng Giáo Dục Số Thông Minh 🇻🇳

![Banner](https://img.shields.io/badge/Status-Stable_Release-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React_Cloudflare_AI-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

> **Sứ mệnh:** Cung cấp công cụ AI mạnh mẽ để giải phóng sức lao động cho giáo viên Việt Nam, hướng tới chuyển đổi số thực chất trong giáo dục.

**Kiến Tạo Việt** là hệ thống quản lý và soạn thảo đề thi toàn diện, tích hợp trí tuệ nhân tạo để tự động hóa quy trình từ **Soạn đề -> Tổ chức thi -> Chấm điểm**.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🧠 Unified AI Core (Lõi AI Đa Nhiệm)
*   **Dual-Model Configuration:** Cho phép giáo viên tùy chọn model riêng biệt cho từng tác vụ để tối ưu chi phí và hiệu năng:
    *   **Text Model:** (GPT-4o-mini, Claude 3 Haiku) chuyên dụng cho việc sinh câu hỏi, ma trận.
    *   **Vision Model:** (Gemini 1.5 Flash, GPT-4o) chuyên dụng cho xử lý hình ảnh (OCR).
*   **BYOK (Bring Your Own Key):** Hỗ trợ API Key cá nhân từ OpenAI, Google, Anthropic.
*   **Smart Context:** AI tự động hiểu bối cảnh sách giáo khoa (KNTT, CTST, CD) để sinh câu hỏi bám sát chương trình.

### 2. 📝 Soạn Đề & Ma Trận Chuẩn 7991
*   **AI Generator:** Tự động xây dựng ma trận đặc tả theo chuẩn **CV 7991/BGDĐT-GDTrH** (4 mức độ: Nhận biết - Thông hiểu - Vận dụng - Vận dụng cao).
*   **Cân bằng độ khó:** Thuật toán tự động phân bổ câu hỏi hợp lý.
*   **Xuất bản chuẩn:**
    *   **Word (.docx):** Định dạng 2 cột, header chuẩn Bộ GD, sẵn sàng in ấn.
    *   **Excel (.xlsx):** Báo cáo chi tiết ma trận và phân phối điểm.

### 3. 👁️ SỐ HÓA ĐỀ THI (OCR Vision)
*   **Digitize Exam:** Chuyển đổi đề thi giấy/ảnh chụp/PDF thành văn bản có thể chỉnh sửa chỉ trong vài giây.
*   **AI Parsing:** Tự động nhận diện cấu trúc câu hỏi (Lời dẫn, Đáp án A/B/C/D) và mức độ nhận thức.

### 4. 🤝 Real-time Collaboration (Cộng Tác)
*   **Live Editing:** Nhiều giáo viên có thể cùng chỉnh sửa một đề thi trong thời gian thực (tương tự Google Docs).
*   **Sync Engine:** Công nghệ **Cloudflare Durable Objects** + **WebSocket** đảm bảo độ trễ thấp (<100ms).
*   **Presence:** Hiển thị ai đang xem/sửa đề thi.

### 5. 🎓 Cổng Thi & Sổ Điểm (Student Portal)
*   **Thi Trực Tuyến:** Học sinh làm bài qua liên kết công khai (VD: `/public/exams/:id`).
*   **Anti-Cheat:**
    *   Cảnh báo khi học sinh rời khỏi màn hình/tab khác.
    *   Tự động nộp bài khi hết giờ.
*   **Sổ Điểm Điện Tử:** Tự động chấm điểm, lưu kết quả và thống kê phổ điểm cho giáo viên.

---

## 🛠 Tech Stack (Công Nghệ)

Dự án sử dụng kiến trúc **Serverless** hiện đại trên nền tảng **Cloudflare**:

| Thành phần | Công nghệ | Ghi chú |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS | Giao diện Glassmorphism mượt mà |
| **State** | Zustand, React Query | Quản lý trạng thái & Cache |
| **Backend** | Hono, Cloudflare Workers | Edge API siêu tốc độ |
| **Database** | Cloudflare D1 (SQLite) | Cơ sở dữ liệu quan hệ tại Edge |
| **Storage** | Cloudflare R2 | Lưu trữ hình ảnh/file đề thi |
| **Real-time** | Durable Objects | WebSocket serverless |
| **AI** | Google Gemini, OpenAI | Tích hợp qua REST API |

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### Yêu cầu
*   Node.js 18+
*   Tài khoản Cloudflare (Miễn phí)

### Các bước cài đặt

**1. Clone mã nguồn**
```bash
git clone https://github.com/longngn/taodeonline.git
cd taodeonline
```

**2. Cài đặt dependencies**
```bash
npm install
```

**3. Khởi tạo Database (D1)**
```bash
cd apps/api
npm run migrate:local
```

**4. Khởi chạy dự án**
```bash
# Tại thư mục gốc (root)
npm run dev
```
*   Frontend: `http://localhost:5173`
*   Backend: `http://localhost:8787`

**5. Cấu hình AI**
*   Truy cập **Cài đặt (Settings)** trên giao diện web.
*   Nhập API Key (Google AI Studio hoặc OpenAI).
*   Chọn Model cho "Text Generation" và "Vision".

---

## 📂 Hướng Dẫn Kiểm Thử (Features)

1.  **Tạo đề thi:** Vào "Tạo đề thi" -> Nhập chủ đề -> AI sinh ma trận -> Sinh đề.
2.  **Số hóa:** Vào "Số hóa" -> Upload ảnh đề thi -> Xem kết quả nhận diện.
3.  **Thi thử:** Mở đề thi -> Copy đường dẫn URL -> Mở tab ẩn danh -> Dán URL để vào giao diện học sinh.
4.  **Cộng tác:** Mở cùng 1 đề thi trên 2 tab trình duyệt khác nhau -> Chỉnh sửa và xem đồng bộ.

---

## 📞 Liên Hệ

*   **Tác giả:** Nguyễn Hoàng Long
*   **Email:** longngn204@gmail.com
*   **Website:** [kientaoviet.edu.vn](https://kientaoviet.edu.vn) (Coming soon)

---

© 2025 **Kiến Tạo Việt**. Mã nguồn mở theo giấy phép MIT.
