import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import type { Metrics } from "@/lib/schemas";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [{ data: dauRaw }, { data: onboardingRaw }, { data: sessionRaw }] = await Promise.all([
    supabase
      .from("events")
      .select("user_id, created_at")
      .gte("created_at", since7),
    supabase
      .from("events")
      .select("user_id, name")
      .gte("created_at", since30)
      .in("name", ["onboarding_completed", "session_created"]),
    supabase
      .from("events")
      .select("name")
      .gte("created_at", since30)
      .in("name", ["session_created", "session_completed"]),
  ]);

  // DAU: 날짜별 유니크 유저 수
  const dauMap = new Map<string, Set<string>>();
  for (const row of dauRaw ?? []) {
    const date = row.created_at.slice(0, 10);
    if (!dauMap.has(date)) dauMap.set(date, new Set());
    dauMap.get(date)!.add(row.user_id);
  }
  const dauEntries = Array.from(dauMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => ({ date, users: users.size }));
  const dauLast7Avg = dauEntries.length
    ? Math.round(dauEntries.reduce((s, e) => s + e.users, 0) / 7)
    : 0;

  // 온보딩 완료율: onboarding_completed / session_created 유저 기준
  const allUsers = new Set((onboardingRaw ?? []).map((r) => r.user_id));
  const onboardedUsers = new Set(
    (onboardingRaw ?? []).filter((r) => r.name === "onboarding_completed").map((r) => r.user_id)
  );
  const onboardingRate = allUsers.size
    ? Math.round((onboardedUsers.size / allUsers.size) * 100)
    : 0;

  // 세션 완료율: session_completed / session_created
  const created = (sessionRaw ?? []).filter((r) => r.name === "session_created").length;
  const completed = (sessionRaw ?? []).filter((r) => r.name === "session_completed").length;
  const sessionCompletionRate = created ? Math.round((completed / created) * 100) : 0;

  const metrics: Metrics = { dauLast7Avg, dauEntries, onboardingRate, sessionCompletionRate };
  return NextResponse.json(metrics);
}
