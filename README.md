# StratOS

솔로 크리에이터와 1인 사업자를 위한 AI 실행 OS.

막막한 상황을 입력하면 오늘 당장 실행할 수 있는 액션 하나를 돌려줍니다.

---

## 왜 만들었나

크리에이터나 1인 사업자는 할 일은 많은데 "지금 뭘 해야 하지?"에서 막히는 경우가 많습니다. 전략이 없어서가 아니라 너무 많아서입니다. StratOS는 지금 상황만 입력하면 오늘 30분 안에 끝낼 수 있는 액션 하나를 반환합니다.

---

## 핵심 기능

### 액션 생성
상황을 자유롭게 입력하면 AI가 오늘 실행 가능한 구체적인 태스크를 최대 3단계로 반환합니다. 각 단계는 30분 이내로 완료할 수 있습니다.

### Magic Copy
채널별로 바로 붙여넣을 수 있는 문구를 자동 생성합니다. 인스타그램 DM, LinkedIn, 네이버 블로그, 유튜브 등 채널에 맞는 톤으로 작성됩니다.

### 실행 추적
완료한 액션은 히스토리에 기록되고, 연속 실행 일수(스트릭)를 추적합니다. 통계 페이지에서 채널별·카테고리별 분포를 확인할 수 있습니다.

### 리마인더 이메일
설정에서 리마인더를 켜두면 오늘 액션을 하지 않은 경우 이메일로 알림을 받습니다.

---

## 유저 플로우

```
랜딩 페이지 → 구글 로그인 → 온보딩 (유형/규모/단계/니치)
    → 대시보드 → 상황 입력 → AI 액션 수령 → Magic Copy → 완료
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

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
```

### 3. 데이터베이스 설정

`supabase/migrations/` 아래 마이그레이션 파일을 순서대로 Supabase SQL Editor에서 실행하세요.

각 테이블에 RLS policy를 추가해야 합니다. `events` 테이블 예시:

```sql
create policy "users can insert own events"
  on events for insert with check (auth.uid() = user_id);

create policy "users can read own events"
  on events for select using (auth.uid() = user_id);
```

### 4. Google OAuth 설정

Supabase 대시보드 → **Authentication → Providers → Google** 활성화.

리다이렉트 URL: `http://localhost:3000/auth/callback`

### 5. 개발 서버 실행

```bash
npm run dev
```

---

## 어드민

`/admin` 페이지에서 DAU, 온보딩 완료율, 세션 완료율을 확인하고 리마인더 이메일을 수동 발송할 수 있습니다. `.env.local`의 `ADMIN_EMAIL`로 지정된 계정만 접근 가능합니다.
