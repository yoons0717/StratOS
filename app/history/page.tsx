"use client";

import { useState } from "react";
import { useStratosStore } from "@/store";
import { useInitStore } from "@/lib/hooks";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorScreen from "@/components/ui/ErrorScreen";
import { computeKpi } from "@/lib/analytics/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";

export default function HistoryPage() {
  const { isLoading, initError } = useInitStore(true);
  const { userContext, sessions } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (initError) return <ErrorScreen />;
  if (isLoading || !userContext) return <LoadingScreen />;

  const completed = sessions.filter((s) => s.completed);
  const kpiData = computeKpi(sessions);
  const selected = completed.find((s) => s.id === selectedId) ?? null;

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex shrink-0 items-center border-b border-zinc-800/60 px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ActionListPanel
          sessions={completed}
          selectedId={selectedId}
          onSelect={setSelectedId}
          emptyLabel="No completed actions"
        />
        <ActionDetailPanel
          key={selected?.id}
          session={selected}
          onComplete={() => {}}
          readonly
        />
      </div>
    </AppShell>
  );
}
