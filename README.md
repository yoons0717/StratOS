# StratOS

솔로 크리에이터와 1인 사업자를 위한 AI 실행 OS. 현재 상황을 입력하면 오늘 실행할 수 있는 액션 하나를 반환합니다.

---

## 기능

**액션 생성**
상황을 입력하면 AI가 실행 가능한 태스크를 최대 3단계로 반환합니다.

**Magic Copy**
채널별(인스타그램 DM, LinkedIn, 네이버 블로그, 유튜브)로 바로 붙여넣을 수 있는 문구를 자동 생성합니다.

**실행 추적**
완료한 액션을 히스토리에 기록하고, 연속 실행 일수(스트릭)와 채널·카테고리별 분포를 통계로 제공합니다.

**리마인더 이메일**
설정에서 리마인더를 켜두면 당일 액션이 없을 경우 이메일 알림을 발송합니다.

---

## 유저 플로우

```
랜딩 → 구글 로그인 → 온보딩 (유형/규모/단계/니치)
    → 대시보드 → 상황 입력 → 액션 수령 → Magic Copy → 완료
```

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 인증 + DB | Supabase (Google OAuth, PostgreSQL) |
| AI | Groq (`llama-3.1-8b-instant`) |
| 이메일 | Resend |
| 상태 관리 | Zustand |
| 유효성 검사 | Zod |
| 스타일링 | Tailwind CSS |
| 테스트 | Vitest + Testing Library |

---

## 시작하기

**1. 의존성 설치**
```bash
npm install
```

**2. 환경변수 설정** — `.env.local` 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
```

**3. 데이터베이스** — `supabase/migrations/` 파일을 순서대로 Supabase SQL Editor에서 실행

**4. Google OAuth** — Supabase 대시보드 → Authentication → Providers → Google 활성화
리다이렉트 URL: `http://localhost:3000/auth/callback`

**5. 서버 실행**
```bash
npm run dev
```

---

## 어드민

`/admin` — DAU, 온보딩 완료율, 세션 완료율 확인 및 리마인더 이메일 수동 발송. `ADMIN_EMAIL`로 지정된 계정만 접근 가능.
