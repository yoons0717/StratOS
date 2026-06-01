"use client";

import { useStratosStore } from "@/store";
import { useInitStore } from "@/lib/hooks";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  computeKpi,
  computeLongestStreak,
  computeHeatmap,
  computeChannelDist,
  computeCategoryDist,
  computeWeeklyChannelDist,
} from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import { CHANNEL_LABEL, CATEGORY_LABEL } from "@/lib/labels";
import type { Channel } from "@/types";

const CHANNEL_ORDER: Channel[] = ["instagram", "naver-blog", "youtube", "general"];
const CHANNEL_COLOR: Record<Channel, string> = {
  instagram: "bg-pink-500/70",
  "naver-blog": "bg-green-500/70",
  youtube: "bg-red-500/70",
  general: "bg-zinc-600",
};

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
  const { isLoading } = useInitStore(true);
  const { userContext, sessions } = useStratosStore();

  if (isLoading || !userContext) return <LoadingScreen />;

  const kpiData = computeKpi(sessions);
  const longestStreak = computeLongestStreak(sessions);
  const heatmapData = computeHeatmap(sessions);
  const channelDist = computeChannelDist(sessions);
  const categoryDist = computeCategoryDist(sessions);
  const weeklyChannelDist = computeWeeklyChannelDist(sessions);

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Stats</h1>

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

        <div className="mb-6 rounded border border-zinc-800 bg-surface p-4">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">
            주별 채널 분포
          </p>
          {weeklyChannelDist.every((w) => Object.keys(w.channels).length === 0) ? (
            <p className="font-mono text-xs text-zinc-700">데이터 없음</p>
          ) : (
            <div className="space-y-2">
              {weeklyChannelDist.map(({ week, channels }) => {
                const total = Object.values(channels).reduce((s, n) => s + n, 0);
                return (
                  <div key={week} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 font-mono text-xs text-zinc-600">{week}</span>
                    <div className="flex h-4 flex-1 overflow-hidden rounded">
                      {total === 0 ? (
                        <div className="h-full w-full bg-zinc-800" />
                      ) : (
                        CHANNEL_ORDER.map((ch) => {
                          const count = channels[ch] ?? 0;
                          if (count === 0) return null;
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div
                              key={ch}
                              className={`bar-segment h-full ${CHANNEL_COLOR[ch]}`}
                              style={{ "--bar-segment-width": `${pct}%` } as React.CSSProperties}
                              title={`${CHANNEL_LABEL[ch]}: ${count}`}
                            />
                          );
                        })
                      )}
                    </div>
                    <span className="w-6 shrink-0 font-mono text-xs text-zinc-600">{total || ""}</span>
                  </div>
                );
              })}
              <div className="mt-3 flex flex-wrap gap-3">
                {CHANNEL_ORDER.map((ch) => (
                  <div key={ch} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-sm ${CHANNEL_COLOR[ch]}`} />
                    <span className="font-mono text-xs text-zinc-600">{CHANNEL_LABEL[ch]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
