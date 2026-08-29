/**
 * The batch pipeline: many advertisements in, an ordered queue of finished
 * application packs out.
 *
 * The behaviour worth protecting is what it REFUSES to do. A batch tool that
 * happily generates forty polished cover letters for forty jobs — including
 * the ones the applicant is barred from by a stated requirement — is a machine
 * for wasting its user's time and other people's attention. Blocked jobs get
 * no documents, and that is asserted here.
 */

const pl = require('../packages/tracker/src/pipeline');

const RESUME = [
  'Jane Doe',
  'jane@example.com',
  '+61 400 111 222',
  '',
  'Summary',
  'Platform engineer with eight years in payments.',
  '',
  'Experience',
  'Senior Engineer, Acme Payments, 2021-2026',
  '- Reduced AWS spend by 34 percent by right-sizing Kubernetes workloads across 60 services',
  '- Introduced Terraform, cutting environment build time from 3 days to 2 hours',
  '- Cut settlement latency from 4s to 380ms across 12 million daily transactions',
  '',
  'Education',
  'BSc Computer Science, University of Adelaide, 2018',
  '',
  'Skills',
  'Kubernetes, Terraform, AWS, Go, PostgreSQL'
].join('\n');

const PROFILE = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  yearsExperience: 8,
  minSalary: 110000,
  skills: ['kubernetes', 'terraform', 'amazon web services', 'go', 'postgresql'],
  resumeText: RESUME
};

const AD_GOOD = [
  'Platform Engineer',
  'Company: Canva',
  'Location: Sydney',
  'We are looking for someone with 3+ years experience with Kubernetes, Terraform and AWS.',
  'Salary $140,000 - $170,000.'
].join('\n');

const AD_TOO_SENIOR = [
  'Principal Engineer',
  'Company: Atlassian',
  'Requires 15 years experience with Kubernetes and Go.',
  'Salary $250,000 - $300,000.'
].join('\n');

const AD_UNDERPAID = [
  'Junior Platform Engineer',
  'Company: Tinyco',
  'Needs 2 years experience with Kubernetes.',
  'Salary $60,000 - $70,000.'
].join('\n');

describe('splitting a pile of advertisements', () => {
  test('a run of dashes separates them', () => {
    expect(pl.splitAdvertisements([AD_GOOD, AD_TOO_SENIOR].join('\n\n---\n\n'))).toHaveLength(2);
  });

  test('equals signs and hashes work too, because people use what they use', () => {
    expect(pl.splitAdvertisements([AD_GOOD, AD_TOO_SENIOR].join('\n===\n'))).toHaveLength(2);
    expect(pl.splitAdvertisements([AD_GOOD, AD_TOO_SENIOR].join('\n####\n'))).toHaveLength(2);
  });

  test('a single advertisement is one advertisement, not zero', () => {
    expect(pl.splitAdvertisements(AD_GOOD)).toHaveLength(1);
  });

  test('empty input is an empty list, not a crash', () => {
    expect(pl.splitAdvertisements('')).toEqual([]);
    expect(pl.splitAdvertisements(null)).toEqual([]);
  });

  test('fragments too short to be a job are dropped', () => {
    expect(pl.splitAdvertisements(`${AD_GOOD}\n---\nsee above`)).toHaveLength(1);
  });
});

describe('reading one advertisement', () => {
  const parsed = pl.parseAdvertisement(AD_GOOD);

  test('it finds the fields that are labelled', () => {
    expect(parsed.title).toBe('Platform Engineer');
    expect(parsed.company).toBe('Canva');
    expect(parsed.location).toBe('Sydney');
  });

  test('it reads the salary range', () => {
    expect(parsed.salaryMin).toBe(140000);
    expect(parsed.salaryMax).toBe(170000);
  });

  test('it reads the years demanded', () => {
    expect(parsed.minYearsExperience).toBe(3);
  });

  test('it separates required skills from preferred ones', () => {
    const p = pl.parseAdvertisement(`${AD_GOOD}\nSplunk would be a bonus.`);
    expect(p.requiredSkills).toEqual(expect.arrayContaining(['kubernetes', 'terraform']));
    expect(p.preferredSkills).toContain('siem');
    expect(p.requiredSkills).not.toContain('siem');
  });

  /**
   * A guessed company name on a cover letter is worse than a blank one,
   * because a blank gets noticed before it is sent.
   */
  test('a field it cannot find is left null and named, not guessed', () => {
    const p = pl.parseAdvertisement('We want someone great with Kubernetes to join the team.');
    expect(p.company).toBeNull();
    expect(p.missingFields).toContain('company');
  });
});

