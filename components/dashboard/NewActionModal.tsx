"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface Props {
  onSubmit: (input: string) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function NewActionModal({ onSubmit, onClose, isLoading, error }: Props) {
  const [input, setInput] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded border border-zinc-800 bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 font-mono text-xs tracking-widest text-zinc-600">
          NEW_ACTION //
        </div>
        <textarea
          className="w-full rounded border border-zinc-800 bg-background px-3 py-2 font-mono text-sm text-zinc-300 focus:border-neon focus:outline-none"
          rows={4}
          placeholder="Describe your current situation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        {error && (
          <div className="mt-2 font-mono text-xs text-red-500">{error}</div>
        )}
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isLoading}>
            CANCEL
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSubmit(input)}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "ANALYZING..." : "EXECUTE →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
