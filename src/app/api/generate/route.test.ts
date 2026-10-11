import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { anthropicToolResponse, jsonResponse, longNotes, validPack } from "@/test/fixtures";

let ipCounter = 0;
function makeRequest(body: unknown, rawBody?: string) {
  ipCounter += 1; // unique IP per test so the in-memory rate limiter never interferes
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${ipCounter}` },
    body: rawBody ?? JSON.stringify(body),
  });
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns an AI pack on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(anthropicToolResponse(validPack))));
    const res = await POST(makeRequest({ notes: longNotes }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("ai");
    expect(body.pack.quiz).toHaveLength(3);
  });

  it("rejects invalid JSON with 400", async () => {
    const res = await POST(makeRequest(null, "{not json"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("bad_request");
  });

  it("rejects notes that are too short with 400", async () => {
    const res = await POST(makeRequest({ notes: "tiny" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_input");
  });

  it("falls back to a basic pack when the AI is down (and says so)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({}, 500)));
    const res = await POST(makeRequest({ notes: longNotes }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(body.notice).toMatch(/basic study pack/i);
    expect(body.pack.quiz).toEqual([]);
  });

  it("falls back gracefully when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(makeRequest({ notes: longNotes }));
    const body = await res.json();
    expect(body.source).toBe("fallback");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 503 when the AI fails and notes are too thin for a fallback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({}, 401)));
    const thin = "word ".repeat(30); // passes length check, but has no usable sentences
    const res = await POST(makeRequest({ notes: thin }));
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe("unavailable");
  });

  it("rate limits a single IP", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(anthropicToolResponse(validPack))));
    const sameIp = () =>
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
        body: JSON.stringify({ notes: longNotes }),
      });
    let last = 200;
    for (let i = 0; i < 11; i++) last = (await POST(sameIp())).status;
    expect(last).toBe(429);
  });
});