describe('the queue refuses to do useless work', () => {
  const queue = pl.buildQueue(PROFILE, [AD_GOOD, AD_TOO_SENIOR, AD_UNDERPAID]);

  /** THE CHECK THAT MATTERS. No documents for an application that cannot win. */
  test('a blocked job gets no generated documents at all', () => {
    const blocked = queue.skip;
    expect(blocked.length).toBeGreaterThan(0);
    for (const p of blocked) expect(p.documents).toBeNull();
  });

  test('a blocked job still says exactly why', () => {
    for (const p of queue.skip) {
      expect(p.why.length).toBeGreaterThan(0);
      expect(p.why.join(' ').length).toBeGreaterThan(10);
    }
  });

  test('the experience gate blocks the job asking for fifteen years', () => {
    const senior = queue.packs.find((p) => p.job.title === 'Principal Engineer');
    expect(senior.recommendation).toBe('skip');
    expect(senior.why.join(' ')).toMatch(/15 years/);
  });

  test('the salary gate blocks the job paying below the floor', () => {
    const junior = queue.packs.find((p) => p.job.title === 'Junior Platform Engineer');
    expect(junior.recommendation).toBe('skip');
  });

  test('a job that clears the gates gets a full pack', () => {
    const good = queue.packs.find((p) => p.job.title === 'Platform Engineer');
    expect(good.documents).not.toBeNull();
    expect(good.documents.coverLetter.text).toContain('Canva');
    expect(good.documents.atsCheck.findings).toBeDefined();
  });

  test('the summary adds up to the number of advertisements in', () => {
    const s = queue.summary;
    expect(s.ready + s.fixFirst + s.skipped).toBe(s.total);
    expect(s.total).toBe(3);
  });

  test('everything that got documents is ordered ahead of everything blocked', () => {
    const firstBlocked = queue.packs.findIndex((p) => p.recommendation === 'skip');
    const lastOpen = queue.packs.map((p) => p.recommendation !== 'skip').lastIndexOf(true);
    if (firstBlocked !== -1) expect(lastOpen).toBeLessThan(firstBlocked);
  });

  test('it reports how much human work is left, not just how many jobs', () => {
    expect(queue.summary.totalGaps).toBeGreaterThan(0);
  });
});

describe('shared resume fixes', () => {
  /**
   * A finding that appears against every job is a resume problem, not a job
   * problem — and fixing it once improves the whole queue. Surfacing that
   * separately is the difference between a list of forty warnings and one
   * useful instruction.
   */
  test('a fault affecting several jobs is surfaced once, with a count', () => {
    const weak = { ...PROFILE, resumeText: RESUME.replace('jane@example.com', '') };
    const q = pl.buildQueue(weak, [AD_GOOD, AD_GOOD, AD_GOOD]);
    const email = q.sharedResumeFixes.find((f) => f.id === 'no-email');
    expect(email).toBeDefined();
    expect(email.affectsJobs).toBe(3);
  });

  test('a per-advertisement keyword gap is not reported as a shared fix', () => {
    const q = pl.buildQueue(PROFILE, [AD_GOOD, AD_GOOD]);
    expect(q.sharedResumeFixes.map((f) => f.id)).not.toContain('job-keyword-gap');
  });
});

describe('tracking an application', () => {
  test('a transition keeps the history rather than overwriting it', () => {
    let r = { id: 1, status: 'queued' };
    r = pl.transition(r, 'ready');
    r = pl.transition(r, 'applied', 'via SEEK Quick Apply');
    expect(r.status).toBe('applied');
    expect(r.history).toHaveLength(2);
    expect(r.history[1].note).toBe('via SEEK Quick Apply');
    expect(r.history[0].at).toBeTruthy();
  });

  test('it does not mutate the record it was given', () => {
    const before = { id: 1, status: 'queued' };
    pl.transition(before, 'applied');
    expect(before.status).toBe('queued');
    expect(before.history).toBeUndefined();
  });

  test('an unknown status is refused rather than silently stored', () => {
    expect(() => pl.transition({ status: 'queued' }, 'ghosted')).toThrow(/Unknown status/);
  });

  test('applications that have gone quiet are found by age', () => {
    const old = new Date(Date.now() - 20 * 86400000).toISOString();
    const recent = new Date().toISOString();
    const due = pl.needsFollowUp([
      { id: 1, status: 'applied', updatedAt: old },
      { id: 2, status: 'applied', updatedAt: recent },
      { id: 3, status: 'rejected', updatedAt: old }
    ], 10);
    expect(due.map((r) => r.id)).toEqual([1]);
  });
});

describe('what it will not do, stated in the code', () => {
  /**
   * There is no submit. This is asserted so that adding one is a deliberate
   * act with a failing test in front of it, rather than a quiet afternoon's
   * work — the terms of every major ATS prohibit automated submission, and the
   * penalty falls on the applicant's account, not on this tool.
   */
  test('the pipeline exposes no submit or apply function', () => {
    const names = Object.keys(pl).join(' ').toLowerCase();
    expect(names).not.toMatch(/submit/);
    expect(names).not.toMatch(/autoapply|auto_apply/);
  });

  test('"applied" is a status a person records, not an action the tool takes', () => {
    expect(pl.STATUSES).toContain('applied');
    expect(typeof pl.transition).toBe('function');
  });
});
