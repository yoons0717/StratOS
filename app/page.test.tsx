import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
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

vi.mock("@/components/dashboard/FirstRunGuide", () => ({
  default: ({ onBegin }: { onBegin?: () => void }) => (
    <div>
      <span>STRATOS_OS v1.0</span>
      {onBegin && <button onClick={onBegin}>[ + NEW ACTION ]</button>}
    </div>
  ),
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
  localStorage.clear();
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
    expect(await screen.findByText("StratOS")).toBeInTheDocument();
  });

  it("shows empty state in list panel when no active sessions", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    render(<DashboardPage />);
    expect(await screen.findByText(/No actions yet/i)).toBeInTheDocument();
  });

  it("shows FirstRunGuide on first visit with no sessions", async () => {
    render(<DashboardPage />);
    expect(await screen.findByText(/STRATOS_OS v1.0/i)).toBeInTheDocument();
  });

  it("does not show FirstRunGuide when already seen", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    render(<DashboardPage />);
    await screen.findByText("StratOS");
    expect(screen.queryByText(/STRATOS_OS v1.0/i)).not.toBeInTheDocument();
  });

  it("shows active session titles in list", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    expect(await screen.findByRole("button", { name: /팔로워 DM 보내기/ })).toBeInTheDocument();
  });

  it("clicking a session shows it in the detail panel", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: /팔로워 DM 보내기/ }));
    expect(screen.getByText("DM 발송")).toBeInTheDocument();
  });

  it("COMPLETE removes session from list and shows feedback", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    mockFetchSessions.mockResolvedValue([session]);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: /팔로워 DM 보내기/ }));
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(screen.queryByRole("button", { name: /팔로워 DM 보내기/ })).not.toBeInTheDocument();
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
    expect(screen.getByText(/ACTION_COMPLETE/)).toBeInTheDocument();
  });

  it("FirstRunGuide overlay: ESC dismisses without opening modal", async () => {
    render(<DashboardPage />);
    await screen.findByText(/STRATOS_OS v1\.0/i);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByText(/STRATOS_OS v1\.0/i)).not.toBeInTheDocument());
    expect(screen.queryByText(/SITUATION \/\//i)).not.toBeInTheDocument();
  });

  it("FirstRunGuide overlay: backdrop click dismisses without opening modal", async () => {
    render(<DashboardPage />);
    await screen.findByText(/STRATOS_OS v1\.0/i);
    await userEvent.click(screen.getByTestId("firstrun-backdrop"));
    await waitFor(() => expect(screen.queryByText(/STRATOS_OS v1\.0/i)).not.toBeInTheDocument());
    expect(screen.queryByText(/SITUATION \/\//i)).not.toBeInTheDocument();
  });

  it("FirstRunGuide overlay: clicking + NEW ACTION opens modal", async () => {
    render(<DashboardPage />);
    const backdrop = await screen.findByTestId("firstrun-backdrop");
    await waitFor(() => within(backdrop).getByRole("button", { name: /\+ NEW ACTION/i }));
    await userEvent.click(within(backdrop).getByRole("button", { name: /\+ NEW ACTION/i }));
    expect(await screen.findByText(/SITUATION \/\//i)).toBeInTheDocument();
  });

  it("RETRY calls regenerateSession and updates action in store", async () => {
    localStorage.setItem("stratos_welcome_seen", "1");
    const updatedSession = { ...session, action: { ...session.action, title: "New Action" } };
    mockFetchSessions.mockResolvedValue([session]);
    mockRegenerateSession.mockResolvedValue(updatedSession);
    render(<DashboardPage />);
    await userEvent.click(await screen.findByRole("button", { name: /팔로워 DM 보내기/ }));
    await userEvent.click(screen.getByRole("button", { name: /REROLL/i }));
    await waitFor(() =>
      expect(useStratosStore.getState().sessions[0].action.title).toBe("New Action")
    );
  });
});
