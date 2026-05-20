"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStratosStore } from "@/store";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserContext } from "@/types";

interface Props {
  userContext: UserContext;
}

const NAV = [
  { href: "/", label: "DASHBOARD" },
  { href: "/history", label: "HISTORY" },
  { href: "/stats", label: "STATS" },
  { href: "/settings", label: "SETTINGS" },
] as const;

export default function Sidebar({ userContext }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUserContext, setSessions } = useStratosStore();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserContext(null);
    setSessions([]);
    router.push("/login");
  }
  return (
    <aside className="flex w-40 shrink-0 flex-col border-r border-zinc-800 bg-surface px-3 py-5">
      <div className="mb-5 font-mono text-xs tracking-widest text-neon">STRATOS_OS</div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded px-2 py-1.5 font-mono text-xs transition-colors ${
              pathname === href
                ? "bg-neon/10 text-neon"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {pathname === href ? "▸ " : "  "}{label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-zinc-800 pt-3">
        <div className="font-mono text-xs text-zinc-700">
          {userContext.type.toUpperCase()}
        </div>
        <div className="font-mono text-xs text-zinc-700">
          {userContext.level} · {userContext.businessStage.toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full text-left font-mono text-xs text-zinc-700 transition-colors hover:text-red-500"
        >
          LOGOUT →
        </button>
      </div>
    </aside>
  );
}
