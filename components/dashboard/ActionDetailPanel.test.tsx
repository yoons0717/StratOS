import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import ActionDetailPanel from "./ActionDetailPanel";
import { makeSession } from "@/tests/fixtures";

const session = makeSession({
  id: "s1",
  action: {
    title: "팔로워 DM 보내기",
    steps: [
      { order: 1, description: "대상 선별" },
      { order: 2, description: "메시지 작성" },
    ],
    magicCopy: "안녕하세요!",
  },
});

function renderPanel(props: Partial<ComponentProps<typeof ActionDetailPanel>> = {}) {
  return render(
    <ActionDetailPanel
      session={session}
      onComplete={vi.fn()}
      {...props}
    />
  );
}

describe("ActionDetailPanel", () => {
  it("shows empty state when session is null", () => {
    renderPanel({ session: null });
    expect(screen.getByText(/Select an action/i)).toBeInTheDocument();
  });

  it("renders action title and category", () => {
    renderPanel();
    expect(screen.getByText("팔로워 DM 보내기")).toBeInTheDocument();
    expect(screen.getAllByText("OUTREACH").length).toBeGreaterThan(0);
  });

  it("shows channel tag for non-general sessions", () => {
    renderPanel({ session: makeSession({ id: "s1", channel: "instagram" }) });
    expect(screen.getByText("인스타그램")).toBeInTheDocument();
  });

  it("does not show channel tag for general sessions", () => {
    renderPanel({ session: makeSession({ id: "s1", channel: "general" }) });
    expect(screen.queryByText("인스타그램")).not.toBeInTheDocument();
  });

  it("renders all steps", () => {
    renderPanel();
    expect(screen.getByText("대상 선별")).toBeInTheDocument();
    expect(screen.getByText("메시지 작성")).toBeInTheDocument();
  });

  it("renders magic copy text", () => {
    renderPanel();
    expect(screen.getByText("안녕하세요!")).toBeInTheDocument();
  });

  it("calls onComplete with id when COMPLETE is clicked", async () => {
    const onComplete = vi.fn();
    renderPanel({ onComplete });
    await userEvent.click(screen.getByRole("button", { name: /COMPLETE/i }));
    expect(onComplete).toHaveBeenCalledWith("s1");
  });

  it("hides COMPLETE button when readonly", () => {
    renderPanel({ readonly: true });
    expect(screen.queryByRole("button", { name: /COMPLETE/i })).not.toBeInTheDocument();
  });

  it("shows DELETE button when onDelete is provided", () => {
    renderPanel({ onDelete: vi.fn() });
    expect(screen.getByRole("button", { name: /DELETE/i })).toBeInTheDocument();
  });

  it("does not show DELETE button when onDelete is not provided", () => {
    renderPanel();
    expect(screen.queryByRole("button", { name: /DELETE/i })).not.toBeInTheDocument();
  });

  it("clicking DELETE opens confirm modal, COMPLETE still visible", async () => {
    renderPanel({ onDelete: vi.fn() });
    await userEvent.click(screen.getByRole("button", { name: /DELETE/i }));
    expect(screen.getByText(/CONFIRM_DELETE/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /COMPLETE/i })).toBeInTheDocument();
  });

  it("CANCEL closes confirm modal without calling onDelete", async () => {
    const onDelete = vi.fn();
    renderPanel({ onDelete });
    await userEvent.click(screen.getByRole("button", { name: /DELETE/i }));
    await userEvent.click(screen.getByRole("button", { name: /CANCEL/i }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/CONFIRM_DELETE/i)).not.toBeInTheDocument();
  });

  it("CONFIRM calls onDelete with id", async () => {
    const onDelete = vi.fn();
    renderPanel({ onDelete });
    await userEvent.click(screen.getByRole("button", { name: /DELETE/i }));
    await userEvent.click(screen.getByRole("button", { name: /CONFIRM/i }));
    expect(onDelete).toHaveBeenCalledWith("s1");
  });

});
