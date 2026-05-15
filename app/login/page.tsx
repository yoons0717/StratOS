"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <ScanlineOverlay />
      <div className="flex flex-col items-center gap-6">
        <div className="font-mono text-xs tracking-widest text-neon">
          STRATOS_OS
        </div>
        <h1 className="font-mono text-2xl font-bold text-white">EXECUTE._</h1>
        <p className="font-mono text-xs text-zinc-600">
          Start executing. One action today.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="rounded border border-zinc-700 px-6 py-3 font-mono text-sm text-zinc-300 transition-colors hover:border-neon hover:text-neon"
        >
          SIGN IN WITH GOOGLE →
        </button>
      </div>
    </main>
  );
}
