# Capstone Portfolio Entry: AI StudyMate

## 1. Project brief

AI StudyMate turns a student's raw study notes into an active-recall study pack: a short summary, a multiple-choice quiz with explanations, and flashcards. It is for students who have notes but no time to convert them into practice questions, and re-reading alone works poorly for memory. Claude does the part that rules cannot do well, which is understanding the notes and writing good questions with plausible wrong answers, and returns it as validated structured data rather than free text. I chose this idea because *(edit this sentence so it is true for you: for example, "I am a student and I wanted something I would actually use before exams.")*

## 2. Live application

- URL: `<paste Vercel URL>`
- Accessible: built toward WCAG 2.1 AA (details and audit in the README and `docs/AUDIT.md`)

## 3. Repository

- Link: `<paste GitHub URL>`
- README covers setup (`npm install && npm run dev`), architecture, how the AI is used, failure behaviour, and known limitations.

## 4. Testing evidence

- Command: `npm run test:coverage`
- Output / screenshot: `<attach from docs/AUDIT.md section 1>`
- Critical user flow covered end to end in `src/components/StudyMate.test.tsx` (notes to results, focus, fallback notice, error states, axe scan).

## 5. Performance and accessibility audit

- Lighthouse (mobile / desktop): `<fill in from docs/AUDIT.md>`
- axe or WAVE: `<fill in>`
- One improvement from an audit finding: `<fill in from docs/AUDIT.md section 4>`

## 6. Deployment and operation

- Deployment checklist: `docs/DEPLOYMENT_CHECKLIST.md` (filled out and signed off)
- Fails safely: AI timeout, rate limit, malformed output, missing key, network loss, and bad input each have a defined, tested behaviour (README, "Resilience" table). When the AI is unavailable the app shows a labelled basic mode instead of a blank error.
- Rollback: Vercel "Promote to Production" on the last good deployment, or `git revert` and push to `main`. Monitoring: Vercel function logs filtered by `[generate]`.

## 7. Reflection (one page max)

> This section has to be yours. The brief asks for honest thinking, and a reviewer can tell when it is generic. Below are prompts and real material from this build to jog your memory. Delete this box and write 150 to 300 words in your own voice.

**What was hardest? Why?** Think about where you got stuck for longest. Candidates from this project: getting Claude to return reliably structured output (and deciding what to do when it does not); designing a fallback that is honest about being worse than the AI version; making a quiz usable with keyboard and screen reader (fieldsets, live regions, focus after results); getting deployment and environment variables right.

**What would you do differently next time?** Candidates: write the failure-mode tests before the happy path; run the accessibility audit earlier instead of at the end; add streaming so the first section appears sooner; use a persistent store for rate limiting; test with real students' notes earlier than the sample notes.

**One thing that surprised you.** Be specific and personal: something you assumed that turned out wrong, for example how often the model output needed validation, how much of "accessible" was just using the right native HTML element, or how different the audit scores were from what you expected.

Avoid: "It was a great learning experience." Say what you believed before, what happened, and what you believe now.
