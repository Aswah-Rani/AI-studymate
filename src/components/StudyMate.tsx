"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiErrorBody, GenerateResponse } from "@/lib/types";
import { NotesForm } from "./NotesForm";
import { SummaryPanel } from "./SummaryPanel";
import { QuizPanel } from "./QuizPanel";
import { FlashcardDeck } from "./FlashcardDeck";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: GenerateResponse };

export function StudyMate() {
  const [state, setState] = useState<State>({ status: "idle" });
  const resultsRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the results so keyboard and screen-reader users land on them.
  useEffect(() => {
    if (state.status === "done") resultsRef.current?.focus();
  }, [state.status]);

  async function handleSubmit(notes: string) {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const body = (await res.json().catch(() => null)) as GenerateResponse | ApiErrorBody | null;

      if (!res.ok || !body) {
        const message =
          body && "error" in body
            ? body.error.message
            : "Something went wrong. Please try again.";
        setState({ status: "error", message });
        return;
      }
      if (!("pack" in body)) {
        setState({ status: "error", message: "Unexpected response from the server." });
        return;
      }
      setState({ status: "done", data: body });
    } catch {
      setState({
        status: "error",
        message: "Could not reach the server. Check your connection and try again.",
      });
    }
  }

  const loading = state.status === "loading";

  return (
    <div>
      <NotesForm
        onSubmit={handleSubmit}
        loading={loading}
        error={state.status === "error" ? state.message : null}
      />

      <div role="status" aria-live="polite" className="sr-only">
        {loading ? "Creating your study pack, please wait." : ""}
      </div>

      {state.status === "done" ? (
        <div className="results">
          <h2 ref={resultsRef} tabIndex={-1} className="results-heading">
            Your study pack
          </h2>

          {state.data.notice ? (
            <p role="status" className="notice">
              {state.data.notice}
            </p>
          ) : null}

          <SummaryPanel pack={state.data.pack} />
          {state.data.pack.quiz.length > 0 ? <QuizPanel questions={state.data.pack.quiz} /> : null}
          <FlashcardDeck cards={state.data.pack.flashcards} />
        </div>
      ) : null}
    </div>
  );
}
