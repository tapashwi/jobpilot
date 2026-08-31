/**
 * Discovery: finding the vacancies in the first place.
 *
 * The API adapters are tested with an injected fetch rather than against the
 * live services — a suite that needs the internet fails for reasons that have
 * nothing to do with the code. The live probing that established which of
 * these APIs still exist is recorded in the module's own header, and was done
 * by calling them.
 */

const src = require('../packages/discovery/src/sources');
const { readCard, boardFor, cardSegments } = require('../packages/discovery/src/harvest');

/** A fetch that returns canned bodies, so the adapters can be exercised offline. */
function fakeFetch(map) {
  return async (url) => {
    const key = Object.keys(map).find((k) => url.indexOf(k) !== -1);
    if (!key) return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => map[key] };
  };
}

describe('what each source needs before it can run', () => {
  test('the keyless ones are the ones with no credentials', () => {
    expect(src.keylessSources().sort()).toEqual(
      ['arbeitnow', 'greenhouse', 'lever', 'remoteok', 'remotive'].sort()
    );
  });

  test('Adzuna and Jooble name the credentials they are missing', () => {
    expect(src.missingCredentials('adzuna', {})).toEqual(['appId', 'appKey']);
    expect(src.missingCredentials('jooble', { apiKey: 'x' })).toEqual([]);
  });

  test('a source that needs a key says so instead of failing obscurely', async () => {
    const r = await src.fetchSource('adzuna', { fetchImpl: fakeFetch({}) });
    expect(r.ok).toBe(false);
    expect(r.needsCredentials).toEqual(['appId', 'appKey']);
  });

  /** Greenhouse and Lever are per-employer, not searches. Saying so is the fix. */
  test('a per-employer source without a company explains what it wants', async () => {
    const r = await src.fetchSource('greenhouse', { fetchImpl: fakeFetch({}) });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/per-employer/);
  });

  test('a wrong company slug is reported as a wrong slug, not as a network error', async () => {
    const r = await src.fetchSource('lever', {
      company: 'not-real',
      fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) })
    });
    expect(r.error).toMatch(/slug is wrong/);
  });

  test('an unknown source throws rather than returning nothing', async () => {
    await expect(src.fetchSource('monster', {})).rejects.toThrow(/Unknown source/);
  });
});

describe('every source normalises to one job shape', () => {
  const FIXTURES = {
    'boards-api.greenhouse.io': { jobs: [{ id: 1, title: 'Platform Engineer',
      location: { name: 'Sydney' }, absolute_url: 'https://x/1', content: '<p>We need <b>Kubernetes</b>.</p>' }] },
    'arbeitnow.com': { data: [{ slug: 'a1', title: 'Backend Engineer', company_name: 'Mirakl',
      location: 'München', remote: false, url: 'https://y/a1', description: '<p>Go and Postgres</p>' }] },
    'remoteok.com': [{ legal: 'terms' }, { id: 9, position: 'SRE', company: 'Acme',
      url: 'https://z/9', description: '<p>Terraform</p>', salary_min: 100000 }]
  };

  test('the same fields come back whatever the source', async () => {
    for (const [source, opts] of [['greenhouse', { company: 'stripe' }], ['arbeitnow', {}], ['remoteok', {}]]) {
      const r = await src.fetchSource(source, { ...opts, fetchImpl: fakeFetch(FIXTURES) });
      expect(r.ok).toBe(true);
      for (const j of r.jobs) {
        expect(Object.keys(j).sort()).toEqual([
          'adText', 'applyEmail', 'applyVia', 'company', 'id', 'location',
          'postedAt', 'remote', 'salaryMax', 'salaryMin', 'source', 'title', 'url'
        ]);
      }
    }
  });

  /** The first element of RemoteOK's response is a licence notice, not a job. */
  test('RemoteOK\'s legal preamble is not queued as a vacancy', async () => {
    const r = await src.fetchSource('remoteok', { fetchImpl: fakeFetch(FIXTURES) });
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].title).toBe('SRE');
  });

  test('HTML in a description becomes readable text', async () => {
    const r = await src.fetchSource('greenhouse', { company: 'stripe', fetchImpl: fakeFetch(FIXTURES) });
    expect(r.jobs[0].adText).toBe('We need Kubernetes.');
    expect(r.jobs[0].adText).not.toMatch(/</);
  });

  test('stripHtml survives scripts, entities and block tags', () => {
    expect(src.stripHtml('<script>bad()</script><p>Go &amp; Rust</p><li>K8s</li>'))
      .toBe('Go & Rust\nK8s');
  });
});

