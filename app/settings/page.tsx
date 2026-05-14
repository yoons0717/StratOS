"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStratosStore } from "@/store";
import StepType from "@/components/onboarding/StepType";
import StepLevel from "@/components/onboarding/StepLevel";
import StepStage from "@/components/onboarding/StepStage";
import PageLayout from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";
import type { UserType, UserLevel, BusinessStage } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { userContext, setUserContext } = useStratosStore();

  const [type, setType] = useState<UserType | null>(userContext?.type ?? null);
  const [level, setLevel] = useState<UserLevel | null>(userContext?.level ?? null);
  const [stage, setStage] = useState<BusinessStage | null>(userContext?.businessStage ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

  function handleSave() {
    if (!type || !level || !stage) return;
    setUserContext({ type, level, businessStage: stage });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const headerRight = (
    <Link
      href="/"
      className="font-mono text-xs text-zinc-500 transition-colors hover:text-white"
    >
      ← BACK
    </Link>
  );

  return (
    <PageLayout headerRight={headerRight}>
      <div className="mb-6">
        <div className="font-mono text-lg font-bold text-white">
          SETTINGS
          <span className="animate-pulse text-neon">_</span>
        </div>
        <div className="mt-1 font-mono text-xs text-zinc-600">
          프로필 설정을 변경해줘
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">
            USER_TYPE //
          </div>
          <StepType selected={type} onSelect={setType} />
        </div>

        <div>
          <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">
            AUDIENCE_SIZE //
          </div>
          <StepLevel selected={level} onSelect={setLevel} />
        </div>

        <div>
          <div className="mb-2 font-mono text-xs tracking-widest text-zinc-600">
            CURRENT_STAGE //
          </div>
          <StepStage selected={stage} onSelect={setStage} />
        </div>
      </div>

      <div className="mt-8">
        {saved && (
          <div className="mb-3 text-center font-mono text-xs tracking-widest text-neon">
            SETTINGS_SAVED ✓
          </div>
        )}
        <Button onClick={handleSave} disabled={!type || !level || !stage} className="w-full">
          SAVE →
        </Button>
      </div>
    </PageLayout>
  );
}
