import type { ActionSession } from "@/types";

interface Props {
  sessions: ActionSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel?: string;
}

export default function ActionListPanel({
  sessions,
  selectedId,
  onSelect,
  emptyLabel = "No actions yet",
}: Props) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-2 overflow-y-auto border-r border-zinc-800 p-3">
      <div className="font-mono text-xs tracking-widest text-zinc-600">ACTIONS //</div>
      {sessions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-zinc-700">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`rounded border px-3 py-2 text-left font-mono text-sm transition-colors ${
                selectedId === session.id
                  ? "border-neon text-neon"
                  : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {session.action.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
