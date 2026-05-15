import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

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

describe("Sidebar", () => {
  it("renders logo", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByText("STRATOS_OS")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /DASHBOARD/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HISTORY/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SETTINGS/i })).toBeInTheDocument();
  });

  it("highlights DASHBOARD when pathname is /", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /DASHBOARD/i })).toHaveClass("text-neon");
  });

  it("highlights HISTORY when pathname is /history", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/history");
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByRole("link", { name: /HISTORY/i })).toHaveClass("text-neon");
  });

  it("renders user context info", () => {
    render(<Sidebar userContext={ctx} />);
    expect(screen.getByText(/CREATOR/i)).toBeInTheDocument();
    expect(screen.getByText(/0-1K/i)).toBeInTheDocument();
  });
});
