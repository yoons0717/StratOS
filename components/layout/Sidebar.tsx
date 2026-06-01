"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Clock, TrendingUp, Settings, type LucideIcon } from "lucide-react";
import { useStratosStore } from "@/store";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { UserContext } from "@/types";

interface Props {
  userContext: UserContext;
}

const NAV: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: Clock },
  { href: "/stats", label: "Stats", icon: TrendingUp },
];

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 font-mono text-xs tracking-wide transition-colors ${
        active
          ? "bg-zinc-800 text-foreground"
          : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

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
    <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-zinc-800/60 bg-surface px-3 py-5">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="h-2 w-2 rounded-sm bg-neon" />
        <span className="text-sm font-semibold text-foreground">StratOS</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-4">
        <p className="mb-1 px-3 text-xs font-medium uppercase tracking-widest text-zinc-600">
          Account
        </p>
        <NavItem href="/settings" label="Settings" icon={Settings} pathname={pathname} />
      </div>

      <div className="mt-auto border-t border-zinc-800/60 pt-4">
        <div className="mb-3 px-3">
          <p className="text-xs font-medium text-zinc-400">{userContext.niche}</p>
          <p className="text-xs text-zinc-600">
            {userContext.level} · {userContext.type}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-800/50 hover:text-red-400"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
