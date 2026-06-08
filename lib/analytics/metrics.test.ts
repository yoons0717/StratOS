import { describe, it, expect } from "vitest";
import {
  computeDauEntries,
  computeOnboardingRate,
  computeSessionCompletionRate,
  computeActivatedUsers,
  computeSessionStats,
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


describe("computeOnboardingRate", () => {
  it("returns 0 when totalUsers is 0", () => {
    expect(computeOnboardingRate([], 0)).toBe(0);
  });

  it("100% when all registered users completed onboarding", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u2", name: "onboarding_completed" },
    ];
    expect(computeOnboardingRate(rows, 2)).toBe(100);
  });

  it("50% when half of registered users completed", () => {
    const rows = [{ user_id: "u1", name: "onboarding_completed" }];
    expect(computeOnboardingRate(rows, 2)).toBe(50);
  });

  it("0% when no one completed onboarding", () => {
    const rows = [{ user_id: "u1", name: "session_created" }];
    expect(computeOnboardingRate(rows, 2)).toBe(0);
  });

  it("user with duplicate onboarding_completed events counts once", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_completed" },
      { user_id: "u1", name: "onboarding_completed" },
    ];
    expect(computeOnboardingRate(rows, 2)).toBe(50);
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

describe("computeActivatedUsers", () => {
  it("returns 0 for empty rows", () => {
    expect(computeActivatedUsers([])).toBe(0);
  });

  it("counts unique users with session_completed", () => {
    const rows = [
      { user_id: "u1", name: "session_completed" },
      { user_id: "u1", name: "session_completed" },
      { user_id: "u2", name: "session_completed" },
      { user_id: "u3", name: "session_created" },
    ];
    expect(computeActivatedUsers(rows)).toBe(2);
  });
});

describe("computeSessionStats", () => {
  it("returns 0 values when no data", () => {
    expect(computeSessionStats([], 0)).toEqual({ avgPerUser: 0, returningUsers: 0 });
  });

  it("avgPerUser = session_created count / totalUsers (1 decimal)", () => {
    const rows = [
      { user_id: "u1", name: "session_created" },
      { user_id: "u1", name: "session_created" },
      { user_id: "u2", name: "session_created" },
    ];
    expect(computeSessionStats(rows, 2).avgPerUser).toBe(1.5);
  });

  it("returningUsers counts users with ≥2 session_created", () => {
    const rows = [
      { user_id: "u1", name: "session_created" },
      { user_id: "u1", name: "session_created" },
      { user_id: "u2", name: "session_created" },
      { user_id: "u3", name: "session_completed" },
    ];
    expect(computeSessionStats(rows, 3).returningUsers).toBe(1);
  });

  it("ignores non-session_created events in counts", () => {
    const rows = [
      { user_id: "u1", name: "session_created" },
      { user_id: "u1", name: "session_completed" },
    ];
    expect(computeSessionStats(rows, 2).avgPerUser).toBe(0.5);
    expect(computeSessionStats(rows, 2).returningUsers).toBe(0);
  });
});

describe("computeFunnel", () => {
  const make = (n: number, name: string) =>
    Array.from({ length: n }, (_, i) => ({ user_id: `${name}-u${i}`, name }));

  it("empty input: 4 steps, count 0, first conversionRate null", () => {
    const result = computeFunnel([]);
    expect(result).toHaveLength(4);
    result.forEach((s) => expect(s.count).toBe(0));
    expect(result[0].conversionRate).toBeNull();
    expect(result[0].usersLost).toBeNull();
  });

  it("step labels are in correct order", () => {
    expect(computeFunnel([]).map((s) => s.label)).toEqual([
      "onboarding_started",
      "onboarding_completed",
      "session_created",
      "session_completed",
    ]);
  });

  it("first step: conversionRate null, usersLost null", () => {
    const rows = [{ user_id: "u1", name: "onboarding_started" }];
    const [s0] = computeFunnel(rows);
    expect(s0.conversionRate).toBeNull();
    expect(s0.usersLost).toBeNull();
  });

  it("counts unique users per step and deduplicates", () => {
    const rows = [
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_started" },
      { user_id: "u2", name: "onboarding_started" },
      { user_id: "u1", name: "onboarding_completed" },
    ];
    const [s0, s1] = computeFunnel(rows);
    expect(s0.count).toBe(2);
    expect(s1.count).toBe(1);
  });

  it("conversionRate is step-over-step", () => {
    const rows = [
      ...make(4, "onboarding_started"),
      ...make(2, "onboarding_completed"),
      ...make(1, "session_created"),
    ];
    const result = computeFunnel(rows);
    expect(result[1].conversionRate).toBe(50); // 2/4
    expect(result[2].conversionRate).toBe(50); // 1/2
  });

  it("usersLost is prev count minus current count", () => {
    const rows = [
      ...make(10, "onboarding_started"),
      ...make(7, "onboarding_completed"),
    ];
    const result = computeFunnel(rows);
    expect(result[1].usersLost).toBe(3);
  });

  it("conversionRate capped at 100 when current > previous", () => {
    const rows = [
      ...make(1, "onboarding_started"),
      ...make(2, "onboarding_completed"),
    ];
    const result = computeFunnel(rows);
    expect(result[1].conversionRate).toBe(100);
    expect(result[1].usersLost).toBe(0);
  });

  it("conversionRate 0 when previous step has 0 users", () => {
    const rows = [{ user_id: "u1", name: "session_created" }];
    const result = computeFunnel(rows);
    expect(result[1].conversionRate).toBe(0); // onboarding_completed: prev (onboarding_started) = 0
    expect(result[2].conversionRate).toBe(0); // session_created: prev (onboarding_completed) = 0
  });

  it("barPct: max step gets 100%, others proportional", () => {
    const rows = [
      ...make(4, "onboarding_started"),
      ...make(2, "onboarding_completed"),
    ];
    const result = computeFunnel(rows);
    expect(result[0].barPct).toBe(100); // 4/4
    expect(result[1].barPct).toBe(50);  // 2/4
    expect(result[2].barPct).toBe(0);
  });

  it("realistic dropout: 10→8→6→4", () => {
    const rows = [
      ...make(10, "onboarding_started"),
      ...make(8, "onboarding_completed"),
      ...make(6, "session_created"),
      ...make(4, "session_completed"),
    ];
    const result = computeFunnel(rows);
    expect(result[0]).toMatchObject({ count: 10, barPct: 100, conversionRate: null, usersLost: null });
    expect(result[1]).toMatchObject({ count: 8, conversionRate: 80, usersLost: 2 });
    expect(result[2]).toMatchObject({ count: 6, conversionRate: 75, usersLost: 2 });
    expect(result[3]).toMatchObject({ count: 4, conversionRate: 67, usersLost: 2 });
  });

  it("all steps same count: barPct 100, conversionRate 100", () => {
    const rows = [
      ...make(3, "onboarding_started"),
      ...make(3, "onboarding_completed"),
      ...make(3, "session_created"),
      ...make(3, "session_completed"),
    ];
    const result = computeFunnel(rows);
    result.forEach((s) => expect(s.barPct).toBe(100));
    result.slice(1).forEach((s) => expect(s.conversionRate).toBe(100));
    result.slice(1).forEach((s) => expect(s.usersLost).toBe(0));
  });
});
