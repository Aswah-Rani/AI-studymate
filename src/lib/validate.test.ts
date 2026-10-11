import { describe, expect, it } from "vitest";
import { checkNotes, createRateLimiter } from "./validate";
import { LIMITS } from "./types";

describe("checkNotes", () => {
  it("rejects non-string input", () => {
    expect(checkNotes(42).ok).toBe(false);
    expect(checkNotes(undefined).ok).toBe(false);
  });

  it("rejects notes that are too short", () => {
    const res = checkNotes("too short");
    expect(res.ok).toBe(false);
  });

  it("rejects notes that are too long", () => {
    const res = checkNotes("a".repeat(LIMITS.maxNotesChars + 1));
    expect(res.ok).toBe(false);
  });

  it("normalises whitespace for valid notes", () => {
    const text = "word   ".repeat(30) + "\r\nend";
    const res = checkNotes(text);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.notes).not.toMatch(/ {2,}/);
      expect(res.notes).not.toMatch(/\r/);
    }
  });
});

describe("createRateLimiter", () => {
  it("allows up to max hits per window then blocks", () => {
    let t = 0;
    const limiter = createRateLimiter(2, 1000, () => t);
    expect(limiter.take("ip")).toBe(true);
    expect(limiter.take("ip")).toBe(true);
    expect(limiter.take("ip")).toBe(false);
    expect(limiter.take("other")).toBe(true);
  });

  it("resets after the window passes", () => {
    let t = 0;
    const limiter = createRateLimiter(1, 1000, () => t);
    expect(limiter.take("ip")).toBe(true);
    expect(limiter.take("ip")).toBe(false);
    t = 1001;
    expect(limiter.take("ip")).toBe(true);
  });
});
