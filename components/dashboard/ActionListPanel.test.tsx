import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionListPanel from "./ActionListPanel";
import { makeSession } from "@/tests/fixtures";

const sessions = [
  makeSession({ id: "s1", action: { title: "팔로워 DM 보내기" } }),
  makeSession({ id: "s2", action: { title: "키워드 리서치" } }),
];

describe("ActionListPanel", () => {
  it("shows empty state when no sessions", () => {
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/No actions yet/i)).toBeInTheDocument();
  });

  it("renders session titles", () => {
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getByText("키워드 리서치")).toBeInTheDocument();
  });

  it("calls onSelect with session id when clicked", async () => {
    const onSelect = vi.fn();
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("팔로워 DM 보내기"));
    expect(onSelect).toHaveBeenCalledWith("s1");
  });

  it("applies active style to selected item", () => {
    render(<ActionListPanel sessions={sessions} selectedId="s1" onSelect={vi.fn()} />);
    expect(screen.getByText("팔로워 DM 보내기").closest("button")).toHaveClass("text-neon");
  });

  it("shows custom empty label", () => {
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} emptyLabel="No completed actions" />);
    expect(screen.getByText("No completed actions")).toBeInTheDocument();
  });

  it("calls onDelete with session id when ✕ is clicked", async () => {
    const onDelete = vi.fn();
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getAllByRole("button", { name: /✕/ })[0]);
    expect(onDelete).toHaveBeenCalledWith("s1");
  });

  it("does not show delete buttons when onDelete is not provided", () => {
    render(<ActionListPanel sessions={sessions} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /✕/ })).not.toBeInTheDocument();
  });
});
