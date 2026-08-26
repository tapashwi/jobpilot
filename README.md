# JobPilot

Privacy-first job application assistant. Your resume stays on your device.
No AI at runtime, no subscription, no account.

## Why this lives here, for now

This directory is a **self-contained project destined for its own
repository**. It shares no code with the rest of Bootstrap, has its own
`package.json`, and its own tests.

It is here rather than in its own repo only because the GitHub App running
this session cannot create repositories (`403 Resource not accessible by
integration`). Keeping it here means the work is committed and pushed rather
than living in a container that gets reclaimed.

**To extract it into its own repository**, once you have created an empty one:

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
