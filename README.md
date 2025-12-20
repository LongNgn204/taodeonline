<p align="center">
  <img src="https://img.icons8.com/color/96/test-passed.png" alt="Exam Matrix Logo" width="96"/>
</p>

<h1 align="center">📝 Exam Matrix Generator</h1>

<p align="center">
  <strong>Công cụ mã nguồn mở giúp giáo viên tạo Ma trận đề kiểm tra định kỳ và Đề thi theo Công văn 7991/BGDĐT-GDTrH</strong>
</p>

<p align="center">
  <a href="#tính-năng">Tính năng</a> •
  <a href="#demo">Demo</a> •
  <a href="#cài-đặt">Cài đặt</a> •
  <a href="#sử-dụng">Sử dụng</a> •
  <a href="#api-reference">API</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"/>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-brightgreen" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Cloudflare-Workers-orange" alt="Cloudflare"/>
</p>

---

## 📖 Giới thiệu

**Exam Matrix Generator** là công cụ hỗ trợ giáo viên tạo đề kiểm tra theo chuẩn **Công văn 7991/BGDĐT-GDTrH** (ban hành ngày 17/12/2024), bám sát **Chương trình Giáo dục Phổ thông 2018**.

Ứng dụng sử dụng **AI** kết hợp với kỹ thuật **RAG (Retrieval-Augmented Generation)** để sinh câu hỏi dựa trên nội dung sách giáo khoa thực tế, đảm bảo độ chính xác và tránh thông tin sai lệch.

---

## ✨ Tính năng

### 🎯 Tạo Ma trận đề
- ✅ Tạo ma trận đề theo chuẩn CV 7991
- ✅ Cấu trúc: MCQ 3đ + Đúng/Sai 2đ + Trả lời ngắn 2đ + Tự luận 3đ
- ✅ Tỷ lệ nhận thức: 40% Nhận biết / 30% Thông hiểu / 30% Vận dụng
- ✅ Hỗ trợ đa môn học, đa lớp (1-12), đa bộ sách

### 🤖 Tích hợp AI
- ✅ Hỗ trợ đa AI provider: OpenAI, Anthropic, Google, Groq, DeepSeek,...
- ✅ API key lưu local trên trình duyệt (bảo mật)
- ✅ Không log API key trên server

### 📄 Xử lý tài liệu
- ✅ Upload tài liệu SGK (PDF/DOCX/XLSX)
- ✅ Tự động trích xuất text và chia chunk
- ✅ RAG để sinh câu hỏi dựa trên nội dung thực

### 📊 Export
- ✅ Export Excel ma trận (giữ nguyên template CV 7991)
- ✅ Export Word đề thi + Đáp án + Hướng dẫn chấm
- ✅ Hỗ trợ ký hiệu toán học/hoá học (m³, H₂O, CO₂,...)

### 📝 Chấm điểm
- ✅ Chấm tự động câu trắc nghiệm
- ✅ Chấm tự động câu Đúng/Sai và Trả lời ngắn
- ✅ Hỗ trợ chấm thủ công câu tự luận

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite 6 + TypeScript + Tailwind CSS |
| **Backend** | Cloudflare Workers + Hono |
| **Database** | Cloudflare D1 (SQLite) |
| **Storage** | Cloudflare R2 |
| **Cache** | Cloudflare KV |
| **Monorepo** | pnpm + Turborepo |
| **Auth** | JWT HttpOnly Cookie |

---

## 📁 Cấu trúc dự án

```
exam-matrix-generator/
├── apps/
│   ├── api/                    # Backend - Cloudflare Worker
│   │   ├── src/
│   │   │   ├── adapters/       # AI model adapters
│   │   │   ├── agents/         # Matrix & Exam generation agents
│   │   │   ├── middleware/     # Auth middleware
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   └── index.ts        # Worker entry point
│   │   └── wrangler.toml       # Cloudflare config
│   │
│   └── web/                    # Frontend - React + Vite
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── pages/          # Route pages
│       │   ├── hooks/          # Custom hooks
│       │   └── lib/            # Utilities
│       └── vite.config.ts
│
├── packages/
│   ├── shared/                 # Shared types + schemas + utils
│   │   └── src/
│   │       ├── schemas/        # Zod validation schemas
│   │       └── utils/          # Common utilities
│   │
│   ├── export/                 # Excel/Word export generators
│   │   └── src/
│   │       ├── excel/          # Excel generation
│   │       └── word/           # Word generation
│   │
│   └── rag/                    # Document chunking & retrieval
│       └── src/
│           ├── chunking/       # Text chunking logic
│           └── retrieval/      # Keyword/semantic search
│
├── migrations/                 # D1 SQL migrations
│   └── 0001_initial.sql
│
├── templates/                  # Excel/Word templates (CV 7991)
├── turbo.json                  # Turborepo config
└── package.json                # Root package
```

