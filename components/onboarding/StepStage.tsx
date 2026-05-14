"use client";

import type { BusinessStage } from "@/types";

const OPTIONS: { value: BusinessStage; label: string; cmd: string }[] = [
  { value: "idea", label: "아이디어 단계", cmd: "IDEA" },
  { value: "first-customers", label: "첫 고객 확보 중", cmd: "FIRST_CUSTOMERS" },
  { value: "consistent-income", label: "수입 안정화", cmd: "CONSISTENT_INCOME" },
  { value: "scaling", label: "스케일업", cmd: "SCALING" },
];

interface Props {
  selected: BusinessStage | null;
  onSelect: (value: BusinessStage) => void;
}

export default function StepStage({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          data-testid={`option-${opt.value}`}
          data-selected={selected === opt.value ? "true" : "false"}
          onClick={() => onSelect(opt.value)}
          className={`flex min-h-[44px] items-center justify-between rounded px-4 py-3 text-left font-mono text-sm transition-colors ${
            selected === opt.value
              ? "border border-neon bg-neon/10 text-neon"
              : "border border-zinc-700 text-zinc-500 hover:border-zinc-500"
          }`}
        >
          <span>
            {selected === opt.value ? "▶ " : "  "}
            {opt.cmd}
          </span>
          <span className="text-xs opacity-60">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
