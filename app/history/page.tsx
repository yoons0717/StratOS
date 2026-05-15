"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchSessions, fetchUserContext } from "@/lib/api";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function HistoryPage() {
  const router = useRouter();
  const { userContext, sessions, setUserContext, setSessions } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const [ctx, list] = await Promise.all([fetchUserContext(), fetchSessions()]);
      if (!ctx) { router.push("/onboarding"); return; }
      setUserContext(ctx);
      setSessions(list);
    }
    init();
  }, [router, setUserContext, setSessions]);

  if (!userContext) return null;

  const completed = sessions.filter((s) => s.completed);
  const kpiData = computeKpi(sessions);
  const selected = completed.find((s) => s.id === selectedId) ?? null;

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={completed}
          selectedId={selectedId}
          onSelect={setSelectedId}
          emptyLabel="No completed actions"
        />
        <ActionDetailPanel
          session={selected}
          allSessions={sessions}
          onComplete={() => {}}
          onDeselect={() => setSelectedId(null)}
          readonly
        />
      </div>
    </AppShell>
  );
}
