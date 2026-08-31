/**
 * The queue orchestrator, and the three seams that were broken.
 *
 * Before this, the extension could not work at all and the reason was not
 * visible from any single file: background.js initialised an empty profile and
 * nothing populated it; the popup sent `job: {}` and nothing set it; and
 * nothing walked the queue. Each looked like a small omission. Together they
 * meant the gate judged an empty job against an empty profile — which passes
 * everything — and then applied to nothing because there was nothing to fill.
 *
 * These tests exist so that state cannot come back quietly.
 */

const o = require('../packages/autofill/src/orchestrator');
const { readJobPage } = require('../packages/discovery/src/jobpage');

const PROFILE = {
  name: 'Jane Doe', email: 'jane@example.com',
  resumeText: '- Ran Kubernetes across 60 services\n- Introduced Terraform, 3 days to 2 hours\n'.repeat(4),
  skills: ['kubernetes', 'terraform'], yearsExperience: 8
};
const BANK = { workAuthorisation: 'Yes', visaSponsorship: 'No', noticePeriod: '4 weeks', salaryExpectation: '140000' };
const QUEUE = [{ url: 'https://x/1', job: { title: 'A' } }, { url: 'https://x/2', job: { title: 'B' } }];

describe('a run refuses to start without what it needs', () => {
  /**
   * THE ONE THAT MATTERS. An empty profile means the gate has nothing to
   * judge, so every job passes — a run in that state applies indiscriminately,
   * which is the exact behaviour this project is built against. It was the
   * extension's actual state before this.
   */
  test('an empty profile blocks the run, and says why', () => {
    const r = o.preflight({}, BANK, QUEUE, { mode: 'auto' });
    expect(r.ok).toBe(false);
    expect(r.problems.map((p) => p.code)).toContain('no-profile');
    expect(r.problems.find((p) => p.code === 'no-profile').message).toMatch(/every job would pass/);
  });

  test('an empty resume blocks the run', () => {
    const r = o.preflight({ name: 'J', email: 'j@e.com' }, BANK, QUEUE, { mode: 'auto' });
    expect(r.problems.map((p) => p.code)).toContain('no-resume');
  });

  test('unattended mode additionally needs the screening answers', () => {
    expect(o.preflight(PROFILE, {}, QUEUE, { mode: 'auto' }).problems.map((p) => p.code))
      .toContain('answers-incomplete');
    // Fill-only does not, because a human is reading every form anyway.
    expect(o.preflight(PROFILE, {}, QUEUE, { mode: 'review' }).ok).toBe(true);
  });

  test('an empty queue is refused rather than starting a run of nothing', () => {
    expect(o.preflight(PROFILE, BANK, [], { mode: 'auto' }).problems.map((p) => p.code))
      .toContain('empty-queue');
  });

  test('a complete setup is allowed', () => {
    expect(o.preflight(PROFILE, BANK, QUEUE, { mode: 'auto' })).toEqual({ ok: true, problems: [] });
  });
});

describe('walking the queue', () => {
  test('it starts on the first job and advances one at a time', () => {
    let run = o.startRun(QUEUE, { mode: 'auto' });
    expect(o.current(run).title).toBe('A');
    run = o.recordAndAdvance(run, { outcome: 'submitted', submitted: true });
    expect(o.current(run).title).toBe('B');
  });

  test('the cap limits the run rather than being advisory', () => {
    const run = o.startRun([{ url: '1' }, { url: '2' }, { url: '3' }], { cap: 2 });
    expect(run.queue).toHaveLength(2);
  });

  test('it finishes when the queue is exhausted', () => {
    let run = o.startRun(QUEUE, {});
    run = o.recordAndAdvance(run, { outcome: 'submitted' });
    run = o.recordAndAdvance(run, { outcome: 'blocked' });
    expect(run.state).toBe('finished');
    expect(o.current(run)).toBeNull();
  });

  test('every transition returns new state and mutates nothing', () => {
    const run = o.startRun(QUEUE, {});
    const before = JSON.stringify(run);
    o.recordAndAdvance(run, { outcome: 'submitted' });
    expect(JSON.stringify(run)).toBe(before);
  });

  /**
   * The service worker is killed after ~30s idle and a run of forty jobs lasts
   * far longer, so a step must be a pure function of stored state. If this
   * ever needs anything held in memory, the run silently stops on job three in
   * real use while passing every test on a fast machine.
   */
  test('a run survives being serialised and resumed between every step', () => {
    let run = o.startRun(QUEUE, { mode: 'auto' });
    for (let i = 0; i < QUEUE.length; i++) {
      run = JSON.parse(JSON.stringify(run)); // the worker died here
      expect(o.current(run)).not.toBeNull();
      run = o.recordAndAdvance(run, { outcome: 'submitted', submitted: true });
    }
    expect(run.state).toBe('finished');
    expect(o.summarise(run).submitted).toBe(2);
  });

  test('stop and pause are distinguishable, and resume only revives a pause', () => {
    let run = o.startRun(QUEUE, {});
    run = o.pause(run, 'browser restarted');
    expect(run.state).toBe('paused');
    expect(o.current(run)).toBeNull();
    run = o.resume(run);
    expect(run.state).toBe('running');

    const stopped = o.stop(o.startRun(QUEUE, {}), 'by you');
    expect(o.resume(stopped).state).toBe('stopped');
  });
});

