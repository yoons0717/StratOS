import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import DashboardPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: vi.fn().mockReturnValue("/"),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

const session = {
  id: "s1",
  createdAt: Date.now(),
  input: "test",
  action: {
    title: "팔로워 DM 보내기",
    category: "outreach" as const,
    steps: [{ order: 1, description: "DM 발송" }],
    magicCopy: "안녕하세요!",
  },
  completed: false,
};

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: ctx, sessions: [] });
});

describe("DashboardPage", () => {
  it("redirects to /onboarding when no userContext", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<DashboardPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("renders KPI bar", () => {
    render(<DashboardPage />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("renders Sidebar", () => {
    render(<DashboardPage />);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("shows empty state in list panel when no active sessions", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/액션이 없어/i)).toBeInTheDocument();
  });

  it("shows active session titles in list", () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
  });

  it("clicking a session shows it in the detail panel", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    expect(screen.getByText("DM 발송")).toBeInTheDocument();
  });

  it("COMPLETE removes session from list", async () => {
    useStratosStore.setState({ userContext: ctx, sessions: [session] });
    render(<DashboardPage />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(screen.queryByText("팔로워 DM 보내기")).not.toBeInTheDocument();
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
  });
});
