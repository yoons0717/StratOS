"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function StepNiche({ value, onChange }: Props) {
  return (
    <div>
      <input
        data-testid="niche-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 피트니스 코치, B2B SaaS, 영어교육..."
        maxLength={100}
        className="w-full rounded border border-zinc-700 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none"
      />
    </div>
  );
}
