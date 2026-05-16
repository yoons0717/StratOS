"use client";

import { useState } from "react";
import { useStratosStore } from "@/store";
import { createSession, completeSession, regenerateSession } from "@/lib/api";
import { useInitStore } from "@/lib/hooks";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";
import CompletionFeedback from "@/components/dashboard/CompletionFeedback";
import NewActionModal from "@/components/dashboard/NewActionModal";

export default function DashboardPage() {
  useInitStore(true);
  const { userContext, sessions, addSession, markCompleted, updateSession } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!userContext) return null;

  const activeSessions = sessions.filter((s) => !s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = activeSessions.find((s) => s.id === selectedId) ?? null;

  async function handleNewAction(input: string) {
    setModalLoading(true);
    setModalError(null);
    try {
      const session = await createSession(input, userContext!);
      addSession(session);
      setSelectedId(session.id);
      setShowModal(false);
    } catch {
      setModalError("EXECUTION_FAILED — Please try again");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleComplete(id: string) {
    await completeSession(id);
    markCompleted(id);
    setSelectedId(null);
    setShowFeedback(true);
  }

  async function handleRegenerate(id: string) {
    setRegenerating(true);
    try {
      const updated = await regenerateSession(id);
      updateSession(id, updated.action);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-72 shrink-0 flex-col border-r border-zinc-800">
          <ActionListPanel
            sessions={activeSessions}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="border-t border-zinc-800 p-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-full rounded border border-zinc-800 py-2 font-mono text-xs text-zinc-600 transition-colors hover:border-neon hover:text-neon"
            >
              + NEW ACTION
            </button>
          </div>
        </div>
        {showFeedback ? (
          <CompletionFeedback
            streak={kpiData.streak}
            rate={kpiData.rate}
            onDismiss={() => setShowFeedback(false)}
          />
        ) : (
          <ActionDetailPanel
            session={selectedSession}
            allSessions={sessions}
            onComplete={handleComplete}
            onDeselect={() => setSelectedId(null)}
            onRegenerate={selectedSession ? () => handleRegenerate(selectedSession.id) : undefined}
            isRegenerating={regenerating}
          />
        )}
      </div>
      {showModal && (
        <NewActionModal
          onSubmit={handleNewAction}
          onClose={() => setShowModal(false)}
          isLoading={modalLoading}
          error={modalError}
        />
      )}
    </AppShell>
  );
}
