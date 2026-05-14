"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStratosStore } from "@/store";
import PageLayout from "@/components/ui/PageLayout";

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { userContext, sessions } = useStratosStore();

  useEffect(() => {
    if (!userContext) router.push("/onboarding");
  }, [userContext, router]);

  if (!userContext) return null;

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
          HISTORY
          <span className="animate-pulse text-neon">_</span>
        </div>
        <div className="mt-1 font-mono text-xs text-zinc-600">
          지난 액션 기록
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="font-mono text-xs tracking-widest text-zinc-600">
            NO_HISTORY
          </div>
          <div className="font-mono text-xs text-zinc-700">
            첫 액션을 실행해봐
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded border border-zinc-800 bg-surface px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-sm text-white">
                  {session.action.title}
                </span>
                {session.completed && (
                  <span className="shrink-0 rounded border border-neon/40 px-1.5 py-0.5 font-mono text-xs text-neon">
                    DONE
                  </span>
                )}
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-600">
                {formatRelativeTime(session.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
