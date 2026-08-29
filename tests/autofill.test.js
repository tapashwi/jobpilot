/**
 * The auto-apply engine.
 *
 * The competitive research is unambiguous about how hands-off appliers fail,
 * and it is not form-filling. It is that they apply to jobs the user is barred
 * from, apply to the same job three times, and answer screening questions
 * wrong at scale — a mis-toggled work-authorisation answer replicated across
 * forty applications, each one an auto-reject before a human reads it.
 *
 * Those three failures are what this package exists to prevent, so they are
 * what these tests are about. The single most important one:
 *
 *     A run cannot reach 'submitted' with an unresolved field in it.
 *
 * If that ever stops being true, this is a spray-and-pray tool with better
 * comments.
 */

const fm = require('../packages/autofill/src/fieldmap');
const ab = require('../packages/autofill/src/answers');
const rn = require('../packages/autofill/src/runner');

const PROFILE = {
  name: 'Jane Doe', email: 'jane@example.com', phone: '+61 400 111 222',
  city: 'Adelaide', country: 'Australia', linkedin: 'linkedin.com/in/janedoe',
  yearsExperience: 8, minSalary: 120000,
  skills: ['kubernetes', 'terraform'],
  resumeText: '- Ran Kubernetes across 60 services\n- Introduced Terraform'
};

const FULL_BANK = {
  workAuthorisation: 'Yes', visaSponsorship: 'No',
  noticePeriod: '4 weeks', salaryExpectation: '140000'
};

const JOB = { title: 'Platform Engineer', company: 'Canva', requiredSkills: ['kubernetes'], minYearsExperience: 3 };

const FORM = { fields: [
  { label: 'First Name', required: true },
  { label: 'Last Name', required: true },
  { label: 'Email Address', required: true },
  { label: 'Phone', required: true },
  { label: 'Are you legally authorised to work in Australia?', required: true },
  { label: 'Will you now or in the future require sponsorship?', required: true },
  { label: 'What are your salary expectations?', required: true },
  { label: 'Notice period', required: true }
] };

describe('identifying a field', () => {
  test('it reads the label, the aria-label, the name and the placeholder', () => {
    expect(fm.identify({ label: 'First Name' }).key).toBe('firstName');
    expect(fm.identify({ ariaLabel: 'Email address' }).key).toBe('email');
    expect(fm.identify({ name: 'phone_number' }).key).toBe('phone');
    expect(fm.identify({ placeholder: 'linkedin.com/in/...' }).key).toBe('linkedin');
  });

  /** Different ATS expose different subsets, so a real one has to use all of them. */
  test('a field with only a cryptic name is still identified where possible', () => {
    expect(fm.identify({ name: 'candidate_postcode' }).key).toBe('postcode');
  });

  test('the visible label outranks a machine name that disagrees', () => {
    const r = fm.identify({ label: 'Email Address', name: 'field_7' });
    expect(r.key).toBe('email');
  });

  test('"current salary" is not "salary expectation"', () => {
    expect(fm.identify({ label: 'What is your current salary?' }).key).toBe('currentSalary');
    expect(fm.identify({ label: 'What are your salary expectations?' }).key).toBe('salaryExpectation');
  });

  test('a field it cannot identify says so rather than guessing', () => {
    const r = fm.identify({ label: 'Describe your leadership philosophy in 300 words' });
    expect(r.key).toBeNull();
    expect(r.confidence).toBe(0);
  });

  test('a field with no signals at all is unidentifiable, not defaulted', () => {
    expect(fm.identify({}).key).toBeNull();
    expect(fm.identify({}).reason).toMatch(/no label/);
  });
});

