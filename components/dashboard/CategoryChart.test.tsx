import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CategoryChart from "./CategoryChart";
import { makeSession } from "@/tests/fixtures";

describe("CategoryChart", () => {
  it("renders nothing for empty sessions", () => {
    const { container } = render(<CategoryChart sessions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders category names", () => {
    const sessions = [makeSession({ action: { category: "outreach" } }), makeSession({ action: { category: "content" } }), makeSession({ action: { category: "outreach" } })];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("renders counts", () => {
    const sessions = [makeSession({ action: { category: "outreach" } }), makeSession({ action: { category: "outreach" } }), makeSession({ action: { category: "content" } })];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
