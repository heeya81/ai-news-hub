# 🏗️ AI News Hub Separation Implementation Plan

This document outlines the roadmap for separating the current integrated Next.js application into distinct Frontend and Backend services.

## 📋 Task List

### Phase 1: Preparation & Documentation
- [x] Create API Protocol Document (Contract between FE and BE).
- [x] Initialize Backend project structure (Node.js + Express + TypeScript).
- [x] Define Environment Variables for both services.

### Phase 2: Backend Migration
- [x] Setup Express server with CORS and error handling.
- [x] Migrate news fetching logic (`rss-parser`).
- [ ] Migrate Supabase integration logic.
- [x] Implement News API Endpoints (`GET /api/news`, `POST /api/news`).
- [x] Implement Keyword filtering logic on Backend (Moving logic from FE to BE for performance).
- [ ] Setup Cron job equivalent (Standalone scheduler or simplified endpoint).

### Phase 3: Frontend Refactoring
- [x] Configure `NEXT_PUBLIC_API_URL`.
- [x] Refactor News Data Fetchers to call the external Backend instead of local API routes.
- [x] Remove legacy `src/app/api` folder from Frontend.
- [x] Clean up `src/lib` logic that moved to Backend.

### Phase 4: Integration & Verification
- [x] Verify CORS functionality.
- [x] Test end-to-end news flow (Backend scrape -> Frontend display).
- [x] Update README with instructions for running both services.

---

## 📂 Proposed Structure

```text
ai-news-hub/
├── frontend/        # Current Next.js App (Refactored)
│   ├── src/app/
│   ├── src/components/
│   └── ...
└── backend/         # New Node.js Service
    ├── src/
    │   ├── routes/
    │   ├── services/
    │   └── server.ts
    ├── package.json
    └── ...
```
