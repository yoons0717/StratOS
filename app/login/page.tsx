"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <ScanlineOverlay />
      <div className="flex w-full max-w-xs flex-col items-center gap-6 px-4">
        <div className="font-mono text-xs tracking-widest text-neon">STRATOS</div>
        <h1 className="font-mono text-2xl font-bold text-white">EXECUTE._</h1>
        <p className="font-mono text-xs text-zinc-600">Start executing. One action today.</p>

        <form onSubmit={handleEmailLogin} className="flex w-full flex-col gap-3">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-zinc-800 bg-transparent px-4 py-3 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-zinc-800 bg-transparent px-4 py-3 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-600"
          />
          {error && <p className="font-mono text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded border border-neon px-6 py-3 font-mono text-sm text-neon transition-colors hover:bg-neon/10 disabled:opacity-40"
          >
            {loading ? "..." : "SIGN IN →"}
          </button>
        </form>

        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="font-mono text-xs text-zinc-700">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded border border-zinc-700 px-6 py-3 font-mono text-sm text-zinc-300 transition-colors hover:border-neon hover:text-neon"
        >
          SIGN IN WITH GOOGLE →
        </button>
      </div>
    </main>
  );
}
