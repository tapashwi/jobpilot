/**
 * Interview prep, resume tailoring and follow-up messages.
 *
 * The property under protection is the same one as everywhere else: the tool
 * surfaces and rewords what is already true, and refuses to manufacture what
 * is not. Tailoring is where that line is easiest to cross and hardest to
 * notice, so most of these tests are about what the tailor will NOT say.
 */

const { prepare } = require('../packages/prep/src/interview');
const { tailor } = require('../packages/prep/src/tailor');
const fu = require('../packages/prep/src/followup');

const RESUME = [
  'Summary',
  'Backend engineer with eight years in payments.',
  '',
  'Experience',
  '- Ran container clusters with k8s across 60 services',
  '- Wrote runbooks for the on-call rotation',
  '- Built CI pipelines in GitHub Actions',
  '- Managed AWS spend across three accounts',
  '- Introduced Terraform, cutting build time from 3 days to 2 hours',
  '- Handled Sev-1 incidents as escalation point'
].join('\n');

const JOB = {
  title: 'Platform Engineer',
  company: 'Canva',
  adText: 'We need Kubernetes, Terraform and Splunk. Strong communication skills and the ability ' +
    'to work in a team with minimal supervision.',
  requiredSkills: ['kubernetes', 'terraform', 'siem']
};

describe('interview prep derives questions from the advertisement', () => {
  const r = prepare({ resumeText: RESUME }, JOB);

  test('questions you cannot answer come first', () => {
    expect(r.technical[0].haveAnswer).toBe(false);
    const firstAnswerable = r.technical.findIndex((t) => t.haveAnswer);
    const lastGap = r.technical.map((t) => !t.haveAnswer).lastIndexOf(true);
    if (firstAnswerable !== -1) expect(lastGap).toBeLessThan(firstAnswerable);
  });

  test('the headline is what you cannot answer, not how many questions there are', () => {
    expect(r.summary.withoutAnAnswer).toBeGreaterThan(0);
    expect(r.summary.advice).toMatch(/no evidence for/);
  });

  test('a question about a skill you have carries the line that answers it', () => {
    const answered = r.technical.find((t) => t.haveAnswer);
    expect(answered.evidence).toBeTruthy();
    expect(RESUME).toContain(answered.evidence);
  });

  /** Same defect as the cover letter had. Fixed once, in skills.js. */
  test('questions use the advertisement\'s word, not the internal canonical', () => {
    const all = r.technical.map((t) => t.question).join(' ');
    expect(all).toContain('Splunk');
    expect(all).not.toMatch(/\bsiem\b/i);
  });

  test('behavioural questions come from the ad\'s own language', () => {
    expect(r.behavioural.map((b) => b.kind)).toEqual(expect.arrayContaining(['communication', 'teamwork']));
  });

  test('an ad with no behavioural language still gets the two everyone asks', () => {
    const bare = prepare({ resumeText: RESUME }, { adText: 'Kubernetes required.', requiredSkills: ['kubernetes'] });
    expect(bare.behavioural.length).toBeGreaterThan(0);
  });

  test('it supplies questions to ask them, each with a reason', () => {
    expect(r.questionsToAsk.length).toBeGreaterThan(3);
    for (const q of r.questionsToAsk) expect(q.why.length).toBeGreaterThan(30);
  });
});

describe('tailoring surfaces and rewords — it never invents', () => {
  const r = tailor({ resumeText: RESUME }, JOB);

  /**
   * THE ONE THAT MATTERS. A resume tailor that suggests adding a missing
   * keyword gets its user past the filter and destroyed in the interview.
   */
  test('a skill the resume does not have is reported as a gap, never as an edit to make', () => {
    const gap = r.edits.find((e) => e.kind === 'gap');
    expect(gap).toBeDefined();
    expect(gap.what).toMatch(/Splunk/);
    expect(gap.how).toMatch(/do NOT add the keyword/i);
  });

  test('no suggestion ever tells you to add a skill you do not have', () => {
    for (const e of r.edits) {
      if (e.kind === 'gap') continue;
      expect(e.how).not.toMatch(/add (the )?(splunk|siem)/i);
    }
  });

  test('it catches your word against their word for the same thing', () => {
    const v = r.edits.find((e) => e.kind === 'vocabulary');
    expect(v.what).toContain('Kubernetes');
    expect(v.what).toContain('k8s');
    expect(v.how).toMatch(/k8s \(Kubernetes\)/);
  });

  test('it notices the summary does not lead with what the ad leads with', () => {
    expect(r.edits.some((e) => e.kind === 'summary')).toBe(true);
  });

  test('the note states where tailoring stops', () => {
    expect(r.note).toMatch(/does not add experience|tailoring and/i);
  });

  test('an already-matching resume is told to change nothing', () => {
    const good = tailor(
      { resumeText: 'Summary\nKubernetes and Terraform engineer.\n\n- Ran Kubernetes across 60 services, cutting cost 34 percent\n- Introduced Terraform, 3 days to 2 hours' },
      { adText: 'Kubernetes and Terraform.', requiredSkills: ['kubernetes', 'terraform'] }
    );
    expect(good.edits.filter((e) => e.kind === 'gap')).toHaveLength(0);
  });

  test('an empty resume says so rather than producing edits', () => {
    expect(tailor({ resumeText: '' }, JOB).edits).toEqual([]);
  });

  test('every edit says what, why and how', () => {
    for (const e of r.edits) {
      expect(e.what.length).toBeGreaterThan(10);
      expect(e.why.length).toBeGreaterThan(20);
      expect(e.how.length).toBeGreaterThan(20);
    }
  });
});

describe('follow-up messages', () => {
  test('each template produces a subject and a body', () => {
    for (const kind of Object.keys(fu.TEMPLATES)) {
      const d = fu.draft(kind, { name: 'Jane Doe' }, { title: 'Platform Engineer', company: 'Canva' });
      expect(d.subject.length).toBeGreaterThan(5);
      expect(d.body).toContain('Jane Doe');
    }
  });

  test('the specific part is always a blank, because only the applicant knows it', () => {
    const d = fu.draft('after-interview', { name: 'Jane' }, { title: 'Engineer' });
    expect(d.gaps).toBeGreaterThan(0);
    expect(d.body).toMatch(/\[name ONE specific thing/);
  });

  test('they are short, because a long follow-up reads as anxiety', () => {
    for (const kind of Object.keys(fu.TEMPLATES)) {
      const d = fu.draft(kind, { name: 'Jane' }, { title: 'Engineer' });
      expect(d.body.split(/\s+/).length).toBeLessThan(160);
    }
  });

  test('it picks the right message for where the application is', () => {
    expect(fu.suggest('applied', 12)).toBe('after-applying');
    expect(fu.suggest('applied', 2)).toBeNull();
    expect(fu.suggest('interviewing', 1)).toBe('after-interview');
    expect(fu.suggest('interviewing', 9)).toBe('chasing-decision');
    expect(fu.suggest('rejected', 0)).toBe('after-rejection');
    expect(fu.suggest('queued', 40)).toBeNull();
  });

  test('the timing advice is attached, since sending at the wrong moment is the usual mistake', () => {
    for (const kind of Object.keys(fu.TEMPLATES)) {
      expect(fu.draft(kind, {}, {}).note.length).toBeGreaterThan(40);
    }
  });

  test('an unknown template throws rather than returning an empty message', () => {
    expect(() => fu.draft('grovel', {}, {})).toThrow(/Unknown follow-up/);
  });
});
