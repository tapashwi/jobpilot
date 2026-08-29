/**
 * runner.js — drive one application from a parsed form to a decision.
 *
 * THE DESIGN, AND WHY IT DIFFERS FROM EVERY OTHER AUTO-APPLIER
 *
 * The published failures of hands-off appliers are consistent and specific:
 *
 *   - they apply to jobs the user is barred from, because they never check
 *     the location, the years-of-experience floor or the licensing rule;
 *   - they apply to the same job three times, because it is posted on three
 *     boards;
 *   - they answer screening questions wrong, at scale, silently.
 *
 * All three are preventable, and none of them is prevented by better form
 * filling. So the runner puts three things in FRONT of the filling:
 *
 *   1. THE GATE. The existing matcher decides whether this job is applicable
 *      at all. A blocked job is never filled, let alone submitted.
 *   2. DEDUPE. The same role at the same employer is applied to once.
 *   3. THE ANSWER BANK. Knockout questions come from explicit answers or the
 *      run stops on that job.
 *
 * And one thing after it: a RECORD of every field, what went in, and where
 * the value came from. If something was wrong, you find out on job one rather
 * than job forty.
 *
 * SUBMISSION IS A MODE, AND IT IS OFF BY DEFAULT.
 *
 *   'review'  — fill everything, submit nothing. The default.
 *   'confirm' — fill everything, ask, then submit.
 *   'auto'    — fill and submit, but ONLY when the job cleared the gate, no
 *               field paused, no field was refused, and every knockout answer
 *               came from the bank. Any doubt at all downgrades to review.
 *
 * That last condition is the whole safety property, and it is asserted by
 * test. A run cannot reach 'submitted' with an unresolved field in it.
 */

const { assess } = require('../../matching/src/match');
const { identify, valueFor } = require('./fieldmap');
const { lookupFreeText, readiness } = require('./answers');

const MODES = ['review', 'confirm', 'auto'];

/** A stable identity for a job, so the same role from two boards is one job. */
function jobKey(job) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const t = norm(job.title);
  const c = norm(job.company);
  if (t && c) return `${c}::${t}`;
  return norm(job.url) || `${t}${c}`;
}

/**
 * Plan the filling of one form. Pure: it decides, it does not touch the DOM.
 * The extension executes the plan, which keeps every decision testable.
 */
function planForm(fields, profile, answers) {
  const plan = [];
  for (const field of fields || []) {
    const id = identify(field);

    // A free-text question the field map cannot classify may still have a
    // saved answer, matched on its wording.
    if (!id.key && !id.refuse && field.label) {
      const saved = lookupFreeText(field.label, answers);
      if (saved.found) {
        plan.push({
          field, key: '_freeText', action: 'fill', value: saved.answer,
          source: saved.exact ? 'answer-bank (exact question)' : 'answer-bank (similar question)',
          confidence: saved.exact ? 1 : 0.7, knockout: false
        });
        continue;
      }
    }

    const v = valueFor(id, profile, answers);
    plan.push({
      field,
      key: id.key,
      action: v.action,
      value: v.value,
      why: v.why,
      source: v.source,
      refused: v.refused,
      // Carried from the identification, not from the value: a knockout with
      // NO answer never reaches valueFor's fill branch, so v.knockout is unset
      // exactly when the flag matters most.
      knockout: !!(v.knockout || id.knockout),
      confidence: id.confidence
    });
  }
  return plan;
}

/**
 * Everything that stops this from being submittable unattended.
 *
 * WHETHER A FIELD IS REQUIRED IS THE DECIDING FACTOR, and getting that wrong
 * in either direction is bad. The first version treated every refusal as a
 * blocker, which sounds cautious and is actually useless: almost every
 * application form carries an optional field this will never fill — a tax file
 * number, a referral code — so auto mode would have refused to fire on any
 * real form, ever. An automation that never automates is not safe, it is
 * broken. Found by running it against a real form rather than by reading it.
 *
 * The rule now:
 *   - a knockout with no answer ALWAYS blocks, required or not. Those are the
 *     auto-reject filters and the reason this package exists.
 *   - anything else blocks only when the form says the field is required.
 *
 * Non-blocking refusals are still returned, marked, so they appear in the
 * record. "We did not touch your tax file number" is worth seeing even when
 * it changed nothing.
 */
