# JobPilot

Privacy-first job application assistant. Your resume stays on your device.
No AI at runtime, no subscription, no account.

## It is live

**https://jobpilot.tapaswibaskota.com.np** — Cloudflare Pages project
`jobpilot`. Static, nothing server-side. Your resume text never leaves the
browser; there is no backend to send it to.

It moved off `jobpilot-ay8.pages.dev` on 2026-08-31 because `pages.dev` is on
the Public Suffix List, so AdSense verifies at the `pages.dev` level and can
never approve a site there. The old address still serves, and the canonical
points here.

Redeploy after any change:

```bash
node scripts/build-engine.js
cd app && npx wrangler pages deploy . --project-name jobpilot --branch main
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

**Tailor your resume.** Concrete edits for one advertisement. Every suggestion
either surfaces or rewords something **already in your resume** — it will tell
you that they write "Kubernetes" where you wrote "k8s", or that a required
skill is buried in your last three bullets. Where the ad asks for something you
genuinely do not have, it says so and explicitly tells you **not** to add the
keyword. That is the line between tailoring and lying.

**Interview prep.** An interview is not a random quiz: the questions come from
the same advertisement you already have. Every requirement is a question, and
every gap between the ad and your resume is the one they will press on. The
questions you cannot answer are listed first, because that is where the hour
goes. Answerable ones arrive with the line from your resume that answers them.
Plus five questions worth asking them, each with why it works.

**Follow up.** The messages everyone knows they should send and nobody does —
after applying, after an interview, chasing a decision, after a rejection.
Short on purpose; the specific sentence is a marked blank, because that is the
part that makes it work and the part only you know. Each one carries the timing,
since sending at the wrong moment is the usual mistake.

**Track them.** Statuses with full history, and a follow-up list for the ones
that have gone quiet.

The skill dictionary carries 167 canonical skills and 400+ aliases, so "k8s"
and "Kubernetes" are the same thing. Names that are also ordinary English —
Go, C, R, SAFe — only count with corroboration, so "we plan to go live" does
not credit you with the Go programming language.

## The auto-apply extension

`extension/` is a Manifest V3 Chrome extension that fills and submits real
application forms. Load it unpacked from `chrome://extensions`.

It is built against the market's documented failures rather than its marketing.
The four things reviewers consistently report about hands-off appliers are that
they apply to jobs you are barred from, apply to the same job three times,
answer screening questions wrong at scale, and add volume where volume was
never the bottleneck. See `docs/competitors.md` for the research.

So, in order:

1. **The gate runs before the form is touched.** A job you do not qualify for
   produces no plan, no documents and no submission.
2. **The same role from two boards is one application.** A *blocked* job
   deliberately does not enter that set, so one bad parse cannot hide a role
   everywhere it appears.
3. **Knockout questions come only from your answer bank.** Work authorisation,
   sponsorship, salary, notice period, clearance, criminal record. Never
   inferred from your resume, never defaulted. No saved answer means the run
   stops on that job.
4. **Nothing is submitted with an unresolved field in it** — asserted by test.
   Any required field it could not resolve, or any unanswered knockout, and
   auto mode drops back to fill-only.
5. **Every field is recorded** with its value and where the value came from, so
   a wrong answer is findable on job one instead of job forty.

### Setting it up

Load `extension/` unpacked from `chrome://extensions`, then open its
**Options** page. Paste the JSON from the app's *Copy for the extension*
button, or fill the fields in directly. **Nothing works until this is done** —
and the extension says so rather than silently applying to everything: an empty
profile means the gate has nothing to judge and every job passes.

### Running a queue

The orchestrator walks the queue tab by tab: open, read the posting, gate it,
fill, submit or leave for review, close, pause, next. It reads the
advertisement **off each job's own page** — via schema.org JobPosting
structured data, which is a contract with Google Jobs and so survives the
redesigns that break every CSS selector — because the queue entry has a title
and an employer but not the requirements, and the gate needs the requirements.

A page whose body did not load is reported as unreadable rather than applied
to: too little text means the requirement extraction finds nothing, an empty
required-skills list makes the gate pass, and the application goes out unread.
Three unreadable pages in a row stops the run, because that is an expired login
or a site change rather than three unlucky jobs.

The run survives the service worker being killed — Manifest V3 collects it
after about thirty seconds idle and a run of forty jobs lasts far longer, so
every step is a pure function of stored state and the pacing goes through
`chrome.alarms` rather than `setTimeout`, which does not survive.

Three modes, and the popup explains each where you choose it:

| Mode | What happens |
| --- | --- |
| `review` (default) | Fills everything, submits nothing |
| `confirm` | Fills, then asks |
| `auto` | Fills and submits — only when the gate passed and every field resolved |

It never fills a password, a card number, a tax file number or a CAPTCHA. It
identifies equal-opportunity questions in order to **skip** them: they are
voluntary and legally sensitive, and a bot answering them for you is the wrong
default.

### What is tested, and what is not

The field mapping and the runner are exercised in a real browser against
ATS-shaped markup — open shadow DOM, framework-controlled inputs that revert a
plain assignment, and labels associated four different ways. That works.

What is **not** verified is any live logged-in SEEK, Workday or LinkedIn
session, because that needs a real account and a real application to throw
away. Treat platform coverage as unverified until you have run it against the
real thing, starting in `review` mode.

Their terms also prohibit automated submission, and enforcement is bot
detection acting on your account. That risk is yours, it is real, and it is
stated in the popup at the point you choose the mode rather than buried here.

## What it deliberately does not do

- **No autofill, yet.** For a SEEK and Workday user it would add almost
  nothing: SEEK Quick Apply already pre-fills from your SEEK profile, and
  Workday's shadow-DOM form widgets ignore programmatic value changes. An
  autofill that silently does nothing is worse than none — you find out after
  submitting a half-empty application.
- **No resume file parsing, yet.** PDF is a printing format with no semantic
  structure; roughly a third of real resumes parse wrongly in ways you would
  not notice. Paste works today and is honest.
- **Never submits blind.** Submission happens only in `auto` mode, only when
  the job cleared every gate, and only when every field resolved from your
  profile or your saved answers. The default is `review`, which submits
  nothing. The distinction that matters is not whether it can submit — it is
  whether it will submit something it had to guess at. It will not.

## Run

```bash
npm install
npm test          # the matching engine
```

The app is static: open `app/index.html` in a browser. No build step.
