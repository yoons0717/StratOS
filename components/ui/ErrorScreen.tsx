import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

export default function ErrorScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <ScanlineOverlay />
      <p className="font-mono text-xs tracking-widest text-red-400">LOAD_FAILED — Please refresh</p>
    </main>
  );
}
