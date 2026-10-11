import { describe, expect, it } from "vitest";
import { validateStudyPack } from "./schema";
import { validPack } from "@/test/fixtures";

describe("validateStudyPack", () => {
  it("accepts a valid pack and trims strings", () => {
    const res = validateStudyPack({ ...validPack, title: "  Photosynthesis  " });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.title).toBe("Photosynthesis");
  });

  it("rejects non-objects", () => {
    expect(validateStudyPack(null).ok).toBe(false);
    expect(validateStudyPack("nope").ok).toBe(false);
    expect(validateStudyPack([]).ok).toBe(false);
  });

  it("rejects a quiz question with the wrong number of options", () => {
    const bad = {
      ...validPack,
      quiz: [{ ...validPack.quiz[0], options: ["a", "b", "c"] }, validPack.quiz[1], validPack.quiz[2]],
    };
    const res = validateStudyPack(bad);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join(" ")).toMatch(/options must be exactly 4/);
  });

  it("rejects an out-of-range answerIndex", () => {
    const bad = {
      ...validPack,
      quiz: [{ ...validPack.quiz[0], answerIndex: 4 }, validPack.quiz[1], validPack.quiz[2]],
    };
    expect(validateStudyPack(bad).ok).toBe(false);
  });

  it("rejects too few key points, quiz questions or flashcards", () => {
    expect(validateStudyPack({ ...validPack, keyPoints: ["one"] }).ok).toBe(false);
    expect(validateStudyPack({ ...validPack, quiz: [] }).ok).toBe(false);
    expect(validateStudyPack({ ...validPack, flashcards: [validPack.flashcards[0]] }).ok).toBe(false);
  });

  it("rejects empty strings and non-integer answer indexes", () => {
    expect(validateStudyPack({ ...validPack, title: "   " }).ok).toBe(false);
    const bad = {
      ...validPack,
      quiz: [{ ...validPack.quiz[0], answerIndex: 1.5 }, validPack.quiz[1], validPack.quiz[2]],
    };
    expect(validateStudyPack(bad).ok).toBe(false);
  });
});
