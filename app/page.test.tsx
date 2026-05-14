import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStratosStore } from "@/store";
import Home from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockClear();
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("Home page", () => {
  it("redirects to /onboarding when userContext is null", () => {
    render(<Home />);
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("does not redirect when userContext exists", () => {
    useStratosStore.setState({
      userContext: { type: "creator", level: "0-1K", businessStage: "idea" },
      sessions: [],
    });
    render(<Home />);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
