
# Hệ thống Tạo Đề Thi & Quản lý Ngân hàng Câu hỏi 4.0 

![Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech](https://img.shields.io/badge/Stack-React_Hono_Cloudflare-orange)

> **Mới nhât:** Đề thi phiên bản AI, Nhận diện OCR, Cộng tác Real-time và Cổng thi trực tuyến cho học sinh.

Nền tảng hỗ trợ giáo viên xây dựng ma trận đề thi, quản lý ngân hàng câu hỏi, và tổ chức thi trực tuyến với sự hỗ trợ đắc lực của Trí tuệ Nhân tạo (Gemini Pro / GPT-4).

## 🚀 Tính năng nổi bật

### 1. Tạo Ma trận & Sinh Đề (Core)
*   Xây dựng ma trận kiến thức theo chuẩn Bộ GD&ĐT (NB-TH-VD-VDC).
*   **Pro:** Sinh đề tự động từ ma trận với thuật toán cân bằng độ khó.
*   **AI:** Gợi ý câu hỏi dựa trên Bloom Taxonomy.

### 2. Ngân hàng Câu hỏi Thông minh
*   Quản lý câu hỏi theo cây thư mục, thẻ (Tags).
*   **OCR Vision:** Số hóa đề thi giấy/PDF chỉ trong 1 click dùng AI Vision.
*   **Import/Export:** Hỗ trợ Word, Excel, PDF và các chuẩn LMS (Moodle, QTI).

### 3. Cộng tác & Quy trình (New)
*   **Real-time Collaboration:** Nhiều giáo viên cùng soạn đề (tương tự Google Docs).
*   **Workflow:** Quy trình duyệt đề chặt chẽ (Draft -> Pending -> Approved).
*   **Phân quyền:** Tổ trưởng bộ môn, Giáo viên biên soạn.

### 4. Tổ chức Thi & Đánh giá
*   **Student Portal:** Cổng thi trực tuyến dành riêng cho học sinh (giao diện tập trung).
*   **Analytics:** Phân tích độ khó câu hỏi (Item Analysis), phổ điểm lớp học.
*   **Chấm tự luận:** AI hỗ trợ chấm điểm dựa trên Rubric.

## 🛠 Công nghệ sử dụng

Dự án được xây dựng theo kiến trúc Monorepo hiện đại, tối ưu cho Cloudflare Workers (Serverless).

*   **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Zag.js
*   **Backend**: Hono (Edge API), Cloudflare Workers
*   **Database**: Cloudflare D1 (SQLite at Edge)
*   **Storage**: Cloudflare R2 (Object Storage)
*   **Real-time**: Cloudflare Durable Objects (WebSockets), Yjs
*   **AI**: Google Gemini API / OpenAI API

## 📦 Cài đặt và Chạy thử

### Yêu cầu
*   Node.js 18+
*   Pnpm (khuyến nghị) hoặc Npm

### Các bước cài đặt

1.  **Clone repository**
    ```bash
    git clone https://github.com/longngn/taodeonline.git
    cd taodeonline
    ```

2.  **Cài đặt dependencies**
    ```bash
    npm install
    # Hoặc pnpm install
    ```

3.  **Khởi tạo Database (Local)**
    ```bash
    cd apps/api
    npm run migrate:local
    ```

4.  **Chạy Development Server**
    Tại thư mục gốc:
    ```bash
    npm run dev
    ```
    *   Web: `http://localhost:5173`
    *   API: `http://localhost:8787`

## 📚 Tài liệu
*   [Hướng dẫn sử dụng cho Giáo viên](./docs/GUIDE.md)
*   [API Documentation](./docs/API.md)
*   [Kiến trúc hệ thống](./docs/ARCHITECTURE.md)

## 🤝 Đóng góp
Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc Issue để báo lỗi/đề xuất tính năng.

---
© 2024 Exam Matrix Gen Team.
