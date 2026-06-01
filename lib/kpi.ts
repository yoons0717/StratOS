import type { ActionSession, Channel, ActionCategory } from "@/types";

const DAY_MS = 86400000;

function toDayStart(isoString: string): number {
  const d = new Date(isoString);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function completedSessions(sessions: ActionSession[]): ActionSession[] {
  return sessions.filter((s) => s.completed);
}

export interface KpiData {
  total: number;
  active: number;
  completed: number;
  rate: number;
  streak: number;
}

export function computeKpi(sessions: ActionSession[]): KpiData {
  const total = sessions.length;
  const completed = completedSessions(sessions).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const streak = computeStreak(sessions);
  return { total, active, completed, rate, streak };
}

export function computeLongestStreak(sessions: ActionSession[]): number {
  if (sessions.length === 0) return 0;

  const days = new Set(sessions.map((s) => toDayStart(s.created_at)));
  const sorted = Array.from(days).sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === DAY_MS) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function computeHeatmap(sessions: ActionSession[], days = 30): Record<string, number> {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const result: Record<string, number> = {};
  for (const s of sessions) {
    const d = new Date(s.created_at);
    if (d < cutoff) continue;
    const key = d.toISOString().slice(0, 10);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

function computeDist<K extends string>(sessions: ActionSession[], getKey: (s: ActionSession) => K) {
  const done = completedSessions(sessions);
  if (done.length === 0) return [];
  const counts = new Map<K, number>();
  for (const s of done) {
    const k = getKey(s);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count, pct: Math.round((count / done.length) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export function computeChannelDist(sessions: ActionSession[]): { channel: Channel; count: number; pct: number }[] {
  return computeDist(sessions, (s) => s.channel)
    .map(({ key, count, pct }) => ({ channel: key, count, pct }));
}

export function computeCategoryDist(sessions: ActionSession[]): { category: ActionCategory; count: number; pct: number }[] {
  return computeDist(sessions, (s) => s.action.category)
    .map(({ key, count, pct }) => ({ category: key, count, pct }));
}

export interface WeeklyChannelEntry {
  week: string;
  channels: Partial<Record<Channel, number>>;
}

export function computeWeeklyChannelDist(sessions: ActionSession[], weeks = 8): WeeklyChannelEntry[] {
  const done = completedSessions(sessions);
  const now = new Date();
  const result: WeeklyChannelEntry[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);

    const channels: Partial<Record<Channel, number>> = {};
    for (const s of done) {
      const d = new Date(s.created_at);
      if (d >= weekStart && d < weekEnd) {
        channels[s.channel] = (channels[s.channel] ?? 0) + 1;
      }
    }

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    result.push({ week: label, channels });
  }

  return result;
}

function computeStreak(sessions: ActionSession[]): number {
  if (sessions.length === 0) return 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sessionDays = new Set(sessions.map((s) => toDayStart(s.created_at)));

  let streak = 0;
  let current = todayStart.getTime();
  while (sessionDays.has(current)) {
    streak++;
    current -= DAY_MS;
  }
  return streak;
}
