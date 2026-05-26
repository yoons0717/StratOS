"use client";

import { useState, useEffect } from "react";
import { useStratosStore } from "@/store";
import { createSession, completeSession, deleteSession } from "@/lib/api";
import { useInitStore } from "@/lib/hooks";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";
import CompletionFeedback from "@/components/dashboard/CompletionFeedback";
import FirstRunGuide from "@/components/dashboard/FirstRunGuide";
import NewActionModal from "@/components/dashboard/NewActionModal";

const WELCOME_KEY = "stratos_welcome_seen";

export default function DashboardPage() {
  useInitStore(true);
  const { userContext, sessions, addSession, markCompleted, removeSession } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(() => typeof window !== "undefined" && !localStorage.getItem(WELCOME_KEY));

  useEffect(() => {
    if (!showFirstRun) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleDismissFirstRun();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showFirstRun]);

  if (!userContext) return null;

  const activeSessions = sessions.filter((s) => !s.completed);
  const kpiData = computeKpi(sessions);
  const selectedSession = activeSessions.find((s) => s.id === selectedId) ?? null;

  function handleDismissFirstRun() {
    localStorage.setItem(WELCOME_KEY, "1");
    setShowFirstRun(false);
  }

  function handleOpenModal() {
    localStorage.setItem(WELCOME_KEY, "1");
    setShowFirstRun(false);
    setShowModal(true);
  }

  async function handleNewAction(input: string, channel: import("@/types").Channel) {
    setModalLoading(true);
    setModalError(null);
    try {
      const session = await createSession(input, userContext!, channel);
      addSession(session);
      setSelectedId(session.id);
      setShowModal(false);
    } catch {
      setModalError("EXECUTION_FAILED — Please try again");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteSession(id);
    removeSession(id);
    if (selectedId === id) setSelectedId(null);
  }

  async function handleComplete(id: string) {
    await completeSession(id);
    markCompleted(id);
    setSelectedId(null);
    setShowFeedback(true);
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
              onClick={handleOpenModal}
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
            onDelete={selectedSession ? handleDelete : undefined}
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
      {showFirstRun && (
        <div
          data-testid="firstrun-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={handleDismissFirstRun}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <FirstRunGuide onBegin={handleOpenModal} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
