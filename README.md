# Exam Matrix & Test Generator

Hệ thống tạo Ma trận đề kiểm tra và Đề thi theo Công văn 7991/BGDĐT-GDTrH (17/12/2024), bám sát Chương trình GDPT 2018.

## Giới thiệu

Dự án mã nguồn mở giúp giáo viên:
- Tạo ma trận đề kiểm tra định kỳ theo chuẩn Công văn 7991
- Sinh đề thi tự động với hỗ trợ AI (OpenAI, Anthropic, Google...)
- Xuất file Word/Excel theo đúng template chuẩn
- Chấm điểm tự động cho phần trắc nghiệm

## Tech Stack

- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Cloudflare Workers + Hono
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2
- Cache: Cloudflare KV
- AI: Hỗ trợ đa model (OpenAI, Anthropic, Google Gemini)

## Cấu trúc dự án

```
taodeonline/
├── apps/
│   ├── api/           # Cloudflare Workers API
│   └── web/           # React + Vite Frontend
├── packages/
│   ├── core/          # Unified LLM core (multi-provider)
│   ├── export/        # Word/Excel export
│   ├── rag/           # RAG chunking và retrieval
│   └── shared/        # Types, schemas, utils
├── docs/              # Tài liệu hướng dẫn
├── migrations/        # D1 database migrations
└── samples/           # Dữ liệu mẫu
```

## Yêu cầu hệ thống

- Node.js >= 20.0.0
- pnpm (khuyến nghị) hoặc npm

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/your-repo/taodeonline.git
cd taodeonline
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

## Các lệnh chính

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy development server (frontend + API) |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra linting |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run test` | Chạy tests |
| `npm run clean` | Xóa build artifacts và node_modules |

## Hướng dẫn sử dụng

Xem chi tiết tại [docs/GUIDE.md](./docs/GUIDE.md)

## Cấu hình

### Biến môi trường

**Frontend (apps/web):**
- `VITE_API_URL`: URL của API backend

**Backend (apps/api):**
- Cấu hình trong `wrangler.toml`
- D1 database binding
- R2 bucket binding
- KV namespace binding

### API Keys

API keys của các AI provider (OpenAI, Anthropic, Google) được lưu trữ local trên trình duyệt người dùng. Backend chỉ nhận key qua request để proxy call, không lưu trữ.

## Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mô tả tính năng"`
4. Push to branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

## Tác giả

Nguyễn Hoàng Long

## License

MIT License - Xem file [LICENSE](./LICENSE) để biết thêm chi tiết.
