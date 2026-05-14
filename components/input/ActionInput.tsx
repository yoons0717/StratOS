"use client";

import { useState } from "react";

interface Props {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export default function ActionInput({ onSubmit, isLoading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="지금 상황을 입력해줘 // e.g. 인스타 반응이 없어요"
        rows={4}
        className="w-full resize-none rounded border border-zinc-700 bg-surface px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className="min-h-[44px] w-full rounded bg-neon font-mono text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isLoading ? "PROCESSING..." : "EXECUTE →"}
      </button>
    </div>
  );
}
