import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizPanel } from "./QuizPanel";
import { validPack } from "@/test/fixtures";

describe("QuizPanel", () => {
  it("renders each question as a fieldset with radio options", () => {
    render(<QuizPanel questions={validPack.quiz} />);
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(screen.getAllByRole("radio")).toHaveLength(12);
  });

  it("keeps Check answers disabled until every question is answered", async () => {
    const user = userEvent.setup();
    render(<QuizPanel questions={validPack.quiz} />);
    const check = screen.getByRole("button", { name: /check answers/i });
    expect(check).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /stroma/i }));
    expect(screen.getByText(/1 of 3 answered/i)).toBeInTheDocument();
    expect(check).toBeDisabled();
  });

  it("scores the quiz and shows explanations", async () => {
    const user = userEvent.setup();
    render(<QuizPanel questions={validPack.quiz} />);

    await user.click(screen.getByRole("radio", { name: /stroma/i })); // correct
    await user.click(screen.getByRole("radio", { name: /keratin/i })); // wrong
    await user.click(screen.getByRole("radio", { name: /oxygen/i })); // correct
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(screen.getByRole("status")).toHaveTextContent("You scored 2 out of 3.");
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
    expect(screen.getByText(/chlorophyll is the green pigment/i)).toBeInTheDocument();
  });

  it("lets the learner try again", async () => {
    const user = userEvent.setup();
    render(<QuizPanel questions={validPack.quiz} />);
    await user.click(screen.getByRole("radio", { name: /stroma/i }));
    await user.click(screen.getByRole("radio", { name: /chlorophyll/i }));
    await user.click(screen.getByRole("radio", { name: /oxygen/i }));
    await user.click(screen.getByRole("button", { name: /check answers/i }));
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByRole("button", { name: /check answers/i })).toBeDisabled();
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });
});
