import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CategoryChart from "./CategoryChart";
import type { ActionSession } from "@/types";

function makeSession(category: string): ActionSession {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    input: "test",
    action: {
      title: "Test",
      category: category as ActionSession["action"]["category"],
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
  };
}

describe("CategoryChart", () => {
  it("renders nothing for empty sessions", () => {
    const { container } = render(<CategoryChart sessions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders CATEGORY_DIST label", () => {
    render(<CategoryChart sessions={[makeSession("outreach")]} />);
    expect(screen.getByText(/CATEGORY_DIST/i)).toBeInTheDocument();
  });

  it("renders category names", () => {
    const sessions = [makeSession("outreach"), makeSession("content"), makeSession("outreach")];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("renders counts", () => {
    const sessions = [makeSession("outreach"), makeSession("outreach"), makeSession("content")];
    render(<CategoryChart sessions={sessions} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
