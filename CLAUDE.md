# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type check (no emit)
npm run test         # vitest watch mode
npm run test:run     # vitest single run (CI)
```

Run a single test file:
```bash
npx vitest run path/to/file.test.ts
```

## Architecture

```
app/
  api/generate-action/route.ts  # 유일한 API 엔드포인트. Groq 호출은 여기서만.
  page.tsx                       # SPA처럼 동작하는 단일 페이지
lib/
  groq.ts      # 서버 전용 Groq 클라이언트. Client Component에서 import 금지.
  schemas.ts   # Zod 스키마. API 요청/응답 양쪽에서 공유.
store/
  index.ts     # Zustand + persist. 모든 클라이언트 상태는 여기서 관리.
types/
  index.ts     # 프로젝트 전체 TypeScript 인터페이스.
```

**데이터 흐름:**
1. 클라이언트 → `POST /api/generate-action` (UserContext + 자유 입력)
2. Route Handler → Zod 검증 → Groq 호출 → Zod 검증 → JSON 응답
3. 클라이언트 → Zustand store에 저장 → LocalStorage persist

**서버/클라이언트 경계:**
- `lib/groq.ts`는 서버 전용. Client Component에서 절대 import하지 않는다.
- `GROQ_API_KEY`는 `.env.local`에만 존재. 클라이언트 번들에 절대 노출되지 않는다.
- `store/`, `types/`는 클라이언트에서 사용 가능.

## Code Conventions

- **Path alias**: `@/` → 프로젝트 루트. 상대 경로(`../`) 사용 금지.
- **TypeScript strict mode** 활성화. `any` 사용 금지.
- **Zod**: 외부 경계(API 요청, AI 응답)는 반드시 Zod로 검증 후 사용. `safeParse` 사용 — `parse`(throws) 금지.
- **Server Component 기본**: `"use client"`는 상태/이벤트가 필요한 최소 단위에만 붙인다.
- **스키마 공유**: API 요청/응답 타입은 `lib/schemas.ts`에서 정의하고 `z.infer<>`로 타입 추출.

## TDD Rules

새 기능/버그픽스는 반드시 테스트 먼저 작성한다.

```
1. 실패하는 테스트 작성 (red)
2. 최소한의 코드로 통과 (green)
3. 리팩터링 (refactor)
```

**테스트 파일 위치**: 테스트 대상 파일과 같은 디렉토리에 `*.test.ts(x)` 로 배치.

**무엇을 테스트하는가:**
- `lib/schemas.ts`: 유효/무효 입력에 대한 Zod 검증 결과
- `store/index.ts`: 각 액션(setUserContext, addSession, completeSession) 후 상태
- React 컴포넌트: 사용자 인터랙션 후 DOM 변화 (`@testing-library/react`)
- `app/api/`: Route Handler는 통합 테스트로 — Groq 클라이언트는 `vi.mock`으로 대체

**Groq mock 패턴:**
```ts
vi.mock("@/lib/groq", () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));
```
