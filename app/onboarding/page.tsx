"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import type { UserType, UserLevel, BusinessStage } from "@/types";

const STEP_LABELS = ["USER_TYPE", "AUDIENCE_SIZE", "CURRENT_STAGE"];

export default function OnboardingPage() {
  const router = useRouter();
  const setUserContext = useStratosStore((s) => s.setUserContext);

  const [step, setStep] = useState(0);
  const [type, setType] = useState<UserType | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [stage, setStage] = useState<BusinessStage | null>(null);

  const currentValue = [type, level, stage][step];

  function handleExecute() {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    if (!type || !level || !stage) return;
    setUserContext({ type, level, businessStage: stage });
    router.push("/");
  }

  return (
    <main className="safe-x flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0f] px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm">
        {/* scanline overlay */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,0.015) 2px,rgba(0,255,180,0.015) 4px)",
          }}
        />

        <div className="relative rounded border border-zinc-800 bg-[#0d0d12] p-6">
          {/* header */}
          <div className="mb-6 flex items-center justify-between font-mono text-xs">
            <span className="tracking-widest text-[#00ffb4]">STRATOS_OS</span>
            <span className="text-zinc-600">{step + 1} / 3</span>
          </div>

          {/* step title */}
          <div className="mb-1 font-mono text-lg font-bold text-white">
            {STEP_LABELS[step]}
            <span className="animate-pulse text-[#00ffb4]">_</span>
          </div>
          <div className="mb-5 font-mono text-xs text-zinc-600">
            SELECT ONE TO CONTINUE
          </div>

          {/* step content */}
          {step === 0 && <StepType selected={type} onSelect={setType} />}
          {step === 1 && <StepLevel selected={level} onSelect={setLevel} />}
          {step === 2 && <StepStage selected={stage} onSelect={setStage} />}

          {/* execute button */}
          <button
            onClick={handleExecute}
            disabled={!currentValue}
            className="mt-6 min-h-[44px] w-full rounded bg-[#00ffb4] py-2 font-mono text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            EXECUTE →
          </button>
        </div>
      </div>
    </main>
  );
}
