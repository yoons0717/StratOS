export function computeDauEntries(rows: { user_id: string; created_at: string }[]) {
  const map = new Map<string, Set<string>>();
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    if (!map.has(date)) map.set(date, new Set());
    const set = map.get(date);
    if (set) set.add(row.user_id);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => ({ date, users: users.size }));
}

export function computeDauAvg(entries: { users: number }[], windowDays: number) {
  if (entries.length === 0) return 0;
  return Math.round(entries.reduce((s, e) => s + e.users, 0) / windowDays);
}

export function computeOnboardingRate(
  rows: { user_id: string; name: string }[],
  totalUsers: number
) {
  const onboarded = new Set(
    rows.filter((r) => r.name === "onboarding_completed").map((r) => r.user_id)
  );
  return totalUsers > 0 ? Math.round((onboarded.size / totalUsers) * 100) : 0;
}

export function computeSessionCompletionRate(rows: { name: string }[]) {
  const created = rows.filter((r) => r.name === "session_created").length;
  const completed = rows.filter((r) => r.name === "session_completed").length;
  return created ? Math.min(Math.round((completed / created) * 100), 100) : 0;
}

export function computeActivatedUsers(rows: { user_id: string; name: string }[]): number {
  return new Set(rows.filter((r) => r.name === "session_completed").map((r) => r.user_id)).size;
}

export function computeSessionStats(
  rows: { user_id: string; name: string }[],
  totalUsers: number
): { avgPerUser: number; returningUsers: number } {
  const created = rows.filter((r) => r.name === "session_created");
  const counts = new Map<string, number>();
  for (const row of created) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  return {
    avgPerUser: totalUsers > 0 ? Math.round((created.length / totalUsers) * 10) / 10 : 0,
    returningUsers: Array.from(counts.values()).filter((c) => c >= 2).length,
  };
}

export type FunnelStep = {
  label: string;
  count: number;
  barPct: number;
  conversionRate: number | null;
  usersLost: number | null;
};

const FUNNEL_STEPS = [
  "onboarding_started",
  "onboarding_completed",
  "session_created",
  "session_completed",
] as const;

export function computeFunnel(rows: { user_id: string; name: string }[]): FunnelStep[] {
  const sets = Object.fromEntries(FUNNEL_STEPS.map((s) => [s, new Set<string>()]));
  for (const row of rows) {
    sets[row.name as keyof typeof sets]?.add(row.user_id);
  }
  const counts = FUNNEL_STEPS.map((s) => sets[s].size);
  const max = Math.max(...counts, 1);

  return FUNNEL_STEPS.map((label, i) => ({
    label,
    count: counts[i],
    barPct: Math.round((counts[i] / max) * 100),
    conversionRate:
      i === 0
        ? null
        : counts[i - 1] === 0
          ? 0
          : Math.min(Math.round((counts[i] / counts[i - 1]) * 100), 100),
    usersLost: i === 0 ? null : Math.max(counts[i - 1] - counts[i], 0),
  }));
}
