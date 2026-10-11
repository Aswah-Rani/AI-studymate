import type { StudyPack } from "./types";

export type ValidationResult =
  | { ok: true; value: StudyPack }
  | { ok: false; errors: string[] };

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isText = (v: unknown, max = 600): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

/**
 * Validates untrusted model output against the StudyPack shape.
 * The model is asked for structured JSON, but we never trust it:
 * every field is checked and trimmed before it reaches the UI.
 */
export function validateStudyPack(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObj(input)) return { ok: false, errors: ["Output is not an object"] };

  if (!isText(input.title, 120)) errors.push("title must be 1-120 chars");
  if (!isText(input.tldr, 600)) errors.push("tldr must be 1-600 chars");

  const keyPoints = input.keyPoints;
  if (
    !Array.isArray(keyPoints) ||
    keyPoints.length < 3 ||
    keyPoints.length > 8 ||
    !keyPoints.every((k) => isText(k))
  ) {
    errors.push("keyPoints must be 3-8 non-empty strings");
  }

  const quiz = input.quiz;
  if (!Array.isArray(quiz) || quiz.length < 3 || quiz.length > 10) {
    errors.push("quiz must have 3-10 questions");
  } else {
    quiz.forEach((q, i) => {
      if (!isObj(q)) {
        errors.push(`quiz[${i}] is not an object`);
        return;
      }
      if (!isText(q.question)) errors.push(`quiz[${i}].question invalid`);
      if (
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.options.every((o) => isText(o, 300))
      ) {
        errors.push(`quiz[${i}].options must be exactly 4 strings`);
      }
      if (
        typeof q.answerIndex !== "number" ||
        !Number.isInteger(q.answerIndex) ||
        q.answerIndex < 0 ||
        q.answerIndex > 3
      ) {
        errors.push(`quiz[${i}].answerIndex must be an integer 0-3`);
      }
      if (!isText(q.explanation)) errors.push(`quiz[${i}].explanation invalid`);
    });
  }

  const cards = input.flashcards;
  if (!Array.isArray(cards) || cards.length < 3 || cards.length > 12) {
    errors.push("flashcards must have 3-12 cards");
  } else {
    cards.forEach((c, i) => {
      if (!isObj(c) || !isText(c.front, 300) || !isText(c.back, 600)) {
        errors.push(`flashcards[${i}] must have non-empty front/back`);
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  const v = input as unknown as StudyPack;
  return {
    ok: true,
    value: {
      title: v.title.trim(),
      tldr: v.tldr.trim(),
      keyPoints: v.keyPoints.map((k) => k.trim()),
      quiz: v.quiz.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
        answerIndex: q.answerIndex,
        explanation: q.explanation.trim(),
      })),
      flashcards: v.flashcards.map((c) => ({
        front: c.front.trim(),
        back: c.back.trim(),
      })),
    },
  };
}
