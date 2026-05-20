import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import { defaultCtx, makeSession } from "@/tests/fixtures";
import StatsPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockFetchSessions = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: vi.fn().mockReturnValue("/stats"),
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

beforeEach(() => {
  pushMock.mockClear();
  mockFetchUserContext.mockResolvedValue(defaultCtx);
  mockFetchSessions.mockResolvedValue([]);
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("StatsPage", () => {
  it("redirects to /onboarding when no userContext", async () => {
    mockFetchUserContext.mockResolvedValue(null);
    render(<StatsPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding"));
  });

  it("renders stat card labels", async () => {
    render(<StatsPage />);
    expect(await screen.findByText("현재 스트릭")).toBeInTheDocument();
    expect(screen.getByText("최장 스트릭")).toBeInTheDocument();
    expect(screen.getByText("총 완료")).toBeInTheDocument();
    expect(screen.getByText("완료율")).toBeInTheDocument();
  });

  it("renders channel and category sections", async () => {
    render(<StatsPage />);
    expect(await screen.findByText("채널별 분포")).toBeInTheDocument();
    expect(screen.getByText("카테고리별 분포")).toBeInTheDocument();
  });

  it("shows zero stat values when no sessions", async () => {
    render(<StatsPage />);
    await screen.findByText("현재 스트릭");
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it("shows correct streak from sessions", async () => {
    const sessions = [
      makeSession({ completed: true, created_at: new Date().toISOString() }),
    ];
    mockFetchSessions.mockResolvedValue(sessions);
    render(<StatsPage />);
    await screen.findByText("현재 스트릭");
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });
});
