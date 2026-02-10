# AI News Hub

AI 뉴스를 자동으로 수집하고 사용자별 관심 키워드에 따라 필터링하여, 매일 지정된 시간에 푸시 알림으로 전달하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🤖 **AI 뉴스 자동 수집**: RSS 피드를 통한 실시간 AI 뉴스 수집
- 🔍 **키워드 기반 필터링**: 사용자가 설정한 키워드로 뉴스 자동 필터링
- 🔔 **스마트 푸시 알림**: 원하는 시간에 맞춤형 뉴스 알림
- 📱 **반응형 웹 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- 🎨 **프리미엄 UI**: 다크 모드, 글라스모피즘, 부드러운 애니메이션

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- Supabase 계정

### 설치

1. **레포지토리 클론 또는 프로젝트 다운로드**

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**

`.env.local.example` 파일을 `.env.local`로 복사하고 값을 채워넣으세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Web Push VAPID Keys (generate using: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com

# Cron Secret
CRON_SECRET=your-random-secret-key
```

4. **데이터베이스 설정**

Supabase 대시보드에서 `DATABASE_SCHEMA.md` 파일의 SQL 스크립트를 실행하세요.

5. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 📦 기술 스택

- **프론트엔드**: Next.js 14 (App Router), React, TypeScript
- **스타일링**: Tailwind CSS
- **백엔드**: Next.js API Routes (Serverless)
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **푸시 알림**: Web Push API, Service Workers
- **뉴스 수집**: RSS Parser
- **아이콘**: Lucide React

## 📱 푸시 알림 설정

### Vercel에서 Cron Job 설정

1. `vercel.json` 파일 생성:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 * * * *"
  }]
}
```

2. Vercel 대시보드에서 환경 변수에 `CRON_SECRET` 추가

3. Cron job은 매시간 실행되며, 각 사용자의 `notification_time` 설정에 따라 알림 전송

## 🔧 주요 파일 구조

```
ainews/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── dashboard/
│   │   │   └── page.tsx          # 뉴스 피드 대시보드
│   │   ├── settings/
│   │   │   └── page.tsx          # 설정 페이지
│   │   └── api/
│   │       └── cron/
│   │           └── route.ts      # 푸시 알림 Cron Job
│   ├── components/
│   │   └── NotificationManager.tsx  # 푸시 알림 관리
│   └── lib/
│       ├── supabase.ts           # Supabase 클라이언트
│       └── news.ts               # 뉴스 수집 및 필터링
├── public/
│   └── sw.js                     # Service Worker
├── DATABASE_SCHEMA.md            # 데이터베이스 스키마
└── README.md
```

## 🌐 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 배포 완료!

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📧 문의

문제가 있으시면 이슈를 등록해주세요.
