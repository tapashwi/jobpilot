/**
 * package-value.js — the comparison that decides which ads are worth reading.
 *
 * WHY THESE TESTS ARE SHAPED THIS WAY
 *
 * The failure this module exists to prevent is quiet and expensive: comparing
 * an advertised base against a public-sector base, concluding a private offer
 * is a $20,000 raise, and being wrong because salary packaging never entered
 * the arithmetic. So the tests pin the gross-up, the imputation flag, and the
 * union rule — the three places a wrong answer would look right.
 */

const {
  packagingGrossEquivalent,
  effectivePackage,
  advertisedValue,
  isSecurityRole,
  campaignReason,
} = require('../packages/matching/src/package-value');

describe('salary packaging is worth more than its face value', () => {
  test('grosses up the tax-free amount at the marginal rate', () => {
    // $18,550 received tax-free needs $27,279 of gross salary at 32% to match.
    // This is the number people leave out, and it is a quarter of base.
    expect(packagingGrossEquivalent()).toBe(27279);
  });

  test('a higher marginal rate makes packaging worth more, not less', () => {
    const at32 = packagingGrossEquivalent({ marginalRate: 0.32 });
    const at47 = packagingGrossEquivalent({ marginalRate: 0.47 });
    expect(at47).toBeGreaterThan(at32);
  });

  test('an implausible marginal rate falls back to face value instead of dividing by zero', () => {
    // 1.0 would divide by zero; above 1 would flip the sign and report the
    // benefit as negative, which is worse than being merely approximate.
    expect(packagingGrossEquivalent({ marginalRate: 1 })).toBe(18550);
    expect(packagingGrossEquivalent({ marginalRate: 1.5 })).toBe(18550);
    expect(packagingGrossEquivalent({ marginalRate: 0 })).toBe(18550);
  });
});

describe('effectivePackage', () => {
  test('itemises rather than returning a bare number', () => {
    // A total nobody can decompose is a total nobody should act on.
    const p = effectivePackage(114282);
    expect(p).toMatchObject({ base: 114282, superannuation: 13714, leaveLoading: 1538, packaging: 27279 });
    expect(p.total).toBe(114282 + 13714 + 1538 + 27279);
  });

  test('packaging can be switched off, and it changes the answer a lot', () => {
    // The single biggest assumption in the model: whether the employer is
    // actually FBT-exempt. Getting it wrong moves the floor by $27k, so it
    // has to be one flag rather than buried arithmetic.
    const withPackaging = effectivePackage(114282);
    const without = effectivePackage(114282, { packagingAvailable: false });
    expect(without.packaging).toBe(0);
    expect(withPackaging.total - without.total).toBe(27279);
  });

  test('returns null for a missing or nonsensical base', () => {
    expect(effectivePackage(null)).toBeNull();
    expect(effectivePackage(0)).toBeNull();
    expect(effectivePackage(-5)).toBeNull();
    expect(effectivePackage('not a number')).toBeNull();
  });
});

describe('advertisedValue', () => {
  test('flags imputed super rather than folding it in silently', () => {
    // An assumption folded silently into a comparison is how a tool tells you
    // a job is better than it is.
    const ad = advertisedValue({ salaryMax: 140000 });
    expect(ad.total).toBe(140000 + 16800);
    expect(ad.imputed).toHaveLength(1);
    expect(ad.imputed[0]).toMatch(/super/i);
  });

  test('does not add super twice when the ad says it is included', () => {
    const ad = advertisedValue({ salaryMax: 140000, superIncluded: true });
    expect(ad.total).toBe(140000);
    expect(ad.imputed).toEqual([]);
  });

  test('prefers the top of a range, which is what the employer says is reachable', () => {
    expect(advertisedValue({ salaryMin: 100000, salaryMax: 130000 }).stated).toBe(130000);
  });

  test('falls back to the minimum when only one figure is given', () => {
    expect(advertisedValue({ salaryMin: 100000 }).stated).toBe(100000);
  });

  test('reports unknown rather than guessing when no salary is stated', () => {
    const ad = advertisedValue({ title: 'Engineer' });
    expect(ad.unknown).toBe(true);
    expect(ad.total).toBeNull();
  });

  test('assumes no packaging for a private employer, and says so by returning zero', () => {
    // Its absence is most of the gap being measured, so it must be explicit.
    expect(advertisedValue({ salaryMax: 140000 }).packaging).toBe(0);
  });
});

describe('isSecurityRole', () => {
  test('recognises the discipline from the title', () => {
    for (const title of [
      'Security Analyst', 'SOC Analyst', 'Cyber Security Engineer',
      'Information Security Officer', 'Incident Response Specialist',
      'Vulnerability Management Lead', 'GRC Consultant', 'Security Architect',
    ]) {
      expect(isSecurityRole({ title })).toBe(true);
    }
  });

  test('is not fooled by a security guard vacancy', () => {
    // The false friend that a naive substring match on "security" gets wrong,
    // and the reason the title check runs before the body check.
    expect(isSecurityRole({ title: 'Security Guard', adText: 'security security security' })).toBe(false);
    expect(isSecurityRole({ title: 'Security Officer - Night Shift' })).toBe(false);
  });

  test('needs two signals in the body, so one stray word is not enough', () => {
    expect(isSecurityRole({ title: 'IT Support', adText: 'You will respond to any threat to the printer.' })).toBe(false);
    expect(isSecurityRole({
      title: 'IT Support',
      adText: 'You will run vulnerability scans and triage SIEM alerts.',
    })).toBe(true);
  });

  test('reads the skills lists too', () => {
    expect(isSecurityRole({ title: 'Analyst', requiredSkills: ['Sentinel', 'SIEM'] })).toBe(true);
  });
});

