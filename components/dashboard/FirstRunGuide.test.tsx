import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import FirstRunGuide from "./FirstRunGuide";

describe("FirstRunGuide", () => {
  it("reveals all lines after animation completes", async () => {
    render(<FirstRunGuide lineDelay={0} />);
    await waitFor(() => expect(screen.getByText(/READY/i)).toBeInTheDocument());
  });

  it("highlights + NEW ACTION in neon", async () => {
    render(<FirstRunGuide lineDelay={0} />);
    await waitFor(() => expect(screen.getByText(/\+ NEW ACTION/i)).toBeInTheDocument());
  });

  it("calls onBegin when [ + NEW ACTION ] button is clicked", async () => {
    const onBegin = vi.fn();
    render(<FirstRunGuide lineDelay={0} onBegin={onBegin} />);
    await waitFor(() => screen.getByRole("button", { name: /\+ NEW ACTION/i }));
    await userEvent.click(screen.getByRole("button", { name: /\+ NEW ACTION/i }));
    expect(onBegin).toHaveBeenCalledOnce();
  });
});
