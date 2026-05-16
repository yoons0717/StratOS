import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import groq from "@/lib/groq";
import { generatedActionSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("action_sessions")
    .select("input")
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

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(session.input, ctx.type, ctx.niche ?? "", ctx.level, ctx.business_stage) },
    ],
    temperature: 0.9,
    max_tokens: 512,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return NextResponse.json({ error: "No response from AI" }, { status: 502 });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid AI response format" }, { status: 502 });
  }

  const action = generatedActionSchema.safeParse(json);
  if (!action.success)
    return NextResponse.json({ error: "Invalid AI response shape" }, { status: 502 });

  const { data, error } = await supabase
    .from("action_sessions")
    .update({ action: action.data })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, created_at, input, action, completed")
    .single();

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json(data);
}
