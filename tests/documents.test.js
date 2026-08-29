/**
 * ATS checks, evidence selection, and the two document generators.
 *
 * The property under protection throughout is that NOTHING IS INVENTED. A
 * cover-letter generator that writes a plausible achievement is worse than one
 * that writes nothing, because its user finds out at the interview. Several of
 * these tests exist purely to fail if that ever stops being true.
 */

const ats = require('../packages/ats/src/ats-check');
const ev = require('../packages/documents/src/evidence');
const { coverLetter } = require('../packages/documents/src/cover-letter');
const sc = require('../packages/documents/src/selection-criteria');

const GOOD_RESUME = [
  'Jane Doe',
  'jane@example.com',
  '+61 400 111 222',
  'linkedin.com/in/janedoe',
  '',
  'Summary',
  'Backend engineer with eight years building payment systems for Australian banks.',
  '',
  'Experience',
  '',
  'Senior Engineer, Acme Payments, 2021-2026',
  '- Cut settlement latency from 4s to 380ms across 12 million daily transactions',
  '- Led a team of 5 rebuilding the ledger in Go and PostgreSQL',
  '- Reduced AWS spend by 34 percent by right-sizing Kubernetes workloads',
  '',
  'Engineer, Bolt Systems, 2018-2021',
  '- Built the reconciliation service handling 200k records nightly',
  '- Migrated 40 services from Jenkins to GitHub Actions',
  '- Introduced Terraform, cutting environment build time from 3 days to 2 hours',
  '',
  'Education',
  '',
  'BSc Computer Science, University of Adelaide, 2018',
  '',
  'Skills',
  '',
  'Go, Python, PostgreSQL, Kubernetes, Terraform, AWS, Docker, Redis'
].join('\n');

/** The same content after a two-column PDF has been read across, not down. */
const COLUMN_DAMAGED = [
  'Jane Doe', 'Backend engineer', 'Skills', 'with eight years', 'Go',
  'building payment', 'Python', 'systems across', 'AWS', 'several teams and',
  'Docker', 'multiple regions', 'Kubernetes', 'Senior Engineer', 'Terraform',
  'Acme Payments', 'Redis', 'Cut settlement', 'Education', 'latency from 4s',
  'BSc', 'to 380ms across', 'Adelaide', 'twelve million', '2018',
  'daily transactions', 'Certifications', 'Led a team of', 'AWS SA',
  'five rebuilding', 'CKA', 'the ledger in Go'
].join('\n');

describe('the column-damage check, which must not cry wolf', () => {
  /**
   * THE PAIR THAT MATTERS. This is the most alarming finding the tool can
   * report, so it is tested in both directions. The first implementation used
   * "lots of short lines" and fired on the clean resume below; the second
   * over-corrected and could never fire at all.
   */
  test('a normal single-column resume is not flagged', () => {
    const ids = ats.checkResume(GOOD_RESUME).findings.map((f) => f.id);
    expect(ids).not.toContain('column-damage');
  });

  test('a genuinely interleaved resume is flagged', () => {
    const ids = ats.checkResume(COLUMN_DAMAGED).findings.map((f) => f.id);
    expect(ids).toContain('column-damage');
  });

  test('the flag is critical, and says why it cannot be fixed downstream', () => {
    const f = ats.checkResume(COLUMN_DAMAGED).findings.find((x) => x.id === 'column-damage');
    expect(f.severity).toBe('critical');
    expect(f.fix).toMatch(/single column/i);
  });

  test('a short paste is never flagged, because there is not enough to tell', () => {
    const ids = ats.checkResume('Jane Doe\njane@example.com\nEngineer\nPython\nAWS').findings.map((f) => f.id);
    expect(ids).not.toContain('column-damage');
  });
});

