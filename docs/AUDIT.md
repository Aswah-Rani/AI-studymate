# Performance and Accessibility Audit

Fill this in after your first production deploy. The numbers must come from your own runs on the live URL. Do not estimate.

## 1. Test evidence

Run:

```bash
npm run test:coverage
```

Paste the summary here (or attach a screenshot of the terminal and `coverage/index.html`):

```
<paste test summary and coverage table here>
```

Pass bar: all tests pass, component coverage at or above 50%.

## 2. Lighthouse (mobile and desktop)

How: open the **live URL** in Chrome incognito, DevTools, Lighthouse tab, choose Mobile, tick all categories, Analyze. Repeat for Desktop.

| Category | Mobile | Desktop | Target |
| --- | --- | --- | --- |
| Performance | | | 90+ (minimum 85) |
| Accessibility | | | 90+ |
| Best Practices | | | 90+ |
| SEO | | | 90+ |

Screenshot: `docs/screenshots/lighthouse-mobile.png`

## 3. Accessibility audit (axe DevTools or WAVE)

How: install the axe DevTools extension (or WAVE). Scan the page in two states: (a) empty form, (b) after generating a study pack with the sample notes. Also check colour contrast here, because the automated tests run in jsdom, which cannot compute colours.

| State | Tool | Violations | Notes |
| --- | --- | --- | --- |
| Empty form | | | |
| Results view | | | |

Manual checks:

- [ ] Whole flow with keyboard only (Tab, Shift+Tab, Space, Enter, arrow keys in radio groups)
- [ ] Screen reader pass (NVDA on Windows, VoiceOver on Mac/iOS, or TalkBack): errors are announced, results heading receives focus, quiz score is announced
- [ ] 200% zoom: no horizontal scroll, nothing cut off

Screenshot: `docs/screenshots/axe-results.png`

## 4. One concrete improvement based on a finding

Fill in from a **real** finding in your audit. Template:

- **Finding:** (what the tool or manual check reported, with the tool name and rule id)
- **Why it mattered:** (who is affected, how)
- **Change:** (file and what you changed; link the commit)
- **Re-test result:** (before and after score or violation count)

### Likely candidates if you need ideas (only use the ones your audit really reports)

- Lighthouse "Reduce unused JavaScript" or slow LCP: check bundle with `next build` output, lazy-load `QuizPanel` and `FlashcardDeck` with `next/dynamic` since they render only after results.
- Contrast flagged on a muted text colour: darken `--muted` in `globals.css`.
- Missing meta description or social tags: extend `metadata` in `layout.tsx`.
- Touch target flagged on small controls: increase `min-height` in `.btn` / `.option`.
