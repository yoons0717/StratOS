# Phase 1 — Auth + DB Migration

**Goal:** Google OAuth 로그인 + LocalStorage → Supabase PostgreSQL

---

## 사전 준비 (수동)

1. Supabase 프로젝트 생성 → Google OAuth 활성화
2. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
3. SQL 실행:

```sql
create table action_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  input text not null,
  action jsonb not null,
  completed boolean default false not null
);
alter table action_sessions enable row level security;
create policy "own" on action_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table user_contexts (
  user_id uuid primary key references auth.users,
  type text not null, level text not null, business_stage text not null
);
alter table user_contexts enable row level security;
create policy "own" on user_contexts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## Tasks

- [ ] **T1** `npm install @supabase/supabase-js @supabase/ssr`
- [ ] **T2** `lib/supabase/browser.ts`, `lib/supabase/server.ts` 생성
- [ ] **T3** `types/index.ts` — `ActionSession.createdAt: number` → `created_at: string` / `lib/kpi.ts` 수정
- [ ] **T4** `middleware.ts` — 미인증 시 `/login` 리다이렉트
- [ ] **T5** `app/login/page.tsx` + `app/auth/callback/route.ts`
- [ ] **T6** `app/api/user-context/route.ts` — GET + PUT
- [ ] **T7** `app/api/sessions/route.ts` — GET + POST (generate-action 로직 이전), `app/api/generate-action/` 삭제
- [ ] **T8** `app/api/sessions/[id]/complete/route.ts` — PATCH
- [ ] **T9** `lib/api.ts` 교체 — fetchSessions / createSession / completeSession / fetchUserContext / saveUserContext
- [ ] **T10** `store/index.ts` — persist 제거, setSessions / markCompleted 추가
- [ ] **T11** `components/dashboard/NewActionModal.tsx` 생성
- [ ] **T12** `app/page.tsx`, `app/history/page.tsx`, `app/settings/page.tsx`, `app/onboarding/page.tsx` — DB 연동으로 교체
- [ ] **T13** `components/layout/Sidebar.tsx` — 로그아웃 버튼 추가
- [ ] **T14** `npx vitest run` + `npm run typecheck` + `npm run build` 통과
