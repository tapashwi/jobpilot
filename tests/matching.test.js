/**
 * The matching engine.
 *
 * Written before any UI, because if the matcher is not useful the UI is
 * decoration. The cases that matter most are the ones where a naive
 * implementation gives a confident wrong answer.
 */

const S = require('../packages/matching/src/skills');
const M = require('../packages/matching/src/match');

describe('skill aliases — where the whole matcher lives or dies', () => {
  test('the abbreviations people actually write resolve', () => {
    expect(S.canonicalise('k8s')).toBe('kubernetes');
    expect(S.canonicalise('AWS')).toBe('amazon web services');
    expect(S.canonicalise('Azure AD')).toBe('microsoft entra id');
    expect(S.canonicalise('Azure Active Directory')).toBe('microsoft entra id');
    expect(S.canonicalise('M365')).toBe('microsoft 365');
    expect(S.canonicalise('MDE')).toBe('microsoft defender');
  });

  test('a rename resolves both old and new names to one thing', () => {
    // Azure AD became Entra ID. A resume says one, a posting says the other.
    expect(S.canonicalise('Azure AD')).toBe(S.canonicalise('Microsoft Entra ID'));
    expect(S.canonicalise('Endpoint Manager')).toBe(S.canonicalise('Intune'));
  });

  test('case and punctuation do not matter', () => {
    expect(S.canonicalise('  CI/CD  ')).toBe('ci/cd');
    expect(S.canonicalise('Node.JS')).toBe('node.js');
  });

  test('an unknown skill passes through rather than vanishing', () => {
    expect(S.canonicalise('Quantum Basket Weaving')).toBe('quantum basket weaving');
    expect(S.isKnown('Quantum Basket Weaving')).toBe(false);
  });

  /** No alias may point at two canonicals, or matching becomes ambiguous. */
  test('no alias collides between two different skills', () => {
    const seen = new Map();
    for (const [alias, canonical] of S.LOOKUP) {
      if (seen.has(alias)) expect(seen.get(alias)).toBe(canonical);
      seen.set(alias, canonical);
    }
    expect(seen.size).toBe(S.LOOKUP.size);
  });
});

describe('extracting skills from free text', () => {
  test('finds skills mentioned in a real sentence', () => {
    const found = S.extractSkills('Built CI/CD in Azure DevOps, deployed to k8s on AWS.');
    expect(found).toContain('ci/cd');
    expect(found).toContain('azure devops');
    expect(found).toContain('kubernetes');
    expect(found).toContain('amazon web services');
  });

  /**
   * THE FAILURE THAT MAKES NAIVE SUBSTRING EXTRACTION USELESS. "ad" inside
   * "advanced", "go" inside "government", "r" inside everything.
   */
  test('does not fire on a skill buried inside another word', () => {
    expect(S.extractSkills('advanced stakeholder management')).not.toContain('active directory');
    expect(S.extractSkills('government department')).toEqual([]);
    expect(S.extractSkills('I am a great communicator')).toEqual([]);
  });

  test('handles the punctuation-bearing names correctly', () => {
    expect(S.extractSkills('Strong .NET and C# background')).toContain('.net');
    expect(S.extractSkills('Strong .NET and C# background')).toContain('c#');
  });

  test('empty and junk input yields nothing rather than throwing', () => {
    for (const bad of ['', null, undefined, 12345]) {
      expect(Array.isArray(S.extractSkills(bad))).toBe(true);
    }
  });
});

describe('required and preferred are kept apart', () => {
  /**
   * Collapsing them is how a tool tells someone not to apply for a job they
   * would get. Missing a nice-to-have is not missing a must-have.
   */
  test('a missing preferred skill does not block, a missing required one does', () => {
    const profile = { skills: ['Azure', 'Defender'] };
    const preferredOnly = M.assess(profile, { requiredSkills: ['Azure'], preferredSkills: ['Splunk'] });
    expect(preferredOnly.passed).toBe(true);
    expect(preferredOnly.skills.missingPreferred).toContain('siem');

    const requiredMissing = M.assess(profile, { requiredSkills: ['Azure', 'Splunk'] });
    expect(requiredMissing.passed).toBe(false);
  });

  test('a skill listed as both required and preferred counts once, as required', () => {
    const m = S.matchSkills(['Azure'], ['Azure'], ['Azure']);
    expect(m.matchedRequired).toEqual(['microsoft azure']);
    expect(m.matchedPreferred).toEqual([]);
  });
});

