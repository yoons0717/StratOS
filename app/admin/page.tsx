import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import RemindButton from "@/app/admin/_components/RemindButton";
import {
  computeDauEntries,
  computeOnboardingRate,
  computeSessionCompletionRate,
  computeActivatedUsers,
  computeSessionStats,
  computeFunnel,
  type FunnelStep,
} from "@/lib/analytics/metrics";

async function fetchMetrics() {
  const supabase = createSupabaseAdminClient();

  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [{ data: dauRaw }, { data: onboardingRaw }, { data: sessionRaw }, { data: funnelRaw }, { data: usersData }] = await Promise.all([
    supabase.from("events").select("user_id, created_at").gte("created_at", since7),
    supabase.from("events").select("user_id, name").gte("created_at", since30).in("name", ["onboarding_completed"]),
    supabase.from("events").select("user_id, name").gte("created_at", since30).in("name", ["session_created", "session_completed"]),
    supabase.from("events").select("user_id, name").gte("created_at", since30).in("name", ["onboarding_started", "onboarding_completed", "session_created", "session_completed"]),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const dauEntries = computeDauEntries(dauRaw ?? []);
  const totalUsers = usersData?.users.length ?? 0;
  const activeUsers7d = new Set((dauRaw ?? []).map((r) => r.user_id)).size;
  const { avgPerUser, returningUsers } = computeSessionStats(sessionRaw ?? [], totalUsers);

  return {
    activeUsers7d,
    dauEntries,
    totalUsers,
    onboardingRate: computeOnboardingRate(onboardingRaw ?? [], totalUsers),
    sessionCompletionRate: computeSessionCompletionRate(sessionRaw ?? []),
    activatedUsers: computeActivatedUsers(sessionRaw ?? []),
    avgPerUser,
    returningUsers,
    funnelSteps: computeFunnel(funnelRaw ?? []),
  };
}

function StatCard({ label, value, tooltip }: { label: string; value: string | number; tooltip?: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-surface p-4">
      <div className="mb-2 flex items-center gap-1">
        <p className="font-mono text-xs tracking-widest text-zinc-600">{label}</p>
        {tooltip && (
          <div className="group relative">
            <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-800 font-mono text-[9px] text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300">?</span>
            <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-48 rounded border border-zinc-800 bg-zinc-950 p-2 font-mono text-[10px] leading-relaxed text-zinc-400 group-hover:block">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function conversionColor(rate: number): string {
  if (rate >= 80) return "text-green-400";
  if (rate >= 60) return "text-yellow-400";
  return "text-red-400";
}

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  if (steps.every((s) => s.count === 0))
    return <p className="font-mono text-xs text-zinc-700">no data</p>;

  return (
    <div className="space-y-1">
      {steps.map((s, i) => (
        <div key={s.label}>
          {i > 0 && s.conversionRate !== null && (
            <div className={`my-1 ml-[188px] font-mono text-xs ${conversionColor(s.conversionRate)}`}>
              ↓ {s.conversionRate}% 통과 · {Math.max(0, s.usersLost ?? 0)}명 이탈
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="w-44 shrink-0 font-mono text-xs text-zinc-600">{s.label}</span>
            <div className="bar-fill h-4 rounded bg-neon/20" style={{ "--bar-width": `${s.barPct}%` } as React.CSSProperties} />
            <span className="w-6 shrink-0 font-mono text-xs text-zinc-400">{s.count}</span>
            {i === 0 && <span className="font-mono text-xs text-zinc-600">base</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DauChart({ entries }: { entries: { date: string; users: number }[] }) {
  if (entries.length === 0)
    return <p className="font-mono text-xs text-zinc-700">no data</p>;
  const max = Math.max(...entries.map((e) => e.users), 1);
  return (
    <div className="space-y-1">
      {entries.map((e) => (
        <div key={e.date} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs text-zinc-600">{e.date}</span>
          <div className="bar-fill h-4 rounded bg-neon/20" style={{ "--bar-width": `${Math.round((e.users / max) * 100)}%` } as React.CSSProperties} />
          <span className="font-mono text-xs text-zinc-400">{e.users}</span>
        </div>
      ))}
    </div>
  );
}

async function logout() {
  "use server";
  (await cookies()).delete("admin_session");
  redirect("/admin/login");
}

export default async function AdminPage() {
  const metrics = await fetchMetrics();

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 font-mono text-xs tracking-widest text-neon">STRATOS</p>
            <h1 className="font-mono text-xl font-bold text-white">GROWTH_METRICS</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400">
              LOGOUT
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Users"
              value={metrics.totalUsers}
              tooltip="가입한 전체 유저 수 (auth 기준)"
            />
            <StatCard
              label="Active (7d)"
              value={metrics.activeUsers7d}
              tooltip="최근 7일 내 어떤 액션이든 한 유저 수"
            />
            <StatCard
              label="Onboarding Rate"
              value={`${metrics.onboardingRate}%`}
              tooltip="전체 가입자 중 온보딩을 완료한 비율"
            />
            <StatCard
              label="Session Completion"
              value={`${metrics.sessionCompletionRate}%`}
              tooltip="생성된 세션 중 완료 마킹된 비율 (최근 30일)"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Activated Users"
              value={metrics.activatedUsers}
              tooltip="세션을 최소 1번 완료한 유저 수 — 실제로 가치를 경험한 유저"
            />
            <StatCard
              label="Avg Sessions"
              value={metrics.avgPerUser.toFixed(1)}
              tooltip="전체 가입자 기준 유저당 평균 세션 생성 수 (최근 30일)"
            />
            <StatCard
              label="Returning Users"
              value={metrics.returningUsers}
              tooltip="세션을 2회 이상 만든 유저 수 — 재방문 신호 (최근 30일)"
            />
          </div>

          <div className="rounded border border-zinc-800 p-4">
            <p className="mb-4 font-mono text-xs tracking-widest text-zinc-600">daily active users (last 7 days)</p>
            <DauChart entries={metrics.dauEntries} />
          </div>

          <div className="rounded border border-zinc-800 p-4">
            <p className="mb-4 font-mono text-xs tracking-widest text-zinc-600">funnel (last 30 days)</p>
            <FunnelChart steps={metrics.funnelSteps} />
          </div>

          <RemindButton />
        </div>
      </div>
    </main>
  );
}