describe('things it will never fill', () => {
  const cases = [
    ['a password', { name: 'password', type: 'password' }],
    ['a card number', { label: 'Credit card number' }],
    ['a tax file number', { label: 'Tax File Number' }],
    ['a social security number', { label: 'Social Security Number' }],
    ['a captcha', { label: 'Enter the CAPTCHA' }]
  ];

  test.each(cases)('%s is refused', (_name, field) => {
    const id = fm.identify(field);
    const v = fm.valueFor(id, PROFILE, FULL_BANK);
    expect(v.action).toBe('refuse');
  });

  /**
   * REGRESSION. Refusals and unidentified fields both carry key === null, so
   * checking the key first swallowed every refusal and logged it as an
   * ordinary skip — losing the difference between "I could not identify this"
   * and "I will never touch this", which is what the audit log exists to show.
   */
  test('a refusal is reported as a refusal, not as an ordinary skip', () => {
    const v = fm.valueFor(fm.identify({ label: 'Credit card number' }), PROFILE, FULL_BANK);
    expect(v.action).toBe('refuse');
    expect(v.refused).toBe('payment');
  });

  test('equal-opportunity questions are skipped, not answered', () => {
    for (const label of ['Gender', 'Race / Ethnicity', 'Do you have a disability?', 'Veteran status',
                         'Are you of Aboriginal or Torres Strait Islander origin?']) {
      const v = fm.valueFor(fm.identify({ label }), PROFILE, FULL_BANK);
      expect(v.action).toBe('skip');
      expect(v.why).toMatch(/voluntary|should not answer/i);
    }
  });
});

describe('knockout questions are never guessed', () => {
  /**
   * THE RULE THE PRODUCT RESTS ON. Every published complaint about these tools
   * is some version of this going wrong.
   */
  test('a knockout with no saved answer pauses instead of filling', () => {
    const v = fm.valueFor(fm.identify({ label: 'Will you require sponsorship?' }), PROFILE, {});
    expect(v.action).toBe('pause');
    expect(v.why).toMatch(/knockout/);
  });

  test('a knockout with a saved answer uses it, and says where it came from', () => {
    const v = fm.valueFor(fm.identify({ label: 'Will you require sponsorship?' }), PROFILE, FULL_BANK);
    expect(v.action).toBe('fill');
    expect(v.value).toBe('No');
    expect(v.source).toBe('answer-bank');
    expect(v.knockout).toBe(true);
  });

  test('a knockout is never satisfied from the resume or the profile', () => {
    const rich = { ...PROFILE, workAuthorisation: 'Yes', visaSponsorship: 'No' };
    const v = fm.valueFor(fm.identify({ label: 'Are you legally authorised to work here?' }), rich, {});
    expect(v.action).toBe('pause');
  });

  test('a low-confidence non-knockout field pauses rather than being filled', () => {
    const v = fm.valueFor({ key: 'city', confidence: 0.3 }, PROFILE, FULL_BANK);
    expect(v.action).toBe('pause');
  });
});

describe('the answer bank', () => {
  test('an empty bank is not ready, and names what is missing', () => {
    const r = ab.readiness({});
    expect(r.ready).toBe(false);
    expect(r.essentialMissing.map((q) => q.key)).toEqual(
      expect.arrayContaining(['workAuthorisation', 'visaSponsorship', 'noticePeriod', 'salaryExpectation'])
    );
  });

  test('the four everyone asks are enough to run', () => {
    expect(ab.readiness(FULL_BANK).ready).toBe(true);
  });

  test('every standard question explains why it matters', () => {
    for (const q of ab.STANDARD) {
      expect(q.why.length).toBeGreaterThan(40);
      expect(q.question.length).toBeGreaterThan(10);
    }
  });

  test('the sponsorship question warns that yes and no are easy to invert', () => {
    expect(ab.BY_KEY.get('visaSponsorship').why).toMatch(/backwards|"Yes" here means/);
  });

  test('a saved free-text answer is reused for the same question', () => {
    const bank = ab.remember({}, 'Why do you want to work here?', 'Because of X.');
    expect(ab.lookupFreeText('why do you want to work here', bank).found).toBe(true);
  });

  /** Answering the wrong question is worse than not answering. */
  test('a saved answer is not reused for a different question', () => {
    const bank = ab.remember({}, 'Why do you want to work here?', 'Because of X.');
    expect(ab.lookupFreeText('Why are you leaving your current role?', bank).found).toBe(false);
  });
});

