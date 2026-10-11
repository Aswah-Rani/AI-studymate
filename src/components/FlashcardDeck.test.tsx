import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardDeck } from "./FlashcardDeck";
import { validPack } from "@/test/fixtures";

describe("FlashcardDeck", () => {
  it("shows the first question and a position counter", () => {
    render(<FlashcardDeck cards={validPack.flashcards} />);
    expect(screen.getByText(/card 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText("Where does photosynthesis occur?")).toBeInTheDocument();
  });

  it("flips to the answer and back", async () => {
    const user = userEvent.setup();
    render(<FlashcardDeck cards={validPack.flashcards} />);
    await user.click(screen.getByRole("button", { name: /flip card/i }));
    expect(screen.getByText("Chloroplasts")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /flip card/i }));
    expect(screen.getByText("Where does photosynthesis occur?")).toBeInTheDocument();
  });

  it("moves between cards, wraps around, and resets the flip", async () => {
    const user = userEvent.setup();
    render(<FlashcardDeck cards={validPack.flashcards} />);

    await user.click(screen.getByRole("button", { name: /flip card/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/card 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText("What does the Calvin cycle produce?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /previous/i }));
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText(/card 3 of 3/i)).toBeInTheDocument();
  });

  it("renders nothing for an empty deck", () => {
    const { container } = render(<FlashcardDeck cards={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
