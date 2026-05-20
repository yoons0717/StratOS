"use client";

import { useStratosStore } from "@/store";
import { useInitStore } from "@/lib/hooks";
import {
  computeKpi,
  computeLongestStreak,
  computeHeatmap,
  computeChannelDist,
  computeCategoryDist,
} from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import { CHANNEL_LABEL, CATEGORY_LABEL } from "@/lib/labels";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-surface p-4">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 font-mono text-xs text-zinc-700">{sub}</p>}
    </div>
  );
}

function BarChart({ items }: { items: { label: string; count: number; pct: number }[] }) {
  if (items.length === 0) {
    return <p className="font-mono text-xs text-zinc-700">데이터 없음</p>;
  }
  return (
    <div className="space-y-2">
      {items.map(({ label, count, pct }) => (
        <div key={label} className="flex items-center gap-2 font-mono text-xs">
          <span className="w-24 shrink-0 text-right text-zinc-600">{label}</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="bar-fill absolute left-0 top-0 h-full rounded-full bg-neon"
              style={{ "--bar-width": `${pct}%` } as React.CSSProperties}
            />
          </div>
          <span className="w-8 shrink-0 text-zinc-600">{count}</span>
        </div>
      ))}
    </div>
  );
}

function toIntensity(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

function HeatmapGrid({ data, days = 30 }: { data: Record<string, number>; days?: number }) {
  const cells: { key: string; intensity: 0 | 1 | 2 | 3 }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, intensity: toIntensity(data[key] ?? 0) });
  }

  const intensityClass = ["bg-zinc-800", "bg-neon/20", "bg-neon/50", "bg-neon"] as const;

  return (
    <div className="flex flex-wrap gap-1">
      {cells.map(({ key, intensity }) => (
        <div
          key={key}
          title={key}
          className={`h-4 w-4 rounded-sm ${intensityClass[intensity]}`}
        />
      ))}
    </div>
  );
}

export default function StatsPage() {
  useInitStore(true);
  const { userContext, sessions } = useStratosStore();

  if (!userContext) return null;

  const kpiData = computeKpi(sessions);
  const longestStreak = computeLongestStreak(sessions);
  const heatmapData = computeHeatmap(sessions);
  const channelDist = computeChannelDist(sessions);
  const categoryDist = computeCategoryDist(sessions);

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 font-mono text-xs uppercase tracking-widest text-zinc-600">
          STATS
        </h1>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="현재 스트릭" value={kpiData.streak} sub="연속 실행 중" />
          <StatCard label="최장 스트릭" value={longestStreak} sub="역대 최고" />
          <StatCard label="총 완료" value={kpiData.completed} sub="누적" />
          <StatCard label="완료율" value={`${kpiData.rate}%`} sub="전체 세션 대비" />
        </div>

        <div className="mb-6 rounded border border-zinc-800 bg-surface p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
            30일 활동 히트맵
          </p>
          <HeatmapGrid data={heatmapData} />
          <div className="mt-3 flex items-center justify-end gap-1 font-mono text-xs text-zinc-700">
            <span>적음</span>
            <div className="h-3 w-3 rounded-sm bg-zinc-800" />
            <div className="h-3 w-3 rounded-sm bg-neon/20" />
            <div className="h-3 w-3 rounded-sm bg-neon/50" />
            <div className="h-3 w-3 rounded-sm bg-neon" />
            <span>많음</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded border border-zinc-800 bg-surface p-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">
              채널별 분포
            </p>
            <BarChart
              items={channelDist.map((d) => ({
                label: CHANNEL_LABEL[d.channel] ?? d.channel,
                count: d.count,
                pct: d.pct,
              }))}
            />
          </div>
          <div className="rounded border border-zinc-800 bg-surface p-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">
              카테고리별 분포
            </p>
            <BarChart
              items={categoryDist.map((d) => ({
                label: CATEGORY_LABEL[d.category] ?? d.category,
                count: d.count,
                pct: d.pct,
              }))}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
