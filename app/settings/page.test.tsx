import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import { defaultCtx } from "@/tests/fixtures";
import SettingsPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));
const mockFetchUserContext = vi.hoisted(() => vi.fn());
const mockSaveUserContext = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: vi.fn().mockReturnValue("/settings"),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

vi.mock("@/lib/api", () => ({
  fetchUserContext: mockFetchUserContext,
  saveUserContext: mockSaveUserContext,
}));

beforeEach(() => {
  pushMock.mockClear();
  mockFetchUserContext.mockResolvedValue(defaultCtx);
  mockSaveUserContext.mockResolvedValue(undefined);
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("SettingsPage", () => {
  it("redirects to /onboarding when no userContext", async () => {
    mockFetchUserContext.mockResolvedValue(null);
    render(<SettingsPage />);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding"));
  });

  it("pre-selects current userContext values", async () => {
    render(<SettingsPage />);
    await screen.findByText("STRATOS_OS");
    expect(screen.getByTestId("option-creator")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-0-1K")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-idea")).toHaveAttribute("data-selected", "true");
  });

  it("updates store when SAVE is clicked", async () => {
    render(<SettingsPage />);
    await screen.findByText("STRATOS_OS");
    await userEvent.click(screen.getByTestId("option-seller"));
    await userEvent.click(screen.getByTestId("option-1K-10K"));
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));
    expect(useStratosStore.getState().userContext).toMatchObject({ type: "seller", level: "1K-10K" });
  });

  it("shows SETTINGS_SAVED after save", async () => {
    render(<SettingsPage />);
    await screen.findByText("STRATOS_OS");
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));
    await waitFor(() => expect(screen.getByText(/SETTINGS_SAVED/i)).toBeInTheDocument());
  });
});
