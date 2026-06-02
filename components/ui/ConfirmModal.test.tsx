import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ConfirmModal from "./ConfirmModal";

function renderModal(overrides = {}) {
  return render(
    <ConfirmModal
      title="CONFIRM_DELETE //"
      message="Delete this action?"
      confirmLabel="DELETE"
      confirmVariant="danger"
      onConfirm={vi.fn()}
      onClose={vi.fn()}
      {...overrides}
    />
  );
}

describe("ConfirmModal", () => {
  it("calls onConfirm then onClose when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderModal({ onConfirm, onClose });
    await userEvent.click(screen.getByRole("button", { name: "DELETE" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when CANCEL is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByTestId("confirm-modal-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
