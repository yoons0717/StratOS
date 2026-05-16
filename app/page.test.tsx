import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import { defaultCtx, makeSession } from "@/tests/fixtures";
import DashboardPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockFetchSessions = vi.hoisted(() => vi.fn());
const mockCompleteSession = vi.hoisted(() => vi.fn());
const mockRegenerateSession = vi.hoisted(() => vi.fn());

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
  regenerateSession: mockRegenerateSession,
}));

const session = makeSession({
  id: "s1",
  action: { title: "팔로워 DM 보내기", steps: [{ order: 1, description: "DM 발송" }], magicCopy: "안녕하세요!" },
});

beforeEach(() => {
  pushMock.mockClear();
  mockFetchUserContext.mockResolvedValue(defaultCtx);
  mockFetchSessions.mockResolvedValue([]);
  mockCompleteSession.mockResolvedValue(undefined);
  mockRegenerateSession.mockResolvedValue(undefined);
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

  it("COMPLETE removes session from list and shows feedback", async () => {
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: "팔로워 DM 보내기" }));
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(screen.queryByRole("button", { name: "팔로워 DM 보내기" })).not.toBeInTheDocument();
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
    expect(screen.getByText(/ACTION_COMPLETE/)).toBeInTheDocument();
  });

  it("RETRY calls regenerateSession and updates action in store", async () => {
    const updatedSession = { ...session, action: { ...session.action, title: "New Action" } };
    mockFetchSessions.mockResolvedValue([session]);
    mockRegenerateSession.mockResolvedValue(updatedSession);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: "팔로워 DM 보내기" }));
    await userEvent.click(screen.getByRole("button", { name: /REROLL/i }));
    await waitFor(() =>
      expect(useStratosStore.getState().sessions[0].action.title).toBe("New Action")
    );
  });
});
