export function computeDauEntries(rows: { user_id: string; created_at: string }[]) {
  const map = new Map<string, Set<string>>();
  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    if (!map.has(date)) map.set(date, new Set());
    map.get(date)!.add(row.user_id);
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
  rows: { user_id: string; name: string }[]
) {
  const allUsers = new Set(rows.map((r) => r.user_id));
  const onboarded = new Set(
    rows.filter((r) => r.name === "onboarding_completed").map((r) => r.user_id)
  );
  return allUsers.size ? Math.round((onboarded.size / allUsers.size) * 100) : 0;
}

export function computeSessionCompletionRate(rows: { name: string }[]) {
  const created = rows.filter((r) => r.name === "session_created").length;
  const completed = rows.filter((r) => r.name === "session_completed").length;
  return created ? Math.min(Math.round((completed / created) * 100), 100) : 0;
}
