import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CompletionFeedback from "./CompletionFeedback";

describe("CompletionFeedback", () => {
  it("renders streak and execution rate", () => {
    render(<CompletionFeedback streak={4} rate={80} onDismiss={vi.fn()} />);
    expect(screen.getByText(/STREAK: 4/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it("calls onDismiss when BACK button is clicked", async () => {
    const onDismiss = vi.fn();
    render(<CompletionFeedback streak={4} rate={80} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: /BACK TO DASHBOARD/i }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
