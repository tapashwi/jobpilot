/**
 * campaign.run() — the decision that actually applies to jobs on your behalf.
 *
 * WHY THIS EXISTS
 *
 * Coverage on discovery/src/campaign.js was 35% of statements and **14.7% of
 * branches**, the worst in the repo, and run() — the orchestration itself —
 * had no test at all. The existing discovery suite covers sources,
 * normalisation, merging, harvesting and enrich(); it stops before the part
 * that decides what gets applied to.
 *
 * That is the wrong thing to leave unverified. Every complaint about automated
 * job appliers is that they apply first and filter never, and this file's own
 * header says "the order is the product". If the gate, the dedupe or the cap
 * is broken, the failure is not a wrong number on a screen — it is an
 * application sent to the wrong employer, or the same one sent twice.
 *
 * Only `search` is mocked, because it is the network. The gate, the ranking,
 * the enrichment and the key generation are all the real implementations, so
 * these tests exercise the actual decision path rather than a model of it.
 */

jest.mock('../packages/discovery/src/sources', () => ({ search: jest.fn() }));
const { search } = require('../packages/discovery/src/sources');
const { run, applicationEmail, emailDraft } = require('../packages/discovery/src/campaign');

/** A profile that comfortably clears the gate for the jobs below. */
const PROFILE = {
  name: 'Test Person',
  email: 'test@example.com',
  title: 'Support Engineer',
  yearsExperience: 6,
  skills: ['linux', 'networking', 'python', 'aws', 'sql'],
  achievements: [{ text: 'Cut ticket backlog by half', skills: ['linux'] }],
  workRights: 'citizen',
  location: 'Darwin',
};

const job = (over = {}) => ({
  title: 'Support Engineer',
  company: 'Acme',
  url: 'https://example.com/job/1',
  location: 'Darwin',
  adText: 'We need linux and networking experience. Apply by sending your CV to jobs@acme.example.',
  ...over,
});

function found(jobs, extra = {}) {
  return { jobs, sources: [{ id: 'test', ok: true }], duplicatesMerged: 0, ...extra };
}

beforeEach(() => search.mockReset());

describe('the gate runs before anything is queued', () => {
  it('queues a job the profile clears', async () => {
    search.mockResolvedValue(found([job()]));
    const r = await run(PROFILE, { sources: ['test'] }, {});
    expect(r.queue).toHaveLength(1);
    expect(r.summary.queued).toBe(1);
    expect(r.rejected).toHaveLength(0);
  });

  it('rejects a job the profile fails, and says why rather than hiding it', async () => {
    // The whole promise of the tool is that a rejection is inspectable.
    search.mockResolvedValue(found([
      job({ adText: 'Requires kubernetes, terraform and go. 15 years experience essential.' }),
    ]));
    const r = await run(PROFILE, { sources: ['test'] }, {});
    expect(r.queue).toHaveLength(0);
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].reason).toBeTruthy();
    expect(r.rejected[0].job).toBeDefined();
  });
});

describe('never applying to the same job twice', () => {
  it('skips a job already applied to in an earlier run', async () => {
    search.mockResolvedValue(found([job()]));
    const first = await run(PROFILE, { sources: ['test'] }, {});
    const key = first.queue[0].key;

    const second = await run(PROFILE, { sources: ['test'] }, { already: [key] });
    expect(second.queue).toHaveLength(0);
    expect(second.summary.alreadyApplied).toBe(1);
  });

  it('deduplicates within a single run', async () => {
    // The same vacancy listed on two boards must not become two applications.
    search.mockResolvedValue(found([job(), job()]));
    const r = await run(PROFILE, { sources: ['test'] }, {});
    expect(r.queue).toHaveLength(1);
    expect(r.summary.alreadyApplied).toBe(1);
  });
});

describe('title filters', () => {
  it('drops a job whose title does not match titleMustMatch', async () => {
    search.mockResolvedValue(found([job({ title: 'Chef' })]));
    const r = await run(PROFILE, { sources: ['test'], titleMustMatch: 'engineer' }, {});
    expect(r.queue).toHaveLength(0);
    expect(r.rejected[0].reason).toMatch(/title does not match/);
  });

  it('drops a job matching excludeTitle even when it would otherwise pass', async () => {
    search.mockResolvedValue(found([job({ title: 'Senior Support Engineer (Night Shift)' })]));
    const r = await run(PROFILE, { sources: ['test'], excludeTitle: 'night shift' }, {});
    expect(r.queue).toHaveLength(0);
    expect(r.rejected[0].reason).toMatch(/exclusion/);
  });

  it('filters on title before running the gate, which is the cheaper order', async () => {
    search.mockResolvedValue(found([job({ title: 'Chef' })]));
    const r = await run(PROFILE, { sources: ['test'], titleMustMatch: 'engineer' }, {});
    // A title rejection carries no assessment, because the gate never ran.
    expect(r.rejected[0].assessment).toBeUndefined();
  });
});

