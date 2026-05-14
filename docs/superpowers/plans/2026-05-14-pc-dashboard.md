# PC Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 SPA를 PC-first 3패널 대시보드로 전면 재설계 — 사이드바 + KPI 바 + 액션 목록 + 상세 패널 + 모달.

**Architecture:** Zustand store는 변경 없음. 새 layout 컴포넌트(AppShell/Sidebar/KpiBar)가 PageLayout을 대체하고, dashboard 컴포넌트(ActionListPanel/ActionDetailPanel/NewActionModal)가 콘텐츠를 담당. 선택된 액션 id는 page 로컬 state로 관리 (URL 변경 없음).

**Tech Stack:** Next.js App Router, Zustand, Tailwind CSS v4, Vitest + @testing-library/react

---

## File Map

### 새로 생성
- `lib/kpi.ts` + `lib/kpi.test.ts` — KPI 계산 순수 함수
- `components/layout/Sidebar.tsx` + `Sidebar.test.tsx`
- `components/layout/KpiBar.tsx` + `KpiBar.test.tsx`
- `components/layout/AppShell.tsx` + `AppShell.test.tsx`
- `components/dashboard/CategoryChart.tsx` + `CategoryChart.test.tsx`
- `components/dashboard/ActionListPanel.tsx` + `ActionListPanel.test.tsx`
- `components/dashboard/ActionDetailPanel.tsx` + `ActionDetailPanel.test.tsx`
- `components/dashboard/NewActionModal.tsx` + `NewActionModal.test.tsx`

### 전면 재작성
- `app/page.tsx` + `app/page.test.tsx`
- `app/history/page.tsx` + `app/history/page.test.tsx`
- `app/settings/page.tsx` + `app/settings/page.test.tsx`

### 삭제
- `app/action/[id]/page.tsx` + `page.test.tsx`
- `components/ui/PageLayout.tsx`
- `components/result/ActionResult.tsx` + `ActionResult.test.tsx`

---

## Stage 1: KPI 계산 함수

### Task 1: `lib/kpi.ts`

**Files:**
- Create: `lib/kpi.ts`
- Create: `lib/kpi.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/kpi.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { computeKpi } from "./kpi";
import type { ActionSession } from "@/types";

function makeSession(overrides: Partial<ActionSession> = {}): ActionSession {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    input: "test",
    action: {
      title: "Test",
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
    ...overrides,
  };
}

describe("computeKpi", () => {
  it("returns zeros for empty sessions", () => {
    expect(computeKpi([])).toEqual({ total: 0, active: 0, completed: 0, rate: 0, streak: 0 });
  });

  it("counts total, active, completed correctly", () => {
    const sessions = [
      makeSession({ completed: false }),
      makeSession({ completed: false }),
      makeSession({ completed: true }),
    ];
    const result = computeKpi(sessions);
    expect(result.total).toBe(3);
    expect(result.active).toBe(2);
    expect(result.completed).toBe(1);
  });

  it("calculates rate as percentage rounded", () => {
    const sessions = [
      makeSession({ completed: true }),
      makeSession({ completed: true }),
      makeSession({ completed: false }),
    ];
    expect(computeKpi(sessions).rate).toBe(67);
  });

  it("rate is 0 when no sessions", () => {
    expect(computeKpi([]).rate).toBe(0);
  });

  it("streak is 1 when only today has sessions", () => {
    const sessions = [makeSession({ createdAt: Date.now() })];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak counts consecutive days back from today", () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const sessions = [
      makeSession({ createdAt: now }),
      makeSession({ createdAt: now - oneDayMs }),
      makeSession({ createdAt: now - oneDayMs * 2 }),
    ];
    expect(computeKpi(sessions).streak).toBe(3);
  });

  it("streak breaks at gap", () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const sessions = [
      makeSession({ createdAt: now }),
      makeSession({ createdAt: now - oneDayMs * 2 }), // gap of 1 day
    ];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak is 0 if today has no sessions", () => {
    const yesterday = Date.now() - 86400000;
    const sessions = [makeSession({ createdAt: yesterday })];
    expect(computeKpi(sessions).streak).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run lib/kpi
```
Expected: FAIL — "Cannot find module './kpi'"

- [ ] **Step 3: Implement**