---

## 🚀 Cài đặt

### Yêu cầu hệ thống

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20.0.0 |
| pnpm | >= 9.0.0 |
| Cloudflare Account | D1, R2, Workers, KV |

### Bước 1: Clone repository

```bash
git clone https://github.com/LongNgn204/taodeonline.git
cd taodeonline
```

### Bước 2: Cài đặt dependencies

```bash
# Cài pnpm (nếu chưa có)
npm install -g pnpm

# Cài dependencies
pnpm install
```

### Bước 3: Setup Cloudflare resources

```bash
# Di chuyển vào thư mục API
cd apps/api

# 1. Tạo D1 database
wrangler d1 create exam-matrix-db
# Copy database_id vào wrangler.toml

# 2. Chạy migrations
wrangler d1 execute exam-matrix-db --file=../../migrations/0001_initial.sql

# 3. Tạo R2 bucket
wrangler r2 bucket create exam-matrix-files

# 4. Tạo KV namespace
wrangler kv:namespace create CACHE
# Copy id vào wrangler.toml

cd ../..
```

### Bước 4: Cấu hình environment variables

Tạo file `.dev.vars` trong `apps/api/`:

```env
# JWT Secret (bắt buộc - đổi trong production!)
JWT_SECRET=your-super-secret-key-change-in-production

# Optional: Default AI provider
DEFAULT_AI_PROVIDER=openai
```

### Bước 5: Build packages

```bash
pnpm build
```

### Bước 6: Chạy development server

```bash
pnpm dev
```

Server sẽ chạy tại:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8787

---

## 📖 Sử dụng

### Quy trình tạo đề thi

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
│  1. Đăng    │────▶│  2. Tạo     │────▶│  3. Upload   │────▶│  4. Tạo     │────▶│  5. Export │
│     nhập    │     │    Library  │     │    Tài liệu  │     │    Đề thi   │     │    File    │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘     └────────────┘
```

#### 1️⃣ Đăng ký/Đăng nhập
Tạo tài khoản hoặc đăng nhập vào hệ thống.

#### 2️⃣ Tạo Thư viện (Library)
Chọn thông tin:
- **Môn học**: Toán, Lý, Hoá, Sinh, Văn,...
- **Lớp**: 1-12
- **Bộ sách**: Cánh diều, Kết nối tri thức, Chân trời sáng tạo
- **Học kỳ**: HK1 hoặc HK2

#### 3️⃣ Upload tài liệu
- Upload SGK dạng PDF/DOCX
- Hệ thống tự động trích xuất text
- Text được chia thành chunks cho RAG

#### 4️⃣ Cấu hình AI & Tạo đề
- Nhập API key của AI provider (lưu local)
- Chọn phạm vi kiến thức (chương/chủ đề)
- Hệ thống tự động:
  - **Tạo Ma trận** theo CV 7991
  - **Sinh câu hỏi** từ ma trận + RAG
  - **Validate** và tự sửa nếu cần

#### 5️⃣ Export
- Tải Excel ma trận
- Tải Word đề thi + Đáp án

---

## 📋 Cấu trúc đề theo CV 7991

| Phần | Dạng câu hỏi | Điểm | Số câu |
|------|--------------|------|--------|
| **I** | Trắc nghiệm nhiều lựa chọn (MCQ) | 3 điểm | 12 câu × 0.25đ |
| **II** | Trắc nghiệm đúng/sai (4 ý/câu) | 2 điểm | 4 câu × 0.5đ |
| **III** | Trả lời ngắn | 2 điểm | 4 câu × 0.5đ |
| **IV** | Tự luận | 3 điểm | 2-3 câu |
| **Tổng** | | **10 điểm** | |

### Tỷ lệ mức độ nhận thức

| Mức độ | Tỷ lệ | Mô tả |
|--------|-------|-------|
| **Nhận biết** | 40% | Nhớ, nhận ra kiến thức |
| **Thông hiểu** | 30% | Hiểu, giải thích được kiến thức |
| **Vận dụng** | 30% | Áp dụng vào tình huống mới |

---

## 📊 Database Schema

```sql
-- Users: Quản lý người dùng
users (id, email, password_hash, created_at)

-- Libraries: Thư viện bộ sách
libraries (id, user_id, subject, grade, bookset, term, duration_minutes, created_at)

-- Documents: Tài liệu upload
documents (id, library_id, user_id, filename, file_type, r2_key, extracted_text_status, created_at)