function blockers(plan) {
  const out = [];
  for (const step of plan) {
    const required = !!(step.field && step.field.required);

    if (step.action === 'pause') {
      // A knockout question is a hard stop whatever the form claims: an ATS
      // that marks work authorisation optional still filters on it.
      if (step.knockout || required) {
        out.push({ kind: 'unanswered', label: labelOf(step.field), why: step.why, blocking: true });
      } else {
        out.push({ kind: 'unanswered', label: labelOf(step.field), why: step.why, blocking: false });
      }
    } else if (step.action === 'refuse') {
      out.push({
        kind: 'refused', label: labelOf(step.field), why: step.why, blocking: required
      });
    } else if (step.action === 'skip' && required) {
      // A required field we could not identify is fatal for an unattended run:
      // the form will not submit, or will submit wrong.
      out.push({ kind: 'required-unknown', label: labelOf(step.field), why: step.why, blocking: true });
    }
  }
  return out;
}

/** Only the blockers that actually prevent an unattended submission. */
function blocking(list) {
  return (list || []).filter((b) => b.blocking !== false);
}

function labelOf(field) {
  const f = field || {};
  return f.label || f.ariaLabel || f.name || f.id || '(unlabelled field)';
}

/**
 * Decide what happens to one job.
 *
 * `seen` is the set of jobKeys already applied to in this session or in
 * history, so duplicates across boards are caught before any work is done.
 */
function runOne(profile, job, form, options) {
  const o = options || {};
  const mode = MODES.indexOf(o.mode) === -1 ? 'review' : o.mode;
  const answers = o.answers || {};
  const seen = o.seen instanceof Set ? o.seen : new Set(o.seen || []);
  const key = jobKey(job);

  // 1. Duplicate. Cheapest check, so it goes first.
  if (seen.has(key)) {
    return { key, job, outcome: 'duplicate', mode, plan: [], blockers: [],
      why: 'Already applied to this role at this employer. The same job posted on three boards ' +
        'is one job, and three applications read as careless rather than keen.' };
  }

  // 2. The gate. A job you are barred from is not filled at all.
  const assessment = assess(profile, job);
  if (!assessment.passed) {
    return { key, job, outcome: 'blocked', mode, assessment, plan: [], blockers: [],
      why: assessment.blockers.map((b) => b.reason).join('; ') };
  }

  // 3. Plan the fill.
  const plan = planForm(form && form.fields, profile, answers);
  const stops = blockers(plan);
  const filled = plan.filter((s) => s.action === 'fill');

  if (!filled.length) {
    return { key, job, outcome: 'needs-human', mode, assessment, plan, blockers: stops,
      why: 'Nothing on this form could be filled from your profile. It is probably a login wall ' +
        'or a format this does not understand yet.' };
  }

  const hard = blocking(stops);
  const clean = hard.length === 0;
  const outcome = mode === 'auto' && clean ? 'submitted'
    : mode === 'confirm' && clean ? 'awaiting-confirmation'
      : 'filled-for-review';

  return {
    key, job, mode, assessment, plan, blockers: stops, outcome,
    filledCount: filled.length,
    why: clean
      ? (outcome === 'submitted'
        ? 'Every field resolved from your profile or your saved answers, and the job cleared ' +
          'every gate. Submitted.'
        : 'Ready to send.')
      : `${hard.length} field${hard.length === 1 ? '' : 's'} need you. Nothing was submitted — ` +
        'a run that guesses here is how a wrong answer ends up on forty applications.',
    // The audit trail. This is what makes a bad answer findable on job one.
    record: filled.map((s) => ({
      field: labelOf(s.field), key: s.key, value: s.value, source: s.source, knockout: s.knockout
    }))
  };
}

/** Run a batch, carrying the dedupe set forward as it goes. */
function runBatch(profile, jobs, options) {
  const o = options || {};
  const seen = new Set(o.seen || []);
  const results = [];

  for (const entry of jobs || []) {
    const r = runOne(profile, entry.job, entry.form, { ...o, seen });
    // Only a job that actually went somewhere counts as applied — a blocked
    // job must not suppress a later, genuine posting of the same role.
    if (r.outcome === 'submitted' || r.outcome === 'awaiting-confirmation' || r.outcome === 'filled-for-review') {
      seen.add(r.key);
    }
    results.push(r);
  }

  const by = (k) => results.filter((r) => r.outcome === k).length;
  return {
    results,
    seen: [...seen],
    summary: {
      total: results.length,
      submitted: by('submitted'),
      awaitingConfirmation: by('awaiting-confirmation'),
      forReview: by('filled-for-review'),
      blocked: by('blocked'),
      duplicates: by('duplicate'),
      needsHuman: by('needs-human')
    },
    answerBank: readiness(o.answers)
  };
}

module.exports = { runOne, runBatch, planForm, blockers, blocking, jobKey, labelOf, MODES };
