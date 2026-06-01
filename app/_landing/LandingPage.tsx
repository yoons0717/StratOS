import Link from "next/link";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

const FEATURES = [
  { cmd: "INPUT_CONTEXT", desc: "Set your creator type, audience size, stage, and niche" },
  { cmd: "GET_ACTION", desc: "AI returns one executable action in up to 3 steps" },
  { cmd: "MAGIC_COPY", desc: "Auto-generates ready-to-post copy for each channel" },
  { cmd: "TRACK_STREAK", desc: "Track completions and streaks to build execution habits" },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-between px-4 py-10">
        <div>
          <p className="mb-4 font-mono text-xs tracking-widest text-neon">STRATOS</p>
          <h1 className="mb-2 font-mono text-3xl font-bold text-white leading-tight">
            One action.<br />Execute today._
          </h1>
          <p className="mb-10 font-mono text-sm text-zinc-500">
            AI execution OS for solo creators.
            <br />Input your situation. Get one action you can do right now.
          </p>

          <div className="flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f.cmd} className="rounded border border-zinc-800 px-4 py-3">
                <p className="font-mono text-xs text-neon">{f.cmd}</p>
                <p className="mt-0.5 font-mono text-xs text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/login"
            className="block w-full rounded border border-neon py-3 text-center font-mono text-sm text-neon transition-colors hover:bg-neon/10"
          >
            EXECUTE → Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
