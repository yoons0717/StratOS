import { describe, it, expect } from "vitest";
import { computeKpi, computeLongestStreak, computeHeatmap, computeChannelDist, computeCategoryDist, computeWeeklyChannelDist } from "./kpi";
import { makeSession } from "@/tests/fixtures";

const ONE_DAY_MS = 86400000;

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
    const sessions = [makeSession({ created_at: new Date().toISOString() })];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak counts consecutive days back from today", () => {
    const now = Date.now();
    const sessions = [
      makeSession({ created_at: new Date(now).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS * 2).toISOString() }),
    ];
    expect(computeKpi(sessions).streak).toBe(3);
  });

  it("streak breaks at gap", () => {
    const now = Date.now();
    const sessions = [
      makeSession({ created_at: new Date(now).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS * 2).toISOString() }),
    ];
    expect(computeKpi(sessions).streak).toBe(1);
  });

  it("streak is 0 if today has no sessions", () => {
    const sessions = [makeSession({ created_at: new Date(Date.now() - ONE_DAY_MS).toISOString() })];
    expect(computeKpi(sessions).streak).toBe(0);
  });
});

describe("computeLongestStreak", () => {
  it("returns 0 for empty sessions", () => {
    expect(computeLongestStreak([])).toBe(0);
  });

  it("returns 1 for single session", () => {
    expect(computeLongestStreak([makeSession()])).toBe(1);
  });

  it("returns longest run across gaps", () => {
    const now = Date.now();
    const sessions = [
      makeSession({ created_at: new Date(now).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS * 2).toISOString() }),
      // gap
      makeSession({ created_at: new Date(now - ONE_DAY_MS * 10).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS * 11).toISOString() }),
    ];
    expect(computeLongestStreak(sessions)).toBe(3);
  });

  it("multiple sessions on same day count as one", () => {
    const now = Date.now();
    const sessions = [
      makeSession({ created_at: new Date(now).toISOString() }),
      makeSession({ created_at: new Date(now).toISOString() }),
      makeSession({ created_at: new Date(now - ONE_DAY_MS).toISOString() }),
    ];
    expect(computeLongestStreak(sessions)).toBe(2);
  });
});

describe("computeHeatmap", () => {
  it("returns empty object for empty sessions", () => {
    expect(computeHeatmap([])).toEqual({});
  });

  it("counts sessions by date key", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const sessions = [
      makeSession({ created_at: today.toISOString() }),
      makeSession({ created_at: today.toISOString() }),
    ];
    const result = computeHeatmap(sessions);
    const key = today.toISOString().slice(0, 10);
    expect(result[key]).toBe(2);
  });

  it("excludes sessions outside the window", () => {
    const old = new Date(Date.now() - ONE_DAY_MS * 40);
    const sessions = [makeSession({ created_at: old.toISOString() })];
    expect(computeHeatmap(sessions, 30)).toEqual({});
  });
});

describe("computeChannelDist", () => {
  it("returns empty array for no completed sessions", () => {
    expect(computeChannelDist([makeSession({ completed: false })])).toEqual([]);
  });

  it("counts completed sessions by channel and sorts by pct desc", () => {
    const sessions = [
      makeSession({ completed: true, channel: "instagram" }),
      makeSession({ completed: true, channel: "instagram" }),
      makeSession({ completed: true, channel: "youtube" }),
      makeSession({ completed: false, channel: "general" }),
    ];
    const result = computeChannelDist(sessions);
    expect(result[0].channel).toBe("instagram");
    expect(result[0].count).toBe(2);
    expect(result[0].pct).toBe(67);
    expect(result[1].channel).toBe("youtube");
    expect(result[1].count).toBe(1);
  });
});

describe("computeCategoryDist", () => {
  it("returns empty array for no completed sessions", () => {
    expect(computeCategoryDist([makeSession({ completed: false })])).toEqual([]);
  });

  it("counts completed sessions by category and sorts by pct desc", () => {
    const sessions = [
      makeSession({ completed: true, action: { category: "content" } }),
      makeSession({ completed: true, action: { category: "content" } }),
      makeSession({ completed: true, action: { category: "seo" } }),
    ];
    const result = computeCategoryDist(sessions);
    expect(result[0].category).toBe("content");
    expect(result[0].count).toBe(2);
    expect(result[1].category).toBe("seo");
  });
});

describe("computeWeeklyChannelDist", () => {
  it("returns N entries equal to weeks param", () => {
    const result = computeWeeklyChannelDist([], 4);
    expect(result).toHaveLength(4);
  });

  it("returns empty channels when no sessions", () => {
    const result = computeWeeklyChannelDist([], 2);
    expect(result.every((w) => Object.keys(w.channels).length === 0)).toBe(true);
  });

  it("counts completed sessions in the correct week", () => {
    const now = new Date();
    const session = makeSession({
      completed: true,
      channel: "instagram",
      created_at: now.toISOString(),
    });
    const result = computeWeeklyChannelDist([session], 8);
    const thisWeek = result[result.length - 1];
    expect(thisWeek.channels.instagram).toBe(1);
  });

  it("excludes incomplete sessions", () => {
    const now = new Date();
    const session = makeSession({
      completed: false,
      channel: "youtube",
      created_at: now.toISOString(),
    });
    const result = computeWeeklyChannelDist([session], 2);
    expect(result.every((w) => Object.keys(w.channels).length === 0)).toBe(true);
  });

  it("sessions from 2 weeks ago appear in the correct bucket", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * ONE_DAY_MS);
    const session = makeSession({
      completed: true,
      channel: "naver-blog",
      created_at: twoWeeksAgo.toISOString(),
    });
    const result = computeWeeklyChannelDist([session], 8);
    const thisWeek = result[result.length - 1];
    expect(thisWeek.channels["naver-blog"]).toBeUndefined();
  });
});
