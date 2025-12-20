# Exam Matrix Generator

Công cụ mã nguồn mở giúp giáo viên tạo **Ma trận đề kiểm tra định kỳ** và **Đề thi** theo **Công văn 7991/BGDĐT-GDTrH** (17/12/2024), bám sát Chương trình Giáo dục Phổ thông 2018.

## Tính năng

- ✅ Tạo ma trận đề theo chuẩn CV 7991 (MCQ 3đ, Đ/S 2đ, TLN 2đ, TL 3đ)
- ✅ Tỷ lệ nhận thức 40% Nhận biết / 30% Thông hiểu / 30% Vận dụng
- ✅ Upload tài liệu SGK (PDF/DOCX/XLSX) và RAG để sinh câu hỏi
- ✅ Hỗ trợ đa AI provider (OpenAI, Anthropic, Google, Groq, DeepSeek, ...)
- ✅ Export Excel ma trận và Word đề thi
- ✅ Chấm tự động câu trắc nghiệm

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV

## Cấu trúc dự án

```
exam-matrix-generator/
├── apps/
│   ├── web/          # Frontend React
│   └── api/          # Backend Worker
├── packages/
│   ├── shared/       # Types + Schemas + Utils
│   ├── export/       # Excel/Word generators
│   └── rag/          # Chunking + Retrieval
├── migrations/       # D1 SQL migrations
└── templates/        # Excel/Word templates
```

## Cài đặt

### Yêu cầu

- Node.js >= 20
- pnpm >= 9
- Cloudflare account (D1, R2, Workers)

### Setup local

```bash
# Clone repo
git clone https://github.com/your-username/exam-matrix-generator.git
cd exam-matrix-generator

# Install dependencies
pnpm install

# Build packages
pnpm build

# Setup D1 database
cd apps/api
wrangler d1 create exam-matrix-db
# Copy database_id vào wrangler.toml

# Run migrations
wrangler d1 execute exam-matrix-db --file=../../migrations/0001_initial.sql

# Setup R2 bucket
wrangler r2 bucket create exam-matrix-files

# Setup KV
wrangler kv:namespace create CACHE
# Copy id vào wrangler.toml

# Run dev
cd ../..
pnpm dev
```

### Environment Variables

Tạo file `.dev.vars` trong `apps/api/`:

```
JWT_SECRET=your-super-secret-key-change-in-production
```

## Deploy

### Frontend (Cloudflare Pages)

```bash
cd apps/web
pnpm build
wrangler pages deploy dist --project-name=exam-matrix
```

### Backend (Cloudflare Workers)

```bash
cd apps/api
wrangler deploy
```

## Sử dụng

1. **Đăng ký/Đăng nhập** tài khoản
2. **Tạo thư viện** - chọn môn, lớp, bộ sách
3. **Upload tài liệu** - SGK PDF/DOCX để làm nguồn sinh câu hỏi
4. **Cấu hình AI** - nhập API key (lưu local, không gửi server)
5. **Tạo ma trận** - AI sinh ma trận theo CV 7991
6. **Sinh đề thi** - tạo câu hỏi từ ma trận và tài liệu
7. **Export** - tải Excel ma trận và Word đề thi

## Cấu trúc đề theo CV 7991

| Phần | Dạng câu hỏi | Điểm |
|------|--------------|------|
| I | Trắc nghiệm nhiều lựa chọn (MCQ) | 3 điểm |
| II | Trắc nghiệm đúng/sai (4 ý/câu) | 2 điểm |
| III | Trả lời ngắn | 2 điểm |
| IV | Tự luận | 3 điểm |
| **Tổng** | | **10 điểm** |

**Tỷ lệ nhận thức**: 40% Nhận biết / 30% Thông hiểu / 30% Vận dụng

## API Reference

Xem [API Documentation](./docs/api.md) (sẽ được bổ sung).

## Contributing

1. Fork repo
2. Tạo branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - xem file [LICENSE](./LICENSE)

## Acknowledgments

- Bộ Giáo dục và Đào tạo - Công văn 7991/BGDĐT-GDTrH
- Chương trình GDPT 2018
