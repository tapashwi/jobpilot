/**
 * Why a real campaign returned one match from 494 jobs, and what changed.
 *
 * EVERY CASE HERE CAME OUT OF A LIVE RUN. The funnel was measured rather than
 * guessed at, and it said the gate was not the problem: 386 of 494 jobs were
 * out of the country, and the whole set held eight security roles, six of them
 * in the UK. The sources were wrong for an Australian search.
 *
 * Widening them to 1,399 jobs then exposed the precision faults below, in the
 * order they were found. Each test pins one.
 */

const {
  isSecurityRole, reachability, remoteRegionLock, securityTermsIn,
} = require('../packages/matching/src/package-value');
const { ADAPTERS, keylessSources } = require('../packages/discovery/src/sources');

describe('a three-letter acronym is not a substring', () => {
  test('a hotel gardener is not a cybersecurity role', () => {
    // Real result from RemoteOK. The ad is in Spanish and "siem" is inside
    // "siempre"; "pam " matched mid-word too. Two hits, and the body rule
    // needs two.
    expect(isSecurityRole({
      title: 'Gardener NUSC',
      adText: 'Supervisar los terrenos del hotel siempre para asegurar una apariencia agradable.',
    })).toBe(false);
  });

  test('"mechanism" does not contain the Information Security Manual', () => {
    expect(isSecurityRole({
      title: 'Building Maintenance Technician',
      adText: 'Responsible for inspection and troubleshooting of the mechanism and equipment.',
    })).toBe(false);
  });

  test('the trailing space the list used to carry could never have worked', () => {
    // 'ism ' was written with a trailing space to bound it. A trailing space
    // does nothing about a match that begins mid-word, which is the whole
    // problem — so this is the case that proves the fix is the fix.
    expect(securityTermsIn('the mechanism failed')).not.toContain('ism');
    expect(securityTermsIn('per the ISM and Essential Eight')).toContain('ism');
  });

  test('stems still match their inflections', () => {
    // The boundary must not cost recall: these are the words real ads use.
    expect(securityTermsIn('managing vulnerabilities')).toContain('vulnerabilit');
    expect(securityTermsIn('digital forensics')).toContain('forensic');
    expect(securityTermsIn('pentesting engagements')).toContain('pentest');
    expect(securityTermsIn('cryptographic controls')).toContain('cryptograph');
  });
});

describe('a security vendor publishes only security-flavoured ads', () => {
  // Adding Cloudflare, Okta and Elastic took the security count from 8 to 197
  // and most of the new ones were sales and customer roles: every posting a
  // security vendor writes mentions security repeatedly, so a two-signal body
  // rule returns all of them. The vendors stay — the same boards produced a
  // real Consulting Architect - Security in Canberra — so the titles are what
  // must be excluded.
  const vendorBody = 'threat intelligence, vulnerability management, incident response, siem';

  test.each([
    'Digital Communications Director',
    'Customer Experience Manager - Russian Speaking',
    'Senior Customer Engineer, Majors - Detroit, MI',
    'Vice President, Cloudflare One GTM',
    'Director, Strategic Finance & Investor Relations',
    'Forward Deployed Engineer (FDE)',
  ])('%s is not a security role', (title) => {
    expect(isSecurityRole({ title, adText: vendorBody })).toBe(false);
  });

  test.each([
    'Consulting Architect - Security (Canberra)',
    'Security Engineer (IAM)',
    'GRC Engineer',
    'Insider Threat Engineer',
    'Lead Vulnerability Management Engineer',
    'Incident Response Analyst - React',
  ])('%s still is one', (title) => {
    expect(isSecurityRole({ title, adText: vendorBody })).toBe(true);
  });

  test('a QA engineer is not a security engineer', () => {
    // "Sr Software QA Engineer" at a medical-device company reached the match
    // list on two mentions in a boilerplate compliance paragraph.
    expect(isSecurityRole({
      title: 'Sr Software QA Engineer',
      adText: 'We take threats and vulnerabilities seriously across the product.',
    })).toBe(false);
  });
});

