import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAction } from "./api";
import type { UserContext, GeneratedAction } from "@/types";

const mockContext: UserContext = {
  type: "creator",
  level: "0-1K",
  businessStage: "idea",
};

const mockAction: GeneratedAction = {
  title: "팔로워 10명에게 DM 보내기",
  category: "outreach",
  steps: [
    { order: 1, description: "최근 좋아요 누른 팔로워 10명 추출" },
    { order: 2, description: "DM 초안 작성 후 발송" },
  ],
  magicCopy: "안녕하세요! 최근 콘텐츠 보셨나요?",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("generateAction", () => {
  it("calls /api/generate-action with input and userContext", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockAction), { status: 200 })
    );

    await generateAction("인스타 반응 없음", mockContext);

    expect(fetch).toHaveBeenCalledWith("/api/generate-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "인스타 반응 없음", userContext: mockContext }),
    });
  });

  it("returns parsed GeneratedAction on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockAction), { status: 200 })
    );

    const result = await generateAction("인스타 반응 없음", mockContext);
    expect(result).toEqual(mockAction);
  });

  it("throws an error when the API returns non-ok status", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 })
    );

    await expect(generateAction("", mockContext)).rejects.toThrow();
  });
});
