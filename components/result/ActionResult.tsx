"use client";

import MagicCopy from "./MagicCopy";
import type { GeneratedAction } from "@/types";

interface Props {
  action: GeneratedAction;
  onComplete: () => void;
  onReset: () => void;
}

export default function ActionResult({ action, onComplete, onReset }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-mono text-base font-bold leading-snug text-white">
          {action.title}
        </h2>
        <span className="shrink-0 rounded border border-neon/40 px-2 py-0.5 font-mono text-xs text-neon">
          {action.category.toUpperCase()}
        </span>
      </div>

      {/* steps */}
      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs tracking-widest text-zinc-600">
          STEPS //
        </div>
        {action.steps.map((step) => (
          <div
            key={step.order}
            className="flex gap-3 rounded border border-zinc-800 bg-surface px-4 py-3"
          >
            <span className="font-mono text-xs text-neon">
              {String(step.order).padStart(2, "0")}
            </span>
            <span className="font-mono text-sm text-zinc-300">
              {step.description}
            </span>
          </div>
        ))}
      </div>

      {/* magic copy */}
      <MagicCopy text={action.magicCopy} />

      {/* actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="min-h-[44px] flex-1 rounded border border-zinc-700 font-mono text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
        >
          NEW →
        </button>
        <button
          onClick={onComplete}
          className="min-h-[44px] flex-1 rounded bg-neon font-mono text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          COMPLETE ✓
        </button>
      </div>
    </div>
  );
}