describe('remote does not mean remote from here', () => {
  const home = { homeCity: 'Darwin' };

  test('"Remote — USA" is not reachable from Australia', () => {
    const r = reachability({ location: 'Remote — USA' }, home);
    expect(r.kind).toBe('remote-elsewhere');
    expect(r.ok).toBe(false);
  });

  test('a marketing "global" in the body does not unlock a US-only role', () => {
    // The exact defect: the first version scanned location AND the ad's
    // opening together for any sign of an open role, so "we are a global team
    // of 400" overrode a location field that said USA. Two HackerOne roles
    // and an Appspace one reached the match list that way.
    const r = reachability({
      location: 'Remote — USA',
      adText: 'We are a global team of 400 people building the future of security.',
    }, home);
    expect(r.kind).toBe('remote-elsewhere');
  });

  test('but an explicit statement in the body IS read, when the location says nothing', () => {
    expect(reachability({
      location: 'Remote',
      adText: 'You must be based in the United States to be eligible for this role.',
    }, home).kind).toBe('remote-elsewhere');

    expect(reachability({
      location: 'Remote',
      adText: 'Open to candidates anywhere in Australia and New Zealand.',
    }, home).kind).toBe('remote');
  });

  test.each([
    ['Remote — Anywhere', 'remote'],
    ['Remote — Worldwide', 'remote'],
    ['Remote — Australia', 'remote'],
    ['Remote APAC', 'remote'],
    ['Remote - Canada', 'remote-elsewhere'],
    ['Remote, EMEA', 'remote-elsewhere'],
    ['Remote (US only)', 'remote-elsewhere'],
  ])('%s → %s', (location, kind) => {
    expect(reachability({ location }, home).kind).toBe(kind);
  });

  test('a foreign remote role is never reported as a domestic relocation', () => {
    // Ordering. "Remote — USA" whose body also says "hybrid" failed the
    // fully-remote test and fell through to 'relocation', which is reported as
    // "not commutable from Darwin" — reading as an interstate move.
    const r = reachability({
      location: 'Remote — USA',
      adText: 'This role is hybrid, 3 days per week in our New York office.',
    }, home);
    expect(r.kind).toBe('remote-elsewhere');
    expect(r.note).not.toMatch(/commutable/i);
  });

  test('an open remote role has no lock at all', () => {
    expect(remoteRegionLock({ location: 'Remote — Anywhere' })).toBeNull();
    expect(remoteRegionLock({ location: 'Remote — USA' })).toBe('the United States');
  });
});

describe('the sources that were added', () => {
  test('Ashby, Jobicy and Himalayas are keyless', () => {
    for (const s of ['ashby', 'jobicy', 'himalayas']) {
      expect(keylessSources()).toContain(s);
    }
  });

  test('Ashby folds workplaceType into the location, so the gate can see it', () => {
    // The gate reads presence out of the location and the ad prose. Ashby
    // states it outright, and throwing that away would mean inferring
    // something already known.
    const [job] = ADAPTERS.ashby.parse({
      jobs: [{
        id: 'x', title: 'Security Engineer', location: 'Sydney, Australia',
        workplaceType: 'Hybrid', isRemote: true, isListed: true,
        jobUrl: 'https://example.com/j', descriptionHtml: '<p>Hi</p>',
      }],
    }, 'acme');
    expect(job.location).toBe('Sydney, Australia — Hybrid');
    expect(reachability(job, { homeCity: 'Darwin' }).kind).toBe('relocation');
  });

  test('an unlisted Ashby posting is not queued', () => {
    expect(ADAPTERS.ashby.parse({ jobs: [{ id: 'x', title: 'T', isListed: false }] }, 'acme'))
      .toHaveLength(0);
  });

  test("Jobicy's jobGeo is a region lock, not a workplace", () => {
    // "USA" on a remote posting means remote WITHIN the USA. Written into the
    // location because that is where reachability() reads from.
    const [job] = ADAPTERS.jobicy.parse({
      jobs: [{ id: 1, jobTitle: 'Security Engineer', companyName: 'X', jobGeo: 'USA', url: 'u' }],
    });
    expect(job.location).toBe('Remote — USA');
    expect(reachability(job, { homeCity: 'Darwin' }).kind).toBe('remote-elsewhere');
  });

  test("Himalayas' locationRestrictions are used directly, and an empty list means worldwide", () => {
    const [locked] = ADAPTERS.himalayas.parse({
      jobs: [{ title: 'T', companyName: 'C', locationRestrictions: ['United States'] }],
    });
    expect(locked.location).toBe('Remote — United States');

    const [open] = ADAPTERS.himalayas.parse({
      jobs: [{ title: 'T', companyName: 'C', locationRestrictions: [] }],
    });
    expect(open.location).toBe('Remote — Worldwide');
    expect(reachability(open, { homeCity: 'Darwin' }).kind).toBe('remote');
  });

  test('only annual salaries are carried across', () => {
    // An hourly or monthly figure compared against an annual package is a
    // wrong answer, not a missing one.
    const [hourly] = ADAPTERS.himalayas.parse({
      jobs: [{ title: 'T', companyName: 'C', minSalary: 80, maxSalary: 95, salaryPeriod: 'hourly' }],
    });
    expect(hourly.salaryMin).toBeNull();

    const [annual] = ADAPTERS.himalayas.parse({
      jobs: [{ title: 'T', companyName: 'C', minSalary: 150000, maxSalary: 190000, salaryPeriod: 'annual' }],
    });
    expect(annual.salaryMax).toBe(190000);
  });
});

describe('a board slug is not a brand name', () => {
  const { DISPLAY_NAMES } = require('../scripts/draft-applications');

  test('the slugs actually in use have a display name', () => {
    // A letter opened "the Security Engineer role at mable" — lower case,
    // because Greenhouse, Lever and Ashby key on a slug and the adapter has
    // nothing else to call the employer. It reads as a machine printing a
    // database key, in the first line of the letter.
    for (const slug of ['cultureamp', 'mable', 'octopusdeploy', 'relevanceai']) {
      expect(DISPLAY_NAMES[slug]).toBeTruthy();
      expect(DISPLAY_NAMES[slug]).not.toBe(slug);
    }
  });

  test('every display name is properly capitalised', () => {
    for (const name of Object.values(DISPLAY_NAMES)) {
      expect(name[0]).toBe(name[0].toUpperCase());
    }
  });
});
