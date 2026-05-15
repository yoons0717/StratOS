import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import DashboardPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockFetchSessions = vi.hoisted(() => vi.fn());
const mockCompleteSession = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: vi.fn().mockReturnValue("/"),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

vi.mock("@/lib/api", () => ({
  fetchUserContext: mockFetchUserContext,
  fetchSessions: mockFetchSessions,
  createSession: vi.fn(),
  completeSession: mockCompleteSession,
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };

const session = {
  id: "s1",
  created_at: new Date().toISOString(),
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
  mockFetchUserContext.mockResolvedValue(ctx);
  mockFetchSessions.mockResolvedValue([]);
  mockCompleteSession.mockResolvedValue(undefined);
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("DashboardPage", () => {
  it("redirects to /onboarding when no userContext", async () => {
    mockFetchUserContext.mockResolvedValue(null);
    render(<DashboardPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding"));
  });

  it("renders KPI bar", async () => {
    render(<DashboardPage />);
    expect(await screen.findByText("TOTAL")).toBeInTheDocument();
  });

  it("renders Sidebar", async () => {
    render(<DashboardPage />);
    expect(await screen.findByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("shows empty state in list panel when no active sessions", async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/No actions yet/i)).toBeInTheDocument();
  });

  it("shows active session titles in list", async () => {
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    expect(await screen.findByRole("button", { name: "팔로워 DM 보내기" })).toBeInTheDocument();
  });

  it("clicking a session shows it in the detail panel", async () => {
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: "팔로워 DM 보내기" }));
    expect(screen.getByText("DM 발송")).toBeInTheDocument();
  });

  it("COMPLETE removes session from list", async () => {
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: "팔로워 DM 보내기" }));
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(screen.queryByRole("button", { name: "팔로워 DM 보내기" })).not.toBeInTheDocument();
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
  });
});
