import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import { useInitStore } from "./hooks";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockFetchSessions = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/lib/api", () => ({
  fetchUserContext: mockFetchUserContext,
  fetchSessions: mockFetchSessions,
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

beforeEach(() => {
  pushMock.mockClear();
  mockFetchSessions.mockResolvedValue([]);
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("useInitStore", () => {
  it("redirects to /onboarding when userContext is null", async () => {
    mockFetchUserContext.mockResolvedValue(null);
    renderHook(() => useInitStore());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding"));
  });

  it("sets isLoading false and initError false on success", async () => {
    mockFetchUserContext.mockResolvedValue({ id: "u1" });
    const { result } = renderHook(() => useInitStore());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.initError).toBe(false);
  });

  it("sets initError true and isLoading false when fetch throws", async () => {
    mockFetchUserContext.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useInitStore());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.initError).toBe(true);
  });
});
