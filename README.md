# StratOS

솔로 크리에이터와 1인 사업자를 위한 AI 실행 OS. 지금 상황을 입력하면 오늘 당장 할 수 있는 액션 하나를 돌려줍니다.

## 어떻게 동작하나요?

1. **컨텍스트 설정** — 크리에이터 유형, 팔로워 규모, 사업 단계, 니치 입력
2. **상황 설명** — 막혀 있는 것, 또는 앞으로 나아가고 싶은 것을 자유롭게 작성
3. **액션 수령** — AI가 오늘 실행 가능한 구체적인 태스크를 최대 3단계로 반환 (각 30분 이내)
4. **바로 복사** — Magic Copy가 채널별(인스타 DM, LinkedIn, 네이버 블로그, 유튜브 등) 바로 쓸 수 있는 문구를 생성
5. **완료 또는 리롤** — 완료하면 스트릭 기록, 맞지 않으면 재생성

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 인증 + DB | Supabase (Google OAuth, PostgreSQL) |
| AI | Groq (`llama-3.1-8b-instant`) |
| 상태 관리 | Zustand |
| 유효성 검사 | Zod |
| 스타일링 | Tailwind CSS |
| 테스트 | Vitest + Testing Library |

## 시작하기

### 사전 준비

- Node.js 18+
- [Supabase](https://supabase.com) 프로젝트
- [Groq](https://console.groq.com) API 키

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 3. 데이터베이스 설정

`supabase/migrations/` 아래 마이그레이션 파일을 참고해 스키마를 적용하세요.

### 4. Google OAuth 설정

Supabase 대시보드에서 **Authentication → Providers → Google** 활성화 후 OAuth 자격증명 입력.

로컬 개발용 리다이렉트 URL: `http://localhost:3000/auth/callback`

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

## 명령어

```bash
npm run dev    # 개발 서버
npm run build  # 프로덕션 빌드
```

## 프로젝트 구조

```
app/
  api/sessions/          # GET 목록, POST 생성
  api/sessions/[id]/     # PATCH 리롤
  api/sessions/[id]/complete/  # PATCH 완료
  api/user-context/      # GET / PUT
  auth/callback/         # OAuth 콜백
  login/                 # Google 로그인 페이지
  history/               # 완료된 세션 히스토리
  stats/                 # 실행 통계 (스트릭, 히트맵, 채널/카테고리 분포)
  page.tsx               # 대시보드
lib/
  groq.ts                # Groq 클라이언트 (서버 전용)
  generate-action.ts     # Groq 호출 + 파싱 + 검증 (서버 전용)
  auth.ts                # getAuthUser() — API route 인증 가드
  prompts.ts             # AI 시스템 프롬프트 및 유저 프롬프트 빌더
  schemas.ts             # API 경계용 Zod 스키마
  kpi.ts                 # KPI 및 통계 계산 함수
  labels.ts              # 채널·카테고리 한국어 레이블
  api.ts                 # 클라이언트 API 함수
  hooks.ts               # useInitStore — 인증 + 데이터 초기화
  supabase/              # browser.ts (클라이언트), server.ts (서버)
components/
  dashboard/             # ActionListPanel, ActionDetailPanel, NewActionModal 등
  layout/                # AppShell, Sidebar
store/
  index.ts               # Zustand 스토어 (비영속)
types/
  index.ts               # 공유 TypeScript 인터페이스
tests/
  fixtures.ts            # defaultCtx, makeSession() 테스트 픽스처
```