describe('ATS findings', () => {
  test('a missing email is critical — it is the primary key in every ATS', () => {
    const f = ats.checkResume(GOOD_RESUME.replace('jane@example.com', '')).findings
      .find((x) => x.id === 'no-email');
    expect(f.severity).toBe('critical');
  });

  test('a clean resume raises no critical findings', () => {
    expect(ats.checkResume(GOOD_RESUME).counts.critical).toBe(0);
  });

  test('creative headings are called out by name', () => {
    const r = ats.checkResume(GOOD_RESUME.replace('Experience', 'What I Bring'));
    const f = r.findings.find((x) => x.id === 'creative-headings' || x.id === 'no-section-experience');
    expect(f).toBeDefined();
  });

  test('acronym coverage notices a resume that says AWS but never Amazon Web Services', () => {
    const f = ats.checkResume(GOOD_RESUME).findings.find((x) => x.id === 'acronym-coverage');
    expect(f).toBeDefined();
    expect(f.detail.toLowerCase()).toMatch(/aws|amazon web services/);
  });

  test('unquantified bullets are flagged, quantified ones are not', () => {
    const vague = GOOD_RESUME.replace(/\d[\d,.]*\s*(percent|million|k\b|s\b|ms\b)?/g, 'several');
    const vagueIds = ats.checkResume(vague).findings.map((f) => f.id);
    const goodIds = ats.checkResume(GOOD_RESUME).findings.map((f) => f.id);
    expect(goodIds).not.toContain('no-numbers');
    expect(vagueIds).toContain('no-numbers');
  });

  test('there is no score out of a hundred anywhere, because no such thing exists', () => {
    const r = ats.checkResume(GOOD_RESUME, 'We need Kubernetes.');
    expect(r.score).toBeUndefined();
    expect(r.rating).toBeUndefined();
    expect(Object.keys(r).sort()).toEqual(['checked', 'counts', 'coverage', 'findings']);
  });

  test('it lists what it checked, so the reader knows what it did not', () => {
    expect(ats.checkResume(GOOD_RESUME).checked.length).toBeGreaterThan(5);
  });

  test('keyword coverage separates present from absent against one advertisement', () => {
    const c = ats.keywordCoverage(GOOD_RESUME, 'Required: Kubernetes, Terraform, Splunk, Ansible.');
    expect(c.present).toEqual(expect.arrayContaining(['kubernetes', 'terraform']));
    expect(c.absent.length).toBeGreaterThan(0);
    expect(c.present).not.toEqual(expect.arrayContaining(c.absent));
  });

  test('empty input says so rather than reporting a clean bill of health', () => {
    const r = ats.checkResume('');
    expect(r.counts.critical).toBe(1);
    expect(r.findings[0].id).toBe('empty');
  });
});

describe('evidence selection never invents', () => {
  test('a skill with no supporting line reports no evidence, not a generated one', () => {
    const [e] = ev.evidenceFor(GOOD_RESUME, ['splunk']);
    expect(e.hasEvidence).toBe(false);
    expect(e.text).toBeNull();
  });

  test('evidence is a verbatim line from the resume', () => {
    const [e] = ev.evidenceFor(GOOD_RESUME, ['terraform']);
    expect(e.hasEvidence).toBe(true);
    expect(GOOD_RESUME).toContain(e.text);
  });

  test('a quantified achievement is preferred over an unquantified one', () => {
    const resume = [
      '- Worked with Redis on the caching layer',
      '- Cut Redis memory use by 60 percent across 30 nodes'
    ].join('\n');
    const [e] = ev.evidenceFor(resume, ['redis']);
    expect(e.text).toMatch(/60 percent/);
    expect(e.quantified).toBe(true);
  });

  test('one bullet is not quoted for two different skills', () => {
    const list = ev.evidenceFor(GOOD_RESUME, ['go', 'postgresql']);
    const used = list.filter((e) => e.hasEvidence).map((e) => e.text);
    expect(new Set(used).size).toBe(used.length);
  });
});

