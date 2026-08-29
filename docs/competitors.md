# What the auto-apply market actually sells, and where it fails

Researched 2026-08-29. This exists because the design of the auto-apply engine
is a direct response to it: the competitors' documented failure modes are the
specification.

## The market splits in two, and the split matters

**Autofill assistants.** You build a profile once, a browser extension pours
it into application forms, and you review and send each one. Simplify's Copilot
is the well-known example, covering the major applicant tracking systems.
Roughly free to $30/month. You are still driving.

**Hands-off appliers.** You set filters and the tool submits on its own until
a daily cap or a credit balance runs out. LazyApply is the archetype, with
Sonara, JobCopilot and AIApply in the same family. Roughly $29–$149, some
one-time, some monthly.

Most reviews lump these together, which is where the confusion starts. They
are different products with different failure modes.

## The four documented failures of hands-off appliers

These come from published reviews and comparisons, and they are consistent
across sources. All four are preventable, and none of them is prevented by
better form filling.

**1. They apply to jobs the applicant is barred from.** The tool does not check
the location requirement, the years-of-experience floor, or the licensing rule.
It sends the CV and moves on. This is the single most reported complaint.

**2. They duplicate.** The same role is posted on three boards and the bot
applies to all three. Occasionally that reads as enthusiasm; usually it reads
as careless.

**3. They fill fields wrong, at scale.** A wrong salary band, a mis-toggled
work-authorisation answer, a yes that should have been a no. Any one of those
is a silent knockout — most systems treat them as auto-reject filters — and the
mistake is replicated across dozens of applications before anyone notices.

**4. Volume was never the bottleneck.** The consistent finding is that firing
hundreds of generic applications produces hundreds of identical rejections
faster. Speed of submission was not the constraint; being an obvious match a
recruiter can act on in a few seconds is.

There is also a governance point worth recording. Sonara was a fully hands-off
service that was later acquired and relaunched under new ownership. If the tool
holds the record of where you applied and what you said, its business problems
become yours.

Reported satisfaction skews accordingly: LazyApply carried a 2.4 out of 5
rating across roughly a hundred Trustpilot reviews as of early 2026, with more
than half at one star, clustering on relevance, quality and refunds.

## What the open-source projects do

A large field, mostly one of two architectures: Python plus Selenium driving a
logged-in browser, or a Manifest V3 Chrome extension with content scripts.
Nearly all of them target LinkedIn Easy Apply first, because it is a
standardised in-site form rather than a different ATS per employer. Several
bolt an LLM on to answer screening questions.

Notably, at least one project publishes its ATS coverage with a verification
column reading "unverified" — which is more honest than most of the commercial
marketing, and worth copying.

## What JobPilot does differently, and why

Every one of the four failures above maps onto something this codebase already
had or has now added.

| Their failure | What we do |
| --- | --- |
| Applies to jobs you are barred from | The gate runs **before** the form is touched. A blocked job produces no plan and no documents at all. |
| Duplicates across boards | Applications are keyed on employer plus role, so the same job from SEEK and LinkedIn is one job. A *blocked* job deliberately does not enter that set, so one bad parse cannot hide a role everywhere. |
| Wrong screening answers at scale | Knockout questions are answered **only** from an explicit answer bank. No answer means the run stops on that job. Never inferred from the resume, never defaulted. |
| Volume without matching | The matcher, the ATS check and the tailoring already exist. Volume is the last thing added, not the first. |

Two further rules that none of the surveyed tools appear to have:

- **Nothing is submitted with an unresolved field in it.** Asserted by test. If
  any required field could not be resolved, or any knockout is unanswered, auto
  mode downgrades to fill-only.
- **An audit record of every field, its value, and where the value came from.**
  A wrong answer is then findable on job one instead of job forty.

And a deliberate non-goal: equal-opportunity questions are identified so they
can be **skipped**, not answered. They are voluntary and legally sensitive, and
a bot answering them on someone's behalf is the wrong default everywhere.

## The honest limits

The engine and the field mapping are tested against real ATS-shaped markup in a
real browser — including open shadow DOM, framework-controlled inputs, and
labels associated four different ways. What is **not** tested is any live,
logged-in SEEK, Workday or LinkedIn session, because that needs an account and
a real application to throw away. Treat platform coverage as unverified until
it has been run against the real thing.

Their terms also prohibit automated submission, and enforcement is bot
detection acting on the account. That risk is real, it falls on the account
holder, and turning on unattended mode is a decision that should be made with
it in view. The tool states this at the point where the mode is chosen rather
than in a footnote.

## Sources

Competitive research conducted 2026-08-29 via Firecrawl across vendor sites,
comparison articles and the `auto-apply` GitHub topic. Product claims are the
vendors' own; the failure analysis is drawn from published reviews and
comparisons. Judgement about what to build from it is ours.
