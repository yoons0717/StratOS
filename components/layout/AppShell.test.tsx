import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppShell from "./AppShell";
import type { KpiData } from "@/lib/analytics/kpi";
import { defaultCtx } from "@/tests/fixtures";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
  useRouter: () => routerMock,
}));

const kpi: KpiData = { total: 5, active: 2, completed: 3, rate: 60, streak: 2 };

describe("AppShell", () => {
  it("renders KpiBar when kpiData is provided", () => {
    render(<AppShell userContext={defaultCtx} kpiData={kpi}><div /></AppShell>);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("does not render KpiBar when kpiData is not provided", () => {
    render(<AppShell userContext={defaultCtx}><div /></AppShell>);
    expect(screen.queryByText("TOTAL")).not.toBeInTheDocument();
  });
});
