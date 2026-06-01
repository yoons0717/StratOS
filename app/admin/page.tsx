import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import RemindButton from "@/app/admin/_components/RemindButton";
import {
  computeDauEntries,
  computeDauAvg,
  computeOnboardingRate,
  computeSessionCompletionRate,
} from "@/lib/analytics/metrics";

async function fetchMetrics() {
  const supabase = createSupabaseAdminClient();

  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [{ data: dauRaw }, { data: onboardingRaw }, { data: sessionRaw }] = await Promise.all([
    supabase.from("events").select("user_id, created_at").gte("created_at", since7),
    supabase.from("events").select("user_id, name").gte("created_at", since30).in("name", ["onboarding_completed", "session_created"]),
    supabase.from("events").select("name").gte("created_at", since30).in("name", ["session_created", "session_completed"]),
  ]);

  const dauEntries = computeDauEntries(dauRaw ?? []);

  return {
    dauLast7Avg: computeDauAvg(dauEntries, 7),
    dauEntries,
    onboardingRate: computeOnboardingRate(onboardingRaw ?? []),
    sessionCompletionRate: computeSessionCompletionRate(sessionRaw ?? []),
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-zinc-800 bg-surface p-4">
      <p className="mb-2 font-mono text-xs tracking-widest text-zinc-600">{label}</p>
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
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
          <span className="w-24 shrink-0 font-mono text-xs text-zinc-600">{e.date.slice(5)}</span>
          <div className="bar-fill h-4 rounded bg-neon/20" style={{ "--bar-width": `${Math.round((e.users / max) * 100)}%` } as React.CSSProperties} />
          <span className="font-mono text-xs text-zinc-400">{e.users}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const metrics = await fetchMetrics();

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <p className="mb-1 font-mono text-xs tracking-widest text-neon">STRATOS</p>
        <h1 className="mb-6 font-mono text-xl font-bold text-white">GROWTH_METRICS</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="DAU 7-day avg" value={metrics.dauLast7Avg} />
            <StatCard label="Onboarding Rate" value={`${metrics.onboardingRate}%`} />
            <StatCard label="Session Completion" value={`${metrics.sessionCompletionRate}%`} />
          </div>

          <div className="rounded border border-zinc-800 p-4">
            <p className="mb-4 font-mono text-xs tracking-widest text-zinc-600">daily active users (last 7 days)</p>
            <DauChart entries={metrics.dauEntries} />
          </div>

          <RemindButton />
        </div>
      </div>
    </main>
  );
}