describe('gates, not percentages', () => {
  const base = { skills: ['Azure', 'Defender', 'Networking'], yearsExperience: 3 };

  /**
   * THE SPEC'S OWN WORKED EXAMPLE: a candidate with Azure, Defender, CCNA and
   * Networking against a job wanting Azure, Defender, SIEM and Networking.
   * Expected: strong, but missing SIEM.
   */
  test("the spec's example: strong match, blocked only by SIEM", () => {
    const r = M.assess(
      { skills: ['Azure', 'Defender', 'CCNA', 'Networking'], yearsExperience: 3 },
      { requiredSkills: ['Azure', 'Defender', 'SIEM', 'Networking'] }
    );
    expect(r.passed).toBe(false);
    expect(r.blockers).toHaveLength(1);
    expect(r.blockers[0].detail).toBe('siem');
    expect(r.skills.matchedRequired).toHaveLength(3);
  });

  /** Salary is binary. A great skills match cannot paper over pay that is too low. */
  test('pay below your minimum is a blocker, not a deduction', () => {
    const r = M.assess({ ...base, minSalary: 120000 }, {
      requiredSkills: ['Azure'],
      salaryMin: 90000,
      salaryMax: 100000
    });
    expect(r.passed).toBe(false);
    expect(r.blockers[0].id).toBe('salary');
    expect(r.score).toBeNull();
  });

  test('an overlapping salary range passes', () => {
    const r = M.assess({ ...base, minSalary: 95000 }, {
      requiredSkills: ['Azure'],
      salaryMin: 95000,
      salaryMax: 110000
    });
    expect(r.passed).toBe(true);
  });

  test('an unstated salary is not held against the job', () => {
    expect(M.assess({ ...base, minSalary: 95000 }, { requiredSkills: ['Azure'] }).passed).toBe(true);
  });

  /** Experience is not linear — and the shortfall is what decides whether to apply anyway. */
  test('too little experience blocks, and says by how much', () => {
    const r = M.assess({ ...base, yearsExperience: 3 }, { requiredSkills: ['Azure'], minYearsExperience: 5 });
    expect(r.passed).toBe(false);
    expect(r.blockers[0].id).toBe('experience');
    expect(r.blockers[0].detail).toMatch(/2\.0 short/);
  });

  test('sponsorship is a blocker only when both sides state it', () => {
    const needs = { ...base, needsSponsorship: true };
    expect(M.assess(needs, { requiredSkills: ['Azure'], sponsorshipOffered: false }).passed).toBe(false);
    // Unstated must not block — most postings say nothing.
    expect(M.assess(needs, { requiredSkills: ['Azure'] }).passed).toBe(true);
    expect(M.assess(base, { requiredSkills: ['Azure'], sponsorshipOffered: false }).passed).toBe(true);
  });

  test('remote is a gate only when the candidate requires it', () => {
    const job = { requiredSkills: ['Azure'], workArrangement: 'On-site' };
    expect(M.assess({ ...base, remoteRequired: true }, job).passed).toBe(false);
    expect(M.assess(base, job).passed).toBe(true);
    expect(M.assess({ ...base, remoteRequired: true }, { ...job, workArrangement: 'Hybrid' }).passed).toBe(true);
  });

  test('every blocker names the specific mismatch, not just "no match"', () => {
    const r = M.assess({ skills: [], yearsExperience: 1, minSalary: 200000, needsSponsorship: true },
      { requiredSkills: ['Azure'], minYearsExperience: 5, salaryMax: 90000, sponsorshipOffered: false });
    expect(r.blockers.length).toBeGreaterThan(1);
    for (const b of r.blockers) {
      expect(b.reason.length).toBeGreaterThan(5);
      expect(b.detail.length).toBeGreaterThan(0);
    }
  });
});

