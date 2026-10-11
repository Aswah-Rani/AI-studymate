import { ClaudeError, DEFAULT_MODEL, generateStudyPack } from "@/lib/claude";
import { buildFallbackPack } from "@/lib/fallback";
import { checkNotes, createRateLimiter } from "@/lib/validate";
import type { ApiErrorBody, GenerateResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// 10 requests per IP per 10 minutes (best-effort, in-memory).
const limiter = createRateLimiter(10, 10 * 60 * 1000);

function errorResponse(status: number, code: ApiErrorBody["error"]["code"], message: string) {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

function describeFailure(err: unknown): string {
  if (err instanceof ClaudeError) {
    switch (err.kind) {
      case "not_configured":
        return "The AI service is not configured on this server.";
      case "auth":
        return "The AI service rejected our credentials.";
      case "rate_limited":
        return "The AI service is busy right now.";
      case "timeout":
        return "The AI service took too long to respond.";
      case "invalid_output":
        return "The AI returned something we could not use.";
      default:
        return "The AI service is unavailable.";
    }
  }
  return "Something went wrong with the AI service.";
}

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.take(ip)) {
    return errorResponse(429, "rate_limited", "Too many requests. Please wait a few minutes and try again.");
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorResponse(400, "bad_request", "Request body must be valid JSON.");
  }

  const check = checkNotes((json as { notes?: unknown })?.notes);
  if (!check.ok) {
    return errorResponse(400, "invalid_input", check.message);
  }

  try {
    const pack = await generateStudyPack(check.notes, {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    });
    const body: GenerateResponse = { pack, source: "ai" };
    return Response.json(body);
  } catch (err) {
    // Log the kind only. Never log notes or keys.
    console.error("[generate] AI call failed:", err instanceof ClaudeError ? err.kind : "unknown");

    const fallback = buildFallbackPack(check.notes);
    if (fallback) {
      const body: GenerateResponse = {
        pack: fallback,
        source: "fallback",
        notice: `${describeFailure(err)} Showing a basic study pack without AI (no quiz). Try again in a moment for the full version.`,
      };
      return Response.json(body);
    }
    return errorResponse(
      503,
      "unavailable",
      `${describeFailure(err)} Please try again in a moment.`,
    );
  }
}
