"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  if (!card) return null;

  function go(delta: number) {
    setIndex((i) => (i + delta + cards.length) % cards.length);
    setFlipped(false);
  }

  return (
    <section aria-labelledby="cards-heading" className="panel">
      <h2 id="cards-heading">Flashcards</h2>
      <p className="help">
        Card {index + 1} of {cards.length}
      </p>

      <div className="card">
        <p className="card-side">{flipped ? "Answer" : "Question"}</p>
        <p className="card-text" aria-live="polite">
          {flipped ? card.back : card.front}
        </p>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => go(-1)}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setFlipped((f) => !f)}>
          Flip card
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go(1)}>
          Next
        </button>
      </div>
    </section>
  );
}
