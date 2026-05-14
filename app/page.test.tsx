import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import Home from "./page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/api", () => ({
  generateAction: vi.fn(),
}));

beforeEach(async () => {
  pushMock.mockClear();
  useStratosStore.setState({
    userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
    sessions: [],
  });
  const { generateAction } = await import("@/lib/api");
  vi.mocked(generateAction).mockReset();
});

describe("Home page", () => {
  it("redirects to /onboarding when userContext is null", () => {
    useStratosStore.setState({ userContext: null, sessions: [] });
    render(<Home />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("shows input screen when userContext exists", () => {
    render(<Home />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows loading state while API call is in progress", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockReturnValue(new Promise(() => {}));

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));

    expect(screen.getByText(/ANALYZING_INPUT/i)).toBeInTheDocument();
  });

  it("shows result after successful API call", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockResolvedValue({
      title: "팔로워 DM 보내기",
      category: "outreach",
      steps: [{ order: 1, description: "DM 발송" }],
      magicCopy: "안녕하세요!",
    });

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));

    await waitFor(() =>
      expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument()
    );
  });

  it("saves session to store after result is shown", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockResolvedValue({
      title: "팔로워 DM 보내기",
      category: "outreach",
      steps: [{ order: 1, description: "DM 발송" }],
      magicCopy: "안녕하세요!",
    });

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));

    await waitFor(() =>
      expect(useStratosStore.getState().sessions).toHaveLength(1)
    );
  });

  it("returns to input view when NEW is clicked", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockResolvedValue({
      title: "팔로워 DM 보내기",
      category: "outreach",
      steps: [{ order: 1, description: "DM 발송" }],
      magicCopy: "안녕하세요!",
    });

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => screen.getByText("팔로워 DM 보내기"));
    await userEvent.click(screen.getByRole("button", { name: /NEW/i }));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows error state when API call fails", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockRejectedValue(new Error("API error"));

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));

    await waitFor(() =>
      expect(screen.getByText(/EXECUTION_FAILED/i)).toBeInTheDocument()
    );
  });

  it("retries the same input when RETRY is clicked after error", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockRejectedValue(new Error("API error"));

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => screen.getByText(/EXECUTION_FAILED/i));
    await userEvent.click(screen.getByRole("button", { name: /RETRY/i }));

    expect(vi.mocked(generateAction)).toHaveBeenCalledTimes(2);
  });

  it("returns to input view when NEW is clicked after error", async () => {
    const { generateAction } = await import("@/lib/api");
    vi.mocked(generateAction).mockRejectedValue(new Error("API error"));

    render(<Home />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응 없음");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    await waitFor(() => screen.getByText(/EXECUTION_FAILED/i));
    await userEvent.click(screen.getByRole("button", { name: /NEW/i }));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
