
# Kiến Tạo Việt - Trợ Lý Soạn Đề Thông Minh & Hệ Thống Quản Lý Giáo Dục 4.0 🇻🇳

![Banner](https://img.shields.io/badge/Status-Stable_Release-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React_Cloudflare_AI-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

> **Sứ mệnh:** Cung cấp công cụ AI mạnh mẽ và **hoàn toàn miễn phí** để giải phóng sức lao động cho giáo viên Việt Nam, hướng tới chuyển đổi số thực chất trong giáo dục.

**Kiến Tạo Việt** là nền tảng toàn diện giúp giáo viên:
1.  **Soạn đề thi chuẩn 7991** chỉ trong vài phút nhờ AI.
2.  **Quản lý ngân hàng câu hỏi** và cộng tác thời gian thực.
3.  **Tổ chức thi & Chấm điểm** tự động.

---

## 🌟 Tính Năng Đột Phá

### 1. Soạn Đề & Ma Trận Chuẩn 
*   **AI Ma Trận:** Tự động xây dựng ma trận đặc tả theo chuẩn **CV 7991/BGDĐT-GDTrH** (Nhận biết - Thông hiểu - Vận dụng - Vận dụng cao).
*   **Cân bằng độ khó:** Thuật toán phân bổ câu hỏi đảm bảo độ khó của đề thi bám sát ma trận.
*   **Xuất bản chuẩn in ấn:** Xuất file Word (.docx) định dạng 2 cột, header chuẩn của Bộ, sẵn sàng in và photocopy.

### 2. Sức Mạnh Trí Tuệ Nhân Tạo (AI)
*   **RAG (Retrieval-Augmented Generation):** AI hiểu sâu nội dung Sách giáo khoa (Kết nối Tri thức, Chân trời sáng tạo, Cánh diều) để sinh câu hỏi chính xác.
*   **OCR Vision:** Số hóa đề thi giấy chỉ bằng một thao tác chụp ảnh hoặc upload PDF.
*   **Chấm thi Camera:** Chấm phiếu trắc nghiệm bằng Camera điện thoại/Laptop với độ chính xác >98%.

### 3. Cộng Tác & Chia Sẻ
*   **Real-time Collaboration:** Nhiều giáo viên cùng biên soạn một đề thi cùng lúc (như Google Docs).
*   **Cộng đồng Giáo viên:** Chia sẻ và sử dụng lại hàng ngàn ma trận/đề thi chất lượng từ đồng nghiệp trên cả nước.
*   **Zalo Integration:** Tự động gửi thông báo lịch thi, kết quả về Zalo cho phụ huynh học sinh.

### 4. Hệ Thống Quản Lý
*   **Cổng thi Học sinh:** Giao diện thi trực tuyến hiện đại, hỗ trợ chống gian lận (full-screen, phát hiện chuyển tab).
*   **Sổ điểm điện tử:** Tự động tổng hợp điểm, thống kê phổ điểm lớp học.
*   **Thống kê chi tiết:** Phân tích chất lượng câu hỏi (độ khó, độ phân biệt) để cải tiến đề thi.

---

## 🛠 Công Nghệ Sử Dụng

Dự án được xây dựng trên nền tảng **Cloudflare** để đảm bảo tốc độ truy cập nhanh nhất và chi phí vận hành bằng 0 (Serverless).

*   **Frontend**: React 18, Vite, TailwindCSS, Framer Motion.
*   **Backend**: Hono (Edge API), Cloudflare Workers.
*   **Database**: Cloudflare D1 (SQLite at Edge) - Nhanh và miễn phí.
*   **AI Core**: Tích hợp Google Gemini Pro & OpenAI GPT-4o.
*   **Real-time**: Cloudflare Durable Objects + Yjs.

---

## 🚀 Hướng Dẫn Cài Đặt (Cho Developer)

Nếu bạn muốn tự triển khai (Self-host) hệ thống này cho trường học của mình:

### Yêu cầu
*   Node.js 18+
*   Tài khoản Cloudflare (Miễn phí)

### Các bước
1.  **Clone mã nguồn**
    ```bash
    git clone https://github.com/longngn/taodeonline.git
    cd taodeonline
    ```

2.  **Cài đặt thư viện**
    ```bash
    npm install
    ```

3.  **Cấu hình Database**
    ```bash
    cd apps/api
    npm run migrate:local # Chạy DB local
    ```

4.  **Khởi chạy**
    ```bash
    # Tại thư mục gốc
    npm run dev
    ```
    *   Web App: `http://localhost:5173`
    *   API Server: `http://localhost:8787`

---

## 🤝 Tham Gia Đóng Góp

Chúng tôi tin rằng **Giáo dục là Chia sẻ**. Dự án là mã nguồn mở (Open Source) và chào đón mọi sự đóng góp từ cộng đồng lập trình viên Việt Nam.

*   🐛 **Báo lỗi:** Tạo Issue trên GitHub.
*   💡 **Đề xuất:** Gửi ý tưởng tính năng mới.
*   🔧 **Đóng góp Code:** Fork và gửi Pull Request.

---

## 📞 Liên Hệ & Hỗ Trợ

*   **Hotline Kỹ thuật:** 09x.xxx.xxxx
*   **Email:** support@kientaoviet.edu.vn
*   **Nhóm Zalo Cộng đồng:** [Bấm để tham gia](#)

---
© 2025 **Kiến Tạo Việt Team**. Xây dựng với ❤️ dành cho Giáo dục Việt Nam.
