import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionDetailPanel from "./ActionDetailPanel";
import type { ActionSession } from "@/types";

const session: ActionSession = {
  id: "s1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "팔로워 DM 보내기",
    category: "outreach",
    steps: [
      { order: 1, description: "대상 선별" },
      { order: 2, description: "메시지 작성" },
    ],
    magicCopy: "안녕하세요!",
  },
  completed: false,
};

describe("ActionDetailPanel", () => {
  it("shows empty state when session is null", () => {
    render(<ActionDetailPanel session={null} allSessions={[]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText(/액션을 선택하거나/i)).toBeInTheDocument();
  });

  it("renders action title and category", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getAllByText("OUTREACH").length).toBeGreaterThan(0);
  });

  it("renders all steps", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("대상 선별")).toBeInTheDocument();
    expect(screen.getByText("메시지 작성")).toBeInTheDocument();
  });

  it("renders magic copy text", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} />);
    expect(screen.getByText("안녕하세요!")).toBeInTheDocument();
  });

  it("calls onComplete with id when COMPLETE is clicked", async () => {
    const onComplete = vi.fn();
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={onComplete} onDeselect={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(onComplete).toHaveBeenCalledWith("s1");
  });

  it("calls onDeselect when NEW button is clicked", async () => {
    const onDeselect = vi.fn();
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={onDeselect} />);
    await userEvent.click(screen.getByRole("button", { name: /NEW/i }));
    expect(onDeselect).toHaveBeenCalled();
  });

  it("hides COMPLETE button when readonly", () => {
    render(<ActionDetailPanel session={session} allSessions={[session]} onComplete={vi.fn()} onDeselect={vi.fn()} readonly />);
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });
});
