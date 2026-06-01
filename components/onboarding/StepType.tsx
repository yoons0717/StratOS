"use client";

import type { UserType } from "@/types";

const OPTIONS: { value: UserType; label: string; cmd: string }[] = [
  { value: "creator", label: "크리에이터", cmd: "CREATOR" },
  { value: "seller", label: "셀러", cmd: "SELLER" },
  { value: "service", label: "서비스 제공자", cmd: "SERVICE" },
  { value: "side", label: "사이드 허슬", cmd: "SIDE_GIG" },
];

interface Props {
  selected: UserType | null;
  onSelect: (value: UserType) => void;
}

export default function StepType({ selected, onSelect }: Props) {
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
            {selected === opt.value ? "▶ " : "  "}
            {opt.cmd}
          </span>
          <span className="text-xs opacity-60">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
