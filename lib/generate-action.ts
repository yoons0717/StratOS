import { createGroqClient } from "@/lib/groq";
import { generatedActionSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import type { GeneratedAction } from "@/types";

type GenerateResult =
  | { ok: true; action: GeneratedAction }
  | { ok: false; error: string; status: number };

export async function generateAction(
  userPrompt: string,
  temperature = 0.7
): Promise<GenerateResult> {
  const completion = await createGroqClient().chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: 512,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return { ok: false, error: "No response from AI", status: 502 };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid AI response format", status: 502 };
  }

  const parsed = generatedActionSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "Invalid AI response shape", status: 502 };

  return { ok: true, action: parsed.data };
}