```ts
// lib/kpi.ts
import type { ActionSession } from "@/types";

export interface KpiData {
  total: number;
  active: number;
  completed: number;
  rate: number;
  streak: number;
}

export function computeKpi(sessions: ActionSession[]): KpiData {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const streak = computeStreak(sessions);
  return { total, active, completed, rate, streak };
}

function computeStreak(sessions: ActionSession[]): number {
  if (sessions.length === 0) return 0;

  const DAY_MS = 86400000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sessionDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  let current = todayStart.getTime();
  while (sessionDays.has(current)) {
    streak++;
    current -= DAY_MS;
  }
  return streak;
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run lib/kpi
```
Expected: 8/8 pass

- [ ] **Step 5: Typecheck + commit**

```bash
npm run typecheck
```

---

## Stage 2: Layout 컴포넌트

### Task 2: `Sidebar`

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Sidebar.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/layout/Sidebar.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

describe("Sidebar", () => {
  it("renders logo", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /DASHBOARD/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HISTORY/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SETTINGS/i })).toBeInTheDocument();
  });

  it("highlights DASHBOARD when pathname is /", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /DASHBOARD/i })).toHaveClass("text-neon");
  });

  it("highlights HISTORY when pathname is /history", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/history");
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /HISTORY/i })).toHaveClass("text-neon");
  });

  it("renders user context info", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByText(/CREATOR/i)).toBeInTheDocument();
    expect(screen.getByText(/0-1K/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/layout/Sidebar
```
Expected: FAIL — "Cannot find module './Sidebar'"

- [ ] **Step 3: Implement**

```tsx
// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserContext } from "@/types";

interface Props {
  userContext: UserContext;
}

const NAV = [
  { href: "/", label: "DASHBOARD" },
  { href: "/history", label: "HISTORY" },
  { href: "/settings", label: "SETTINGS" },
] as const;

export default function Sidebar({ userContext }: Props) {
  const pathname = usePathname();
  return (
    <aside className="flex w-40 shrink-0 flex-col border-r border-zinc-800 bg-surface px-3 py-5">
      <div className="mb-5 font-mono text-xs tracking-widest text-neon">STRATOS_OS</div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded px-2 py-1.5 font-mono text-xs transition-colors ${
              pathname === href
                ? "bg-neon/10 text-neon"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {pathname === href ? "▸ " : "  "}{label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-zinc-800 pt-3">
        <div className="font-mono text-xs text-zinc-700">
          {userContext.type.toUpperCase()}
        </div>
        <div className="font-mono text-xs text-zinc-700">
          {userContext.level} · {userContext.businessStage.toUpperCase()}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/layout/Sidebar
```
Expected: 5/5 pass

- [ ] **Step 5: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/Sidebar.test.tsx lib/kpi.ts lib/kpi.test.ts
git commit -m "feat: add KPI computation and Sidebar component"
```

---

### Task 3: `KpiBar`

**Files:**
- Create: `components/layout/KpiBar.tsx`
- Create: `components/layout/KpiBar.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/layout/KpiBar.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KpiBar from "./KpiBar";
import type { KpiData } from "@/lib/kpi";

const data: KpiData = { total: 12, active: 4, completed: 8, rate: 67, streak: 5 };

describe("KpiBar", () => {
  it("renders all 5 KPI labels", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("RATE")).toBeInTheDocument();
    expect(screen.getByText("STREAK")).toBeInTheDocument();
  });

  it("renders numeric values", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("appends % to RATE", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

  it("renders 0% when rate is 0", () => {
    render(<KpiBar data={{ ...data, rate: 0 }} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/layout/KpiBar
```

- [ ] **Step 3: Implement**

```tsx
// components/layout/KpiBar.tsx
import type { KpiData } from "@/lib/kpi";

interface Props {
  data: KpiData;
}

const CARDS: Array<{ key: keyof KpiData; label: string; neon?: boolean }> = [
  { key: "total", label: "TOTAL" },
  { key: "active", label: "ACTIVE", neon: true },
  { key: "completed", label: "COMPLETED" },
  { key: "rate", label: "RATE", neon: true },
  { key: "streak", label: "STREAK", neon: true },
];

export default function KpiBar({ data }: Props) {
  return (
    <div className="flex shrink-0 gap-3 border-b border-zinc-800 bg-background px-4 py-3">
      {CARDS.map(({ key, label, neon }) => (
        <div key={key} className="flex-1 rounded border border-zinc-800 bg-surface px-3 py-2">
          <div className="font-mono text-xs tracking-widest text-zinc-600">{label}</div>
          <div
            className={`font-mono text-xl font-bold leading-tight ${neon ? "text-neon" : "text-white"}`}
          >
            {key === "rate" ? `${data[key]}%` : data[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/layout/KpiBar
```
Expected: 4/4 pass

---

### Task 4: `AppShell`

**Files:**
- Create: `components/layout/AppShell.tsx`
- Create: `components/layout/AppShell.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/layout/AppShell.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppShell from "./AppShell";
import type { KpiData } from "@/lib/kpi";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };
const kpi: KpiData = { total: 5, active: 2, completed: 3, rate: 60, streak: 2 };

describe("AppShell", () => {
  it("renders children", () => {
    render(<AppShell userContext={ctx}><div>content</div></AppShell>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders Sidebar with logo", () => {
    render(<AppShell userContext={ctx}><div /></AppShell>);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("renders KpiBar when kpiData is provided", () => {
    render(<AppShell userContext={ctx} kpiData={kpi}><div /></AppShell>);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("does not render KpiBar when kpiData is not provided", () => {
    render(<AppShell userContext={ctx}><div /></AppShell>);
    expect(screen.queryByText("TOTAL")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/layout/AppShell
```

- [ ] **Step 3: Implement**

```tsx
// components/layout/AppShell.tsx
import type { ReactNode } from "react";
import type { UserContext } from "@/types";
import type { KpiData } from "@/lib/kpi";
import Sidebar from "./Sidebar";
import KpiBar from "./KpiBar";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

interface Props {
  userContext: UserContext;
  kpiData?: KpiData;
  children: ReactNode;
}

export default function AppShell({ userContext, kpiData, children }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <ScanlineOverlay />
      <Sidebar userContext={userContext} />
      <div className="flex min-h-0 flex-1 flex-col">
        {kpiData && <KpiBar data={kpiData} />}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/layout/AppShell
```
Expected: 4/4 pass

- [ ] **Step 5: Commit**

```bash
git add components/layout/KpiBar.tsx components/layout/KpiBar.test.tsx components/layout/AppShell.tsx components/layout/AppShell.test.tsx
git commit -m "feat: add KpiBar and AppShell layout components"
```

---

## Stage 3: Dashboard 콘텐츠 컴포넌트

### Task 5: `CategoryChart`

**Files:**
- Create: `components/dashboard/CategoryChart.tsx`
- Create: `components/dashboard/CategoryChart.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/dashboard/CategoryChart.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CategoryChart from "./CategoryChart";
import type { ActionSession } from "@/types";

function makeSession(category: string): ActionSession {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    input: "test",
    action: {
      title: "Test",
      category: category as ActionSession["action"]["category"],
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
  };
}

describe("CategoryChart", () => {
  it("renders nothing for empty sessions", () => {
    const { container } = render(<CategoryChart sessions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders CATEGORY_DIST label", () => {
    render(<CategoryChart sessions={[makeSession("outreach")]} />);
    expect(screen.getByText(/CATEGORY_DIST/i)).toBeInTheDocument();
  });

  it("renders category names", () => {
    const sessions = [makeSession("outreach"), makeSession("content"), makeSession("outreach")];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("renders counts", () => {
    const sessions = [makeSession("outreach"), makeSession("outreach"), makeSession("content")];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/dashboard/CategoryChart
```

- [ ] **Step 3: Implement**

Note: 바 너비는 데이터 기반 동적 값이므로 CSS 커스텀 프로퍼티를 통한 inline style 예외 사용.

```tsx
// components/dashboard/CategoryChart.tsx
import type { ActionSession } from "@/types";

interface Props {
  sessions: ActionSession[];
}

export default function CategoryChart({ sessions }: Props) {
  if (sessions.length === 0) return null;

  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.action.category] = (acc[s.action.category] ?? 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts));
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">
        CATEGORY_DIST //
      </div>
      <div className="flex flex-col gap-1.5">
        {entries.map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-500">
              {cat.toUpperCase()}
            </span>
            <div className="h-1.5 flex-1 rounded bg-zinc-800">
              <div
                className="h-full rounded bg-neon/70"
                style={
                  { "--bar-w": `${(count / max) * 100}%`, width: "var(--bar-w)" } as React.CSSProperties
                }
              />
            </div>
            <span className="w-4 font-mono text-xs text-zinc-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/dashboard/CategoryChart
```
Expected: 4/4 pass

---

### Task 6: `ActionListPanel`

**Files:**
- Create: `components/dashboard/ActionListPanel.tsx`
- Create: `components/dashboard/ActionListPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/dashboard/ActionListPanel.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionListPanel from "./ActionListPanel";
import type { ActionSession } from "@/types";

function makeSession(id: string, title: string): ActionSession {
  return {
    id,
    createdAt: Date.now(),
    input: "test",
    action: {
      title,
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
  };
}

const sessions = [makeSession("s1", "팔로워 DM 보내기"), makeSession("s2", "키워드 리서치")];

describe("ActionListPanel", () => {
  it("shows empty state when no sessions", () => {
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} onNewAction={vi.fn()} />);
    expect(screen.getByText(/액션이 없어/i)).toBeInTheDocument();
  });

  it("renders session titles", () => {
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} onNewAction={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getByText("키워드 리서치")).toBeInTheDocument();
  });

  it("calls onSelect with session id when clicked", async () => {
    const onSelect = vi.fn();
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={onSelect} onNewAction={vi.fn()} />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    expect(onSelect).toHaveBeenCalledWith("s1");
  });

  it("applies active style to selected item", () => {
    render(<ActionListPanel sessions={sessions} selectedId="s1" onSelect={vi.fn()} onNewAction={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기").closest("button")).toHaveClass("text-neon");
  });

  it("shows NEW ACTION button and calls onNewAction when clicked", async () => {
    const onNewAction = vi.fn();
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} onNewAction={onNewAction} />);
    await userEvent.click(screen.getByText(/NEW ACTION/i));
    expect(onNewAction).toHaveBeenCalled();
  });

  it("hides NEW ACTION button when showNewButton is false", () => {
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} onNewAction={vi.fn()} showNewButton={false} />);
    expect(screen.queryByText(/NEW ACTION/i)).not.toBeInTheDocument();
  });

  it("shows custom empty label", () => {
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} onNewAction={vi.fn()} emptyLabel="완료된 액션 없음" />);
    expect(screen.getByText("완료된 액션 없음")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/dashboard/ActionListPanel
```

- [ ] **Step 3: Implement**

```tsx
// components/dashboard/ActionListPanel.tsx
import type { ActionSession } from "@/types";

interface Props {
  sessions: ActionSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewAction: () => void;
  emptyLabel?: string;
  showNewButton?: boolean;
}

export default function ActionListPanel({
  sessions,
  selectedId,
  onSelect,
  onNewAction,
  emptyLabel = "액션이 없어",
  showNewButton = true,
}: Props) {
  return (
    <div className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r border-zinc-800 p-3">
      <div className="font-mono text-xs tracking-widest text-zinc-600">ACTIONS //</div>
      {sessions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-zinc-700">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`rounded border px-3 py-2 text-left font-mono text-sm transition-colors ${
                selectedId === session.id
                  ? "border-neon text-neon"
                  : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {session.action.title}
            </button>
          ))}
        </div>
      )}
      {showNewButton && (
        <button
          onClick={onNewAction}
          className="mt-auto rounded border border-dashed border-zinc-700 px-3 py-2 font-mono text-xs text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-400"
        >
          + NEW ACTION
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/dashboard/ActionListPanel
```
Expected: 7/7 pass

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/CategoryChart.tsx components/dashboard/CategoryChart.test.tsx components/dashboard/ActionListPanel.tsx components/dashboard/ActionListPanel.test.tsx
git commit -m "feat: add CategoryChart and ActionListPanel components"
```

---

### Task 7: `ActionDetailPanel`

**Files:**
- Create: `components/dashboard/ActionDetailPanel.tsx`
- Create: `components/dashboard/ActionDetailPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/dashboard/ActionDetailPanel.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionDetailPanel from "./ActionDetailPanel";
import type { ActionSession } from "@/types";

const session: ActionSession = {
  id: "s1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "팔로워 DM 보내기",
    category: "outreach",
    steps: [
      { order: 1, description: "대상 선별" },
      { order: 2, description: "메시지 작성" },
    ],
    magicCopy: "안녕하세요!",
  },
  completed: false,
};

describe("ActionDetailPanel", () => {
  it("shows empty state when session is null", () => {
    render(<ActionDetailPanel session={null} allSessions={[]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText(/액션을 선택하거나/i)).toBeInTheDocument();
  });

  it("renders action title and category", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("대상 선별")).toBeInTheDocument();
    expect(screen.getByText("메시지 작성")).toBeInTheDocument();
  });

  it("renders magic copy text", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("안녕하세요!")).toBeInTheDocument();
  });

  it("calls onComplete with id when COMPLETE is clicked", async () => {
    const onComplete = vi.fn();
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={onComplete} onDeselect={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(onComplete).toHaveBeenCalledWith("s1");
  });

  it("calls onDeselect when NEW button is clicked", async () => {
    const onDeselect = vi.fn();
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={onDeselect} />);
    await userEvent.click(screen.getByRole("button", { name: /NEW/i }));
    expect(onDeselect).toHaveBeenCalled();
  });

  it("hides COMPLETE button when readonly", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} readonly />);
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/dashboard/ActionDetailPanel
```

- [ ] **Step 3: Implement**

```tsx
// components/dashboard/ActionDetailPanel.tsx
import type { ActionSession } from "@/types";
import Button from "@/components/ui/Button";
import MagicCopy from "@/components/result/MagicCopy";
import CategoryChart from "./CategoryChart";

interface Props {
  session: ActionSession | null;
  allSessions: ActionSession[];
  onComplete: (id: string) => void;
  onDeselect: () => void;
  readonly?: boolean;
}

export default function ActionDetailPanel({
  session,
  allSessions,
  onComplete,
  onDeselect,
  readonly = false,
}: Props) {
  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs text-zinc-700">
        액션을 선택하거나 새로 만들어봐
      </div>
    );
  }

  const { action } = session;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-mono text-base font-bold text-white">{action.title}</h2>
        <span className="shrink-0 rounded border border-neon/40 px-2 py-0.5 font-mono text-xs text-neon">
          {action.category.toUpperCase()}
        </span>
      </div>

      <div>
        <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">STEPS //</div>
        <div className="flex flex-col gap-1.5">
          {action.steps.map((step) => (
            <div
              key={step.order}
              className="flex gap-3 rounded border border-zinc-800 bg-surface px-3 py-2"
            >
              <span className="font-mono text-xs text-neon">
                {String(step.order).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm text-zinc-300">{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      <MagicCopy text={action.magicCopy} />

      <CategoryChart sessions={allSessions} />

      {!readonly && (
        <div className="mt-auto flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onDeselect}>
            NEW →
          </Button>
          <Button className="flex-1" onClick={() => onComplete(session.id)}>
            COMPLETE ✓
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/dashboard/ActionDetailPanel
```
Expected: 7/7 pass

---

### Task 8: `NewActionModal`

**Files:**
- Create: `components/dashboard/NewActionModal.tsx`
- Create: `components/dashboard/NewActionModal.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/dashboard/NewActionModal.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import NewActionModal from "./NewActionModal";

vi.mock("@/lib/api", () => ({ generateAction: vi.fn() }));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

beforeEach(async () => {
  useStratosStore.setState({ userContext: ctx, sessions: [] });
  const { generateAction } = await import("@/lib/api");
  vi.mocked(generateAction).mockReset();
});

describe("NewActionModal", () => {
  it("renders textarea and EXECUTE button", () => {
    render(<NewActionModal userContext={ctx} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /EXECUTE/i })).toBeInTheDocument();
  });

  it("calls onClose when ESC is pressed", async () => {
    const onClose = vi.fn();
    render(<NewActionModal userContext={ctx} onClose={onClose} onSuccess={vi.fn()} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows ANALYZING_INPUT while loading", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockReturnValue(new Promise(() => {}));
    render(<NewActionModal userContext={ctx} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(screen.getByText(/ANALYZING_INPUT/i)).toBeInTheDocument();
  });

  it("shows EXECUTION_FAILED on error", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockRejectedValue(new Error("fail"));
    render(<NewActionModal userContext={ctx} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => expect(screen.getByText(/EXECUTION_FAILED/i)).toBeInTheDocument());
  });

  it("calls onSuccess with new session id on success and adds to store", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockResolvedValue({
      title: "팔로워 DM",
      category: "outreach",
      steps: [{ order: 1, description: "DM 발송" }],
      magicCopy: "안녕하세요!",
    });
    const onSuccess = vi.fn();
    render(<NewActionModal userContext={ctx} onClose={vi.fn()} onSuccess={onSuccess} />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.any(String)));
    expect(useStratosStore.getState().sessions).toHaveLength(1);
  });

  it("retries on RETRY click after error", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockRejectedValue(new Error("fail"));
    render(<NewActionModal userContext={ctx} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => screen.getByText(/EXECUTION_FAILED/i));
    await userEvent.click(screen.getByRole("button", { name: /RETRY/i }));
    expect(vi.mocked(generateAction)).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run components/dashboard/NewActionModal
```

- [ ] **Step 3: Implement**

```tsx
// components/dashboard/NewActionModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useStratosStore } from "@/store";
import { generateAction } from "@/lib/api";
import type { UserContext } from "@/types";

interface Props {
  userContext: UserContext;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

type ModalView = "idle" | "loading" | "error";

export default function NewActionModal({ userContext, onClose, onSuccess }: Props) {
  const { addSession } = useStratosStore();
  const [view, setView] = useState<ModalView>("idle");
  const [input, setInput] = useState("");
  const [lastInput, setLastInput] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(text: string) {
    setLastInput(text);
    setView("loading");
    try {
      const action = await generateAction(text, userContext);
      const id = crypto.randomUUID();
      addSession({ id, createdAt: Date.now(), input: text, action, completed: false });
      onSuccess(id);
    } catch {
      setView("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[480px] rounded-lg border border-zinc-700 bg-surface p-6">
        {view === "idle" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-mono text-sm font-bold text-white">
                NEW_ACTION<span className="animate-pulse text-neon">_</span>
              </div>
              <button
                onClick={onClose}
                className="font-mono text-xs text-zinc-600 hover:text-zinc-400"
              >
                ESC ✕
              </button>
            </div>
            <div className="mb-3 font-mono text-xs text-zinc-600">지금 상황을 그대로 적어줘</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              autoFocus
              placeholder="지금 상황을 입력해줘 // e.g. 인스타 반응이 없어요"
              className="w-full resize-none rounded border border-zinc-700 bg-background px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none"
            />
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim()}
              className="mt-3 w-full rounded bg-neon py-2.5 font-mono text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              EXECUTE →
            </button>
          </>
        )}

        {view === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="font-mono text-xs tracking-widest text-neon">
              ANALYZING_INPUT<span className="animate-pulse">...</span>
            </div>
            <div className="font-mono text-xs text-zinc-600">&quot;{lastInput}&quot;</div>
            <div className="flex gap-1">
              {([0, 1, 2] as const).map((i) => (
                <div key={i} className={`delay-${i} h-1 w-1 rounded-full bg-neon`} />
              ))}
            </div>
          </div>
        )}

        {view === "error" && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center">
              <div className="font-mono text-xs tracking-widest text-red-400">EXECUTION_FAILED</div>
              <div className="mt-2 font-mono text-xs text-zinc-600">&quot;{lastInput}&quot;</div>
            </div>
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded border border-zinc-700 py-2 font-mono text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-400"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleSubmit(lastInput)}
                className="min-h-[44px] flex-1 rounded border border-red-400/40 font-mono text-sm text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
              >
                RETRY ↺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run components/dashboard/NewActionModal
```
Expected: 6/6 pass

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ActionDetailPanel.tsx components/dashboard/ActionDetailPanel.test.tsx components/dashboard/NewActionModal.tsx components/dashboard/NewActionModal.test.tsx
git commit -m "feat: add ActionDetailPanel and NewActionModal components"
```

---

## Stage 4: 페이지 재작성

### Task 9: `app/page.tsx` (Dashboard)

**Files:**
- Rewrite: `app/page.tsx`
- Rewrite: `app/page.test.tsx`

- [ ] **Step 1: Write new failing tests**

```tsx
// app/page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import DashboardPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: vi.fn().mockReturnValue("/"),
}));
vi.mock("@/lib/api", () => ({ generateAction: vi.fn() }));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

const session = {
  id: "s1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "팔로워 DM 보내기",
    category: "outreach" as const,
    steps: [{ order: 1, description: "DM 발송" }],
    magicCopy: "안녕하세요!",
  },
  completed: false,
};

