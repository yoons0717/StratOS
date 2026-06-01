import type { ReactNode } from "react";
import type { UserContext } from "@/types";
import type { KpiData } from "@/lib/analytics/kpi";
import Sidebar from "./Sidebar";
import KpiBar from "./KpiBar";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

interface Props {
  userContext: UserContext;
  kpiData?: KpiData;
  children: ReactNode;
}

export default function AppShell({ userContext, kpiData, children }: Props) {
  return (
    <div className="flex h-screen bg-background">
      <ScanlineOverlay />
      <Sidebar userContext={userContext} />
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-800/60 px-6">
          <span className="text-sm text-zinc-300">{userContext.niche}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-600">{userContext.level} / {userContext.type}</span>
        </div>
        <div className="flex flex-1 min-h-0 w-full max-w-5xl flex-col mx-auto">
          {kpiData && <KpiBar data={kpiData} />}
          {children}
        </div>
      </div>
    </div>
  );
}
