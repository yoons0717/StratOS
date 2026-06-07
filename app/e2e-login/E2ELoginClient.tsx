"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  email: string;
  password: string;
}

export default function E2ELoginClient({ email, password }: Props) {
  const [status, setStatus] = useState("signing in...");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .signInWithPassword({ email, password })
      .then(({ error }) => {
        if (error) {
          setStatus(`error: ${error.message}`);
        } else {
          setStatus("done");
        }
      });
  }, [email, password]);

  if (status === "done") {
    return <div data-testid="e2e-auth-done">done</div>;
  }

  return <div data-testid="e2e-auth-status">{status}</div>;
}
