"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchUserContext, saveUserContext } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import StepNiche from "@/components/onboarding/StepNiche";
import type { UserType, UserLevel, BusinessStage } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { userContext, setUserContext } = useStratosStore();
  const [type, setType] = useState<UserType | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [stage, setStage] = useState<BusinessStage | null>(null);
  const [niche, setNiche] = useState("");
  const [reminderEmail, setReminderEmail] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserContext().then((ctx) => {
      if (!ctx) { router.push("/onboarding"); return; }
      setUserContext(ctx);
      setType(ctx.type);
      setLevel(ctx.level);
      setStage(ctx.businessStage);
      setNiche(ctx.niche);
      setReminderEmail(ctx.reminderEmail);
    }).catch(() => {
      router.push("/onboarding");
    });
  }, [router, setUserContext]);

  if (!userContext) return null;

  async function handleSave() {
    if (!type || !level || !stage || !niche.trim()) return;
    const ctx = { type, level, businessStage: stage, niche: niche.trim(), reminderEmail };
    try {
      await saveUserContext(ctx);
      setUserContext(ctx);
      setSaved(true);
      setSaveError(null);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("SAVE_FAILED — Please try again");
    }
  }

  return (
    <AppShell userContext={userContext}>
      <div className="p-8">
        <div className="mb-6 max-w-lg">
          <div className="font-mono text-lg font-bold text-white">
            SETTINGS<span className="animate-pulse text-neon">_</span>
          </div>
          <div className="mt-1 font-mono text-xs text-zinc-600">Update your profile settings</div>
        </div>
        <div className="flex max-w-lg flex-col gap-6">
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">USER_TYPE //</div>
            <StepType selected={type} onSelect={setType} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">AUDIENCE_SIZE //</div>
            <StepLevel selected={level} onSelect={setLevel} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">CURRENT_STAGE //</div>
            <StepStage selected={stage} onSelect={setStage} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">YOUR_NICHE //</div>
            <StepNiche value={niche} onChange={setNiche} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">NOTIFICATIONS //</div>
            <button
              onClick={() => setReminderEmail((v) => !v)}
              className={`flex min-h-[44px] w-full items-center justify-between rounded border px-4 py-3 font-mono text-sm transition-colors ${
                reminderEmail
                  ? "border-neon bg-neon/10 text-neon"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
              }`}
            >
              <span>{reminderEmail ? "▶ " : "  "}REMINDER_EMAIL</span>
              <span className="text-xs opacity-60">{reminderEmail ? "ON" : "OFF"}</span>
            </button>
          </div>
          <div>
            {saved && (
              <div className="mb-3 font-mono text-xs tracking-widest text-neon">SETTINGS_SAVED ✓</div>
            )}
            {saveError && (
              <div className="mb-3 font-mono text-xs text-red-400">{saveError}</div>
            )}
            <Button onClick={handleSave} disabled={!type || !level || !stage || !niche.trim()} className="w-full">
              SAVE →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
