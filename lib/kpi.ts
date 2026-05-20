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

export function computeChannelDist(sessions: ActionSession[]): { channel: Channel; count: number; pct: number }[] {
  const done = completedSessions(sessions);
  if (done.length === 0) return [];

  const counts = new Map<Channel, number>();
  for (const s of done) {
    counts.set(s.channel, (counts.get(s.channel) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([channel, count]) => ({ channel, count, pct: Math.round((count / done.length) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export function computeCategoryDist(sessions: ActionSession[]): { category: ActionCategory; count: number; pct: number }[] {
  const done = completedSessions(sessions);
  if (done.length === 0) return [];

  const counts = new Map<ActionCategory, number>();
  for (const s of done) {
    counts.set(s.action.category, (counts.get(s.action.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count, pct: Math.round((count / done.length) * 100) }))
    .sort((a, b) => b.pct - a.pct);
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
