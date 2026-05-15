"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchSessions, fetchUserContext, createSession, completeSession } from "@/lib/api";
import { computeKpi } from "@/lib/kpi";
import AppShell from "@/components/layout/AppShell";
import ActionListPanel from "@/components/dashboard/ActionListPanel";
import ActionDetailPanel from "@/components/dashboard/ActionDetailPanel";
import NewActionModal from "@/components/dashboard/NewActionModal";

export default function DashboardPage() {
  const router = useRouter();
  const { userContext, sessions, setUserContext, setSessions, addSession, markCompleted } =
    useStratosStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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
  }

  return (
    <AppShell userContext={userContext} kpiData={kpiData}>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800">
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
        <ActionDetailPanel
          session={selectedSession}
          allSessions={sessions}
          onComplete={handleComplete}
          onDeselect={() => setSelectedId(null)}
        />
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
