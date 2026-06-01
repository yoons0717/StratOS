import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NewActionModal from "./NewActionModal";

function renderModal(props: Partial<Parameters<typeof NewActionModal>[0]> = {}) {
  return render(
    <NewActionModal
      onSubmit={vi.fn()}
      onClose={vi.fn()}
      isLoading={false}
      error={null}
      {...props}
    />
  );
}

describe("NewActionModal", () => {
  it("selects 일반 by default", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /일반/i })).toHaveAttribute("data-selected", "true");
  });

  it("changes selected channel on click", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /인스타그램/i }));
    expect(screen.getByRole("button", { name: /인스타그램/i })).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("button", { name: /일반/i })).toHaveAttribute("data-selected", "false");
  });

  it("shows guide text for 일반 by default", () => {
    renderModal();
    expect(screen.getByText(/현재 수치/i)).toBeInTheDocument();
  });

  it("shows channel-specific guide text when channel is selected", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /인스타그램/i }));
    expect(screen.getByText(/게시물·릴스/i)).toBeInTheDocument();
  });

  it("calls onSubmit with input and selected channel", async () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });
    await userEvent.click(screen.getByRole("button", { name: /인스타그램/i }));
    await userEvent.type(screen.getByRole("textbox"), "상황 설명");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(onSubmit).toHaveBeenCalledWith("상황 설명", "instagram");
  });

  it("calls onSubmit with general channel when none selected", async () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });
    await userEvent.type(screen.getByRole("textbox"), "상황 설명");
    await userEvent.click(screen.getByRole("button", { name: /EXECUTE/i }));
    expect(onSubmit).toHaveBeenCalledWith("상황 설명", "general");
  });
});
