"use client";

import { useState } from "react";

export default function RemindButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [sent, setSent] = useState(0);

  async function handleSend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/notifications/remind", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSent(data.sent);
      setStatus("done");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="rounded border border-zinc-800 p-4">
      <p className="mb-4 font-mono text-xs tracking-widest text-zinc-600">reminder email</p>
      <button
        onClick={handleSend}
        disabled={status === "sending"}
        className="rounded border border-zinc-700 px-4 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-neon hover:text-neon disabled:opacity-40"
      >
        {status === "sending" ? "SENDING..." : "SEND_REMINDERS →"}
      </button>
      {status === "done" && (
        <p className="mt-3 font-mono text-xs text-neon">sent to {sent} users</p>
      )}
      {status === "error" && (
        <p className="mt-3 font-mono text-xs text-red-400">SEND_FAILED — please try again</p>
      )}
    </div>
  );
}