describe('the soft score is a tie-breaker, never a verdict', () => {
  test('no score is produced for a blocked job', () => {
    const r = M.assess({ skills: [] }, { requiredSkills: ['Azure'] });
    expect(r.score).toBeNull();
  });

  test('a job clearing every gate with every preferred skill scores at the top', () => {
    const r = M.assess({ skills: ['Azure', 'KQL'], yearsExperience: 5 },
      { requiredSkills: ['Azure'], preferredSkills: ['KQL'], minYearsExperience: 5 });
    expect(r.passed).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(100);
  });

  /** Twice the required experience is not twice as good a fit. */
  test('excess experience is capped, not rewarded without limit', () => {
    const modest = M.assess({ skills: ['Azure'], yearsExperience: 6 }, { requiredSkills: ['Azure'], minYearsExperience: 5 });
    const huge = M.assess({ skills: ['Azure'], yearsExperience: 40 }, { requiredSkills: ['Azure'], minYearsExperience: 5 });
    expect(huge.score - modest.score).toBeLessThanOrEqual(15);
  });
});

describe('ranking', () => {
  test('jobs that pass sort above jobs that are blocked', () => {
    const profile = { skills: ['Azure'], yearsExperience: 5 };
    const good = M.assess(profile, { requiredSkills: ['Azure'] });
    const bad = M.assess(profile, { requiredSkills: ['Azure', 'Splunk', 'Terraform'] });
    expect(M.rank([bad, good])[0]).toBe(good);
  });

  /** Blocked jobs stay in the list — "why was this filtered out" is a real question. */
  test('blocked jobs are ranked last, not discarded', () => {
    const profile = { skills: ['Azure'] };
    const list = [M.assess(profile, { requiredSkills: ['Splunk'] }), M.assess(profile, { requiredSkills: ['Azure'] })];
    expect(M.rank(list)).toHaveLength(2);
  });

  test('among blocked jobs, the nearest miss ranks first', () => {
    const profile = { skills: ['Azure'], yearsExperience: 1, minSalary: 200000 };
    const oneProblem = M.assess(profile, { requiredSkills: ['Splunk'] });
    const manyProblems = M.assess(profile, { requiredSkills: ['Splunk'], minYearsExperience: 10, salaryMax: 50000 });
    expect(M.rank([manyProblems, oneProblem])[0]).toBe(oneProblem);
  });
});

describe('it does not fall over on empty input', () => {
  test('an empty profile and empty job do not throw', () => {
    expect(() => M.assess({}, {})).not.toThrow();
    expect(() => M.assess(null, null)).not.toThrow();
    expect(M.assess({}, {}).passed).toBe(true);
  });
});

describe('word boundaries around punctuation-bearing skill names', () => {
  /**
   * "Deployed to AWS." is how people actually write. An earlier version
   * excluded the full stop from the boundary set so that ".net" and "node.js"
   * would work, and silently missed every skill that ended a sentence.
   */
  test('a skill ending a sentence still matches', () => {
    expect(S.extractSkills('Everything runs on AWS.')).toContain('amazon web services');
    expect(S.extractSkills('We are moving to Kubernetes.')).toContain('kubernetes');
  });

  test('a skill that legitimately contains a full stop still matches', () => {
    expect(S.extractSkills('Strong .NET background')).toContain('.net');
    expect(S.extractSkills('built with Node.js')).toContain('node.js');
  });

  /** "node" must not shadow the longer "node.js". */
  test('a short alias does not fire inside a longer name that extends it', () => {
    const found = S.extractSkills('built with Node.js');
    expect(found).toContain('node.js');
  });

  test('a skill name inside a longer word still does not fire', () => {
    expect(S.extractSkills('awsome tooling')).toEqual([]);
    expect(S.extractSkills('advanced skills')).toEqual([]);
  });

  test('+ and # are part of the name, not boundaries', () => {
    const found = S.extractSkills('C# and C++ work');
    expect(found).toContain('c#');
  });
});