describe('campaignReason: a union, not an intersection', () => {
  // Misreading this as an intersection would silently drop most of what was
  // asked for — every security role that pays about the same.
  const profile = { currentBase: 114282 };

  test('surfaces a security role that pays about the same', () => {
    const r = campaignReason(profile, { title: 'Security Analyst', salaryMax: 130000 });
    expect(r).not.toBeNull();
    expect(r.arm).toBe('security');
  });

  test('surfaces a non-security role only when it genuinely pays more', () => {
    const better = campaignReason(profile, { title: 'Systems Engineer', salaryMax: 160000 });
    expect(better.arm).toBe('pay');

    // $140k base looks like a big raise against $114k base, and is not one
    // once packaging is counted. This is the whole point of the module.
    expect(campaignReason(profile, { title: 'Systems Engineer', salaryMax: 140000 })).toBeNull();
  });

  test('drops a security role that pays far below tolerance', () => {
    // A career move may cost something; it may not cost anything.
    expect(campaignReason(profile, { title: 'Security Analyst', salaryMax: 70000 })).toBeNull();
  });

  test('surfaces a security role with no stated pay, on discipline alone', () => {
    // Most security ads in this market omit salary. Dropping them for that
    // would discard the entire arm.
    const r = campaignReason(profile, { title: 'SOC Analyst' });
    expect(r.arm).toBe('security');
    expect(r.detail).toMatch(/not stated/i);
  });

  test('does NOT surface a non-security role with no stated pay', () => {
    // Asymmetric on purpose: with no salary there is nothing to compare, and
    // the pay arm is entirely a comparison.
    expect(campaignReason(profile, { title: 'Systems Engineer' })).toBeNull();
  });

  test('the pay tolerance for security roles is adjustable', () => {
    const strict = campaignReason(profile, { title: 'Security Analyst', salaryMax: 120000 }, { securityPayTolerance: 0 });
    const loose = campaignReason(profile, { title: 'Security Analyst', salaryMax: 120000 }, { securityPayTolerance: 0.3 });
    expect(strict).toBeNull();
    expect(loose).not.toBeNull();
  });

  test('carries both packages back so the reason can be shown, not just asserted', () => {
    const r = campaignReason(profile, { title: 'Systems Engineer', salaryMax: 160000 });
    expect(r.current.total).toBeGreaterThan(0);
    expect(r.advertised.total).toBeGreaterThan(r.current.total);
    expect(r.advertised.imputed[0]).toMatch(/super/i);
  });
});

/**
 * Defects found by running this against real job boards, not by imagining
 * inputs. Each of these shipped in the first live run of scripts/find-jobs.js
 * and each would have wasted the reader's time.
 */
describe('what the first live run got wrong', () => {
  const { isSecurityRole, isReachable, campaignReason } = require('../packages/matching/src/package-value');

  test('a sales role at a security vendor is not a security job', () => {
    // KnowBe4, Ping Identity and Tenable sell security, so every ad they
    // publish is full of security language and the body rule matched all of
    // them. The title is the only place this can be decided.
    const vendorAd = 'We protect customers from threat actors with our SIEM and vulnerability platform.';
    for (const title of [
      'Account Executive (Mid-Market)',
      'Director, Sales (Middle East)',
      'Strategic Account Executive (UKI)',
      'Public Sector Territory Account Manager',
    ]) {
      expect(isSecurityRole({ title, adText: vendorAd })).toBe(false);
    }
  });

  test('a sales title beats a security term inside it', () => {
    // "Security Sales Specialist" contains "security specialist".
    expect(isSecurityRole({ title: 'Security Sales Specialist' })).toBe(false);
  });

  test('"&" in a title is read as "and"', () => {
    // "Identity & Access Management Engineer" is a real security role that
    // matched nothing, because the term list says "identity and access".
    expect(isSecurityRole({ title: 'Identity & Access Management Engineer' })).toBe(true);
  });

  test('DevSecOps is a security role', () => {
    // The list had no term for it at all, so a real one was dropped.
    expect(isSecurityRole({ title: 'Senior DevSecOps Engineer' })).toBe(true);
  });

  describe('geography', () => {
    // The first run returned Saarbrücken, München, Berlin and London to
    // someone in Darwin. There was no location gate whatsoever.
    test('Australian cities and states are reachable', () => {
      for (const location of ['Melbourne', 'Sydney, Australia', 'Darwin, NT', 'Brisbane QLD']) {
        expect(isReachable({ location })).toBe(true);
      }
    });

    test('European cities are not', () => {
      for (const location of ['Saarbrücken', 'München', 'Berlin', 'London']) {
        expect(isReachable({ location })).toBe(false);
      }
    });

    test('remote passes wherever it is posted', () => {
      expect(isReachable({ location: 'Remote' })).toBe(true);
      expect(isReachable({ location: 'London', workArrangement: 'Fully remote' })).toBe(true);
    });

    test('an unstated location passes, leaving the other gates to decide', () => {
      // Refusing these would drop real local ads that simply omit the field.
      expect(isReachable({ location: '' })).toBe(true);
      expect(isReachable({})).toBe(true);
    });

    test('the country list is configurable', () => {
      expect(isReachable({ location: 'London' }, { countries: ['united kingdom'], places: ['london'] })).toBe(true);
    });

    test('geography is applied before either arm of the gate', () => {
      // A perfect security role in Munich is still not a match.
      expect(campaignReason({ currentBase: 114282 }, { title: 'Security Analyst', location: 'München' })).toBeNull();
      expect(campaignReason({ currentBase: 114282 }, { title: 'Security Analyst', location: 'Melbourne' })).not.toBeNull();
    });
  });
});

