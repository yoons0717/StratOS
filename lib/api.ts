import type { UserContext, GeneratedAction } from "@/types";

export async function generateAction(
  input: string,
  userContext: UserContext
): Promise<GeneratedAction> {
  const res = await fetch("/api/generate-action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, userContext }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<GeneratedAction>;
}
