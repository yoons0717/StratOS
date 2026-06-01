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
      onCancel={vi.fn()}
      {...overrides}
    />
  );
}

describe("ConfirmModal", () => {
  it("renders title, message and buttons", () => {
    renderModal();
    expect(screen.getByText("CONFIRM_DELETE //")).toBeInTheDocument();
    expect(screen.getByText("Delete this action?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DELETE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    renderModal({ onConfirm });
    await userEvent.click(screen.getByRole("button", { name: "DELETE" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when CANCEL is clicked", async () => {
    const onCancel = vi.fn();
    renderModal({ onCancel });
    await userEvent.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when backdrop is clicked", async () => {
    const onCancel = vi.fn();
    renderModal({ onCancel });
    await userEvent.click(screen.getByTestId("confirm-modal-backdrop"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
