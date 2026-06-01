import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MagicCopy from "./MagicCopy";

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

describe("MagicCopy", () => {
  it("copies text to clipboard when copy button is clicked", async () => {
    render(<MagicCopy text="복사할 캡션 텍스트" />);
    await userEvent.click(screen.getByRole("button", { name: /COPY/i }));
    expect(writeText).toHaveBeenCalledWith("복사할 캡션 텍스트");
  });

  it("shows character count", () => {
    render(<MagicCopy text="hello" />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows COPIED after clicking copy", async () => {
    render(<MagicCopy text="캡션" />);
    await userEvent.click(screen.getByRole("button", { name: /COPY/i }));
    expect(screen.getByText(/COPIED/i)).toBeInTheDocument();
  });
});
