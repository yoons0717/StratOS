import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StepType from "./StepType";

describe("StepType", () => {
  it("renders all 4 type options", () => {
    render(<StepType selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Creator")).toBeInTheDocument();
    expect(screen.getByText("Seller")).toBeInTheDocument();
    expect(screen.getByText("Service Provider")).toBeInTheDocument();
    expect(screen.getByText("Side Hustle")).toBeInTheDocument();
  });

  it("calls onSelect with 'creator' when Creator is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepType selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Creator"));
    expect(onSelect).toHaveBeenCalledWith("creator");
  });

  it("highlights the selected option", () => {
    render(<StepType selected="creator" onSelect={vi.fn()} />);
    const selected = screen.getByTestId("option-creator");
    expect(selected).toHaveAttribute("data-selected", "true");
  });
});
