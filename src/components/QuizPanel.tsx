"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

export function QuizPanel({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const answered = Object.keys(answers).length;
  const score = questions.reduce((n, q, i) => (answers[i] === q.answerIndex ? n + 1 : n), 0);

  function reset() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <section aria-labelledby="quiz-heading" className="panel">
      <h2 id="quiz-heading">Quiz</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (answered === questions.length) setChecked(true);
        }}
      >
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <fieldset key={qi} className="question" disabled={checked}>
              <legend>
                <span className="qnum">{qi + 1}.</span> {q.question}
              </legend>
              {q.options.map((opt, oi) => (
                <label key={oi} className="option">
                  <input
                    type="radio"
                    name={`q-${qi}`}
                    value={oi}
                    checked={chosen === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  />
                  <span>
                    <span aria-hidden="true">{LETTERS[oi]}. </span>
                    {opt}
                  </span>
                </label>
              ))}
              {checked ? (
                <p className={chosen === q.answerIndex ? "feedback correct" : "feedback wrong"}>
                  <strong>
                    {chosen === q.answerIndex
                      ? "Correct."
                      : `Not quite. Correct answer: ${LETTERS[q.answerIndex]}. ${q.options[q.answerIndex]}`}
                  </strong>{" "}
                  {q.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}

        <div className="actions">
          {!checked ? (
            <button type="submit" className="btn btn-primary" disabled={answered < questions.length}>
              Check answers
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Try again
            </button>
          )}
          {!checked && answered < questions.length ? (
            <span className="help">
              {answered} of {questions.length} answered
            </span>
          ) : null}
        </div>
      </form>

      <div role="status" aria-live="polite" className="score">
        {checked ? `You scored ${score} out of ${questions.length}.` : ""}
      </div>
    </section>
  );
}
