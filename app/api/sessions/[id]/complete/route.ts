import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { logEvent } from "@/lib/events";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { error } = await supabase
    .from("action_sessions")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) { console.error(error); return NextResponse.json({ error: "DB error" }, { status: 500 }); }
  await logEvent("session_completed", user.id, supabase);
  return NextResponse.json({ ok: true });
}
