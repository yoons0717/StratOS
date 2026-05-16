import type { ActionSession } from "@/types";

interface Props {
  sessions: ActionSession[];
}

export default function CategoryChart({ sessions }: Props) {
  if (sessions.length === 0) return null;

  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.action.category] = (acc[s.action.category] ?? 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts));
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">
        CATEGORY_DIST //
      </div>
      <div className="flex flex-col gap-1.5">
        {entries.map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-right font-mono text-xs text-zinc-500">
              {cat.toUpperCase()}
            </span>
            <div className="h-1.5 flex-1 rounded bg-zinc-800">
              <div
                className={`h-full rounded bg-neon/70 w-[${Math.round((count / max) * 100)}%]`}
              />
            </div>
            <span className="w-4 font-mono text-xs text-zinc-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
