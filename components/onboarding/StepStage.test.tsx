import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StepStage from "./StepStage";

describe("StepStage", () => {
  it("renders all 4 stage options", () => {
    render(<StepStage selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Idea Stage")).toBeInTheDocument();
    expect(screen.getByText("Getting First Customers")).toBeInTheDocument();
    expect(screen.getByText("Consistent Income")).toBeInTheDocument();
    expect(screen.getByText("Scaling")).toBeInTheDocument();
  });

  it("calls onSelect with 'idea' when Idea Stage is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepStage selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Idea Stage"));
    expect(onSelect).toHaveBeenCalledWith("idea");
  });

  it("highlights the selected option", () => {
    render(<StepStage selected="scaling" onSelect={vi.fn()} />);
    expect(screen.getByTestId("option-scaling")).toHaveAttribute(
      "data-selected",
      "true"
    );
  });
});