describe('merging several sources', () => {
  test('the same role from an aggregator and the employer keeps the employer\'s', async () => {
    const fetchImpl = async (url) => ({
      ok: true, status: 200,
      json: async () => url.indexOf('greenhouse') !== -1
        ? { jobs: [{ id: 1, title: 'Platform Engineer', location: { name: 'Sydney' }, absolute_url: 'https://boards/1', content: 'x' }] }
        : { data: [{ slug: 'a', title: 'Platform Engineer', company_name: 'stripe', url: 'https://aggregator/a', description: 'x' }] }
    });
    const r = await src.search([{ source: 'greenhouse', company: 'stripe' }, { source: 'arbeitnow' }], { fetchImpl });
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].source).toBe('greenhouse');
    expect(r.duplicatesMerged).toBe(1);
  });

  test('one failing source does not lose the others', async () => {
    const fetchImpl = async (url) => url.indexOf('arbeitnow') !== -1
      ? { ok: false, status: 500, json: async () => ({}) }
      : { ok: true, status: 200, json: async () => ({ jobs: [{ id: 1, title: 'A', location: {}, absolute_url: 'u', content: '' }] }) };
    const r = await src.search([{ source: 'greenhouse', company: 'x' }, { source: 'arbeitnow' }], { fetchImpl });
    expect(r.jobs).toHaveLength(1);
    expect(r.sources.find((s) => s.source === 'arbeitnow').ok).toBe(false);
  });
});

describe('harvesting a search-results page', () => {
  test('it knows which board it is on, and admits when it does not', () => {
    expect(boardFor('https://www.seek.com.au/jobs?k=x').id).toBe('seek');
    expect(boardFor('https://au.indeed.com/jobs?q=x').id).toBe('indeed');
    expect(boardFor('https://www.linkedin.com/jobs/search/').id).toBe('linkedin');
    expect(boardFor('https://example.com/jobs')).toBeNull();
  });

  /**
   * REGRESSION. Element.textContent concatenates sibling elements with NO
   * separator, so a card of three spans arrived as "CanvaSydney NSW$140,000"
   * and every field parsed from it was wrong — including the employer, which
   * addresses the cover letter to the wrong company.
   */
  test('fields are read from separate segments, never from one concatenated blob', () => {
    const good = readCard(['Platform Engineer', 'Canva', 'Sydney NSW', '$140,000 - $170,000'], 'Platform Engineer');
    expect(good.company).toBe('Canva');
    expect(good.location).toBe('Sydney NSW');
    expect(good.salaryMin).toBe(140000);
  });

  /** A salary range contains a comma, so a comma alone is not a place. */
  test('a pay band is not mistaken for a location', () => {
    const r = readCard(['Engineer', 'Canva', '$140,000 - $170,000'], 'Engineer');
    expect(r.location).toBeNull();
    expect(r.company).toBe('Canva');
    expect(r.salaryMin).toBe(140000);
  });

  test('"Sydney NSW" is a location even without a comma', () => {
    expect(readCard(['X', 'Canva', 'Sydney NSW'], 'X').location).toBe('Sydney NSW');
    expect(readCard(['X', 'Acme', 'Austin TX'], 'X').location).toBe('Austin TX');
  });

  test('remote is picked up wherever it is written', () => {
    expect(readCard(['X', 'Acme', 'Remote'], 'X').remote).toBe(true);
    expect(readCard(['X', 'Acme', 'Sydney NSW'], 'X').remote).toBeNull();
  });

  test('the title is not returned as the employer', () => {
    expect(readCard(['Platform Engineer', 'Canva'], 'Platform Engineer').company).toBe('Canva');
  });
});

/**
 * REGRESSION, found by running a real advertisement through enrich().
 *
 * "Send your CV to careers@..." was being credited with the skill "computer
 * vision", because the alias table mapped cv to it. In a job-application tool
 * CV is curriculum vitae every single time, so that alias was not ambiguous —
 * it was wrong, and it put a fictitious skill into the preferred list of any
 * advertisement that said the word.
 */
describe('job-ad vocabulary is not mistaken for skills', () => {
  const { enrich } = require('../packages/discovery/src/campaign');
  const { extractSkills, ALIASES, AMBIGUOUS } = require('../packages/matching/src/skills');

  test('"send your CV" does not add computer vision', () => {
    const j = enrich({ title: 'Engineer', adText: 'Send your CV to careers@acme.com. Kubernetes required.' });
    expect(j.requiredSkills.concat(j.preferredSkills)).not.toContain('computer vision');
    expect(j.requiredSkills).toContain('kubernetes');
  });

  test('computer vision is still found when it is genuinely meant', () => {
    expect(extractSkills('Experience with computer vision and OpenCV')).toContain('computer vision');
  });

  test('every alias that is also an ordinary word is guarded or gone', () => {
    const ORDINARY = ['cv', 'go', 'r', 'c', 'safe', 'express', 'spring', 'swift', 'rust', 'dart', 'sap'];
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (canonical.startsWith('_')) continue;
      const risky = [canonical].concat(aliases).filter((a) => ORDINARY.includes(a.toLowerCase()));
      if (risky.length) {
        expect({ term: risky[0], canonical, guarded: !!AMBIGUOUS[canonical] })
          .toEqual({ term: risky[0], canonical, guarded: true });
      }
    }
  });

  test('a dart in prose is not the Dart language', () => {
    expect(extractSkills('We move fast and dart between priorities')).not.toContain('dart');
    expect(extractSkills('Skills: Dart, Flutter, Kotlin')).toContain('dart');
  });
});
