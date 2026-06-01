"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchUserContext, fetchSessions } from "@/lib/api";

export function useInitStore(withSessions = false) {
  const router = useRouter();
  const { setUserContext, setSessions } = useStratosStore();
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }
    init().catch(() => setIsLoading(false));
  }, [router, setUserContext, setSessions, withSessions]);

  return { isLoading };
}
