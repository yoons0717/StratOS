"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function DashboardPage() {
  const router = useRouter();
  const { userContext, sessions, completeSession } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  const activeSessions = sessions.filter((s) => !s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = activeSessions.find((s) => s.id === selectedId) ?? null;

  function handleComplete(id: string) {
    completeSession(id);
    setSelectedId(null);
  }

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={activeSessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <ActionDetailPanel
          session={selectedSession}
          allSessions={sessions}
          onComplete={handleComplete}
          onDeselect={() => setSelectedId(null)}
        />
      </div>
    </AppShell>
  );
}
