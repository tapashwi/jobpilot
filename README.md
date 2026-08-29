# JobPilot

Privacy-first job application assistant. Your resume stays on your device.
No AI at runtime, no subscription, no account.

## It is live

**https://jobpilot-ay8.pages.dev** — deployed 2026-08-26, Cloudflare Pages
project `jobpilot`. Static, three files, nothing server-side. Your resume text
never leaves the browser; there is no backend to send it to.

Redeploy after any change:

```bash
node scripts/build-engine.js
npx wrangler pages deploy app --project-name jobpilot --branch main
```

## Where this came from

JobPilot was designed and built inside the [Bootstrap](https://github.com/tapashwi/Bootstrap)
repository and split out here with `git subtree split`, so the history above is
the real history — not a squashed import.

The full design reasoning lives in that repo at
`docs/projects/jobpilot-plan.md`: why the matcher uses gates rather than a
weighted score, why PDF parsing and autofill are deliberately absent, and what
Manifest V3 does to browser-extension autofill.

## What it does

Answers one question honestly: **is this job worth applying to, and what am I
missing?**

- Paste your resume. Paste a job description.
- Deterministic matching — no LLM, so every result can be explained.
- **Hard requirements are gates, not percentages.** If a job needs five years
  and you have three, that is a fail with a reason, not "80% matched".
- Missing skills are separated into *required* and *preferred*, because they
  are not the same problem.

## What it deliberately does not do

- **No autofill, yet.** For a SEEK and Workday user it would add almost
  nothing: SEEK Quick Apply already pre-fills from your SEEK profile, and
  Workday's shadow-DOM form widgets ignore programmatic value changes. An
  autofill that silently does nothing is worse than none — you find out after
  submitting a half-empty application.
- **No resume file parsing, yet.** PDF is a printing format with no semantic
  structure; roughly a third of real resumes parse wrongly in ways you would
  not notice. Paste works today and is honest.
- **Never submits anything.** The final click is always yours.

See `docs/projects/jobpilot-plan.md` in Bootstrap for the full reasoning.

## Run

```bash
npm install
npm test          # the matching engine
```

The app is static: open `app/index.html` in a browser. No build step.
