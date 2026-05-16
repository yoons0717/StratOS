"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchUserContext, fetchSessions } from "@/lib/api";

export function useInitStore(withSessions = false) {
  const router = useRouter();
  const { setUserContext, setSessions } = useStratosStore();

  useEffect(() => {
    async function init() {
      if (withSessions) {
        const [ctx, list] = await Promise.all([fetchUserContext(), fetchSessions()]);
        if (!ctx) { router.push("/onboarding"); return; }
        setUserContext(ctx);
        setSessions(list);
      } else {
        const ctx = await fetchUserContext();
        if (!ctx) { router.push("/onboarding"); return; }
        setUserContext(ctx);
      }
    }
    init();
  }, [router, setUserContext, setSessions, withSessions]);
}
