import Link from "next/link";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

const FEATURES = [
  { cmd: "INPUT_CONTEXT", desc: "크리에이터 유형, 팔로워 규모, 사업 단계 입력" },
  { cmd: "GET_ACTION", desc: "AI가 오늘 실행 가능한 액션 1개를 3단계로 반환" },
  { cmd: "MAGIC_COPY", desc: "채널별 바로 쓸 수 있는 문구 자동 생성" },
  { cmd: "TRACK_STREAK", desc: "완료 기록과 스트릭으로 실행력 추적" },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <ScanlineOverlay />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-between px-4 py-10">
        <div>
          <p className="mb-4 font-mono text-xs tracking-widest text-neon">STRATOS</p>
          <h1 className="mb-2 font-mono text-3xl font-bold text-white leading-tight">
            오늘 하나,<br />실행하세요._
          </h1>
          <p className="mb-10 font-mono text-sm text-zinc-500">
            솔로 크리에이터를 위한 AI 실행 OS.
            <br />막힌 상황을 입력하면 지금 당장 할 수 있는 액션을 돌려줍니다.
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
            EXECUTE → 시작하기
          </Link>
        </div>
      </div>
    </main>
  );
}
