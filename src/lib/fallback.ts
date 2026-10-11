import type { StudyPack } from "./types";

const STOPWORDS = new Set(
  "the a an and or but of to in on for with is are was were be been it this that these those as at by from into than then so such can will would should could not no yes you your our their its".split(
    " ",
  ),
);

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && s.length <= 280);
}

function pickKeyword(sentence: string): string | null {
  const words = sentence.match(/[A-Za-z][A-Za-z-]{4,}/g) ?? [];
  const candidates = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (b.length > a.length ? b : a));
}

/**
 * A deliberately simple, no-AI study pack used when Claude is unavailable.
 * It extracts sentences and builds fill-in-the-blank flashcards so the user
 * still gets something useful instead of an error. It is clearly labelled
 * "basic mode" in the UI. Quiz is left empty (a quiz needs real distractors).
 */
export function buildFallbackPack(notes: string): StudyPack | null {
  const sentences = splitSentences(notes);
  if (sentences.length < 3) return null;

  const firstLine = notes.split("\n").find((l) => l.trim().length > 0) ?? "Study notes";
  const title = firstLine.trim().slice(0, 80);

  // Prefer longer sentences: they tend to carry more information.
  const ranked = [...sentences].sort((a, b) => b.length - a.length);
  const keyPoints = ranked.slice(0, Math.min(6, ranked.length));

  const flashcards = keyPoints
    .map((s) => {
      const kw = pickKeyword(s);
      if (!kw) return null;
      return {
        front: s.replace(new RegExp(`\\b${kw}\\b`), "_____"),
        back: kw,
      };
    })
    .filter((c): c is { front: string; back: string } => c !== null)
    .slice(0, 8);

  if (flashcards.length < 3) return null;

  return {
    title,
    tldr: sentences.slice(0, 2).join(" "),
    keyPoints,
    quiz: [],
    flashcards,
  };
}
