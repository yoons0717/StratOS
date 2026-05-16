import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import groq from "@/lib/groq";
import { generatedActionSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are StratOS, an execution-focused AI for solo creators and entrepreneurs.

Your only job: given a user's situation, return ONE specific action they can realistically start TODAY.

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
- Maximum 3 steps, each completable in under 30 minutes.
- magicCopy is a ready-to-use text draft the user can immediately copy and send/post — not advice.
- Prioritize: (1) doability today, (2) completable in 30min, (3) ROI.

Output schema:
{
  "title": "short action title",
  "category": "content" | "outreach" | "seo" | "offer" | "community",
  "steps": [
    { "order": 1, "description": "..." }
  ],
  "magicCopy": "ready-to-edit draft text"
}`;

const STAGE_MAP: Record<string, string> = {
  idea: "Idea Stage",
  "first-customers": "Getting First Customers",
  "consistent-income": "Consistent Income",
  scaling: "Scaling",
};

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
    .select("type, level, business_stage")
    .eq("user_id", user.id)
    .single();

  if (!ctx) return NextResponse.json({ error: "No user context" }, { status: 400 });

  const userPrompt = `User type: ${ctx.type}
Audience size: ${ctx.level}
Stage: ${STAGE_MAP[ctx.business_stage] ?? ctx.business_stage}

Situation: ${session.input}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
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
