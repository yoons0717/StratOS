import type { ReactNode } from "react";
import type { UserContext } from "@/types";
import type { KpiData } from "@/lib/kpi";
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
    <div className="flex min-h-screen bg-background">
      <ScanlineOverlay />
      <Sidebar userContext={userContext} />
      <div className="flex min-h-0 flex-1 flex-col">
        {kpiData && <KpiBar data={kpiData} />}
        {children}
      </div>
    </div>
  );
}
