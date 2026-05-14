"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStratosStore } from "@/store";

export default function Home() {
  const router = useRouter();
  const userContext = useStratosStore((s) => s.userContext);

  useEffect(() => {
    if (!userContext) {
      router.push("/onboarding");
    }
  }, [userContext, router]);

  if (!userContext) return null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0f] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <h1 className="font-mono text-2xl font-bold text-[#00ffb4]">STRATOS_OS</h1>
      <p className="mt-2 font-mono text-xs text-zinc-600">오늘 행동 1개</p>
    </main>
  );
}
