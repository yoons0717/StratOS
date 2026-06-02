import { describe, it, expect } from "vitest";
import {
  computeDauEntries,
  computeDauAvg,
  computeOnboardingRate,
  computeSessionCompletionRate,
  computeFunnel,
} from "./metrics";

describe("computeDauEntries", () => {
  it("returns empty array for no rows", () => {
    expect(computeDauEntries([])).toEqual([]);
  });

  it("counts unique users per day", () => {
    const rows = [
      { user_id: "u1", created_at: "2026-06-01T10:00:00Z" },
      { user_id: "u2", created_at: "2026-06-01T14:00:00Z" },
      { user_id: "u3", created_at: "2026-06-02T09:00:00Z" },
    ];
    const result = computeDauEntries(rows);
    expect(result).toEqual([
      { date: "2026-06-01", users: 2 },
      { date: "2026-06-02", users: 1 },
    ]);
  });

  it("deduplicates same user on the same day", () => {
    const rows = [
      { user_id: "u1", created_at: "2026-06-01T08:00:00Z" },
      { user_id: "u1", created_at: "2026-06-01T20:00:00Z" },
    ];
    const result = computeDauEntries(rows);
    expect(result).toEqual([{ date: "2026-06-01", users: 1 }]);
  });

  it("sorts entries by date ascending", () => {
    const rows = [
      { user_id: "u1", created_at: "2026-06-03T00:00:00Z" },
      { user_id: "u2", created_at: "2026-06-01T00:00:00Z" },
      { user_id: "u3", created_at: "2026-06-02T00:00:00Z" },
    ];
    const dates = computeDauEntries(rows).map((e) => e.date);
    expect(dates).toEqual(["2026-06-01", "2026-06-02", "2026-06-03"]);
  });

  it("handles many users on a single day", () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      user_id: `u${i}`,
      created_at: "2026-06-01T00:00:00Z",
    }));
    expect(computeDauEntries(rows)[0].users).toBe(50);
  });

  it("same user on multiple days counts once per day", () => {
    const rows = [
      { user_id: "u1", created_at: "2026-06-01T10:00:00Z" },
      { user_id: "u1", created_at: "2026-06-02T10:00:00Z" },
      { user_id: "u1", created_at: "2026-06-03T10:00:00Z" },
    ];
    const result = computeDauEntries(rows);
    expect(result).toHaveLength(3);
    expect(result.every((e) => e.users === 1)).toBe(true);
  });
});

describe("computeDauAvg", () => {
  it("returns 0 for empty entries", () => {
    expect(computeDauAvg([], 7)).toBe(0);
  });

  it("divides total by window size, not entry count", () => {
    const entries = [
      { users: 10 },
      { users: 4 },
    ];
    expect(computeDauAvg(entries, 7)).toBe(2);
  });

  it("rounds correctly", () => {
    const entries = [{ users: 10 }];
    expect(computeDauAvg(entries, 7)).toBe(1);
  });

  it("full 7-day window", () => {
    const entries = Array.from({ length: 7 }, () => ({ users: 7 }));
    expect(computeDauAvg(entries, 7)).toBe(7);
  });

  it("sparse data: 2 days of activity in 7-day window divides by 7 not 2", () => {
    const entries = [{ users: 7 }, { users: 7 }];
    expect(computeDauAvg(entries, 7)).toBe(2);
  });
});

describe("computeOnboardingRate", () => {
  it("returns 0 for empty rows", () => {
    expect(computeOnboardingRate([])).toBe(0);
  });

  it("100% when all users completed onboarding", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "onboarding_completed" },
    ];
    expect(computeOnboardingRate(rows)).toBe(100);
  });

  it("50% when half completed", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "session_created" },
    ];
    expect(computeOnboardingRate(rows)).toBe(50);
  });

  it("0% when no one completed onboarding", () => {
    const rows = [
      { user_id: "u1", name: "session_created" },
      { user_id: "u2", name: "session_created" },
    ];
    expect(computeOnboardingRate(rows)).toBe(0);
  });

  it("user with both onboarding_completed and session_created counts once", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u1", name: "session_created" },
    ];
    expect(computeOnboardingRate(rows)).toBe(100);
  });

  it("user with duplicate onboarding_completed events counts once", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "session_created" },
    ];
    expect(computeOnboardingRate(rows)).toBe(50);
  });
});

