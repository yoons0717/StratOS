import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchSessions, createSession, completeSession, fetchUserContext, saveUserContext, regenerateSession } from "./api";
import { defaultCtx, makeSession } from "@/tests/fixtures";

const mockSession = makeSession({ id: "s1" });

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
    const result = await createSession("test", defaultCtx);
    expect(fetch).toHaveBeenCalledWith("/api/sessions", expect.objectContaining({ method: "POST" }));
    expect(result.id).toBe("s1");
  });

  it("channel을 request body에 포함", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockSession), { status: 200 })
    );
    await createSession("test", defaultCtx, "instagram-dm");
    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.channel).toBe("instagram-dm");
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
      new Response(JSON.stringify(defaultCtx), { status: 200 })
    );
    const result = await fetchUserContext();
    expect(result).toEqual(defaultCtx);
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
    await saveUserContext(defaultCtx);
    expect(fetch).toHaveBeenCalledWith("/api/user-context", expect.objectContaining({ method: "PUT" }));
  });
});

describe("regenerateSession", () => {
  it("PATCH /api/sessions/:id 호출 후 세션 반환", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockSession), { status: 200 })
    );
    const result = await regenerateSession("s1");
    expect(fetch).toHaveBeenCalledWith("/api/sessions/s1", { method: "PATCH" });
    expect(result.id).toBe("s1");
  });

  it("non-ok 응답 시 throw", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 500 })
    );
    await expect(regenerateSession("s1")).rejects.toThrow("API error: 500");
  });
});
