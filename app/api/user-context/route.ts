import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateActionRequestSchema, userContextRowSchema } from "@/lib/schemas";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("user_contexts")
    .select("type, level, business_stage")
    .eq("user_id", user.id)
    .single();

  if (!data) return NextResponse.json(null);

  const parsed = userContextRowSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json(null);

  return NextResponse.json({
    type: parsed.data.type,
    level: parsed.data.level,
    businessStage: parsed.data.business_stage,
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = generateActionRequestSchema.shape.userContext.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { type, level, businessStage } = parsed.data;
  const { error } = await supabase.from("user_contexts").upsert({
    user_id: user.id,
    type,
    level,
    business_stage: businessStage,
  });

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
