import { StudyMate } from "@/components/StudyMate";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <p className="brand">AI StudyMate</p>
      </header>
      <main id="main" className="container">
        <h1>Turn your notes into a study pack</h1>
        <p className="lede">
          Paste your notes and get a summary, a multiple-choice quiz and flashcards. Your notes are
          sent to Claude to generate the pack and are not stored by this app.
        </p>
        <StudyMate />
      </main>
      <footer className="site-footer">
        <p>AI-generated content can contain mistakes. Check important facts against your sources.</p>
      </footer>
    </>
  );
}