describe("computeSessionCompletionRate", () => {
  it("returns 0 for empty rows", () => {
    expect(computeSessionCompletionRate([])).toBe(0);
  });

  it("returns 0 when no sessions created", () => {
    const rows = [{ name: "session_completed" }];
    expect(computeSessionCompletionRate(rows)).toBe(0);
  });

  it("100% when all sessions completed", () => {
    const rows = [
      { name: "session_created" },
      { name: "session_completed" },
    ];
    expect(computeSessionCompletionRate(rows)).toBe(100);
  });

  it("50% when half completed", () => {
    const rows = [
      { name: "session_created" },
      { name: "session_created" },
      { name: "session_completed" },
    ];
    expect(computeSessionCompletionRate(rows)).toBe(50);
  });

  it("rounds correctly", () => {
    const rows = [
      { name: "session_created" },
      { name: "session_created" },
      { name: "session_created" },
      { name: "session_completed" },
    ];
    expect(computeSessionCompletionRate(rows)).toBe(33);
  });

  it("completed > created (data anomaly) is capped at 100%", () => {
    const rows = [
      { name: "session_created" },
      { name: "session_completed" },
      { name: "session_completed" },
    ];
    expect(computeSessionCompletionRate(rows)).toBe(100);
  });
});

describe("computeFunnel", () => {
  const make = (n: number, name: string) =>
    Array.from({ length: n }, (_, i) => ({ user_id: `${name}-u${i}`, name }));

  it("empty input: 4 steps with count 0, first drop null", () => {
    const result = computeFunnel([]);
    expect(result).toHaveLength(4);
    result.forEach((s) => expect(s.count).toBe(0));
    expect(result[0].drop).toBeNull();
  });

  it("step labels are in correct order", () => {
    expect(computeFunnel([]).map((s) => s.label)).toEqual([
      "onboarding_started",
      "onboarding_completed",
      "session_created",
      "session_completed",
    ]);
  });

  it("all pct 0 when no onboarding_started", () => {
    expect(computeFunnel([{ user_id: "u1", name: "session_created" }])[0].pct).toBe(0);
  });

  it("counts unique users per step and deduplicates", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_started" }, // dup
      { user_id: "u2", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u1", name: "session_created" },
      { user_id: "u1", name: "session_completed" },
    ];
    const [s0, s1, s2, s3] = computeFunnel(rows);
    expect([s0.count, s1.count, s2.count, s3.count]).toEqual([2, 1, 1, 1]);
  });

  it("pct is relative to base and drop is step-over-step", () => {
    const rows = [...make(4, "onboarding_started"), ...make(3, "onboarding_completed")];
    const result = computeFunnel(rows);
    expect(result[0]).toMatchObject({ pct: 100, drop: null });
    expect(result[1]).toMatchObject({ pct: 75, drop: 25 });
    expect(result[2]).toMatchObject({ pct: 0, drop: 75 });
  });

  it.each([
    [3, 1, 33, 67],
    [3, 2, 67, 33],
  ])("rounding: %i started %i completed → pct %i%% drop %i%%", (started, completed, pct, drop) => {
    const rows = [...make(started, "onboarding_started"), ...make(completed, "onboarding_completed")];
    const result = computeFunnel(rows);
    expect(result[1].pct).toBe(pct);
    expect(result[1].drop).toBe(drop);
  });

  it("zero drop when all users proceed to next step", () => {
    const rows = [...make(2, "onboarding_started"), ...make(2, "onboarding_completed")];
    expect(computeFunnel(rows)[1]).toMatchObject({ pct: 100, drop: 0 });
  });

  it("realistic dropout: 100→74→58→31", () => {
    const rows = [
      ...make(100, "onboarding_started"),
      ...make(74, "onboarding_completed"),
      ...make(58, "session_created"),
      ...make(31, "session_completed"),
    ];
    const result = computeFunnel(rows);
    expect(result[0]).toMatchObject({ count: 100, pct: 100, drop: null });
    expect(result[1]).toMatchObject({ count: 74, pct: 74, drop: 26 });
    expect(result[2]).toMatchObject({ count: 58, pct: 58, drop: 16 });
    expect(result[3]).toMatchObject({ count: 31, pct: 31, drop: 27 });
  });

  it("anomalous data: user in later step without earlier does not crash", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u99", name: "session_completed" },
    ];
    const result = computeFunnel(rows);
    expect(result[0].count).toBe(1);
    expect(result[3].count).toBe(1);
    expect(result[3].pct).toBe(100);
  });

  it("single user completes all steps: all pct 100, drops 0", () => {
    const rows = ["onboarding_started", "onboarding_completed", "session_created", "session_completed"]
      .map((name) => ({ user_id: "u1", name }));
    const result = computeFunnel(rows);
    result.forEach((s) => expect(s.pct).toBe(100));
    result.slice(1).forEach((s) => expect(s.drop).toBe(0));
  });
});
