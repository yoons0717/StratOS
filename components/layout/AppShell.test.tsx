import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppShell from "./AppShell";
import type { KpiData } from "@/lib/kpi";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

const ctx = { type: "creator" as const, level: "0-1K" as const, businessStage: "idea" as const };
const kpi: KpiData = { total: 5, active: 2, completed: 3, rate: 60, streak: 2 };

describe("AppShell", () => {
  it("renders KpiBar when kpiData is provided", () => {
    render(<AppShell userContext={ctx} kpiData={kpi}><div /></AppShell>);
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("does not render KpiBar when kpiData is not provided", () => {
    render(<AppShell userContext={ctx}><div /></AppShell>);
    expect(screen.queryByText("TOTAL")).not.toBeInTheDocument();
  });
});
