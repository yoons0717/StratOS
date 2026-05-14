"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function HistoryPage() {
  const router = useRouter();
  const { userContext, sessions } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  const completedSessions = sessions.filter((s) => s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = completedSessions.find((s) => s.id === selectedId) ?? null;

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={completedSessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          emptyLabel="완료된 액션 없음"
        />
        <ActionDetailPanel
          session={selectedSession}
          allSessions={sessions}
          onComplete={() => {}}
          onDeselect={() => setSelectedId(null)}
          readonly
        />
      </div>
    </AppShell>
  );
}
