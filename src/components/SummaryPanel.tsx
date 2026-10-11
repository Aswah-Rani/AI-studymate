import type { StudyPack } from "@/lib/types";

export function SummaryPanel({ pack }: { pack: Pick<StudyPack, "title" | "tldr" | "keyPoints"> }) {
  return (
    <section aria-labelledby="summary-heading" className="panel">
      <h2 id="summary-heading">Summary</h2>
      <h3 className="topic">{pack.title}</h3>
      <p>{pack.tldr}</p>
      <h3>Key points</h3>
      <ul>
        {pack.keyPoints.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
