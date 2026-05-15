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
      const d = new Date(s.created_at);
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