describe('the cover letter', () => {
  const profile = { name: 'Jane Doe', email: 'jane@example.com', yearsExperience: 8, resumeText: GOOD_RESUME };
  const job = { title: 'Platform Engineer', company: 'Canva', requiredSkills: ['Kubernetes', 'Terraform'] };

  test('every claim it makes is traceable to a line in the resume', () => {
    const r = coverLetter(profile, job);
    expect(r.sources.length).toBeGreaterThan(0);
    for (const s of r.sources) expect(GOOD_RESUME).toContain(s.quotedFrom);
  });

  test('it uses the advertisement\'s own word, not the internal canonical name', () => {
    // "Splunk" canonicalises to "siem"; a letter saying "asks for Siem" is
    // both wrong and obviously machine-written.
    const r = coverLetter(profile, { ...job, requiredSkills: ['Kubernetes', 'Splunk'] });
    expect(r.text).toContain('Splunk');
    expect(r.text).not.toMatch(/\bSiem\b/);
  });

  /**
   * REGRESSION. The first version of the display fix read the ad's wording
   * from the skill names the caller passed in — which works in this test file
   * and does nothing in the app, because the app passes the output of
   * parseJobSkills(), already canonicalised to "siem". The label now falls
   * back to searching the advertisement text itself.
   */
  test('the ad\'s wording is recovered even when the caller passes canonical names', () => {
    const r = coverLetter(profile, {
      ...job,
      adText: 'Platform Engineer at Canva. Must have Kubernetes and Splunk experience.',
      requiredSkills: ['kubernetes', 'siem']
    });
    expect(r.text).toContain('Splunk');
    expect(r.text).not.toMatch(/\bSiem\b/);
  });

  test('a required skill with no evidence is named, not quietly skipped', () => {
    const r = coverLetter(profile, { ...job, requiredSkills: ['Kubernetes', 'Splunk'] });
    expect(r.unbackedRequired).toContain('siem');
  });

  test('several unsupported requirements produce a warning, not five bluffs', () => {
    const r = coverLetter(profile, { ...job, requiredSkills: ['Splunk', 'SAP', 'Salesforce'] });
    expect(r.text).toMatch(/worth sending|no achievement/i);
  });

  test('it never claims to be finished while blanks remain', () => {
    const r = coverLetter(profile, job);
    expect(r.gaps).toBeGreaterThan(0);
    expect(r.readiness).not.toBe('complete');
  });

  test('the why-this-employer paragraph is always a blank, never generated', () => {
    // It is the paragraph that distinguishes a tailored letter from a
    // template, and it is the one thing no generator can know.
    const r = coverLetter(profile, job);
    expect(r.text).toMatch(/\[why Canva specifically/);
  });

  test('an empty resume does not produce a confident letter', () => {
    const r = coverLetter({ name: 'X', resumeText: '' }, job);
    expect(r.readiness).toMatch(/skeleton/);
  });

  test('tone changes the wording without changing the evidence', () => {
    const plain = coverLetter(profile, job, { tone: 'plain' });
    const formal = coverLetter(profile, job, { tone: 'formal' });
    expect(formal.text).toMatch(/Yours sincerely/);
    expect(plain.text).not.toMatch(/Yours sincerely/);
    expect(formal.sources.map((s) => s.quotedFrom)).toEqual(plain.sources.map((s) => s.quotedFrom));
  });
});

describe('selection criteria', () => {
  const CRITERIA = [
    'Selection Criteria',
    '1. Demonstrated experience administering Kubernetes clusters in production environments',
    '2. High-level written and verbal communication skills with technical and non-technical stakeholders',
    '3. Proven ability to work autonomously with minimal supervision'
  ].join('\n');

  test('it finds the criteria and drops the heading above them', () => {
    const list = sc.parseCriteria(CRITERIA);
    expect(list).toHaveLength(3);
    expect(list.join(' ')).not.toMatch(/^Selection Criteria$/m);
  });

  test('numbering, letters and bullets are all stripped', () => {
    const list = sc.parseCriteria([
      '1. Demonstrated experience administering Kubernetes clusters in production',
      'b) High-level communication skills across technical and non-technical teams',
      '- Proven ability to work autonomously and manage competing deadlines'
    ].join('\n'));
    expect(list).toHaveLength(3);
    for (const c of list) expect(c).not.toMatch(/^[-\d(a-z][.)]?\s/);
  });

  test('every response has all four STAR parts', () => {
    const r = sc.draftAll(CRITERIA, GOOD_RESUME);
    for (const x of r.responses) {
      expect(Object.keys(x.parts).sort()).toEqual(['action', 'result', 'situation', 'task']);
      expect(x.text).toMatch(/Situation/);
      expect(x.text).toMatch(/Result/);
    }
  });

  test('a technical criterion is answered with the applicant\'s real achievement', () => {
    const r = sc.draftAll(CRITERIA, GOOD_RESUME);
    const k8s = r.responses[0];
    expect(k8s.technical).toContain('kubernetes');
    expect(k8s.evidenceUsed).toBeTruthy();
    expect(GOOD_RESUME).toContain(k8s.evidenceUsed);
  });

  test('the Situation is always a blank — it cannot be inferred and must not be invented', () => {
    const r = sc.draftAll(CRITERIA, GOOD_RESUME);
    for (const x of r.responses) expect(x.parts.situation).toMatch(/^\[Situation/);
  });

  test('behavioural criteria are recognised where no skill keyword exists', () => {
    const r = sc.draftAll(CRITERIA, GOOD_RESUME);
    expect(r.responses[1].behavioural).toContain('communication');
  });

  /**
   * "minimal supervision" is a criterion about working WITHOUT a supervisor.
   * Matching it as leadership inverts the meaning, and the drafted prompt then
   * asks for the opposite of what the panel wants.
   */
  test('"minimal supervision" is initiative, not leadership', () => {
    expect(sc.behaviouralKind('Proven ability to work autonomously with minimal supervision')
      .map((b) => b.id)).toEqual(['initiative']);
    expect(sc.behaviouralKind('Experience supervising a team of engineers')
      .map((b) => b.id)).toContain('leadership');
  });

  test('criteria with no matching evidence are listed rather than padded', () => {
    const r = sc.draftAll(CRITERIA, GOOD_RESUME);
    expect(r.unsupported.length).toBeGreaterThan(0);
  });

  test('no criteria found says so instead of returning an empty success', () => {
    const r = sc.draftAll('', GOOD_RESUME);
    expect(r.responses).toHaveLength(0);
    expect(r.note).toMatch(/No criteria found/);
  });
});
