"use client";

import { useState } from "react";
import { useStratosStore } from "@/store";
import { useInitStore } from "@/lib/hooks";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function HistoryPage() {
  useInitStore(true);
  const { userContext, sessions } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
