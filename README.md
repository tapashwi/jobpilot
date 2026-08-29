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

Six things, all on your device.

**Check one job.** Paste your resume and an advertisement. Hard requirements
are gates, not percentages: if a job needs five years and you have three, that
is a fail with a reason, not "80% matched". Missing skills are separated into
required and preferred, because they are different problems.

**ATS check.** What an applicant tracking system will do to your resume, and
what it will fail to find — contact fields it cannot see, headings it does not
recognise, acronyms written in only one of their two forms, achievements with
no number in them, and whether a multi-column layout has already scrambled the
text. There is deliberately **no score out of a hundred**; no such number
exists, and any tool showing you one invented it.

**Cover letter.** Assembled from your own resume, not written by a model. Every
sentence about your experience is built from a line that is already in your
resume, and the letter shows you which line. Where there is nothing to build
from, you get a marked blank rather than an invented claim.

**Selection criteria.** STAR responses for Australian public-sector, university
and not-for-profit applications, where a panel scores each criterion separately.
Your strongest matching achievement is placed in the Action; the Situation is
always a blank, because it is a specific thing that happened and a plausible
fabrication is exactly what a panel probes for.

**Apply in bulk.** Paste as many advertisements as you like, separated by a
line of three dashes. Each is parsed, gated, ranked and given its own cover
letter and resume gap list. Jobs you are barred from get **no documents at
all** — the point is to stop you spending an evening on applications that
cannot succeed. Faults that affect every job are surfaced once, because fixing
your resume improves the whole queue.

**Track them.** Statuses with full history, and a follow-up list for the ones
that have gone quiet.

The skill dictionary carries 167 canonical skills and 400+ aliases, so "k8s"
and "Kubernetes" are the same thing. Names that are also ordinary English —
Go, C, R, SAFe — only count with corroboration, so "we plan to go live" does
not credit you with the Go programming language.

## What it deliberately does not do

- **No autofill, yet.** For a SEEK and Workday user it would add almost
  nothing: SEEK Quick Apply already pre-fills from your SEEK profile, and
  Workday's shadow-DOM form widgets ignore programmatic value changes. An
  autofill that silently does nothing is worse than none — you find out after
  submitting a half-empty application.
- **No resume file parsing, yet.** PDF is a printing format with no semantic
  structure; roughly a third of real resumes parse wrongly in ways you would
  not notice. Paste works today and is honest.
- **Never submits anything.** The final click is always yours, and that is an
  engineering decision rather than squeamishness. SEEK, Workday, PageUp and
  JobAdder all prohibit automated submission; the enforcement is bot detection
  terminating the account, including your SEEK profile and every application
  already in flight. Workday's form widgets ignore programmatic changes, so an
  automated submission there does not fail loudly — it sends a half-empty
  application and you find out by never hearing back. And a submission cannot
  be undone. So everything up to the button is prepared for you, and the button
  stays with the person whose name is on the application.

See `docs/projects/jobpilot-plan.md` in Bootstrap for the full reasoning.

## Run

```bash
npm install
npm test          # the matching engine
```

The app is static: open `app/index.html` in a browser. No build step.