describe('the daily cap', () => {
  const many = () => [1, 2, 3, 4, 5].map((n) => job({ url: `https://example.com/job/${n}`, company: `Co${n}` }));

  it('queues at most dailyCap and defers the rest rather than dropping them', async () => {
    search.mockResolvedValue(found(many()));
    const r = await run(PROFILE, { sources: ['test'], dailyCap: 2 }, {});
    expect(r.queue).toHaveLength(2);
    expect(r.deferred).toHaveLength(3);
    expect(r.summary.deferredByCap).toBe(3);
    // Nothing is lost: everything discovered is accounted for somewhere.
    expect(r.queue.length + r.deferred.length + r.rejected.length).toBe(5);
  });

  it('spends a capped run on the best-scoring jobs, not the first ones seen', async () => {
    // This is the reason ranking happens before the slice. A cap that took the
    // arbitrary source order would spend the day's applications on whichever
    // board answered first.
    search.mockResolvedValue(found(many()));
    const r = await run(PROFILE, { sources: ['test'], dailyCap: 2 }, {});
    const queuedScores = r.queue.map((q) => q.assessment.score);
    const deferredScores = r.deferred.map((q) => q.assessment.score);
    expect(Math.min(...queuedScores)).toBeGreaterThanOrEqual(Math.max(...deferredScores));
  });

  it('queues everything when no cap is set', async () => {
    search.mockResolvedValue(found(many()));
    const r = await run(PROFILE, { sources: ['test'] }, {});
    expect(r.queue).toHaveLength(5);
    expect(r.deferred).toHaveLength(0);
  });
});

describe('the summary tells the truth about the run', () => {
  it('counts email and web application routes separately', async () => {
    search.mockResolvedValue(found([
      job({ url: 'https://example.com/a', adText: 'linux networking. Email your application to hiring@acme.example.' }),
      job({ url: 'https://example.com/b', company: 'Beta', adText: 'linux networking. Apply through our portal.' }),
    ]));
    const r = await run(PROFILE, { sources: ['test'] }, {});
    expect(r.summary.byEmail + r.summary.byWeb).toBe(r.queue.length);
    expect(r.summary.byEmail).toBe(1);
    expect(r.summary.byWeb).toBe(1);
  });

  it('gives different advice for nothing found, nothing passing, and a real queue', async () => {
    search.mockResolvedValue(found([]));
    expect((await run(PROFILE, { sources: ['test'] }, {})).advice).toMatch(/No vacancies came back/);

    search.mockResolvedValue(found([job({ adText: 'Requires 20 years of kubernetes and go.' })]));
    expect((await run(PROFILE, { sources: ['test'] }, {})).advice).toMatch(/none cleared your gates/);

    search.mockResolvedValue(found([job()]));
    expect((await run(PROFILE, { sources: ['test'] }, {})).advice).toMatch(/worth applying to/);
  });
});

describe('the application address', () => {
  it('takes an address the ad says to apply to', () => {
    const hit = applicationEmail('Please send your resume to careers@acme.example by Friday.');
    expect(hit.address).toBe('careers@acme.example');
  });

  it('ignores an address that is not for applications', () => {
    // Mailing a privacy officer an application is useless and rude, which is
    // why context is required rather than "first address wins".
    expect(applicationEmail('Our privacy officer is privacy@acme.example.')).toBeNull();
    expect(applicationEmail('Questions? noreply@acme.example')).toBeNull();
  });

  it('returns null when the ad has no address at all', () => {
    expect(applicationEmail('Apply through the portal.')).toBeNull();
    expect(applicationEmail('')).toBeNull();
  });
});

describe('emailDraft prepares but never sends', () => {
  it('produces a draft addressed to the advertised address', () => {
    const enriched = { title: 'Support Engineer', company: 'Acme', applyEmail: 'jobs@acme.example' };
    const d = emailDraft(PROFILE, enriched, 'Dear hiring team, ...');
    expect(d.to).toBe('jobs@acme.example');
    expect(d.subject).toMatch(/Support Engineer/);
    expect(d.body).toMatch(/Dear hiring team/);
    // There is no send(). A tool that can silently mail hundreds of employers
    // is a spam cannon whatever its intent, so the human presses send.
    expect(d.send).toBeUndefined();
  });
});
