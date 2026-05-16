import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KpiBar from "./KpiBar";
import type { KpiData } from "@/lib/kpi";

const data: KpiData = { total: 12, active: 4, completed: 8, rate: 67, streak: 5 };

describe("KpiBar", () => {
  it("renders all 5 KPI labels", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("RATE")).toBeInTheDocument();
    expect(screen.getByText("STREAK")).toBeInTheDocument();
  });

  it("renders numeric values", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("appends % to RATE", () => {
    render(<KpiBar data={data} />);
    expect(screen.getByText("67%")).toBeInTheDocument();
  });

});
