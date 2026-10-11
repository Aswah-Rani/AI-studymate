import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryPanel } from "./SummaryPanel";
import { validPack } from "@/test/fixtures";

describe("SummaryPanel", () => {
  it("renders the title, tl;dr and key points as a list", () => {
    render(<SummaryPanel pack={validPack} />);
    expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByText(validPack.tldr)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(validPack.keyPoints.length);
  });
});
