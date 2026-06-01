import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";
import { defaultCtx } from "@/tests/fixtures";

const pushMock = vi.hoisted(() => vi.fn());
const routerMock = vi.hoisted(() => ({ push: pushMock }));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
  useRouter: () => routerMock,
}));

describe("Sidebar", () => {
  it("renders all nav links", () => {
    render(<Sidebar userContext={defaultCtx} />);
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/i })).toBeInTheDocument();
  });

  it("highlights Dashboard when pathname is /", () => {
    render(<Sidebar userContext={defaultCtx} />);
    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveClass("bg-zinc-800");
  });

  it("highlights History when pathname is /history", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/history");
    render(<Sidebar userContext={defaultCtx} />);
    expect(screen.getByRole("link", { name: /History/i })).toHaveClass("bg-zinc-800");
  });


});
