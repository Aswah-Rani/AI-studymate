"use client";

import { useId, useState } from "react";
import { LIMITS } from "@/lib/types";

export const SAMPLE_NOTES = `Photosynthesis is the process plants use to turn light energy into chemical energy stored as glucose. It takes place in the chloroplasts, which contain the green pigment chlorophyll. The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH while splitting water and releasing oxygen. The Calvin cycle occurs in the stroma and uses ATP and NADPH to fix carbon dioxide into glucose. Factors that limit the rate of photosynthesis include light intensity, carbon dioxide concentration and temperature.`;

interface Props {
  onSubmit: (notes: string) => void;
  loading: boolean;
  error?: string | null;
}

export function NotesForm({ onSubmit, loading, error }: Props) {
  const [notes, setNotes] = useState("");
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const length = notes.trim().length;
  const tooShort = length < LIMITS.minNotesChars;
  const tooLong = length > LIMITS.maxNotesChars;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && !tooShort && !tooLong) onSubmit(notes);
      }}
      noValidate
    >
      <label htmlFor={`${id}-notes`} className="label">
        Paste your study notes
      </label>
      <textarea
        id={`${id}-notes`}
        className="textarea"
        rows={10}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        aria-invalid={error ? true : undefined}
        placeholder="Lecture notes, a textbook section, an article summary..."
      />
      <p id={helpId} className="help">
        {length.toLocaleString("en-US")} / {LIMITS.maxNotesChars.toLocaleString("en-US")} characters
        {tooShort && length > 0 ? ` (add at least ${LIMITS.minNotesChars} to continue)` : ""}
      </p>

      {error ? (
        <p id={errorId} role="alert" className="error">
          {error}
        </p>
      ) : null}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={loading || tooShort || tooLong}>
          {loading ? "Creating your study pack..." : "Create study pack"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setNotes(SAMPLE_NOTES)}
          disabled={loading}
        >
          Use sample notes
        </button>
      </div>
    </form>
  );
}
