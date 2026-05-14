import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StepStage from "./StepStage";

describe("StepStage", () => {
  it("renders all 4 stage options", () => {
    render(<StepStage selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText("아이디어 단계")).toBeInTheDocument();
    expect(screen.getByText("첫 고객 확보 중")).toBeInTheDocument();
    expect(screen.getByText("수입 안정화")).toBeInTheDocument();
    expect(screen.getByText("스케일업")).toBeInTheDocument();
  });

  it("calls onSelect with 'idea' when 아이디어 단계 is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepStage selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("아이디어 단계"));
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
