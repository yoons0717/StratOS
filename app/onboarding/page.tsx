"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { saveUserContext } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import StepNiche from "@/components/onboarding/StepNiche";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import Button from "@/components/ui/Button";
import type { UserType, UserLevel, BusinessStage } from "@/types";

const STEP_LABELS = ["USER_TYPE", "AUDIENCE_SIZE", "CURRENT_STAGE", "YOUR_NICHE"];
const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const setUserContext = useStratosStore((s) => s.setUserContext);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<UserType | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [stage, setStage] = useState<BusinessStage | null>(null);
  const [niche, setNiche] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const currentValue = step === 3 ? niche.trim() : [type, level, stage][step];

  async function handleExecute() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (!type || !level || !stage || !niche.trim()) return;
    const ctx = { type, level, businessStage: stage, niche: niche.trim(), reminderEmail: false };
    try {
      await saveUserContext(ctx);
      setUserContext(ctx);
      router.push("/");
    } catch {
      setError("SAVE_FAILED — Please try again");
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs tracking-widest text-neon">STRATOS</span>
            {email && (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-400">{email}</span>
                <span className="font-mono text-xs text-zinc-600">·</span>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-xs text-zinc-400 transition-colors hover:text-red-400"
                >
                  SIGN_OUT
                </button>
              </div>
            )}
          </div>
          <span className="font-mono text-xs text-zinc-600">{step + 1} / {TOTAL_STEPS}</span>
        </div>
        <div className="mb-1 font-mono text-lg font-bold text-white">
          {STEP_LABELS[step]}
          <span className="animate-pulse text-neon">_</span>
        </div>
        <div className="mb-5 font-mono text-xs text-zinc-600">
          {step === 3 ? "니치를 입력하고 계속하세요" : "하나를 선택하고 계속하세요"}
        </div>

        {step === 0 && <StepType selected={type} onSelect={setType} />}
        {step === 1 && <StepLevel selected={level} onSelect={setLevel} />}
        {step === 2 && <StepStage selected={stage} onSelect={setStage} />}
        {step === 3 && <StepNiche value={niche} onChange={setNiche} />}

        <Button onClick={handleExecute} disabled={!currentValue} className="mt-6 w-full">
          EXECUTE →
        </Button>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-3 w-full font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            ← 이전으로
          </button>
        )}
        {error && (
          <p className="mt-3 font-mono text-xs text-red-400">{error}</p>
        )}

      </div>
    </main>
  );
}
