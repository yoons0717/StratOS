"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import type { Channel } from "@/types";

interface Props {
  onSubmit: (input: string, channel: Channel) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const CHANNELS: { value: Channel; label: string }[] = [
  { value: "general", label: "일반" },
  { value: "instagram-dm", label: "인스타 DM" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "naver-blog", label: "네이버 블로그" },
  { value: "youtube", label: "유튜브" },
];

const GUIDE: Record<Channel, string> = {
  general: "현재 수치(팔로워·매출 등) + 하고 있는 것 + 원하는 결과를 함께 적으면 더 정확한 액션이 나와요.",
  "instagram-dm": "누구에게, 어떤 목적으로 DM을 보낼지 적어주세요. 타겟의 특징도 알려주면 좋아요.",
  linkedin: "타겟 직군·업종과 원하는 행동(연결 수락·답장·미팅)을 포함해주세요.",
  "naver-blog": "블로그 주제, 현재 방문자 상황, 원하는 전환(문의·구매·구독)을 적어주세요.",
  youtube: "채널 주제, 현재 조회수·구독자 상황, 시청자에게 원하는 행동을 함께 적어주세요.",
};

const PLACEHOLDER: Record<Channel, string> = {
  general: "e.g. 인스타 팔로워 800명인데 구매 문의가 없어요. 주 3회 홈트레이닝 콘텐츠 올리는 중이고, 1:1 PT 프로그램 팔고 싶어요.",
  "instagram-dm": "e.g. 팔로워한테 DM 보내서 무료 상담 유도하고 싶은데, 어떻게 시작해야 할지 모르겠어요.",
  linkedin: "e.g. B2B 잠재 고객한테 콜드 아웃리치 하고 싶은데 연결 요청 메시지를 어떻게 써야 할지 막막해요.",
  "naver-blog": "e.g. 블로그 방문자는 있는데 실제 문의로 연결이 안 돼요. 글 주제는 다이어트 식단이에요.",
  youtube: "e.g. 조회수는 나오는데 구독자 전환이 안 돼요. 영상 말미에 뭔가 행동을 유도하고 싶어요.",
};

export default function NewActionModal({ onSubmit, onClose, isLoading, error }: Props) {
  const [input, setInput] = useState("");
  const [channel, setChannel] = useState<Channel>("general");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded border border-zinc-800 bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 font-mono text-xs tracking-widest text-zinc-600">
          NEW_ACTION //
        </div>

        <div className="mb-1 font-mono text-xs tracking-widest text-zinc-600">CHANNEL //</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              data-selected={channel === ch.value ? "true" : "false"}
              onClick={() => setChannel(ch.value)}
              disabled={isLoading}
              className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
                channel === ch.value
                  ? "border-neon text-neon"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div className="mb-1 font-mono text-xs tracking-widest text-zinc-600">SITUATION //</div>
        <p className="mb-2 font-mono text-xs text-zinc-500">{GUIDE[channel]}</p>
        <textarea
          className="w-full rounded border border-zinc-800 bg-background px-3 py-2 font-mono text-sm text-zinc-300 focus:border-neon focus:outline-none"
          rows={4}
          placeholder={PLACEHOLDER[channel]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        {error && (
          <div className="mt-2 font-mono text-xs text-red-500">{error}</div>
        )}
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isLoading}>
            CANCEL
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSubmit(input, channel)}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "ANALYZING..." : "EXECUTE →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
