import { describe, expect, it } from "vitest";
import { buildFallbackPack } from "./fallback";
import { validateStudyPack } from "./schema";
import { longNotes } from "@/test/fixtures";

describe("buildFallbackPack", () => {
  it("builds a basic pack with fill-in-the-blank flashcards", () => {
    const pack = buildFallbackPack(longNotes);
    expect(pack).not.toBeNull();
    expect(pack!.quiz).toEqual([]);
    expect(pack!.flashcards.length).toBeGreaterThanOrEqual(3);
    for (const card of pack!.flashcards) {
      expect(card.front).toContain("_____");
      expect(card.back.length).toBeGreaterThan(0);
    }
  });

  it("returns null when notes have too few usable sentences", () => {
    expect(buildFallbackPack("Short. Tiny. Bits.")).toBeNull();
  });

  it("does not satisfy the AI schema (it has no quiz), so it can never be mistaken for one", () => {
    const pack = buildFallbackPack(longNotes)!;
    expect(validateStudyPack(pack).ok).toBe(false);
  });
});
