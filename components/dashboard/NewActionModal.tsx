"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import type { Channel } from "@/types";

interface Props {
  onSubmit: (input: string, channel: Channel) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const CHANNELS: { value: Channel; label: string }[] = [
  { value: "general", label: "General" },
  { value: "instagram", label: "Instagram" },
  { value: "naver-blog", label: "Naver Blog" },
  { value: "youtube", label: "YouTube" },
];

const CHANNEL_CONFIG: Record<Channel, { guide: string; placeholder: string }> = {
  general: {
    guide: "Include current metrics (followers, revenue, etc.) + what you're doing + desired outcome for more accurate actions.",
    placeholder: "e.g. 800 Instagram followers but no purchase inquiries. Posting home workout content 3x/week. Want to sell 1:1 PT program.",
  },
  instagram: {
    guide: "Describe your post/reel topic, current follower situation, and desired action (follow, inquiry, purchase).",
    placeholder: "e.g. Posts get saved a lot but no inquiries. 800 followers. Want to improve conversion through reels.",
  },
  "naver-blog": {
    guide: "Describe your blog topic, current traffic situation, and desired conversion (inquiry, purchase, subscription).",
    placeholder: "e.g. Getting traffic but visitors don't convert to inquiries. Blog topic is diet and nutrition.",
  },
  youtube: {
    guide: "Describe your channel topic, current views/subscribers, and desired viewer action.",
    placeholder: "e.g. Getting views but poor subscriber conversion. Want to add a stronger CTA at the end of videos.",
  },
};

export default function NewActionModal({ onSubmit, onClose, isLoading, error }: Props) {
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<Channel>("general");

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

        <div className="mb-1 font-mono text-xs tracking-widest text-zinc-600">CHANNEL //</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              data-selected={channel === ch.value ? "true" : "false"}
              onClick={() => setChannel(ch.value)}
              disabled={isLoading}
              className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
                channel === ch.value
                  ? "border-neon text-neon"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div className="mb-1 font-mono text-xs tracking-widest text-zinc-600">SITUATION //</div>
        <p className="mb-2 font-mono text-xs text-zinc-500">{CHANNEL_CONFIG[channel].guide}</p>
        <textarea
          className="w-full rounded border border-zinc-800 bg-background px-3 py-2 font-mono text-sm text-zinc-300 focus:border-neon focus:outline-none"
          rows={4}
          placeholder={CHANNEL_CONFIG[channel].placeholder}
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
            onClick={() => onSubmit(input, channel)}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "ANALYZING..." : "EXECUTE →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
