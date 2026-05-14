import { describe, it, expect } from "vitest";
import { computeKpi } from "./kpi";
import type { ActionSession } from "@/types";

function makeSession(overrides: Partial<ActionSession> = {}): ActionSession {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    input: "test",
    action: {
      title: "Test",
      category: "outreach",
      steps: [{ order: 1, description: "step" }],
      magicCopy: "copy",
    },
    completed: false,
    ...overrides,
  };
}

describe("computeKpi", () => {
  it("returns zeros for empty sessions", () => {
    expect(computeKpi([])).toEqual({ total: 0, active: 0, completed: 0, rate: 0, streak: 0 });
  });

  it("counts total, active, completed correctly", () => {
    const sessions = [
      makeSession({ completed: false }),
      makeSession({ completed: false }),
      makeSession({ completed: true }),
    ];
    const result = computeKpi(sessions);
    expect(result.total).toBe(3);
    expect(result.active).toBe(2);
    expect(result.completed).toBe(1);
  });

  it("calculates rate as percentage rounded", () => {
    const sessions = [
      makeSession({ completed: true }),
      makeSession({ completed: true }),
      makeSession({ completed: false }),
    ];
    expect(computeKpi(sessions).rate).toBe(67);
  });

  it("rate is 0 when no sessions", () => {
    expect(computeKpi([]).rate).toBe(0);
  });

  it("streak is 1 when only today has sessions", () => {
    const sessions = [makeSession({ createdAt: Date.now() })];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak counts consecutive days back from today", () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const sessions = [
      makeSession({ createdAt: now }),
      makeSession({ createdAt: now - oneDayMs }),
      makeSession({ createdAt: now - oneDayMs * 2 }),
    ];
    expect(computeKpi(sessions).streak).toBe(3);
  });

  it("streak breaks at gap", () => {
    const now = Date.now();
    const oneDayMs = 86400000;
    const sessions = [
      makeSession({ createdAt: now }),
      makeSession({ createdAt: now - oneDayMs * 2 }),
    ];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak is 0 if today has no sessions", () => {
    const yesterday = Date.now() - 86400000;
    const sessions = [makeSession({ createdAt: yesterday })];
    expect(computeKpi(sessions).streak).toBe(0);
  });
});
