import type { ActionSession } from "@/types";

interface Props {
  sessions: ActionSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyLabel?: string;
}

export default function ActionListPanel({
  sessions,
  selectedId,
  onSelect,
  onDelete,
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
            <div
              key={session.id}
              className="group relative"
            >
              <button
                onClick={() => onSelect(session.id)}
                className={`w-full rounded border px-3 py-2 pr-8 text-left font-mono text-sm transition-colors ${
                  selectedId === session.id
                    ? "border-neon text-neon"
                    : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {session.action.title}
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(session.id)}
                  aria-label="✕"
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
