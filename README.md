# Exam Matrix Generator (Tạo Đề Online)

Hệ thống tạo đề thi theo ma trận kiểm tra đánh giá (KTĐG) và định dạng TN THPT 2025 (TT 17/2025).

## Features
-   **Đa công văn**: Hỗ trợ nhiều mode tạo đề (Truyền thống vs 2025).
-   **Validator Engine**: Kiểm tra cấu trúc, số lượng câu hỏi, thời gian theo quy định.
-   **Policy Registry**: Quản lý văn bản quy phạm pháp luật (D1).
-   **Generation Pipeline**: Quy trình sinh đề từ Blueprint -> AI -> Validate -> Export.

## Modules
-   `apps/web`: Next.js Dashboard.
-   `apps/api`: Cloudflare Workers (Hono) API.
-   `packages/core`: Core logic (Validator, Blueprints, Policies).

## API Usage

### 1. Generate Exam
`POST /exam/generate`
```json
{
  "subject": "MATH",
  "blueprintId": "BP_MATH_2025",
  "mode": "TN_2025"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "content": { ... },
  "compliance": {
    "passed": true,
    "evidence": [
      { "policyId": "RULE_TIME_MATH", "status": "PASSED" }
    ]
  }
}
```

### 2. Validate Exam
`POST /exam/validate`
Input: Exam JSON object.

## Development
1.  **Core Tests**:
    ```bash
    cd packages/core
    npm test
    ```
2.  **API Dev**:
    ```bash
    cd apps/api
    npm run dev
    ```
3.  **D1 Migrations**:
    ```bash
    npx turbo run migrate
    # or
    cd apps/api && npx wrangler d1 migrations apply DB --local
    ```
