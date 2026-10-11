import { LIMITS } from "./types";

export type NotesCheck = { ok: true; notes: string } | { ok: false; message: string };

/** Normalises whitespace and enforces length limits on user notes. */
export function checkNotes(raw: unknown): NotesCheck {
  if (typeof raw !== "string") {
    return { ok: false, message: "Notes must be text." };
  }
  const notes = raw.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (notes.length < LIMITS.minNotesChars) {
    return {
      ok: false,
      message: `Please add a bit more (at least ${LIMITS.minNotesChars} characters) so there is enough to study from.`,
    };
  }
  if (notes.length > LIMITS.maxNotesChars) {
    return {
      ok: false,
      message: `Notes are too long. Please keep them under ${LIMITS.maxNotesChars.toLocaleString("en-US")} characters.`,
    };
  }
  return { ok: true, notes };
}

/**
 * Tiny in-memory fixed-window rate limiter.
 * NOTE: on serverless platforms each instance has its own memory, so this is
 * best-effort abuse protection, not a hard guarantee (see README limitations).
 */
export function createRateLimiter(max: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    take(key: string): boolean {
      const t = now();
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      if (entry.count >= max) return false;
      entry.count += 1;
      return true;
    },
  };
}
