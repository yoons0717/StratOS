import type { ReactNode } from "react";
import ScanlineOverlay from "./ScanlineOverlay";

interface Props {
  children: ReactNode;
  headerRight?: ReactNode;
}

export default function PageLayout({ children, headerRight }: Props) {
  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-neon">STRATOS_OS</span>
          {headerRight}
        </div>
        {children}
      </div>
    </main>
  );
}
