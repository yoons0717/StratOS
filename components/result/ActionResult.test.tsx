import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionResult from "./ActionResult";
import type { GeneratedAction } from "@/types";

const mockAction: GeneratedAction = {
  title: "팔로워 10명에게 DM 보내기",
  category: "outreach",
  steps: [
    { order: 1, description: "최근 좋아요 누른 팔로워 10명 추출" },
    { order: 2, description: "DM 초안 작성 후 발송" },
  ],
  magicCopy: "안녕하세요! 최근 콘텐츠 보셨나요?",
};

describe("ActionResult", () => {
  it("renders the action title", () => {
    render(<ActionResult action={mockAction}onComplete={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText("팔로워 10명에게 DM 보내기")).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<ActionResult action={mockAction}onComplete={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<ActionResult action={mockAction}onComplete={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText("최근 좋아요 누른 팔로워 10명 추출")).toBeInTheDocument();
    expect(screen.getByText("DM 초안 작성 후 발송")).toBeInTheDocument();
  });

  it("renders the magic copy text", () => {
    render(<ActionResult action={mockAction}onComplete={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText("안녕하세요! 최근 콘텐츠 보셨나요?")).toBeInTheDocument();
  });

  it("calls onComplete when complete button is clicked", async () => {
    const onComplete = vi.fn();
    render(<ActionResult action={mockAction}onComplete={onComplete} onReset={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(onComplete).toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", async () => {
    const onReset = vi.fn();
    render(<ActionResult action={mockAction}onComplete={vi.fn()} onReset={onReset} />);
    await userEvent.click(screen.getByRole("button", { name: /NEW/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
