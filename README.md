# StratOS

AI-powered execution OS for solo creators and entrepreneurs. Describe your situation, get one specific action to take today — with ready-to-send copy.

## How it works

1. **Set your context** — creator type, audience size, business stage, niche
2. **Describe your situation** — what you're stuck on or trying to move forward
3. **Get one action** — AI returns a concrete task with up to 3 steps, each doable in under 30 minutes
4. **Copy and go** — Magic Copy generates channel-specific text (Instagram DM, LinkedIn, Naver Blog, YouTube, or general) ready to send without edits
5. **Complete or reroll** — mark done to track your streak, or regenerate if the action doesn't fit

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Auth + DB | Supabase (Google OAuth, PostgreSQL) |
| AI | Groq (`llama-3.1-8b-instant`) |
| State | Zustand |
| Validation | Zod |
| Styling | Tailwind CSS |
| Tests | Vitest + Testing Library |

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Set up the database

Run the following SQL in your Supabase SQL editor:

```sql
-- User context
CREATE TABLE user_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  business_stage TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Action sessions
CREATE TABLE action_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general',
  action JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-level security
ALTER TABLE user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own context" ON user_contexts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users manage own sessions" ON action_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Enable Google OAuth in Supabase

In your Supabase dashboard: **Authentication → Providers → Google** — enable and add your OAuth credentials.

Set the redirect URL to `http://localhost:3000/auth/callback` for local development.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run test:run   # run all tests once
```

## Project structure

```
app/
  api/sessions/          # GET list, POST create, PATCH reroll
  api/sessions/[id]/     # PATCH complete
  api/user-context/      # GET / PUT
  auth/callback/         # OAuth callback
  login/                 # Google sign-in page
  history/               # Completed sessions view
  page.tsx               # Dashboard
lib/
  groq.ts                # Groq client (server-only)
  prompts.ts             # AI system prompt and user prompt builder
  schemas.ts             # Zod schemas for API boundaries
  hooks.ts               # useInitStore — bootstraps auth + data
  supabase/              # browser.ts (client), server.ts (server)
components/
  dashboard/             # ActionListPanel, ActionDetailPanel, NewActionModal, ...
  layout/                # AppShell, Sidebar
store/
  index.ts               # Zustand store (no persist)
types/
  index.ts               # Shared TypeScript interfaces
tests/
  fixtures.ts            # defaultCtx, makeSession() for tests
```