describe('the circuit breaker', () => {
  /**
   * Three unreadable pages in a row is a logged-out session or a site change,
   * not three unlucky jobs. Continuing burns the whole queue against a broken
   * assumption.
   */
  test('three unreadable pages in a row stops the run', () => {
    let run = o.startRun([{ url: '1' }, { url: '2' }, { url: '3' }, { url: '4' }, { url: '5' }], {});
    for (let i = 0; i < 3; i++) run = o.recordAndAdvance(run, { outcome: 'unreadable' });
    expect(run.state).toBe('stopped');
    expect(run.stopReason).toMatch(/login|site change/i);
  });

  test('unreadable pages scattered among successes do not stop it', () => {
    let run = o.startRun([{ url: '1' }, { url: '2' }, { url: '3' }, { url: '4' }, { url: '5' }], {});
    run = o.recordAndAdvance(run, { outcome: 'unreadable' });
    run = o.recordAndAdvance(run, { outcome: 'submitted' });
    run = o.recordAndAdvance(run, { outcome: 'unreadable' });
    run = o.recordAndAdvance(run, { outcome: 'unreadable' });
    expect(run.state).toBe('running');
  });
});

describe('reporting a run', () => {
  test('the summary accounts for every job', () => {
    let run = o.startRun([{ url: '1' }, { url: '2' }, { url: '3' }], { mode: 'auto' });
    run = o.recordAndAdvance(run, { outcome: 'submitted', submitted: true });
    run = o.recordAndAdvance(run, { outcome: 'blocked' });
    run = o.recordAndAdvance(run, { outcome: 'filled-for-review' });
    const s = o.summarise(run);
    expect(s.done).toBe(3);
    expect(s.submitted + s.blocked + s.filledForReview + s.duplicates + s.needsHuman).toBe(3);
    expect(s.advice).toMatch(/1 submitted/);
  });

  test('only blocking blockers are recorded, not the optional refusals', () => {
    let run = o.startRun([{ url: '1' }], {});
    run = o.recordAndAdvance(run, {
      outcome: 'filled-for-review',
      blockers: [{ label: 'Sponsorship', blocking: true }, { label: 'Tax File Number', blocking: false }]
    });
    expect(run.results[0].blockers).toEqual(['Sponsorship']);
  });

  test('an idle machine reports idle rather than throwing', () => {
    expect(o.summarise(null).state).toBe('idle');
  });
});

describe('the job the gate is given comes from the page', () => {
  /**
   * The popup used to send `job: state.currentJob || {}` where currentJob was
   * never assigned. assess() on an empty job finds no requirements, so the
   * skills gate passes, the experience gate passes and the salary gate passes.
   * Every job cleared. This checks the reader supplies real requirements, and
   * refuses when it cannot.
   */
  const fakeDoc = (ld) => ({
    querySelectorAll: (sel) => sel.indexOf('ld+json') !== -1
      ? [{ textContent: JSON.stringify(ld) }] : [],
    querySelector: () => null
  });

  test('a posting with structured data yields real requirements', () => {
    const job = readJobPage(fakeDoc({
      '@type': 'JobPosting', title: 'Platform Engineer',
      hiringOrganization: { name: 'Canva' },
      description: 'We need 5+ years experience with Kubernetes and Terraform. '.repeat(12)
    }), 'https://x/job/1', () => ({ required: ['kubernetes', 'terraform'], preferred: [] }));

    expect(job.usable).toBe(true);
    expect(job.title).toBe('Platform Engineer');
    expect(job.company).toBe('Canva');
    expect(job.minYearsExperience).toBe(5);
    expect(job.requiredSkills).toContain('kubernetes');
  });

  test('a page whose body did not load is unusable, and says so', () => {
    const job = readJobPage(fakeDoc({
      '@type': 'JobPosting', title: 'X', hiringOrganization: { name: 'Y' }, description: 'short'
    }), 'https://x/job/1', () => ({ required: [], preferred: [] }));

    expect(job.usable).toBe(false);
    expect(job.whyUnusable).toMatch(/applying unread/);
  });

  test('an empty job is never reported as usable', () => {
    const job = readJobPage({ querySelectorAll: () => [], querySelector: () => null }, 'https://x', null);
    expect(job.usable).toBe(false);
    expect(job.requiredSkills).toEqual([]);
  });
});
