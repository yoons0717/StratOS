import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionInput from "./ActionInput";

describe("ActionInput", () => {
  it("renders textarea and submit button", () => {
    render(<ActionInput onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /EXECUTE/i })).toBeInTheDocument();
  });

  it("calls onSubmit with input text", async () => {
    const onSubmit = vi.fn();
    render(<ActionInput onSubmit={onSubmit} isLoading={false} />);
    await userEvent.type(screen.getByRole("textbox"), "인스타 반응이 없어요");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(onSubmit).toHaveBeenCalledWith("인스타 반응이 없어요");
  });

  it("disables button when input is empty", () => {
    render(<ActionInput onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByRole("button", { name: /EXECUTE/i })).toBeDisabled();
  });

  it("disables EXECUTE button and shows loading state when isLoading is true", () => {
    render(<ActionInput onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByText(/PROCESSING/i).closest("button")).toBeDisabled();
    expect(screen.getByText(/PROCESSING/i)).toBeInTheDocument();
  });

  it("clears input after submit", async () => {
    render(<ActionInput onSubmit={vi.fn()} isLoading={false} />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "인스타 반응이 없어요");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(textarea).toHaveValue("");
  });
});
