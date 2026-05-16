"use client";

interface Props {
  streak: number;
  rate: number;
  onDismiss: () => void;
}

function buildBar(rate: number): string {
  const filled = Math.round(rate / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export default function CompletionFeedback({ streak, rate, onDismiss }: Props) {

  return (
    <div className="flex flex-1 flex-col justify-center gap-2 p-8 font-mono">
      <p className="reveal-line-1 text-sm text-neon">&gt; ACTION_COMPLETE ✓</p>
      <p className="reveal-line-2 text-sm text-zinc-400">&gt; STREAK: {streak} days</p>
      <p className="reveal-line-3 text-sm text-zinc-400">
        &gt; [{buildBar(rate)}] {rate}% execution rate
      </p>
      <p className="reveal-line-4 mt-4 text-base font-bold text-white">
        KEEP GOING, EXECUTOR.
      </p>
      <button
        onClick={onDismiss}
        className="reveal-line-5 mt-6 w-fit rounded border border-zinc-700 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
      >
        [ BACK TO DASHBOARD ]
      </button>
    </div>
  );
}
