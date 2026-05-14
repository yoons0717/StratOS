import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StepType from "./StepType";

describe("StepType", () => {
  it("renders all 4 type options", () => {
    render(<StepType selected={null} onSelect={vi.fn()} />);
    expect(screen.getByText("크리에이터")).toBeInTheDocument();
    expect(screen.getByText("판매자")).toBeInTheDocument();
    expect(screen.getByText("서비스 제공자")).toBeInTheDocument();
    expect(screen.getByText("부업 시작 중")).toBeInTheDocument();
  });

  it("calls onSelect with 'creator' when 크리에이터 is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepType selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("크리에이터"));
    expect(onSelect).toHaveBeenCalledWith("creator");
  });

  it("calls onSelect with 'seller' when 판매자 is clicked", async () => {
    const onSelect = vi.fn();
    render(<StepType selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("판매자"));
    expect(onSelect).toHaveBeenCalledWith("seller");
  });

  it("highlights the selected option", () => {
    render(<StepType selected="creator" onSelect={vi.fn()} />);
    const selected = screen.getByTestId("option-creator");
    expect(selected).toHaveAttribute("data-selected", "true");
  });
});
