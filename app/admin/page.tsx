import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { metricsSchema } from "@/lib/schemas";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

async function getMetrics() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/admin/metrics`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const parsed = metricsSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
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
    return <p className="font-mono text-xs text-zinc-700">데이터 없음</p>;
  const max = Math.max(...entries.map((e) => e.users), 1);
  return (
    <div className="space-y-1">
      {entries.map((e) => (
        <div key={e.date} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs text-zinc-600">{e.date.slice(5)}</span>
          <div className="h-4 rounded bg-neon/20 bar-fill" style={{ "--bar-width": `${Math.round((e.users / max) * 100)}%` } as React.CSSProperties} />
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

  const metrics = await getMetrics();

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <p className="mb-1 font-mono text-xs tracking-widest text-neon">STRATOS</p>
        <h1 className="mb-6 font-mono text-xl font-bold text-white">GROWTH_METRICS</h1>

        {!metrics ? (
          <p className="font-mono text-xs text-red-400">데이터를 불러올 수 없습니다.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="DAU 7일 평균" value={metrics.dauLast7Avg} />
              <StatCard label="온보딩 완료율" value={`${metrics.onboardingRate}%`} />
              <StatCard label="세션 완료율" value={`${metrics.sessionCompletionRate}%`} />
            </div>

            <div className="rounded border border-zinc-800 p-4">
              <p className="mb-4 font-mono text-xs tracking-widest text-zinc-600">일별 활성 유저 (최근 7일)</p>
              <DauChart entries={metrics.dauEntries} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