/**
 * Defects from the SECOND live run, after the first round of fixes.
 *
 * Each pass over real boards surfaced a different class of false positive.
 * That is the value of running it rather than reasoning about it: none of
 * these were predicted, and all of them would have wasted the reader's time.
 */
describe('what the second live run got wrong', () => {
  const { isSecurityRole } = require('../packages/matching/src/package-value');
  const VENDOR_AD = 'We stop threat actors. SIEM, vulnerability management, incident response.';

  test('a pre-sales architect at a security vendor is not a security role', () => {
    // Elastic and NICE both returned these. "Solutions Architect" is a
    // pre-sales title; "Security Architect" is a practitioner one.
    expect(isSecurityRole({ title: 'Senior Partner Solutions Architect', adText: VENDOR_AD })).toBe(false);
    expect(isSecurityRole({ title: 'Security Architect' })).toBe(true);
  });

  test('a title naming another discipline is not rescued by a security-heavy body', () => {
    // NICE sells security software, so its "Software Architect" ad matched
    // two body terms easily. The body cannot tell these apart; the title can.
    for (const title of ['Software Architect', 'Frontend Developer', 'Product Manager', 'Data Scientist']) {
      expect(isSecurityRole({ title, adText: VENDOR_AD })).toBe(false);
    }
  });

  test('but a security qualifier on such a title wins', () => {
    // "Security Software Engineer" contains "software engineer" and is a
    // security role. Note "security engineer" is NOT a substring of it, which
    // is why the standalone-word rule exists.
    expect(isSecurityRole({ title: 'Security Software Engineer' })).toBe(true);
    expect(isSecurityRole({ title: 'Cyber Risk Advisor' })).toBe(true);
  });

  test('a security guard is still excluded despite the standalone rule', () => {
    // The ordering that makes this work: false friends are checked before the
    // standalone security word.
    expect(isSecurityRole({ title: 'Security Guard', adText: VENDOR_AD })).toBe(false);
  });

  test('a talent-pool posting is not a vacancy', () => {
    // RemoteOK returned "Don't see your role - Apply here". It is a real
    // posting with no job in it, so it can never be applied to.
    for (const title of [
      "Don't see your role Apply here",
      'General Application - Security Team',
      'Talent Pool: Cyber Security',
      'Expression of Interest - SOC Analyst',
    ]) {
      expect(isSecurityRole({ title, adText: VENDOR_AD })).toBe(false);
    }
  });

  test('repairs UTF-8 that was decoded as Latin-1 upstream', () => {
    const { fixMojibake } = require('../packages/matching/src/package-value');
    // Build the mojibake the way it actually happens rather than typing an
    // approximation: my first attempt pasted "Don\u00e2t" out of terminal
    // output, which had already lost the trailing bytes, so it was not a
    // faithful sample and the repair correctly declined to touch it.
    const broken = Buffer.from('Don\u2019t see your role', 'utf8').toString('latin1');
    expect(fixMojibake(broken)).toBe('Don\u2019t see your role');
  });

  test('leaves text that is not mojibake alone', () => {
    const { fixMojibake } = require('../packages/matching/src/package-value');
    expect(fixMojibake('plain ascii')).toBe('plain ascii');
    // Legitimately accented text must survive. Mangling M\u00fcnchen would be a
    // worse bug than the one being fixed.
    expect(fixMojibake('M\u00fcnchen')).toBe('M\u00fcnchen');
    expect(fixMojibake('')).toBe('');
  });

  test('an IT support role doing real security work still matches', () => {
    // Deliberately kept: this is the sideways move the profile is aiming at,
    // and "IT Support" is absent from the other-discipline list on purpose.
    expect(isSecurityRole({
      title: 'IT Support Engineer',
      adText: 'You will run vulnerability scans and triage SIEM alerts daily.',
    })).toBe(true);
  });
});
