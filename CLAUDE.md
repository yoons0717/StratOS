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

## Architecture

```
app/
  api/sessions/route.ts               # GET (list), POST (create + Groq)
  api/sessions/[id]/route.ts          # PATCH (reroll)
  api/sessions/[id]/complete/route.ts # PATCH (complete)
  api/user-context/route.ts           # GET / PUT
  login/page.tsx                      # Google OAuth login
  auth/callback/route.ts              # OAuth callback
  page.tsx                            # Dashboard
lib/
  groq.ts      # Server-only Groq client. Never import in Client Components.
  prompts.ts   # Shared SYSTEM_PROMPT, STAGE_MAP, buildUserPrompt for session route handlers.
  schemas.ts   # Zod schemas shared across API request/response boundaries.
  hooks.ts     # useInitStore — fetch ctx + sessions, redirect to /onboarding if null.
  supabase/    # browser.ts (client-side), server.ts (server-side)
store/
  index.ts     # Zustand (no persist). All client state lives here.
types/
  index.ts     # Project-wide TypeScript interfaces.
tests/
  fixtures.ts  # Shared test fixtures: defaultCtx, makeSession(overrides?).
middleware.ts  # Redirects unauthenticated requests to /login.
```

**Server/client boundary — common mistakes:**
- `lib/groq.ts` is server-only. Importing it in a Client Component will break the build.
- `lib/supabase/server.ts` is server-only. Use `lib/supabase/browser.ts` in client code.
- `GROQ_API_KEY` must never reach the client bundle — only in `.env.local`.

## Code Conventions

- **Path alias**: `@/` → project root. No relative paths (`../`).
- **Zod**: Validate at all external boundaries — API requests, AI responses, and DB row reads. Always `safeParse`, never `parse`. Do not use `as SomeType` casting; validate and extract the type instead.
- **Schemas**: Define types in `lib/schemas.ts`, extract with `z.infer<>`.
- **No inline styles**: `style={{...}}` is banned. For dynamic values, define a utility class in `globals.css` that reads a CSS custom property, then pass the value via style:
  ```tsx
  // globals.css: .bar-fill { width: var(--bar-width); }
  <div className="bar-fill" style={{ "--bar-width": `${pct}%` } as React.CSSProperties} />
  ```
- **No dynamic Tailwind arbitrary values**: `w-[${value}%]` will not work — Tailwind's scanner is static and won't generate the class. Use the CSS custom property pattern above.
- **`"use client"`**: Only on components that need state or event handlers.

## Working Style

- **Plans**: filename + one-line description only. No code in plans.
- **Tasks**: one at a time. Confirm before moving to the next.

## TDD Rules

Write tests first for all new features and bug fixes.

```
1. Write failing test (red)
2. Minimal code to pass (green)
3. Refactor (refactor)
```

**Test file location**: same directory as the source file, `*.test.ts(x)`.

**Shared fixtures**: use `defaultCtx` and `makeSession(overrides?)` from `@/tests/fixtures` instead of defining fixtures locally in each test file.

**Critical: stable router mock to prevent infinite re-render**

Using `useRouter: () => ({ push: vi.fn() })` creates a new object every render, causing useEffect to re-run infinitely and the test to hang. Always use `vi.hoisted()`:

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
