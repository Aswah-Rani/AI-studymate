# Deployment Checklist: AI StudyMate

> If your course (FE-11) gave you a template, copy these answers into it. Tick a box only after you have actually done and seen the thing. Unticked boxes are honest; ticked-but-untested boxes defeat the point of a checklist.

**Release:** v1.0.0  **Date:** ____  **Deployed by:** ____  **Production URL:** ____

## 1. Before deploying

- [ ] `npm install` works on a clean clone
- [ ] `npm test` passes (paste the summary line in `docs/AUDIT.md`)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes locally
- [ ] `.env.local` is in `.gitignore` and no secrets are in git history (`git log -p | grep -i "sk-ant"` finds nothing)
- [ ] `.env.example` lists every variable the app reads

## 2. Configuration

- [ ] `ANTHROPIC_API_KEY` set in Vercel (Production and Preview)
- [ ] Spend limit set on the key in console.anthropic.com
- [ ] `ANTHROPIC_MODEL` decided (default `claude-sonnet-5-5`)

## 3. Smoke test on the live URL

- [ ] Home page loads over HTTPS, no console errors
- [ ] "Use sample notes" then "Create study pack" returns summary, quiz and flashcards
- [ ] Quiz can be answered, scored, and retried with the keyboard only
- [ ] Flashcards flip and move next/previous
- [ ] Works at 360 px width on a real phone

## 4. Failure behaviour (see each state once)

- [ ] Notes under 80 characters: inline error, no request sent
- [ ] Temporarily remove the API key in a **Preview** deployment: app shows basic mode with the notice
- [ ] Offline (DevTools, Network, Offline): friendly error, notes are kept in the box
- [ ] Rapid repeat requests (11+ in 10 minutes from one IP): friendly rate-limit message

## 5. Quality gates

- [ ] Lighthouse mobile: Performance, Accessibility, Best Practices, SEO recorded in `docs/AUDIT.md`
- [ ] axe DevTools or WAVE: no violations recorded in `docs/AUDIT.md`
- [ ] One audit-driven fix made and documented

## 6. Rollback and monitoring

- [ ] I know the previous good deployment (Vercel, Deployments) and have practised "Promote to Production" once
- [ ] Code rollback command known: `git revert <sha> && git push`
- [ ] I know where to see errors: Vercel project, Logs, filter `[generate]`
- [ ] (Optional) Uptime monitor on the home page

## Sign-off

| Role | Name | Date | Notes |
| --- | --- | --- | --- |
| Author | | | |
| Reviewer (peer or mentor) | | | |
