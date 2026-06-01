import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userContextInputSchema, userContextRowSchema } from "@/lib/schemas";
import { logEvent } from "@/lib/events";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { data } = await supabase
    .from("user_contexts")
    .select("type, level, business_stage, niche, reminder_email")
    .eq("user_id", user.id)
    .single();

  if (!data) return NextResponse.json(null);

  const parsed = userContextRowSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json(null);

  return NextResponse.json({
    type: parsed.data.type,
    level: parsed.data.level,
    businessStage: parsed.data.business_stage,
    niche: parsed.data.niche,
    reminderEmail: parsed.data.reminder_email,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const body = await req.json().catch(() => null);
  const parsed = userContextInputSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { type, level, businessStage, niche, reminderEmail } = parsed.data;

  const { data: existing } = await supabase
    .from("user_contexts")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase.from("user_contexts").upsert({
    user_id: user.id,
    type,
    level,
    business_stage: businessStage,
    niche,
    reminder_email: reminderEmail,
  });

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  if (!existing) await logEvent("onboarding_completed", user.id, supabase);
  return NextResponse.json({ ok: true });
}
