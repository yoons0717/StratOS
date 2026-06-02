import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { generateAction } from "@/lib/ai/generate-action";
import { generateActionRequestSchema } from "@/lib/schemas";
import { buildUserPrompt } from "@/lib/ai/prompts";
import { logEvent } from "@/lib/events";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from("action_sessions")
    .select("id, created_at, completed_at, input, channel, action, completed")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const body = await req.json().catch(() => null);
  const parsed = generateActionRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { input, channel, userContext } = parsed.data;
  const userPrompt = buildUserPrompt(input, userContext.type, userContext.niche, userContext.level, userContext.businessStage, channel);

  const result = await generateAction(userPrompt, 0.7);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const { data, error } = await supabase
    .from("action_sessions")
    .insert({ user_id: user.id, input, channel, action: result.action, completed: false })
    .select("id, created_at, completed_at, input, channel, action, completed")
    .single();

  if (error) { console.error(error); return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  await logEvent("session_created", user.id, supabase);
  return NextResponse.json(data);
}
