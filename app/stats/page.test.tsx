import { render, screen, waitFor, within } from "@testing-library/react";
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

  it("shows zero stat values when no sessions", async () => {
    render(<StatsPage />);
    await screen.findByText("Current Streak");
    const card = (label: string) => screen.getByText(label).closest("div")!;
    expect(within(card("Current Streak")).getByText("0")).toBeInTheDocument();
    expect(within(card("Longest Streak")).getByText("0")).toBeInTheDocument();
    expect(within(card("Total Done")).getByText("0")).toBeInTheDocument();
    expect(within(card("Completion Rate")).getByText("0%")).toBeInTheDocument();
  });

  it("shows correct stat values from sessions", async () => {
    const sessions = [
      makeSession({ completed: true, created_at: new Date().toISOString() }),
    ];
    mockFetchSessions.mockResolvedValue(sessions);
    render(<StatsPage />);
    await screen.findByText("Current Streak");
    const card = (label: string) => screen.getByText(label).closest("div")!;
    expect(within(card("Current Streak")).getByText("1")).toBeInTheDocument();
    expect(within(card("Longest Streak")).getByText("1")).toBeInTheDocument();
    expect(within(card("Total Done")).getByText("1")).toBeInTheDocument();
    expect(within(card("Completion Rate")).getByText("100%")).toBeInTheDocument();
  });
});
