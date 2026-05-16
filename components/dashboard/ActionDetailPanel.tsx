import type { ActionSession } from "@/types";
import Button from "@/components/ui/Button";
import MagicCopy from "@/components/result/MagicCopy";
import CategoryChart from "./CategoryChart";

interface Props {
  session: ActionSession | null;
  allSessions: ActionSession[];
  onComplete: (id: string) => void;
  onDeselect: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  readonly?: boolean;
}

export default function ActionDetailPanel({
  session,
  allSessions,
  onComplete,
  onDeselect,
  onRegenerate,
  isRegenerating = false,
  readonly = false,
}: Props) {
  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center font-mono text-xs text-zinc-700">
        Select an action or create a new one
      </div>
    );
  }

  const { action } = session;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-mono text-base font-bold text-white">{action.title}</h2>
        <span className="shrink-0 rounded border border-neon/40 px-2 py-0.5 font-mono text-xs text-neon">
          {action.category.toUpperCase()}
        </span>
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

      <MagicCopy text={action.magicCopy} />

      <CategoryChart sessions={allSessions} />

      {!readonly && (
        <div className="mt-auto flex flex-col gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="min-h-[44px] w-full rounded border border-dashed border-zinc-700 font-mono text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRegenerating ? "↺ REROLLING..." : "↺ REROLL"}
            </button>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onDeselect}>
              NEW →
            </Button>
            <Button className="flex-1" onClick={() => onComplete(session.id)}>
              COMPLETE ✓
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
