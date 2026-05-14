import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import SettingsPage from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({
    userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
    sessions: [],
  });
});

describe("SettingsPage", () => {
  it("redirects to /onboarding when userContext is null", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<SettingsPage />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("pre-selects current userContext values", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("option-creator")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-0-1K")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("option-idea")).toHaveAttribute("data-selected", "true");
  });

  it("updates store when SAVE is clicked after changing values", async () => {
    render(<SettingsPage />);
    await userEvent.click(screen.getByTestId("option-seller"));
    await userEvent.click(screen.getByTestId("option-1K-10K"));
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));

    expect(useStratosStore.getState().userContext).toMatchObject({
      type: "seller",
      level: "1K-10K",
      businessStage: "idea",
    });
  });

  it("shows save confirmation after SAVE is clicked", async () => {
    render(<SettingsPage />);
    await userEvent.click(screen.getByRole("button", { name: /SAVE/i }));

    await waitFor(() =>
      expect(screen.getByText(/SETTINGS_SAVED/i)).toBeInTheDocument()
    );
  });

  it("has a link back to main page", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("link", { name: /BACK/i })).toHaveAttribute("href", "/");
  });
});
