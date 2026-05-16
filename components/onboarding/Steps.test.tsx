import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import StepType from "./StepType";
import StepLevel from "./StepLevel";
import StepStage from "./StepStage";

type StepProps = { selected: string | null; onSelect: (v: string) => void };

const CASES = [
  {
    name: "StepType",
    Component: StepType as ComponentType<StepProps>,
    options: ["Creator", "Seller", "Service Provider", "Side Hustle"],
    firstLabel: "Creator",
    firstValue: "creator",
    selectedValue: "creator",
    selectedTestId: "option-creator",
  },
  {
    name: "StepLevel",
    Component: StepLevel as ComponentType<StepProps>,
    options: ["0 ~ 1K", "1K ~ 10K", "10K+"],
    firstLabel: "0 ~ 1K",
    firstValue: "0-1K",
    selectedValue: "1K-10K",
    selectedTestId: "option-1K-10K",
  },
  {
    name: "StepStage",
    Component: StepStage as ComponentType<StepProps>,
    options: ["Idea Stage", "Getting First Customers", "Consistent Income", "Scaling"],
    firstLabel: "Idea Stage",
    firstValue: "idea",
    selectedValue: "scaling",
    selectedTestId: "option-scaling",
  },
];

describe.each(CASES)("$name", ({ Component, options, firstLabel, firstValue, selectedValue, selectedTestId }) => {
  it("renders all options", () => {
    render(<Component selected={null} onSelect={vi.fn()} />);
    for (const label of options) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("calls onSelect when option is clicked", async () => {
    const onSelect = vi.fn();
    render(<Component selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText(firstLabel));
    expect(onSelect).toHaveBeenCalledWith(firstValue);
  });

  it("highlights the selected option", () => {
    render(<Component selected={selectedValue} onSelect={vi.fn()} />);
    expect(screen.getByTestId(selectedTestId)).toHaveAttribute("data-selected", "true");
  });
});
