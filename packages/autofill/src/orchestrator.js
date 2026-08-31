/**
 * orchestrator.js — walk a queue of jobs, applying to each.
 *
 * This is the join that was missing: the campaign produced a queue and the
 * content script applied to whatever page you happened to be on, but nothing
 * connected them. Without this, everything else is a set of tools rather than
 * a machine.
 *
 * WHY THE STATE MACHINE IS PURE, AND SEPARATE FROM THE EXTENSION
 *
 * Manifest V3 kills a service worker after roughly thirty seconds idle, and a
 * run walking forty jobs takes far longer than that. So the run cannot live in
 * memory: every transition is a pure function from stored state to the next
 * stored state, and the worker can die between any two steps and resume
 * exactly where it left off. That also makes the sequencing testable without a
 * browser, which is the only way to check the resumption behaviour at all.
 *
 * WHAT IT REFUSES TO DO
 *
 * - It will not start without a profile. An empty profile means the gate has
 *   nothing to judge and every job passes; a run in that state would apply to
 *   everything indiscriminately, which is the exact behaviour this project
 *   exists to avoid.
 * - It will not run unattended without a complete answer bank, for the same
 *   reason: unanswered screening questions become guesses at scale.
 * - It paces itself. Applications fired as fast as tabs can open are both
 *   obvious to bot detection and useless to a human trying to watch what is
 *   happening.
 */

const { readiness } = require('./answers');

const RUN_STATES = ['idle', 'running', 'paused', 'stopped', 'finished'];

/** Deliberately unhurried. Faster is not better here — it is just more obvious. */
const DEFAULT_DELAY_MS = 8000;
const DEFAULT_CAP = 25;

/**
 * Can a run start at all?
 *
 * Returns the reasons it cannot, rather than a bare false — "you cannot start"
 * with no explanation is the least useful message a tool can give.
 */
function preflight(profile, answers, queue, options) {
  const o = options || {};
  const problems = [];

  const p = profile || {};
  const hasIdentity = !!(p.name || p.firstName) && !!p.email;
  if (!hasIdentity) {
    problems.push({
      code: 'no-profile',
      message: 'No profile. Fill in at least your name and email in the extension options — ' +
        'without them nothing can be filled in, and without the rest of the profile the gate ' +
        'has nothing to judge, so every job would pass.'
    });
  }
  if (!p.resumeText || p.resumeText.length < 200) {
    problems.push({
      code: 'no-resume',
      message: 'No resume text. The skills gate compares the advertisement against your resume; ' +
        'with an empty resume you match nothing and every job is reported as a skills failure.'
    });
  }

  if (o.mode === 'auto') {
    const r = readiness(answers);
    if (!r.ready) {
      problems.push({
        code: 'answers-incomplete',
        message: 'Unattended mode needs the screening answers filled in first. ' + r.advice
      });
    }
  }

  if (!queue || !queue.length) {
    problems.push({ code: 'empty-queue', message: 'Nothing in the queue. Run a search first.' });
  }

  return { ok: problems.length === 0, problems };
}

/** The initial stored state for a run. Everything the machine needs is here. */
function startRun(queue, options) {
  const o = options || {};
  const cap = Math.max(1, o.cap || DEFAULT_CAP);
  return {
    state: 'running',
    mode: o.mode || 'review',
    queue: (queue || []).slice(0, cap).map((q) => ({
      url: q.url || (q.job && q.job.url),
      title: (q.job && q.job.title) || q.title || null,
      company: (q.job && q.job.company) || q.company || null,
      key: q.key || null,
      status: 'pending'
    })),
    index: 0,
    delayMs: o.delayMs === undefined ? DEFAULT_DELAY_MS : o.delayMs,
    startedAt: o.now || new Date().toISOString(),
    results: [],
    stopReason: null
  };
}

/** The job the machine should act on next, or null when there is none. */
function current(run) {
  if (!run || run.state !== 'running') return null;
  return run.queue[run.index] || null;
}

/**
 * Record what happened to the current job and advance.
 *
 * `outcome` is whatever the content script reported. Nothing is interpreted
 * here beyond deciding whether to keep going.
 */
function recordAndAdvance(run, outcome, options) {
  const o = options || {};
  const next = { ...run, queue: run.queue.slice(), results: run.results.slice() };
  const entry = next.queue[next.index];

  if (entry) {
    next.queue[next.index] = { ...entry, status: outcome.outcome || 'unknown' };
    next.results.push({
      url: entry.url,
      title: entry.title,
      company: entry.company,
      outcome: outcome.outcome || 'unknown',
      submitted: !!outcome.submitted,
      why: outcome.why || null,
      blockers: (outcome.blockers || []).filter((b) => b.blocking !== false).map((b) => b.label),
      at: o.now || new Date().toISOString()
    });
  }

  next.index += 1;

  /**
   * A run that fails on job after job is not working, and continuing wastes
   * applications. Three consecutive failures to even read the page means
   * something systemic — logged out, a layout change, a network problem — and
   * stopping is the right answer.
   */
  const recent = next.results.slice(-3);
  const allUnreadable = recent.length === 3 && recent.every((r) => r.outcome === 'unreadable');
  if (allUnreadable) {
    next.state = 'stopped';
    next.stopReason =
      'Three jobs in a row could not be read. That is usually a login that has expired or a site ' +
      'change, not three unlucky pages — stopping rather than burning through the queue.';
    return next;
  }

  if (next.index >= next.queue.length) {
    next.state = 'finished';
    next.stopReason = null;
  }
  return next;
}

function pause(run, reason) {
  return { ...run, state: 'paused', stopReason: reason || null };
}

function resume(run) {
  if (!run || run.state !== 'paused') return run;
  return { ...run, state: 'running', stopReason: null };
}

function stop(run, reason) {
  return { ...run, state: 'stopped', stopReason: reason || 'Stopped by you.' };
}

/** A human-readable account of where a run got to. */
function summarise(run) {
  if (!run) return { state: 'idle', done: 0, total: 0 };
  const by = (k) => run.results.filter((r) => r.outcome === k).length;
  const submitted = run.results.filter((r) => r.submitted).length;
  return {
    state: run.state,
    mode: run.mode,
    done: run.results.length,
    total: run.queue.length,
    remaining: Math.max(0, run.queue.length - run.index),
    submitted,
    filledForReview: by('filled-for-review'),
    blocked: by('blocked'),
    duplicates: by('duplicate'),
    needsHuman: by('needs-human') + by('unreadable'),
    stopReason: run.stopReason,
    advice: run.state === 'finished'
      ? `${run.results.length} jobs processed. ${submitted} submitted, ` +
        `${by('filled-for-review')} filled and waiting for you, ${by('blocked')} skipped because ` +
        'you did not meet a stated requirement.'
      : run.state === 'stopped'
        ? run.stopReason
        : `${run.index} of ${run.queue.length} done.`
  };
}

module.exports = {
  preflight, startRun, current, recordAndAdvance, pause, resume, stop, summarise,
  RUN_STATES, DEFAULT_DELAY_MS, DEFAULT_CAP
};
