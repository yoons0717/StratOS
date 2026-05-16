"use client";

import { useState } from "react";

interface Props {
  text: string;
}

export default function MagicCopy({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded border border-zinc-700 bg-surface">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="font-mono text-xs tracking-widest text-neon">MAGIC_COPY</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-600">{text.length}</span>
          <button
            onClick={handleCopy}
            className="min-h-[44px] rounded px-3 font-mono text-xs text-zinc-400 transition-colors hover:text-neon"
          >
            {copied ? "COPIED ✓" : "COPY"}
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap px-4 py-3 font-mono text-sm leading-relaxed text-zinc-300">
        {text}
      </p>
    </div>
  );
}
