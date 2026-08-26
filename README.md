# JobPilot

Privacy-first job application assistant. Your resume stays on your device.
No AI at runtime, no subscription, no account.

## It is live

**https://jobpilot-ay8.pages.dev** — deployed 2026-08-26, Cloudflare Pages
project `jobpilot`. Static, three files, nothing server-side. Your resume text
never leaves the browser; there is no backend to send it to.

Redeploy after any change:

```bash
node jobpilot/scripts/build-engine.js
npx wrangler pages deploy jobpilot/app --project-name jobpilot --branch main
```

## Why the source still lives in Bootstrap

This directory is a **self-contained project destined for its own
repository**. It shares no code with the rest of Bootstrap, has its own
`package.json`, and its own tests.

It is here because a GitHub App cannot create repositories on a user account —
there is no permission that grants it, so `POST /user/repos` returns
`403 Resource not accessible by integration` no matter how the app is
configured. Only a human, or a personal access token, can create the repo.
Keeping the code here means it is committed and pushed rather than living in a
container that gets reclaimed.

**To extract it**, create an empty repo first:
<https://github.com/new?name=jobpilot&visibility=public> — no README, no
.gitignore, no licence, so the first push is not a conflict. Then:

```bash
# from the Bootstrap repo root
git subtree split --prefix=jobpilot -b jobpilot-only
git push git@github.com:tapashwi/jobpilot.git jobpilot-only:main
```

That preserves this directory's full history as the new repo's history. Then
delete `jobpilot/` from Bootstrap.

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
cd jobpilot
npm test          # the matching engine
```

The app is static: open `app/index.html` in a browser. No build step.
