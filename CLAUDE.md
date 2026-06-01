# CLAUDE.md

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type check (no emit)
npm run test:run     # vitest single run
npx vitest run path/to/file.test.ts
```

## Key Patterns

**Server/client boundary:**
- `lib/groq.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` — server-only. Never import in Client Components.
- `lib/supabase/browser.ts` — client-only. Use in `"use client"` components.
- `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` must never reach the client bundle.

**Supabase clients:**
- `createSupabaseServerClient()` — user session context, respects RLS. Use in API routes and server components for user-scoped queries.
- `createSupabaseAdminClient()` — service role, bypasses RLS. Use only in admin-only routes (`/api/notifications/remind`, `/admin`).

**Admin auth guard:**
```ts
if (auth.user.email !== process.env.ADMIN_EMAIL) return redirect("/");
```

**New tables need RLS policies.** After creating a table via migration, add `insert`/`select` policies in Supabase dashboard or migration SQL. Without policies, all operations silently fail.

**Event logging** (`lib/events.ts`):
```ts
await logEvent("session_created", user.id, supabase);
```
Events: `onboarding_completed` (first save only), `session_created`, `session_completed`.

**Pure computation functions** go in `lib/` (e.g., `lib/kpi.ts`, `lib/metrics.ts`). Keep DB queries out of computation logic so functions are unit-testable without mocking Supabase.

**Next.js 16:** `middleware.ts` → `proxy.ts`, export function name `proxy` (not `middleware`).

## Code Conventions

- **Path alias**: `@/` → project root. No relative paths (`../`).
- **Zod**: Validate at all external boundaries — API requests, AI responses, and DB row reads. Always `safeParse`, never `parse`. Do not use `as SomeType` casting.
- **Schemas**: Define shared types in `lib/schemas.ts`, extract with `z.infer<>`.
- **No inline styles**: `style={{...}}` is banned. For dynamic values, use CSS custom property pattern:
  ```tsx
  // globals.css: .bar-fill { width: var(--bar-width); }
  <div className="bar-fill" style={{ "--bar-width": `${pct}%` } as React.CSSProperties} />
  ```
- **No dynamic Tailwind arbitrary values**: `w-[${value}%]` won't work. Use the CSS custom property pattern above.
- **`"use client"`**: Only on components that need state or event handlers.
- **Comments**: Only when WHY is non-obvious. Never explain WHAT the code does.

## PR Workflow

- Branch per feature: `feat/`, `fix/`, `refactor/`, `chore/`
- PR description format: **Why** (motivation) → **Summary** (what changed) → **Test plan** (checklist)
- Never commit without explicit user instruction.

## Working Style

- **Plans**: feature description only. No code in plans. 100줄 이하.
- **Tasks**: one at a time. Confirm before moving to the next.

## TDD Rules

Write tests first for all new features and bug fixes.

```
1. Write failing test (red)
2. Minimal code to pass (green)
3. Refactor (refactor)
```

**Test file location**: same directory as the source file, `*.test.ts(x)`.

**Shared fixtures**: use `defaultCtx` and `makeSession(overrides?)` from `@/tests/fixtures`.

**What NOT to test**: hardcoded label text, prop rendering (e.g. `getByText("TOTAL")`). Only test logic and behavior.

**Critical: stable router mock to prevent infinite re-render**
```ts
const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: vi.fn().mockReturnValue("/"),
}));
```

**Supabase browser mock** (required in any test that renders Sidebar or AppShell):
```ts
vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));
```

**Groq mock**:
```ts
vi.mock("@/lib/groq", () => ({
  default: { chat: { completions: { create: vi.fn() } } },
}));
```
