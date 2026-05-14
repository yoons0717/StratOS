"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { generateAction } from "@/lib/api";
import ActionInput from "@/components/input/ActionInput";
import ActionResult from "@/components/result/ActionResult";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import type { GeneratedAction } from "@/types";

type ViewState = "idle" | "loading" | "result" | "error";

export default function Home() {
  const router = useRouter();
  const { userContext, addSession, completeSession } = useStratosStore();

  const [view, setView] = useState<ViewState>("idle");
  const [result, setResult] = useState<GeneratedAction | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState("");

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  async function handleSubmit(input: string) {
    setLastInput(input);
    setView("loading");
    try {
      const action = await generateAction(input, userContext!);
      const id = crypto.randomUUID();
      addSession({ id, createdAt: Date.now(), input, action, completed: false });
      setSessionId(id);
      setResult(action);
      setView("result");
    } catch {
      setView("error");
    }
  }

  function handleComplete() {
    if (sessionId) completeSession(sessionId);
    setView("idle");
    setResult(null);
  }

  function handleReset() {
    setView("idle");
    setResult(null);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />

      <div className="relative flex flex-1 flex-col px-4 py-6">
        {/* header */}
        <div className="mb-6 flex items-center justify-between font-mono text-xs">
          <span className="tracking-widest text-neon">STRATOS_OS</span>
          <span className="text-zinc-600">오늘 행동 1개</span>
        </div>

        {view === "idle" && (
          <>
            <div className="mb-4">
              <div className="font-mono text-lg font-bold text-white">
                INPUT_SITUATION
                <span className="animate-pulse text-neon">_</span>
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-600">
                지금 상황을 그대로 적어줘
              </div>
            </div>
            <ActionInput onSubmit={handleSubmit} isLoading={false} />
          </>
        )}

        {view === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="font-mono text-xs tracking-widest text-neon">
              ANALYZING_INPUT
              <span className="animate-pulse">...</span>
            </div>
            <div className="max-w-xs text-center font-mono text-xs text-zinc-600">
              &quot;{lastInput}&quot;
            </div>
            <div className="flex gap-1">
              {([0, 1, 2] as const).map((i) => (
                <div
                  key={i}
                  className={`delay-${i} h-1 w-1 rounded-full bg-neon`}
                />
              ))}
            </div>
          </div>
        )}

        {view === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-mono text-xs tracking-widest text-red-400">
                EXECUTION_FAILED
              </div>
              <div className="mt-2 max-w-xs text-center font-mono text-xs text-zinc-600">
                &quot;{lastInput}&quot;
              </div>
            </div>
            <div className="flex w-full gap-3">
              <button
                onClick={handleReset}
                className="min-h-[44px] flex-1 rounded border border-zinc-700 font-mono text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
              >
                NEW →
              </button>
              <button
                onClick={() => handleSubmit(lastInput)}
                className="min-h-[44px] flex-1 rounded border border-red-400/40 font-mono text-sm text-red-400 transition-colors hover:border-red-400 hover:text-red-300"
              >
                RETRY ↺
              </button>
            </div>
          </div>
        )}

        {view === "result" && result && (
          <>
            <div className="mb-4 font-mono text-xs tracking-widest text-zinc-600">
              ACTION_GENERATED //
            </div>
            <ActionResult
              action={result}
              onComplete={handleComplete}
              onReset={handleReset}
            />
          </>
        )}
      </div>
    </main>
  );
}
