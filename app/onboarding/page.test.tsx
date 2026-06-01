import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import OnboardingPage from "./page";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/lib/api", () => ({
  saveUserContext: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { email: "test@example.com" } } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}));

beforeEach(() => {
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("OnboardingPage", () => {
  it("starts at step 1 — type selection", () => {
    render(<OnboardingPage />);
    expect(screen.getByText("USER_TYPE")).toBeInTheDocument();
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
  });

  it("advances to step 2 after selecting a type", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
    expect(screen.getByText("AUDIENCE_SIZE")).toBeInTheDocument();
  });

  it("advances to niche step (4/4) after completing type, level, stage", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("0 ~ 1K"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("Idea Stage"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(screen.getByText("4 / 4")).toBeInTheDocument();
    expect(screen.getByText("YOUR_NICHE")).toBeInTheDocument();
    expect(screen.getByTestId("niche-input")).toBeInTheDocument();
  });

  it("saves userContext with niche after completing all 4 steps", async () => {
    render(<OnboardingPage />);
    await userEvent.click(screen.getByText("Creator"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("0 ~ 1K"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.click(screen.getByText("Idea Stage"));
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await userEvent.type(screen.getByTestId("niche-input"), "피트니스 코치");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    const { userContext } = useStratosStore.getState();
    expect(userContext).toEqual({ type: "creator", level: "0-1K", businessStage: "idea", niche: "피트니스 코치", reminderEmail: false });
  });

  it("EXECUTE 버튼은 선택하지 않으면 비활성화", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("button", { name: /EXECUTE/i })).toBeDisabled();
  });
});
