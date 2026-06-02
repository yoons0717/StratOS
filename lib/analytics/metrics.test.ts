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
  it("returns 4 steps for empty input with count 0", () => {
    const result = computeFunnel([]);
    expect(result).toHaveLength(4);
    result.forEach((s) => expect(s.count).toBe(0));
  });

  it("first step has drop null", () => {
    const result = computeFunnel([]);
    expect(result[0].drop).toBeNull();
  });

  it("all pct 0 when no onboarding_started", () => {
    const rows = [{ user_id: "u1", name: "session_created" }];
    const result = computeFunnel(rows);
    expect(result[0].pct).toBe(0);
  });

  it("counts unique users per step", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u2", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u1", name: "session_created" },
      { user_id: "u1", name: "session_completed" },
    ];
    const result = computeFunnel(rows);
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
    expect(result[2].count).toBe(1);
    expect(result[3].count).toBe(1);
  });

  it("pct is relative to onboarding_started count", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u2", name: "onboarding_started" },
      { user_id: "u3", name: "onboarding_started" },
      { user_id: "u4", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "onboarding_completed" },
      { user_id: "u3", name: "onboarding_completed" },
    ];
    const result = computeFunnel(rows);
    expect(result[0].pct).toBe(100);
    expect(result[1].pct).toBe(75);
  });

  it("drop is step-over-step loss relative to base", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u2", name: "onboarding_started" },
      { user_id: "u3", name: "onboarding_started" },
      { user_id: "u4", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "onboarding_completed" },
      { user_id: "u3", name: "onboarding_completed" },
    ];
    const result = computeFunnel(rows);
    // step 0→1: 4→3, drop = 1/4 = 25%
    expect(result[1].drop).toBe(25);
    // step 1→2: 3→0, drop = 3/4 = 75%
    expect(result[2].drop).toBe(75);
  });

  it("deduplicates same user duplicate events", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_started" },
    ];
    expect(computeFunnel(rows)[0].count).toBe(1);
  });

  it("step labels are in correct order", () => {
    const result = computeFunnel([]);
    expect(result.map((s) => s.label)).toEqual([
      "onboarding_started",
      "onboarding_completed",
      "session_created",
      "session_completed",
    ]);
  });
});
