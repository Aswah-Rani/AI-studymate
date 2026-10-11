import { buildUserMessage, SYSTEM_PROMPT, TOOL_NAME, TOOL_SCHEMA } from "./prompt";
import { validateStudyPack } from "./schema";
import type { StudyPack } from "./types";

export type ClaudeErrorKind =
  | "not_configured"
  | "timeout"
  | "rate_limited"
  | "auth"
  | "upstream"
  | "invalid_output";

export class ClaudeError extends Error {
  constructor(
    public kind: ClaudeErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "ClaudeError";
  }
}

export interface GenerateOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
}

const API_URL = "https://api.anthropic.com/v1/messages";
export const DEFAULT_MODEL = "claude-sonnet-5-5";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Calls Claude with forced tool use and returns a validated StudyPack.
 * Retries once on transient failures (429 / 5xx / timeout / invalid output).
 * Throws ClaudeError with a stable `kind` so callers can decide how to degrade.
 */
export async function generateStudyPack(
  notes: string,
  opts: GenerateOptions = {},
): Promise<StudyPack> {
  const {
    apiKey,
    model = DEFAULT_MODEL,
    timeoutMs = 45_000,
    maxAttempts = 2,
    retryDelayMs = 500,
    fetchImpl = fetch,
  } = opts;

  if (!apiKey) {
    throw new ClaudeError("not_configured", "ANTHROPIC_API_KEY is not set");
  }

  let lastError: ClaudeError = new ClaudeError("upstream", "Unknown error");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await callOnce(notes, { apiKey, model, timeoutMs, fetchImpl });
    } catch (err) {
      const e = err instanceof ClaudeError ? err : new ClaudeError("upstream", String(err));
      lastError = e;
      const retryable =
        e.kind === "timeout" ||
        e.kind === "rate_limited" ||
        e.kind === "upstream" ||
        e.kind === "invalid_output";
      if (!retryable || attempt === maxAttempts) break;
      await sleep(retryDelayMs);
    }
  }
  throw lastError;
}

async function callOnce(
  notes: string,
  cfg: { apiKey: string; model: string; timeoutMs: number; fetchImpl: typeof fetch },
): Promise<StudyPack> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

  let res: Response;
  try {
    res = await cfg.fetchImpl(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content: buildUserMessage(notes) }],
      }),
    });
  } catch (err) {
    if ((err as { name?: string } | null)?.name === "AbortError") {
      throw new ClaudeError("timeout", "Claude took too long to respond");
    }
    throw new ClaudeError("upstream", "Could not reach Claude");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429 || res.status === 529) {
    throw new ClaudeError("rate_limited", "Claude is busy right now");
  }
  if (res.status === 401 || res.status === 403) {
    throw new ClaudeError("auth", "The API key was rejected");
  }
  if (!res.ok) {
    throw new ClaudeError("upstream", `Claude returned status ${res.status}`);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ClaudeError("invalid_output", "Claude returned unreadable JSON");
  }

  const content = (data as { content?: unknown })?.content;
  const block = Array.isArray(content)
    ? (content as Array<{ type?: string; name?: string; input?: unknown }>).find(
        (b) => b?.type === "tool_use" && b?.name === TOOL_NAME,
      )
    : undefined;
  if (!block) {
    throw new ClaudeError("invalid_output", "Claude did not return a study pack");
  }

  const result = validateStudyPack(block.input);
  if (!result.ok) {
    throw new ClaudeError("invalid_output", `Invalid study pack: ${result.errors.join("; ")}`);
  }
  return result.value;
}
