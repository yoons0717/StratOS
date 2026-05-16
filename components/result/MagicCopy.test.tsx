import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MagicCopy from "./MagicCopy";

describe("MagicCopy", () => {
  it("renders the magic copy text", () => {
    render(<MagicCopy text="안녕하세요! 최근 콘텐츠 보셨나요?" />);
    expect(screen.getByText("안녕하세요! 최근 콘텐츠 보셨나요?")).toBeInTheDocument();
  });

  it("renders a copy button", () => {
    render(<MagicCopy text="테스트 캡션" />);
    expect(screen.getByRole("button", { name: /COPY/i })).toBeInTheDocument();
  });

  it("copies text to clipboard when copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<MagicCopy text="복사할 캡션 텍스트" />);
    await userEvent.click(screen.getByRole("button", { name: /COPY/i }));
    expect(writeText).toHaveBeenCalledWith("복사할 캡션 텍스트");
  });

  it("shows character count", () => {
    render(<MagicCopy text="hello" />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows COPIED after clicking copy", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<MagicCopy text="캡션" />);
    await userEvent.click(screen.getByRole("button", { name: /COPY/i }));
    expect(screen.getByText(/COPIED/i)).toBeInTheDocument();
  });
});
