import { describe, expect, it, vi } from "vitest";
import { ClaudeError, generateStudyPack } from "./claude";
import { anthropicToolResponse, jsonResponse, longNotes, validPack } from "@/test/fixtures";

const base = { apiKey: "test-key", retryDelayMs: 0 };

describe("generateStudyPack", () => {
  it("throws not_configured when there is no API key", async () => {
    await expect(generateStudyPack(longNotes, { retryDelayMs: 0 })).rejects.toMatchObject({
      kind: "not_configured",
    });
  });

  it("returns a validated pack and sends forced tool use", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(anthropicToolResponse(validPack)));
    const pack = await generateStudyPack(longNotes, { ...base, fetchImpl: fetchImpl as never });
    expect(pack.title).toBe("Photosynthesis");

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    const body = JSON.parse(init.body as string);
    expect(body.tool_choice).toEqual({ type: "tool", name: "create_study_pack" });
    expect(body.messages[0].content).toContain("<notes>");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("test-key");
  });

  it("retries once when the model output fails validation, then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(anthropicToolResponse({ title: "bad" })))
      .mockResolvedValueOnce(jsonResponse(anthropicToolResponse(validPack)));
    const pack = await generateStudyPack(longNotes, { ...base, fetchImpl });
    expect(pack.title).toBe("Photosynthesis");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("gives up with invalid_output after max attempts", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(anthropicToolResponse({ title: "bad" })));
    await expect(generateStudyPack(longNotes, { ...base, fetchImpl })).rejects.toMatchObject({
      kind: "invalid_output",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 and reports rate_limited if it keeps failing", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 429));
    await expect(generateStudyPack(longNotes, { ...base, fetchImpl })).rejects.toMatchObject({
      kind: "rate_limited",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry on auth errors", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 401));
    await expect(generateStudyPack(longNotes, { ...base, fetchImpl })).rejects.toMatchObject({
      kind: "auth",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("maps an aborted request to a timeout error", async () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    const fetchImpl = vi.fn(async () => {
      throw abort;
    });
    await expect(generateStudyPack(longNotes, { ...base, fetchImpl })).rejects.toMatchObject({
      kind: "timeout",
    });
  });

  it("maps network failures to an upstream error", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const err = await generateStudyPack(longNotes, { ...base, fetchImpl }).catch((e) => e);
    expect(err).toBeInstanceOf(ClaudeError);
    expect(err.kind).toBe("upstream");
  });

  it("rejects a response with no tool_use block", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ content: [{ type: "text", text: "Sure! Here is a quiz..." }] }),
    );
    await expect(generateStudyPack(longNotes, { ...base, fetchImpl })).rejects.toMatchObject({
      kind: "invalid_output",
    });
  });
});
