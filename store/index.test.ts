import { describe, it, expect, beforeEach } from "vitest";
import { useStratosStore } from "./index";
import { defaultCtx, makeSession } from "@/tests/fixtures";

const session = makeSession({ id: "s1" });

describe("useStratosStore", () => {
  beforeEach(() => {
    useStratosStore.setState({ userContext: null, sessions: [] });
  });

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
    useStratosStore.getState().setUserContext(defaultCtx);
    expect(useStratosStore.getState().userContext?.type).toBe("creator");
  });

  it("setUserContext null", () => {
    useStratosStore.getState().setUserContext(null);
    expect(useStratosStore.getState().userContext).toBeNull();
  });

  it("updateSession replaces action for matching id", () => {
    const newAction = { ...session.action, title: "Updated" };
    useStratosStore.getState().setSessions([session]);
    useStratosStore.getState().updateSession("s1", newAction);
    expect(useStratosStore.getState().sessions[0].action.title).toBe("Updated");
  });

  it("updateSession ignores non-matching id", () => {
    useStratosStore.getState().setSessions([session]);
    useStratosStore.getState().updateSession("other", session.action);
    expect(useStratosStore.getState().sessions[0].action.title).toBe("Test Action");
  });
});