describe('the runner, and the one property that matters', () => {
  /**
   * THE SAFETY PROPERTY. If this test ever fails, the tool has become the
   * thing its own README criticises.
   */
  test('a run never reaches submitted with an unresolved field', () => {
    const banks = [{}, { workAuthorisation: 'Yes' }, { workAuthorisation: 'Yes', visaSponsorship: 'No' }, FULL_BANK];
    for (const bank of banks) {
      const r = rn.runOne(PROFILE, JOB, FORM, { mode: 'auto', answers: bank });
      if (r.outcome === 'submitted') expect(r.blockers).toHaveLength(0);
      if (r.blockers.length) expect(r.outcome).not.toBe('submitted');
    }
  });

  test('an incomplete answer bank downgrades auto to review, and says which field', () => {
    const r = rn.runOne(PROFILE, JOB, FORM, { mode: 'auto', answers: { workAuthorisation: 'Yes' } });
    expect(r.outcome).toBe('filled-for-review');
    expect(r.blockers.map((b) => b.label).join(' ')).toMatch(/sponsorship/i);
  });

  test('a complete bank on a job that clears the gates does submit', () => {
    const r = rn.runOne(PROFILE, JOB, FORM, { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('submitted');
  });

  test('review is the default mode, so an omitted option never submits', () => {
    const r = rn.runOne(PROFILE, JOB, FORM, { answers: FULL_BANK });
    expect(r.outcome).toBe('filled-for-review');
  });

  test('an unrecognised mode falls back to review rather than to auto', () => {
    const r = rn.runOne(PROFILE, JOB, FORM, { mode: 'YOLO', answers: FULL_BANK });
    expect(r.outcome).toBe('filled-for-review');
  });

  test('a blocked job is never filled at all', () => {
    const senior = { ...JOB, minYearsExperience: 15 };
    const r = rn.runOne(PROFILE, senior, FORM, { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('blocked');
    expect(r.plan).toHaveLength(0);
    expect(r.why).toMatch(/15 years/);
  });

  test('the same role from two boards is applied to once', () => {
    const b = rn.runBatch(PROFILE, [
      { job: { ...JOB, url: 'https://seek.com.au/1' }, form: FORM },
      { job: { ...JOB, url: 'https://linkedin.com/2' }, form: FORM }
    ], { mode: 'auto', answers: FULL_BANK });
    expect(b.summary.submitted).toBe(1);
    expect(b.summary.duplicates).toBe(1);
  });

  test('a blocked job does not suppress a later genuine posting of the same role', () => {
    // Blocking must not poison the dedupe set, or one bad parse hides the role
    // everywhere it appears.
    const b = rn.runBatch(PROFILE, [
      { job: { ...JOB, minYearsExperience: 15 }, form: FORM },
      { job: JOB, form: FORM }
    ], { mode: 'auto', answers: FULL_BANK });
    expect(b.summary.blocked).toBe(1);
    expect(b.summary.submitted).toBe(1);
  });

  /**
   * FOUND BY RUNNING IT, not by reading it. The first version treated every
   * refusal as a blocker, which sounds cautious and is useless: nearly every
   * real application form carries an optional field this will never fill — a
   * tax file number, a referral code — so auto mode would never have fired on
   * any real form. An automation that never automates is broken, not safe.
   */
  test('an OPTIONAL field we refuse to fill does not prevent submission', () => {
    const form = { fields: [
      { label: 'First Name', required: true },
      { label: 'Email Address', required: true },
      { label: 'Are you legally authorised to work here?', required: true },
      { label: 'Will you require sponsorship?', required: true },
      { label: 'Tax File Number' }
    ] };
    const r = rn.runOne(PROFILE, JOB, form, { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('submitted');
    // It is still reported, because "we did not touch your TFN" is worth
    // seeing even when it changed nothing.
    expect(r.blockers.some((b) => b.kind === 'refused' && b.blocking === false)).toBe(true);
  });

  test('a REQUIRED field we refuse to fill does prevent submission', () => {
    const form = { fields: [
      { label: 'First Name', required: true },
      { label: 'Email Address', required: true },
      { label: 'Are you legally authorised to work here?', required: true },
      { label: 'Will you require sponsorship?', required: true },
      { label: 'Tax File Number', required: true }
    ] };
    const r = rn.runOne(PROFILE, JOB, form, { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('filled-for-review');
    expect(rn.blocking(r.blockers).some((b) => b.kind === 'refused')).toBe(true);
  });

  /**
   * The one exception to the required rule. An ATS that marks work
   * authorisation optional still filters on it, so an unanswered knockout is
   * a hard stop whatever the form claims.
   */
  test('an unanswered knockout blocks even when the form calls it optional', () => {
    const form = { fields: [
      { label: 'First Name', required: true },
      { label: 'Email Address', required: true },
      { label: 'Will you require sponsorship?' }
    ] };
    const r = rn.runOne(PROFILE, JOB, form, { mode: 'auto', answers: { workAuthorisation: 'Yes' } });
    expect(r.outcome).toBe('filled-for-review');
    expect(rn.blocking(r.blockers).some((b) => /sponsorship/i.test(b.label))).toBe(true);
  });

  test('a required field nothing could identify blocks submission', () => {
    const form = { fields: [
      { label: 'First Name', required: true },
      { label: 'Email Address', required: true },
      { label: 'Describe your leadership philosophy', required: true }
    ] };
    const r = rn.runOne(PROFILE, JOB, form, { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('filled-for-review');
    expect(rn.blocking(r.blockers).some((b) => b.kind === 'required-unknown')).toBe(true);
  });

  test('every filled field is recorded with its value and where it came from', () => {
    const r = rn.runOne(PROFILE, JOB, FORM, { mode: 'auto', answers: FULL_BANK });
    expect(r.record.length).toBeGreaterThan(4);
    for (const e of r.record) {
      expect(e.field).toBeTruthy();
      expect(e.source).toMatch(/profile|answer-bank/);
    }
    // The audit trail must show which answers were the dangerous ones.
    expect(r.record.some((e) => e.knockout)).toBe(true);
  });

  test('a form nothing can be filled from is reported, not submitted', () => {
    const r = rn.runOne(PROFILE, JOB, { fields: [{ label: 'Username' }, { name: 'password', type: 'password' }] },
      { mode: 'auto', answers: FULL_BANK });
    expect(r.outcome).toBe('needs-human');
  });

  test('a batch reports the answer-bank readiness alongside the results', () => {
    const b = rn.runBatch(PROFILE, [{ job: JOB, form: FORM }], { mode: 'auto', answers: {} });
    expect(b.answerBank.ready).toBe(false);
    expect(b.summary.submitted).toBe(0);
  });

  test('the summary accounts for every job', () => {
    const b = rn.runBatch(PROFILE, [
      { job: JOB, form: FORM },
      { job: { ...JOB, minYearsExperience: 15 }, form: FORM },
      { job: JOB, form: FORM }
    ], { mode: 'auto', answers: FULL_BANK });
    const s = b.summary;
    expect(s.submitted + s.awaitingConfirmation + s.forReview + s.blocked + s.duplicates + s.needsHuman)
      .toBe(s.total);
  });
});

/**
 * The browser bundle puts every module in ONE shared scope, so two modules
 * declaring the same top-level name is a SyntaxError that takes the whole app
 * down on load — with no failing unit test, because the packages are fine
 * individually.
 *
 * This has now nearly happened twice: GAP declared in both document
 * generators, and normalise in both skills.js and fieldmap.js. Twice is a
 * pattern, so it gets a guard rather than a third careful review.
 */
describe('the browser bundle cannot collide with itself', () => {
  const fs = require('fs');
  const path = require('path');
  const ROOT = path.join(__dirname, '..');

  function modulesFromBuildScript() {
    const src = fs.readFileSync(path.join(ROOT, 'scripts/build-engine.js'), 'utf8');
    const block = src.slice(src.indexOf('const MODULES'), src.indexOf('];', src.indexOf('const MODULES')));
    return [...block.matchAll(/'([^']+\.js)'/g)].map((m) => m[1]);
  }

  function topLevelNames(file) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
      .replace(/^const .*= require\(.*\);?\s*$/gm, '')
      .replace(/^module\.exports\b[\s\S]*?;\s*$/gm, '');
    const names = new Set();
    for (const re of [/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm, /^function\s+([A-Za-z_$][\w$]*)/gm]) {
      let m;
      while ((m = re.exec(src))) names.add(m[1]);
    }
    return names;
  }

  test('no two bundled modules declare the same top-level name', () => {
    const owner = new Map();
    const clashes = [];
    for (const file of modulesFromBuildScript()) {
      for (const name of topLevelNames(file)) {
        if (owner.has(name)) clashes.push(`"${name}" in both ${owner.get(name)} and ${file}`);
        else owner.set(name, file);
      }
    }
    expect(clashes).toEqual([]);
  });

  test('every module named by the build script exists', () => {
    for (const file of modulesFromBuildScript()) {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }
  });

  test('the generated bundle parses, and exposes the auto-apply entry points', () => {
    const vm = require('vm');
    const root = {};
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'app/engine.js'), 'utf8'), { globalThis: root, console });
    for (const fn of ['runOne', 'runBatch', 'identify', 'valueFor', 'answerReadiness']) {
      expect(typeof root.JobPilot[fn]).toBe('function');
    }
  });
});