describe('reading required vs preferred out of a job ad', () => {
  /**
   * THE WORST FAILURE THIS TOOL CAN HAVE is telling someone a nice-to-have
   * blocks them. An ad that says "SIEM essential, KQL a plus" must not gate
   * on KQL.
   */
  test('"a plus" lands on the preferred side', () => {
    const r = S.parseJobSkills('We need Azure, Defender, SIEM and networking. KQL a plus.');
    expect(r.required).toEqual(expect.arrayContaining(['microsoft azure', 'siem', 'networking']));
    expect(r.preferred).toEqual(['kql']);
    expect(r.required).not.toContain('kql');
  });

  test('every preference marker is recognised', () => {
    for (const marker of S.PREFERRED_MARKERS) {
      const r = S.parseJobSkills(`Azure essential. Kubernetes ${marker}.`);
      expect(r.preferred).toContain('kubernetes');
      expect(r.required).not.toContain('kubernetes');
    }
  });

  test('an ad with no preference marker treats everything as required', () => {
    const r = S.parseJobSkills('Must have Azure and Kubernetes.');
    expect(r.required).toEqual(expect.arrayContaining(['microsoft azure', 'kubernetes']));
    expect(r.preferred).toEqual([]);
    expect(r.splitAt).toBeNull();
  });

  test('a skill on both sides counts as required, the stricter reading', () => {
    const r = S.parseJobSkills('Azure essential. Azure certification desirable.');
    expect(r.required).toContain('microsoft azure');
    expect(r.preferred).not.toContain('microsoft azure');
  });

  test('empty input does not throw', () => {
    for (const bad of ['', null, undefined]) {
      expect(() => S.parseJobSkills(bad)).not.toThrow();
    }
  });

  /** End to end: the nice-to-have must not appear as a blocker. */
  test('a candidate missing only a nice-to-have is not blocked', () => {
    const ad = 'We need Azure and Defender. KQL a plus.';
    const parsed = S.parseJobSkills(ad);
    const r = M.assess(
      { skills: ['Azure', 'Defender'] },
      { requiredSkills: parsed.required, preferredSkills: parsed.preferred }
    );
    expect(r.passed).toBe(true);
    expect(r.skills.missingPreferred).toContain('kql');
  });
});

/**
 * Skill names that are also ordinary English words (added with the dictionary
 * expansion from 57 to 168 canonical skills).
 *
 * Before the expansion the dictionary contained no such name, so the problem
 * did not exist. Adding "Go", "C", "R", "Rust" and "SAFe" created it: a resume
 * saying "go live" or "a safe workplace" would be credited with skills the
 * applicant does not have, and matched to jobs they cannot do. That is the
 * worst direction for this tool to be wrong in, so both halves are pinned.
 */
describe('ambiguous skill names need corroboration', () => {
  const { extractSkills, inListContext, AMBIGUOUS } = require('../packages/matching/src/skills');

  test('prose uses of the word do not count as the skill', () => {
    expect(extractSkills('We plan to go live in March and go to market quickly')).not.toContain('go');
    expect(extractSkills('Ready to go the extra mile')).not.toContain('go');
    expect(extractSkills('We are a customer-centric company')).not.toContain('c');
    expect(extractSkills('This is a safe and inclusive workplace')).not.toContain('safe');
  });

  test('a skills list does count, because prose does not look like one', () => {
    expect(extractSkills('Skills: Go, Python, Rust, Kubernetes')).toEqual(
      expect.arrayContaining(['go', 'rust', 'python', 'kubernetes'])
    );
    expect(extractSkills('- Go\n- Python\n- Terraform')).toContain('go');
    expect(extractSkills('Languages: C, C++, Python')).toContain('c');
    expect(extractSkills('Frameworks: SAFe, Scrum, Kanban')).toContain('safe');
  });

  test('an unambiguous form anywhere in the text corroborates a bare mention', () => {
    expect(extractSkills('Built the payments service in Golang')).toContain('go');
    expect(extractSkills('Strong C programming background')).toContain('c');
  });

  /**
   * REGRESSION. inListContext was first written against the normalised text.
   * normalise() strips punctuation and collapses whitespace, so by then
   * "Skills: Go, Python" has become "skills go python" and every delimiter is
   * gone — making the list case unreachable and the guard a blanket ban.
   */
  test('list context is detected on raw text, where the delimiters still exist', () => {
    expect(inListContext('Skills: Go, Python, Rust', 'go')).toBe(true);
    expect(inListContext('we will go live shortly', 'go')).toBe(false);
  });

  /**
   * The first version of this asserted every corroborating form was LONGER
   * than the canonical, as a proxy for "more specific". That is not the
   * invariant: "runbooks" is a perfectly unambiguous corroboration of
   * "documentation" and is shorter. What actually has to hold is that a form
   * is a different string from the canonical — corroborating a word with
   * itself corroborates nothing.
   */
  test('every ambiguous entry names at least one distinct corroborating form', () => {
    for (const [canonical, forms] of Object.entries(AMBIGUOUS)) {
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBeGreaterThan(0);
      for (const f of forms) expect(f).not.toBe(canonical);
    }
  });

  /**
   * Only words that are ALSO ordinary English belong here. Guarding a word
   * that is unambiguous in context — "architecture", "documentation" — throws
   * away real mentions, which is the guard causing the harm it exists to stop.
   */
  test('the guard covers only genuinely ambiguous words', () => {
    for (const k of ['architecture', 'documentation', 'kubernetes', 'python']) {
      expect(AMBIGUOUS[k]).toBeUndefined();
    }
    expect(Object.keys(AMBIGUOUS)).toEqual(expect.arrayContaining(['go', 'c', 'r']));
  });
});

