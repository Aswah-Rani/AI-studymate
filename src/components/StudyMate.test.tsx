import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { StudyMate } from "./StudyMate";
import { jsonResponse, validPack } from "@/test/fixtures";

async function submitSampleNotes() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /use sample notes/i }));
  await user.click(screen.getByRole("button", { name: /create study pack/i }));
  return user;
}

describe("StudyMate (critical user flow)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("goes from notes to a full study pack and moves focus to the results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ pack: validPack, source: "ai" })),
    );
    render(<StudyMate />);
    await submitSampleNotes();

    const heading = await screen.findByRole("heading", { name: /your study pack/i });
    expect(heading).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quiz" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Flashcards" })).toBeInTheDocument();
  });

  it("shows a notice and hides the quiz in basic (fallback) mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          pack: { ...validPack, quiz: [] },
          source: "fallback",
          notice: "The AI service is busy right now. Showing a basic study pack without AI (no quiz).",
        }),
      ),
    );
    render(<StudyMate />);
    await submitSampleNotes();

    expect(await screen.findByText(/showing a basic study pack/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quiz" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Flashcards" })).toBeInTheDocument();
  });

  it("shows the server's error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ error: { code: "rate_limited", message: "Too many requests." } }, 429),
      ),
    );
    render(<StudyMate />);
    await submitSampleNotes();

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests.");
    expect(screen.queryByRole("heading", { name: /your study pack/i })).not.toBeInTheDocument();
  });

  it("shows a friendly message when the network is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    render(<StudyMate />);
    await submitSampleNotes();

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach the server/i);
  });

  it("has no axe violations in the results view", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ pack: validPack, source: "ai" })),
    );
    const { container } = render(<StudyMate />);
    await submitSampleNotes();
    await screen.findByRole("heading", { name: /your study pack/i });

    // jsdom cannot compute colours, so colour-contrast is checked in the browser audit instead.
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
