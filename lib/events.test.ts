import { describe, it, expect, vi } from "vitest";
import { logEvent } from "@/lib/events";
import type { SupabaseClient } from "@supabase/supabase-js";

function makeSupabase(insertError: unknown = null) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const from = vi.fn().mockReturnValue({ insert });
  return { supabase: { from } as unknown as SupabaseClient, insert, from };
}

describe("logEvent", () => {
  it("inserts event with correct user_id and name", async () => {
    const { supabase, from, insert } = makeSupabase();
    await logEvent("session_created", "user-123", supabase);
    expect(from).toHaveBeenCalledWith("events");
    expect(insert).toHaveBeenCalledWith({ user_id: "user-123", name: "session_created" });
  });

  it("does not throw when insert returns an error", async () => {
    const { supabase } = makeSupabase({ message: "db error" });
    await expect(logEvent("session_completed", "user-123", supabase)).resolves.toBeUndefined();
  });
});
