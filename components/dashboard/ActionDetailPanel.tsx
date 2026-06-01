"use client";

import { useState } from "react";
import type { ActionSession } from "@/types";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MagicCopy from "@/components/result/MagicCopy";
import { CHANNEL_LABEL } from "@/lib/analytics/labels";

function formatDuration(startIso: string, endIso: string): string {
  const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function SessionTimestamp({ session }: { session: ActionSession }) {
  const started = new Date(session.created_at).toLocaleString("en-US", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  if (!session.completed_at) {
    return (
      <p className="font-mono text-xs text-zinc-700">started {started}</p>
    );
  }

  const ended = new Date(session.completed_at).toLocaleString("en-US", {
    month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const duration = formatDuration(session.created_at, session.completed_at);

  return (
    <p className="font-mono text-xs text-zinc-700">
      {started} → {ended} <span className="text-neon">({duration})</span>
    </p>
  );
}

interface Props {
  session: ActionSession | null;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  readonly?: boolean;
}

export default function ActionDetailPanel({
  session,
  onComplete,
  onDelete,
  readonly = false,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs text-zinc-700">
        Select an action or create a new one
      </div>
    );
  }

  const { action } = session;
  const channelLabel = CHANNEL_LABEL[session.channel];

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-mono text-base font-bold text-white">{action.title}</h2>
        <div className="flex shrink-0 gap-2">
          {channelLabel && (
            <span className="rounded border border-zinc-600 px-2 py-0.5 font-mono text-xs text-zinc-400">
              {channelLabel}
            </span>
          )}
          <span className="rounded border border-neon/40 px-2 py-0.5 font-mono text-xs text-neon">
            {action.category.toUpperCase()}
          </span>
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">STEPS //</div>
        <div className="flex flex-col gap-1.5">
          {action.steps.map((step) => (
            <div
              key={step.order}
              className="flex gap-3 rounded border border-zinc-800 bg-surface px-3 py-2"
            >
              <span className="font-mono text-xs text-neon">
                {String(step.order).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm text-zinc-300">{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      <SessionTimestamp session={session} />

      <MagicCopy text={action.magicCopy} />

      {!readonly && (
        <div className="mt-auto flex gap-3">
          {onDelete && (
            <Button variant="ghost" className="px-4" onClick={() => setConfirmDelete(true)}>
              ✕ DELETE
            </Button>
          )}
          <Button className="flex-1" onClick={() => onComplete(session.id)}>
            COMPLETE ✓
          </Button>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="CONFIRM_DELETE //"
          message={session.action.title}
          confirmLabel="DELETE"
          confirmVariant="danger"
          onConfirm={() => onDelete!(session.id)}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
