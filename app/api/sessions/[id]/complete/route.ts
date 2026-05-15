import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("action_sessions")
    .update({ completed: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
