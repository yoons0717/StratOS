import { describe, it, expect, beforeEach } from "vitest";
import { useStratosStore } from "./index";
import type { ActionSession } from "@/types";

const session: ActionSession = {
  id: "s1",
  created_at: "2026-01-01T00:00:00Z",
  input: "test",
  action: {
    title: "T",
    category: "content",
    steps: [{ order: 1, description: "D" }],
    magicCopy: "C",
  },
  completed: false,
};

beforeEach(() => {
  useStratosStore.setState({ userContext: null, sessions: [] });
});

describe("useStratosStore", () => {
  it("setSessions", () => {
    useStratosStore.getState().setSessions([session]);
    expect(useStratosStore.getState().sessions).toHaveLength(1);
  });

  it("addSession prepends", () => {
    const s2 = { ...session, id: "s2" };
    useStratosStore.getState().addSession(session);
    useStratosStore.getState().addSession(s2);
    expect(useStratosStore.getState().sessions[0].id).toBe("s2");
  });

  it("markCompleted", () => {
    useStratosStore.getState().setSessions([session]);
    useStratosStore.getState().markCompleted("s1");
    expect(useStratosStore.getState().sessions[0].completed).toBe(true);
  });

  it("setUserContext", () => {
    useStratosStore.getState().setUserContext({ type: "creator", level: "0-1K", businessStage: "idea" });
    expect(useStratosStore.getState().userContext?.type).toBe("creator");
  });

  it("setUserContext null", () => {
    useStratosStore.getState().setUserContext(null);
    expect(useStratosStore.getState().userContext).toBeNull();
  });
});
