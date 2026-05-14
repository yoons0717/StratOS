import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import {
  generateActionRequestSchema,
  generatedActionSchema,
} from "@/lib/schemas";
import type { GenerateActionRequest } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are StratOS, an execution-focused AI for solo creators and entrepreneurs.

Your only job: given a user's situation, return ONE specific action they can realistically start TODAY.

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no extra text.
- Maximum 3 steps, each completable in under 30 minutes.
- magicCopy is a ready-to-edit draft (caption, message, or post body) — not advice.
- Prioritize: (1) doability today, (2) completable in 30min, (3) channel fit, (4) ROI.

Output schema:
{
  "title": "short action title",
  "category": "content" | "outreach" | "seo" | "offer" | "community",
  "steps": [
    { "order": 1, "description": "..." },
    { "order": 2, "description": "..." }
  ],
  "magicCopy": "ready-to-edit draft text"
}`;

function buildUserPrompt(
  input: string,
  userContext: GenerateActionRequest["userContext"]
): string {
  const stageMap: Record<string, string> = {
    idea: "아이디어 단계",
    "first-customers": "첫 고객 확보 단계",
    "consistent-income": "안정적 수입 단계",
    scaling: "스케일업 단계",
  };

  return `User type: ${userContext.type}
Audience size: ${userContext.level}
Stage: ${stageMap[userContext.businessStage]}

Situation: ${input}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const parsed = generateActionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { input, userContext } = parsed.data;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input, userContext) },
    ],
    temperature: 0.7,
    max_tokens: 512,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json({ error: "No response from AI" }, { status: 502 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid AI response format" },
      { status: 502 }
    );
  }

  const parsed2 = generatedActionSchema.safeParse(json);
  if (!parsed2.success) {
    return NextResponse.json(
      { error: "Invalid AI response shape" },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed2.data);
}