-- Doc Chunks: Chunks cho RAG
doc_chunks (id, document_id, chunk_index, title_hint, text, tokens_est, created_at)

-- Exams: Đề thi và ma trận
exams (id, library_id, user_id, title, matrix_json, exam_json, answer_key_json, status, created_at, updated_at)

-- Exports: File đã xuất
exports (id, exam_id, user_id, type, r2_key, created_at)
```

---

## 🔌 API Reference

### Authentication

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/auth/register` | POST | Đăng ký tài khoản |
| `/auth/login` | POST | Đăng nhập |
| `/auth/logout` | POST | Đăng xuất |
| `/me` | GET | Lấy thông tin user hiện tại |

### Libraries

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/libraries` | POST | Tạo library mới |
| `/libraries` | GET | Danh sách libraries |
| `/libraries/:id` | GET | Chi tiết library |

### Documents

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/libraries/:id/documents/initiate-upload` | POST | Khởi tạo upload |
| `/libraries/:id/documents/complete` | POST | Hoàn tất upload |
| `/libraries/:id/documents` | GET | Danh sách documents |
| `/documents/:id/chunks` | GET | Lấy chunks của document |

### Generation

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/exams/generate-matrix` | POST | Tạo ma trận đề |
| `/exams/generate-exam` | POST | Sinh đề từ ma trận |
| `/exams/:id/regenerate-question` | POST | Sinh lại 1 câu hỏi |
| `/exams/:id/validate` | POST | Validate đề |

### Exams

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/exams` | POST | Lưu đề |
| `/exams` | GET | Danh sách đề |
| `/exams/:id` | GET | Chi tiết đề |
| `/exams/:id` | PUT | Cập nhật đề |

### Export

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/exams/:id/export/matrix-xlsx` | POST | Export ma trận Excel |
| `/exams/:id/export/exam-docx` | POST | Export đề thi Word |

### Grading

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/exams/:id/grade` | POST | Chấm điểm tự động |

---

## 🚢 Deploy

### Frontend (Cloudflare Pages)

```bash
cd apps/web

# Build production
pnpm build

# Deploy
wrangler pages deploy dist --project-name=exam-matrix
```

### Backend (Cloudflare Workers)

```bash
cd apps/api

# Deploy production
wrangler deploy

# Deploy với environment cụ thể
wrangler deploy --env production
```

### Environment Variables (Production)

Cấu hình trong Cloudflare Dashboard hoặc wrangler:

```bash
# Set JWT secret
wrangler secret put JWT_SECRET
```

---

## 🧪 Development

### Scripts có sẵn

```bash
# Chạy development server
pnpm dev

# Build tất cả packages
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

### Cấu trúc Turborepo

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] },
    "test": { "dependsOn": ["^build"] }
  }
}
```

---

## 🔐 Bảo mật

### API Key
- ✅ API key lưu **localStorage** trên client
- ✅ Backend chỉ dùng key để proxy call, **không log**
- ✅ Truyền qua HTTPS, không persist trên server

### Authentication
- ✅ Password hash với bcrypt/scrypt
- ✅ JWT HttpOnly Cookie
- ✅ CORS chỉ allow origin của Pages

### Rate Limiting
- ✅ Rate limit per user qua KV
- ✅ Tránh spam AI calls

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! 

### Quy trình đóng góp

1. **Fork** repository
2. **Clone** fork về máy
   ```bash
   git clone https://github.com/your-username/taodeonline.git
   ```
3. **Tạo branch** mới
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit** changes
   ```bash
   git commit -m 'Add: amazing feature'
   ```
5. **Push** to branch
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Tạo Pull Request**

### Coding Standards

- TypeScript strict mode
- ESLint + Prettier
- Meaningful commit messages
- Unit tests cho logic quan trọng

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for more information.

```
MIT License

Copyright (c) 2024 Exam Matrix Generator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- **Bộ Giáo dục và Đào tạo** - Công văn 7991/BGDĐT-GDTrH (17/12/2024)
- **Chương trình GDPT 2018** - Cơ sở nội dung kiểm tra đánh giá
- **Cloudflare** - Hạ tầng serverless
- **Open Source Community** - Các thư viện và công cụ sử dụng

---

## 📞 Liên hệ

- **Author**: Nguyễn Hoàng Long
- **GitHub**: [@LongNgn204](https://github.com/LongNgn204)
- **Project**: [https://github.com/LongNgn204/taodeonline](https://github.com/LongNgn204/taodeonline)

---

<p align="center">
  Made with ❤️ for Vietnamese Teachers
</p>
