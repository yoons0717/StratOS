import { z } from "zod";
import { actionSessionSchema, userContextInputSchema } from "@/lib/schemas";
import type { UserContext, ActionSession } from "@/types";

export async function fetchSessions(): Promise<ActionSession[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const parsed = z.array(actionSessionSchema).safeParse(await res.json());
  if (!parsed.success) throw new Error("Invalid response format");
  return parsed.data;
}

export async function createSession(
  input: string,
  userContext: UserContext,
  channel: import("@/types").Channel = "general"
): Promise<ActionSession> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, channel, userContext }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const parsed = actionSessionSchema.safeParse(await res.json());
  if (!parsed.success) throw new Error("Invalid response format");
  return parsed.data;
}

export async function completeSession(id: string): Promise<void> {
  const res = await fetch(`/api/sessions/${id}/complete`, { method: "PATCH" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function fetchUserContext(): Promise<UserContext | null> {
  const res = await fetch("/api/user-context");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  if (json === null) return null;
  const parsed = userContextInputSchema.safeParse(json);
  if (!parsed.success) throw new Error("Invalid response format");
  return parsed.data;
}

export async function saveUserContext(ctx: UserContext): Promise<void> {
  const res = await fetch("/api/user-context", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ctx),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