describe('the dictionary is broad enough to be useful', () => {
  const { extractSkills, ALIASES, isKnown } = require('../packages/matching/src/skills');

  /**
   * The original 57 entries were skewed to one job search: Microsoft, infra
   * and security. Redis, Kafka, Elasticsearch, Java, React Native and every
   * data-engineering tool were absent, so a resume mentioning them matched
   * nothing and the applicant looked unqualified.
   */
  test('the common technologies missing from the first version are present', () => {
    for (const s of ['redis', 'kafka', 'elasticsearch', 'java', 'mongodb', 'apache spark',
                     'snowflake', 'graphql', 'flutter', 'salesforce', 'sap', 'prometheus']) {
      expect(isKnown(s)).toBe(true);
    }
  });

  test('it carries enough skills to cover a real advertisement', () => {
    const canonicals = Object.keys(ALIASES).filter((k) => !k.startsWith('_'));
    expect(canonicals.length).toBeGreaterThan(150);
  });

  test('no canonical name is also an alias of a different skill', () => {
    const canonicals = new Set(Object.keys(ALIASES).filter((k) => !k.startsWith('_')));
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (canonical.startsWith('_')) continue;
      for (const a of aliases) {
        if (canonicals.has(a)) {
          throw new Error(`"${a}" is an alias of "${canonical}" and also a canonical skill`);
        }
      }
    }
  });

  test('an alias is not claimed by two different canonicals', () => {
    const owner = new Map();
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (canonical.startsWith('_')) continue;
      for (const a of aliases) {
        if (owner.has(a)) {
          throw new Error(`"${a}" is claimed by both "${owner.get(a)}" and "${canonical}"`);
        }
        owner.set(a, canonical);
      }
    }
  });
});

/**
 * REGRESSION. An explicit null is not zero.
 *
 * `Number(null)` is 0, and 0 is finite, so the gates' num() helper turned a
 * job with no advertised salary into a job paying nothing — and then blocked
 * it for anybody who had set a minimum. Every test passed throughout, because
 * tests OMIT the field (undefined -> NaN -> null, which is correct) while the
 * browser sends an explicit null from an empty input. Only clicking the real
 * button found it.
 */
describe('an unstated field is unknown, not zero', () => {
  const { assess } = require('../packages/matching/src/match');
  const PROFILE = { skills: ['kubernetes'], yearsExperience: 8, minSalary: 120000 };

  test('a job with explicitly null salary is not blocked on pay', () => {
    const a = assess(PROFILE, {
      requiredSkills: ['kubernetes'], salaryMin: null, salaryMax: null, minYearsExperience: null
    });
    expect(a.blockers.map((b) => b.id)).not.toContain('salary');
    expect(a.passed).toBe(true);
  });

  test('an omitted salary behaves the same as an explicit null', () => {
    const omitted = assess(PROFILE, { requiredSkills: ['kubernetes'] });
    const explicit = assess(PROFILE, { requiredSkills: ['kubernetes'], salaryMin: null, salaryMax: null });
    expect(explicit.passed).toBe(omitted.passed);
    expect(explicit.blockers).toEqual(omitted.blockers);
  });

  test('an empty string is unknown too — that is what a blank input sends', () => {
    const a = assess(PROFILE, { requiredSkills: ['kubernetes'], salaryMin: '', salaryMax: '' });
    expect(a.blockers.map((b) => b.id)).not.toContain('salary');
  });

  test('a genuinely low salary is still blocked', () => {
    const a = assess(PROFILE, { requiredSkills: ['kubernetes'], salaryMin: 60000, salaryMax: 70000 });
    expect(a.blockers.map((b) => b.id)).toContain('salary');
  });

  test('the experience gate has the same hazard and is also safe', () => {
    const a = assess(PROFILE, { requiredSkills: ['kubernetes'], minYearsExperience: null });
    expect(a.blockers.map((b) => b.id)).not.toContain('experience');
  });
});
