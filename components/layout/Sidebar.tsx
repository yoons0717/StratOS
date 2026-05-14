"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserContext } from "@/types";

interface Props {
  userContext: UserContext;
}

const NAV = [
  { href: "/", label: "DASHBOARD" },
  { href: "/history", label: "HISTORY" },
  { href: "/settings", label: "SETTINGS" },
] as const;

export default function Sidebar({ userContext }: Props) {
  const pathname = usePathname();
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
      </div>
    </aside>
  );
}
