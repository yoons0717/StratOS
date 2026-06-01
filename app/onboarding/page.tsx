"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { saveUserContext } from "@/lib/api";
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

  const headerRight = (
    <span className="font-mono text-xs text-zinc-600">{step + 1} / {TOTAL_STEPS}</span>
  );

  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-neon">STRATOS</span>
          {headerRight}
        </div>
        <div className="mb-1 font-mono text-lg font-bold text-white">
          {STEP_LABELS[step]}
          <span className="animate-pulse text-neon">_</span>
        </div>
        <div className="mb-5 font-mono text-xs text-zinc-600">
          {step === 3 ? "TYPE YOUR NICHE TO CONTINUE" : "SELECT ONE TO CONTINUE"}
        </div>

        {step === 0 && <StepType selected={type} onSelect={setType} />}
        {step === 1 && <StepLevel selected={level} onSelect={setLevel} />}
        {step === 2 && <StepStage selected={stage} onSelect={setStage} />}
        {step === 3 && <StepNiche value={niche} onChange={setNiche} />}

        <Button onClick={handleExecute} disabled={!currentValue} className="mt-6 w-full">
          EXECUTE →
        </Button>
        {error && (
          <p className="mt-3 font-mono text-xs text-red-400">{error}</p>
        )}
      </div>
    </main>
  );
}
