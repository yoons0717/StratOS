import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import { defaultCtx } from "@/tests/fixtures";
import HistoryPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockFetchSessions = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: vi.fn().mockReturnValue("/history"),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

vi.mock("@/lib/api", () => ({
  fetchUserContext: mockFetchUserContext,
  fetchSessions: mockFetchSessions,
}));

const completedSession = {
  id: "done-1",
  created_at: new Date().toISOString(),
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
  mockFetchUserContext.mockResolvedValue(defaultCtx);
  mockFetchSessions.mockResolvedValue([]);
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("HistoryPage", () => {
  it("redirects to /onboarding when no userContext", async () => {
    mockFetchUserContext.mockResolvedValue(null);
    render(<HistoryPage />);
    await screen.findByText(/No completed actions/i).catch(() => {});
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("shows empty state when no completed sessions", async () => {
    render(<HistoryPage />);
    expect(await screen.findByText("No completed actions")).toBeInTheDocument();
  });

  it("renders only completed sessions", async () => {
    mockFetchSessions.mockResolvedValue([completedSession, activeSession]);
    render(<HistoryPage />);
    expect(await screen.findByText("완료된 액션")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "진행 중 액션" })).not.toBeInTheDocument();
  });

  it("clicking a session shows detail", async () => {
    mockFetchSessions.mockResolvedValue([completedSession]);
    render(<HistoryPage />);
    await userEvent.click(await screen.findByRole("button", { name: "완료된 액션" }));
    expect(screen.getByText("완료 스텝")).toBeInTheDocument();
  });

  it("detail panel has no COMPLETE button in history (readonly)", async () => {
    mockFetchSessions.mockResolvedValue([completedSession]);
    render(<HistoryPage />);
    await userEvent.click(await screen.findByRole("button", { name: "완료된 액션" }));
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });

  it("renders KPI bar", async () => {
    render(<HistoryPage />);
    expect(await screen.findByText("TOTAL")).toBeInTheDocument();
  });
});
