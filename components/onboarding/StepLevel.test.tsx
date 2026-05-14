import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StepLevel from "./StepLevel";

describe("StepLevel", () => {
  it("renders all 3 level options", () => {
    render(<StepLevel selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText("0 ~ 1K")).toBeInTheDocument();
    expect(screen.getByText("1K ~ 10K")).toBeInTheDocument();
    expect(screen.getByText("10K+")).toBeInTheDocument();
  });

  it("calls onSelect with '0-1K' when 0 ~ 1K is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepLevel selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("0 ~ 1K"));
    expect(onSelect).toHaveBeenCalledWith("0-1K");
  });

  it("highlights the selected option", () => {
    render(<StepLevel selected="1K-10K" onSelect={vi.fn()} />);
    expect(screen.getByTestId("option-1K-10K")).toHaveAttribute(
      "data-selected",
      "true"
    );
  });
});
