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
import type { UserType, UserLevel, BusinessStage } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { userContext, setUserContext } = useStratosStore();
  const [type, setType] = useState<UserType | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [stage, setStage] = useState<BusinessStage | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchUserContext().then((ctx) => {
      if (!ctx) { router.push("/onboarding"); return; }
      setUserContext(ctx);
      setType(ctx.type);
      setLevel(ctx.level);
      setStage(ctx.businessStage);
    });
  }, [router, setUserContext]);

  if (!userContext) return null;

  async function handleSave() {
    if (!type || !level || !stage) return;
    const ctx = { type, level, businessStage: stage };
    await saveUserContext(ctx);
    setUserContext(ctx);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            {saved && (
              <div className="mb-3 font-mono text-xs tracking-widest text-neon">SETTINGS_SAVED ✓</div>
            )}
            <Button onClick={handleSave} disabled={!type || !level || !stage} className="w-full">
              SAVE →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
