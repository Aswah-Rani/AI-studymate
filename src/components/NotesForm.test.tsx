import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesForm, SAMPLE_NOTES } from "./NotesForm";

describe("NotesForm", () => {
  it("has an accessible label and disables submit until there are enough notes", () => {
    render(<NotesForm onSubmit={() => {}} loading={false} />);
    expect(screen.getByLabelText(/paste your study notes/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create study pack/i })).toBeDisabled();
  });

  it("fills in sample notes and submits them", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NotesForm onSubmit={onSubmit} loading={false} />);

    await user.click(screen.getByRole("button", { name: /use sample notes/i }));
    expect(screen.getByLabelText(/paste your study notes/i)).toHaveValue(SAMPLE_NOTES);

    await user.click(screen.getByRole("button", { name: /create study pack/i }));
    expect(onSubmit).toHaveBeenCalledWith(SAMPLE_NOTES);
  });

  it("shows an error as an alert and marks the field invalid", () => {
    render(<NotesForm onSubmit={() => {}} loading={false} error="Something broke" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something broke");
    expect(screen.getByLabelText(/paste your study notes/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("disables the form while loading", () => {
    render(<NotesForm onSubmit={() => {}} loading={true} />);
    expect(screen.getByRole("button", { name: /creating your study pack/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /use sample notes/i })).toBeDisabled();
  });
});
