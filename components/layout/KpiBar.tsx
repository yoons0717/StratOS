import type { KpiData } from "@/lib/analytics/kpi";

interface Props {
  data: KpiData;
}

const CARDS: Array<{ key: keyof KpiData; label: string; neon?: boolean }> = [
  { key: "total", label: "TOTAL" },
  { key: "active", label: "ACTIVE", neon: true },
  { key: "completed", label: "COMPLETED" },
  { key: "rate", label: "RATE", neon: true },
  { key: "streak", label: "STREAK", neon: true },
];

export default function KpiBar({ data }: Props) {
  return (
    <div className="flex shrink-0 gap-2 border-b border-zinc-800/60 bg-background px-4 py-3">
      {CARDS.map(({ key, label, neon }) => (
        <div key={key} className="flex-1 rounded-md border border-zinc-800/60 bg-surface px-3 py-2">
          <div className="mb-1 text-xs font-medium text-zinc-500">{label}</div>
          <div
            className={`font-mono text-xl font-semibold leading-tight ${neon ? "text-neon" : "text-foreground"}`}
          >
            {key === "rate" ? `${data[key]}%` : data[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
