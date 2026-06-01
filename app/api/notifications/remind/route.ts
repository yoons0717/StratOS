import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendReminderEmail } from "@/lib/email";
import { computeKpi } from "@/lib/kpi";

export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.user.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: activeToday } = await supabase
    .from("events")
    .select("user_id")
    .eq("name", "session_created")
    .gte("created_at", `${today}T00:00:00Z`);

  const activeTodayIds = new Set((activeToday ?? []).map((r) => r.user_id));

  const { data: targets } = await supabase
    .from("user_contexts")
    .select("user_id, reminder_email")
    .eq("reminder_email", true);

  const toNotify = (targets ?? []).filter((r) => !activeTodayIds.has(r.user_id));

  let sent = 0;
  for (const target of toNotify) {
    const { data: sessions } = await supabase
      .from("action_sessions")
      .select("completed, created_at")
      .eq("user_id", target.user_id);

    const { data: userRow } = await supabase.auth.admin.getUserById(target.user_id);
    const email = userRow.user?.email;
    if (!email) continue;

    const streak = computeKpi(sessions ?? []).streak;
    await sendReminderEmail(email, streak);
    sent++;
  }

  return NextResponse.json({ sent });
}
