import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ActionListPanel from "./ActionListPanel";
import type { ActionSession } from "@/types";

function makeSession(id: string, title: string): ActionSession {
  return {
    id,
    createdAt: Date.now(),
    input: "test",
    action: {
      title,
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
  };
}

const sessions = [makeSession("s1", "팔로워 DM 보내기"), makeSession("s2", "키워드 리서치")];

describe("ActionListPanel", () => {
  it("shows empty state when no sessions", () => {
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/액션이 없어/i)).toBeInTheDocument();
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
    render(<ActionListPanel sessions={[]} selectedId={null} onSelect={vi.fn()} emptyLabel="완료된 액션 없음" />);
    expect(screen.getByText("완료된 액션 없음")).toBeInTheDocument();
  });
});
