import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

export default function LoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <ScanlineOverlay />
      <p className="animate-pulse font-mono text-xs tracking-widest text-neon">LOADING...</p>
    </main>
  );
}
