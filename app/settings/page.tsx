"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { fetchUserContext, saveUserContext } from "@/lib/api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import StepNiche from "@/components/onboarding/StepNiche";
import type { UserType, UserLevel, BusinessStage } from "@/types";

type FormState = {
  type: UserType | null;
  level: UserLevel | null;
  stage: BusinessStage | null;
  niche: string;
  reminderEmail: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const { userContext, setUserContext } = useStratosStore();
  const [form, setForm] = useState<FormState>({
    type: null,
    level: null,
    stage: null,
    niche: "",
    reminderEmail: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isValid = !!(form.type && form.level && form.stage && form.niche.trim());

  useEffect(() => {
    fetchUserContext()
      .then((ctx) => {
        if (!ctx) { router.push("/onboarding"); return; }
        setUserContext(ctx);
        setForm({
          type: ctx.type,
          level: ctx.level,
          stage: ctx.businessStage,
          niche: ctx.niche,
          reminderEmail: ctx.reminderEmail,
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router, setUserContext]);

  if (isLoading || !userContext) return <LoadingScreen />;

  async function handleSave() {
    const { type, level, stage, niche, reminderEmail } = form;
    if (!type || !level || !stage || !niche.trim() || isSaving) return;
    setIsSaving(true);
    const ctx = { type, level, businessStage: stage, niche: niche.trim(), reminderEmail };
    try {
      await saveUserContext(ctx);
      setUserContext(ctx);
      setSaved(true);
      setSaveError(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
      setSaveError("SAVE_FAILED — Please try again");
    } finally {
      setIsSaving(false);
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
            <StepType selected={form.type} onSelect={(v) => setForm((f) => ({ ...f, type: v }))} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">AUDIENCE_SIZE //</div>
            <StepLevel selected={form.level} onSelect={(v) => setForm((f) => ({ ...f, level: v }))} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">CURRENT_STAGE //</div>
            <StepStage selected={form.stage} onSelect={(v) => setForm((f) => ({ ...f, stage: v }))} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">YOUR_NICHE //</div>
            <StepNiche value={form.niche} onChange={(v) => setForm((f) => ({ ...f, niche: v }))} />
          </div>
          <div>
            <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">NOTIFICATIONS //</div>
            <button
              onClick={() => setForm((f) => ({ ...f, reminderEmail: !f.reminderEmail }))}
              className={`flex min-h-[44px] w-full items-center justify-between rounded border px-4 py-3 font-mono text-sm transition-colors ${
                form.reminderEmail
                  ? "border-neon bg-neon/10 text-neon"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
              }`}
            >
              <span>{form.reminderEmail ? "▶ " : "  "}REMINDER_EMAIL</span>
              <span className="text-xs opacity-60">{form.reminderEmail ? "ON" : "OFF"}</span>
            </button>
          </div>
          <div>
            {saved && (
              <div className="mb-3 font-mono text-xs tracking-widest text-neon">SETTINGS_SAVED ✓</div>
            )}
            {saveError && (
              <div className="mb-3 font-mono text-xs text-red-400">{saveError}</div>
            )}
            <Button onClick={handleSave} disabled={!isValid || isSaving} className="w-full">
              SAVE →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
