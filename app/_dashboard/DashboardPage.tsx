"use client";

import { useState, useEffect } from "react";
import { useStratosStore } from "@/store";
import { createSession, completeSession, deleteSession } from "@/lib/api";
import { useInitStore } from "@/lib/hooks";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorScreen from "@/components/ui/ErrorScreen";
import { computeKpi } from "@/lib/analytics/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";
import CompletionFeedback from "@/components/dashboard/CompletionFeedback";
import FirstRunGuide from "@/components/dashboard/FirstRunGuide";
import NewActionModal from "@/components/dashboard/NewActionModal";

const WELCOME_KEY = "stratos_welcome_seen";

export default function DashboardPage() {
  const { isLoading, initError } = useInitStore(true);
  const { userContext, sessions, addSession, markCompleted, removeSession } = useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showFirstRun, setShowFirstRun] = useState(() => typeof window !== "undefined" && !localStorage.getItem(WELCOME_KEY));

  useEffect(() => {
    if (!showFirstRun) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleDismissFirstRun();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showFirstRun]);

  if (initError) return <ErrorScreen />;
  if (isLoading || !userContext) return <LoadingScreen />;

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
    if (!userContext) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const session = await createSession(input, userContext, channel);
      addSession(session);
      setSelectedId(session.id);
      setShowModal(false);
      setShowFeedback(false);
    } catch (error) {
      console.error(error);
      setModalError("EXECUTION_FAILED — Please try again");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSession(id);
      removeSession(id);
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.error(error);
      setActionError("DELETE_FAILED — Please try again");
    }
  }

  async function handleComplete(id: string) {
    try {
      await completeSession(id);
      markCompleted(id);
      setSelectedId(null);
      setShowFeedback(true);
    } catch (error) {
      console.error(error);
      setActionError("COMPLETE_FAILED — Please try again");
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
              onClick={handleOpenModal}
              className="w-full rounded border border-zinc-800 py-2 font-mono text-xs text-zinc-600 transition-colors hover:border-neon hover:text-neon"
            >
              + NEW ACTION
            </button>
          </div>
        </div>
        <div className="relative flex flex-1 overflow-hidden">
          {showFeedback ? (
            <CompletionFeedback
              streak={kpiData.streak}
              rate={kpiData.rate}
              onDismiss={() => setShowFeedback(false)}
            />
          ) : (
            <ActionDetailPanel
              key={selectedSession?.id}
              session={selectedSession}
              onComplete={handleComplete}
              onDelete={selectedSession ? handleDelete : undefined}
            />
          )}
          {actionError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-red-900 bg-zinc-900 px-4 py-2 font-mono text-xs text-red-400">
              {actionError}
            </div>
          )}
        </div>
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
