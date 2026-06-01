import type { SupabaseClient } from "@supabase/supabase-js";

export type EventName =
  | "onboarding_started"
  | "onboarding_completed"
  | "session_created"
  | "session_completed";

export async function logEvent(
  name: EventName,
  userId: string,
  supabase: SupabaseClient
) {
  await supabase.from("events").insert({ user_id: userId, name });
}
