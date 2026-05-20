import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { generateAction } from "@/lib/generate-action";
import { buildUserPrompt } from "@/lib/prompts";
import { userContextRowSchema } from "@/lib/schemas";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { data: session } = await supabase
    .from("action_sessions")
    .select("input, channel")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: ctx } = await supabase
    .from("user_contexts")
    .select("type, level, business_stage, niche")
    .eq("user_id", user.id)
    .single();

  if (!ctx) return NextResponse.json({ error: "No user context" }, { status: 400 });

  const parsedCtx = userContextRowSchema.safeParse(ctx);
  if (!parsedCtx.success) return NextResponse.json({ error: "Invalid user context" }, { status: 500 });

  const userPrompt = buildUserPrompt(session.input, parsedCtx.data.type, parsedCtx.data.niche, parsedCtx.data.level, parsedCtx.data.business_stage, session.channel ?? "general");

  const result = await generateAction(userPrompt, 0.9);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { data, error } = await supabase
    .from("action_sessions")
    .update({ action: result.action })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, created_at, completed_at, input, channel, action, completed")
    .single();

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data);
}