beforeEach(async () => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: ctx, sessions: [] });
  const { generateAction } = await import("@/lib/api");
  vi.mocked(generateAction).mockReset();
});

describe("DashboardPage", () => {
  it("redirects to /onboarding when no userContext", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<DashboardPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("renders KPI bar", () => {
    render(<DashboardPage />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("renders Sidebar", () => {
    render(<DashboardPage />);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("shows empty state in list panel when no active sessions", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/액션이 없어/i)).toBeInTheDocument();
  });

  it("shows active session titles in list", () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
  });

  it("clicking a session shows it in the detail panel", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    expect(screen.getByText("DM 발송")).toBeInTheDocument();
  });

  it("COMPLETE removes session from list", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(screen.queryByText("팔로워 DM 보내기")).not.toBeInTheDocument();
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
  });

  it("+ NEW ACTION opens modal", async () => {
    render(<DashboardPage />);
    await userEvent.click(screen.getByText(/NEW ACTION/i));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("successful modal submit adds session and selects it", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockResolvedValue({
      title: "새 액션",
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    });
    render(<DashboardPage />);
    await userEvent.click(screen.getByText(/NEW ACTION/i));
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => expect(screen.getByText("새 액션")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run app/page
```
Expected: several tests fail (KPI, Sidebar refs not in current page)

- [ ] **Step 3: Implement**

```tsx
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";
import NewActionModal from "@/components/dashboard/NewActionModal";

export default function DashboardPage() {
  const router = useRouter();
  const { userContext, sessions, completeSession } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  const activeSessions = sessions.filter((s) => !s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = activeSessions.find((s) => s.id === selectedId) ?? null;

  function handleComplete(id: string) {
    completeSession(id);
    setSelectedId(null);
  }

  function handleModalSuccess(id: string) {
    setShowModal(false);
    setSelectedId(id);
  }

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={activeSessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNewAction={() => setShowModal(true)}
        />
        <ActionDetailPanel
          session={selectedSession}
          allSessions={sessions}
          onComplete={handleComplete}
          onDeselect={() => setSelectedId(null)}
        />
      </div>
      {showModal && (
        <NewActionModal
          userContext={userContext}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </AppShell>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run app/page
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: rewrite dashboard page with 3-panel PC layout"
```

---

### Task 10: `app/history/page.tsx`

**Files:**
- Rewrite: `app/history/page.tsx`
- Rewrite: `app/history/page.test.tsx`

- [ ] **Step 1: Write new failing tests**

```tsx
// app/history/page.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import HistoryPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: vi.fn().mockReturnValue("/history"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

const completedSession = {
  id: "done-1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "완료된 액션",
    category: "content" as const,
    steps: [{ order: 1, description: "완료 스텝" }],
    magicCopy: "완료 copy",
  },
  completed: true,
};

const activeSession = {
  ...completedSession,
  id: "active-1",
  action: { ...completedSession.action, title: "진행 중 액션" },
  completed: false,
};

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: ctx, sessions: [] });
});

describe("HistoryPage", () => {
  it("redirects to /onboarding when no userContext", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<HistoryPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("shows empty state when no completed sessions", () => {
    render(<HistoryPage />);
    expect(screen.getByText("완료된 액션 없음")).toBeInTheDocument();
  });

  it("renders only completed sessions", () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession, activeSession] });
    render(<HistoryPage />);
    expect(screen.getByText("완료된 액션")).toBeInTheDocument();
    expect(screen.queryByText("진행 중 액션")).not.toBeInTheDocument();
  });

  it("clicking a session shows detail", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession] });
    render(<HistoryPage />);
    await userEvent.click(screen.getByText("완료된 액션"));
    expect(screen.getByText("완료 스텝")).toBeInTheDocument();
  });

  it("detail panel has no COMPLETE button in history (readonly)", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession] });
    render(<HistoryPage />);
    await userEvent.click(screen.getByText("완료된 액션"));
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });

  it("renders KPI bar", () => {
    render(<HistoryPage />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run app/history
```

- [ ] **Step 3: Implement**

```tsx
// app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function HistoryPage() {
  const router = useRouter();
  const { userContext, sessions } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  const completedSessions = sessions.filter((s) => s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = completedSessions.find((s) => s.id === selectedId) ?? null;

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={completedSessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNewAction={() => {}}
          emptyLabel="완료된 액션 없음"
          showNewButton={false}
        />
        <ActionDetailPanel
          session={selectedSession}
          allSessions={sessions}
          onComplete={() => {}}
          onDeselect={() => setSelectedId(null)}
          readonly
        />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run app/history
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add app/history/page.tsx app/history/page.test.tsx
git commit -m "feat: rewrite history page with AppShell and readonly detail panel"
```

---

### Task 11: `app/settings/page.tsx`

**Files:**
- Rewrite: `app/settings/page.tsx`
- Rewrite: `app/settings/page.test.tsx`

- [ ] **Step 1: Write new failing tests**

```tsx
// app/settings/page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import SettingsPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: vi.fn().mockReturnValue("/settings"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: ctx, sessions: [] });
});

describe("SettingsPage", () => {
  it("redirects to /onboarding when no userContext", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<SettingsPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("renders Sidebar", () => {
    render(<SettingsPage />);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("pre-selects current userContext values", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("option-creator")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-0-1K")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-idea")).toHaveAttribute("data-selected", "true");
  });

  it("updates store when SAVE is clicked", async () => {
    render(<SettingsPage />);
    await userEvent.click(screen.getByTestId("option-seller"));
    await userEvent.click(screen.getByTestId("option-1K-10K"));
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));
    expect(useStratosStore.getState().userContext).toMatchObject({
      type: "seller",
      level: "1K-10K",
    });
  });

  it("shows SETTINGS_SAVED after save", async () => {
    render(<SettingsPage />);
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));
    await waitFor(() => expect(screen.getByText(/SETTINGS_SAVED/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run app/settings
```

- [ ] **Step 3: Implement**

```tsx
// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import type { UserType, UserLevel, BusinessStage } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { userContext, setUserContext } = useStratosStore();

  const [type, setType] = useState<UserType | null>(userContext?.type ?? null);
  const [level, setLevel] = useState<UserLevel | null>(userContext?.level ?? null);
  const [stage, setStage] = useState<BusinessStage | null>(userContext?.businessStage ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  function handleSave() {
    if (!type || !level || !stage) return;
    setUserContext({ type, level, businessStage: stage });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell userContext={userContext}>
      <div className="p-8">
        <div className="mb-6 max-w-lg">
          <div className="font-mono text-lg font-bold text-white">
            SETTINGS<span className="animate-pulse text-neon">_</span>
          </div>
          <div className="mt-1 font-mono text-xs text-zinc-600">프로필 설정을 변경해줘</div>
        </div>
        <div className="flex max-w-lg flex-col gap-6">
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">USER_TYPE //</div>
            <StepType selected={type} onSelect={setType} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">AUDIENCE_SIZE //</div>
            <StepLevel selected={level} onSelect={setLevel} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">CURRENT_STAGE //</div>
            <StepStage selected={stage} onSelect={setStage} />
          </div>
          <div>
            {saved && (
              <div className="mb-3 font-mono text-xs tracking-widest text-neon">SETTINGS_SAVED ✓</div>
            )}
            <Button onClick={handleSave} disabled={!type || !level || !stage} className="w-full">
              SAVE →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Run to verify GREEN**

```bash
npx vitest run app/settings
```
Expected: all pass

- [ ] **Step 5: Full suite check**

```bash
npx vitest run
npm run typecheck
npm run lint
```
Expected: all green, no type errors, no lint errors

- [ ] **Step 6: Commit**

```bash
git add app/settings/page.tsx app/settings/page.test.tsx
git commit -m "feat: rewrite settings page with AppShell"
```

---

## Stage 5: 정리 (Cleanup)

### Task 12: 불필요한 파일 삭제

**Files:**
- Delete: `app/action/[id]/page.tsx`
- Delete: `app/action/[id]/page.test.tsx`
- Delete: `components/ui/PageLayout.tsx`
- Delete: `components/result/ActionResult.tsx`
- Delete: `components/result/ActionResult.test.tsx`

- [ ] **Step 1: 삭제**

```bash
rm -rf app/action
rm components/ui/PageLayout.tsx
rm components/result/ActionResult.tsx components/result/ActionResult.test.tsx
```

- [ ] **Step 2: Full suite + typecheck + lint**

```bash
npx vitest run
npm run typecheck
npm run lint
npm run build
```
Expected: all green

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove PageLayout, ActionResult, and action/[id] route"
```
