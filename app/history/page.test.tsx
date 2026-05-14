import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import HistoryPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: vi.fn().mockReturnValue("/history"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

const completedSession = {
  id: "done-1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "완료된 액션",
    category: "content" as const,
    steps: [{ order: 1, description: "완료 스텝" }],
    magicCopy: "완료 copy",
  },
  completed: true,
};

const activeSession = {
  ...completedSession,
  id: "active-1",
  action: { ...completedSession.action, title: "진행 중 액션" },
  completed: false,
};

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: ctx, sessions: [] });
});

describe("HistoryPage", () => {
  it("redirects to /onboarding when no userContext", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<HistoryPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("shows empty state when no completed sessions", () => {
    render(<HistoryPage />);
    expect(screen.getByText("완료된 액션 없음")).toBeInTheDocument();
  });

  it("renders only completed sessions", () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession, activeSession] });
    render(<HistoryPage />);
    expect(screen.getByText("완료된 액션")).toBeInTheDocument();
    expect(screen.queryByText("진행 중 액션")).not.toBeInTheDocument();
  });

  it("clicking a session shows detail", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession] });
    render(<HistoryPage />);
    await userEvent.click(screen.getByText("완료된 액션"));
    expect(screen.getByText("완료 스텝")).toBeInTheDocument();
  });

  it("detail panel has no COMPLETE button in history (readonly)", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [completedSession] });
    render(<HistoryPage />);
    await userEvent.click(screen.getByText("완료된 액션"));
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });

  it("renders KPI bar", () => {
    render(<HistoryPage />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });
});
