"use client";

import type { UserLevel } from "@/types";

const OPTIONS: { value: UserLevel; label: string }[] = [
  { value: "0-1K", label: "0 ~ 1K" },
  { value: "1K-10K", label: "1K ~ 10K" },
  { value: "10K+", label: "10K+" },
];

interface Props {
  selected: UserLevel | null;
  onSelect: (value: UserLevel) => void;
}

export default function StepLevel({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          data-testid={`option-${opt.value}`}
          data-selected={selected === opt.value ? "true" : "false"}
          onClick={() => onSelect(opt.value)}
          className={`min-h-[44px] rounded px-4 py-3 text-left font-mono text-sm transition-colors ${
            selected === opt.value
              ? "border border-neon bg-neon/10 text-neon"
              : "border border-zinc-700 text-zinc-500 hover:border-zinc-500"
          }`}
        >
          {selected === opt.value ? "▶ " : "  "}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
