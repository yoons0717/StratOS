import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import OnboardingPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  saveUserContext: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("OnboardingPage", () => {
  it("starts at step 1 — type selection", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("USER_TYPE")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("advances to step 2 after selecting a type", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.getByText("AUDIENCE_SIZE")).toBeInTheDocument();
  });

  it("advances to step 3 after selecting a level", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("0 ~ 1K"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByText("CURRENT_STAGE")).toBeInTheDocument();
  });

  it("saves userContext to store after completing all 3 steps", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("0 ~ 1K"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("Idea Stage"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    const { userContext } = useStratosStore.getState();
    expect(userContext).toEqual({ type: "creator", level: "0-1K", businessStage: "idea" });
  });

  it("EXECUTE 버튼은 선택하지 않으면 비활성화", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /EXECUTE/i })).toBeDisabled();
  });
});
