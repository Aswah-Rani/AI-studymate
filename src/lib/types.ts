export interface QuizQuestion {
  question: string;
  options: string[]; // exactly 4
  answerIndex: number; // 0-3
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyPack {
  title: string;
  tldr: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export type PackSource = "ai" | "fallback";

export interface GenerateResponse {
  pack: StudyPack;
  source: PackSource;
  /** Human-readable note shown when the pack is not a full AI result. */
  notice?: string;
}

export type ApiErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "unavailable"
  | "bad_request";

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string };
}

export const LIMITS = {
  minNotesChars: 80,
  maxNotesChars: 12000,
} as const;
