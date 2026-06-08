"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("비밀번호가 올바르지 않습니다.");
        return;
      }
      router.push("/admin");
    } catch (error) {
      console.error(error);
      setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <ScanlineOverlay />
      <div className="flex w-full max-w-xs flex-col items-center gap-6 px-4">
        <div className="font-mono text-xs tracking-widest text-neon">STRATOS</div>
        <h1 className="font-mono text-xl font-bold text-white">ADMIN_ACCESS._</h1>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full rounded border border-zinc-800 bg-transparent px-4 py-3 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-600"
          />
          {error && <p className="font-mono text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded border border-neon px-6 py-3 font-mono text-sm text-neon transition-colors hover:bg-neon/10 disabled:opacity-40"
          >
            {loading ? "..." : "ENTER →"}
          </button>
        </form>
      </div>
    </main>
  );
}
