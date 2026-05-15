import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchSessions, createSession, completeSession, fetchUserContext, saveUserContext } from "./api";
import type { UserContext, ActionSession } from "@/types";

const mockContext: UserContext = {
  type: "creator",
  level: "0-1K",
  businessStage: "idea",
};

const mockSession: ActionSession = {
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
  vi.restoreAllMocks();
});

describe("fetchSessions", () => {
  it("GET /api/sessions 호출 후 목록 반환", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([mockSession]), { status: 200 })
    );
    const result = await fetchSessions();
    expect(fetch).toHaveBeenCalledWith("/api/sessions");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s1");
  });

  it("non-ok 응답 시 throw", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 401 })
    );
    await expect(fetchSessions()).rejects.toThrow();
  });
});

describe("createSession", () => {
  it("POST /api/sessions 호출 후 세션 반환", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockSession), { status: 200 })
    );
    const result = await createSession("test", mockContext);
    expect(fetch).toHaveBeenCalledWith("/api/sessions", expect.objectContaining({ method: "POST" }));
    expect(result.id).toBe("s1");
  });
});

describe("completeSession", () => {
  it("PATCH /api/sessions/s1/complete 호출", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    await completeSession("s1");
    expect(fetch).toHaveBeenCalledWith("/api/sessions/s1/complete", { method: "PATCH" });
  });
});

describe("fetchUserContext", () => {
  it("GET /api/user-context 호출 후 컨텍스트 반환", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockContext), { status: 200 })
    );
    const result = await fetchUserContext();
    expect(result).toEqual(mockContext);
  });

  it("null 반환 시 null", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(null), { status: 200 })
    );
    const result = await fetchUserContext();
    expect(result).toBeNull();
  });
});

describe("saveUserContext", () => {
  it("PUT /api/user-context 호출", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    await saveUserContext(mockContext);
    expect(fetch).toHaveBeenCalledWith("/api/user-context", expect.objectContaining({ method: "PUT" }));
  });
});
