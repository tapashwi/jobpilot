/**
 * readJobPage() — reading a single job posting off its own page.
 *
 * WHY THIS EXISTS
 *
 * jobpage.js sat at 67.15% of statements and 51.61% of branches, the weakest
 * file in the discovery package once harvest.js was covered. The uncovered
 * half is not incidental: it is the JSON-LD salary block, the location
 * assembly, and the DOM fallbacks — in other words, everything the gate
 * later makes a decision on.
 *
 * The salary annualisation is the sharpest of them. schema.org permits a rate
 * to be hourly, daily, weekly or monthly, and the module's own comment says
 * that comparing an hourly figure against an annual minimum "would block
 * every job on earth". That is a silent, total failure — the queue would
 * simply come back empty and look like no jobs matched. It had no test.
 *
 * NO jsdom, matching tests/harvest-dom.test.js and for the same reason: the
 * repo's only devDependency is jest, and readJobPage takes its document as a
 * parameter so it can be driven directly. This builds the smallest DOM that
 * satisfies what jobpage.js actually calls — querySelector, querySelectorAll,
 * getAttribute, textContent — and exercises the real functions.
 */

const {
  readJobPage,
  emptyJob,
  collectPostings,
  fromJsonLd,
  fromMeta,
  fromDom,
  nameOf,
  MIN_AD_TEXT,
} = require('../packages/discovery/src/jobpage');

/** A minimal element supporting only the surface jobpage.js touches. */
function el(tag, { attrs = {}, text = null, children = [] } = {}) {
  return {
    tagName: tag.toUpperCase(),
    attrs,
    children,
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
    get textContent() {
      return text !== null ? text : children.map((c) => c.textContent).join(' ');
    },
  };
}

/**
 * A document whose selector support covers exactly the selectors jobpage.js
 * uses: a tag name, `script[type="..."]`, and `meta[property="..."]` /
 * `meta[name="..."]`. Anything else matches by tag, which is enough for the
 * comma-separated container list fromDom() passes in.
 */
function doc(...nodes) {
  const all = [];
  (function walk(list) {
    for (const n of list) { all.push(n); walk(n.children); }
  })(nodes);

  const matches = (node, sel) => {
    const s = sel.trim();
    const attr = s.match(/^(\w+)\[([\w-]+)([~*]?)="([^"]+)"\]$/);
    if (attr) {
      const [, tag, name, op, val] = attr;
      if (node.tagName !== tag.toUpperCase()) return false;
      const got = node.getAttribute(name);
      return op === '*' ? String(got || '').includes(val) : got === val;
    }
    const cls = s.match(/^\[class\*="([^"]+)"\]$/);
    if (cls) return String(node.getAttribute('class') || '').includes(cls[1]);
    const dataAuto = s.match(/^\[data-automation\*="([^"]+)"\]$/);
    if (dataAuto) return String(node.getAttribute('data-automation') || '').includes(dataAuto[1]);
    return node.tagName === s.toUpperCase();
  };

  return {
    querySelectorAll(sel) {
      const parts = String(sel).split(',').map((p) => p.trim());
      return all.filter((n) => parts.some((p) => matches(n, p)));
    },
    querySelector(sel) {
      return this.querySelectorAll(sel)[0] || null;
    },
  };
}

const ld = (obj) => el('script', {
  attrs: { type: 'application/ld+json' },
  text: JSON.stringify(obj),
});
const meta = (key, val, value) => el('meta', { attrs: { [key]: val, content: value } });
const posting = (extra) => Object.assign({ '@type': 'JobPosting', title: 'Engineer' }, extra);

const LONG = 'We are hiring. '.repeat(40); // comfortably over MIN_AD_TEXT

describe('salary: schema.org rates are not all annual', () => {
  // The module's own comment: comparing an hourly rate against an annual
  // minimum "would block every job on earth". That is a silent, total
  // failure — an empty queue that looks like a bad market.
  const salaried = (value) => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ baseSalary: { value } }))), job);
    return job;
  };

  it('annualises an hourly rate at 1900 hours', () => {
    expect(salaried({ minValue: 50, maxValue: 60, unitText: 'HOUR' }).salaryMin).toBe(95000);
  });

  it('annualises a daily rate at 240 days', () => {
    expect(salaried({ minValue: 400, unitText: 'DAY' }).salaryMin).toBe(96000);
  });

  it('annualises a weekly rate at 52 weeks', () => {
    expect(salaried({ minValue: 2000, unitText: 'WEEK' }).salaryMin).toBe(104000);
  });

  it('annualises a monthly rate at 12 months', () => {
    expect(salaried({ minValue: 9000, unitText: 'MONTH' }).salaryMin).toBe(108000);
  });

  it('leaves a yearly rate alone', () => {
    expect(salaried({ minValue: 120000, unitText: 'YEAR' }).salaryMin).toBe(120000);
  });

  it('treats a missing unitText as already annual rather than guessing', () => {
    expect(salaried({ minValue: 120000 }).salaryMin).toBe(120000);
  });

  it('accepts a single value where min and max are not given separately', () => {
    const job = salaried({ value: 100000, unitText: 'YEAR' });
    expect(job.salaryMin).toBe(100000);
    expect(job.salaryMax).toBe(100000);
  });

  it('ignores a zero or non-numeric salary instead of recording 0', () => {
    // A recorded 0 would read as "this job pays nothing" to the gate, which
    // is a stronger and wronger claim than "no salary was stated".
    expect(salaried({ minValue: 0, unitText: 'YEAR' }).salaryMin).toBeNull();
    expect(salaried({ minValue: 'negotiable' }).salaryMin).toBeNull();
  });

  it('reads a salary nested under baseSalary.value as an array', () => {
    expect(salaried([{ minValue: 90000, unitText: 'YEAR' }]).salaryMin).toBe(90000);
  });
});

describe('location and remote', () => {
  it('assembles locality, region and country in order', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({
      jobLocation: { address: { addressLocality: 'Darwin', addressRegion: 'NT', addressCountry: 'Australia' } },
    }))), job);
    expect(job.location).toBe('Darwin, NT, Australia');
  });

  it('skips address parts that are absent rather than leaving empty commas', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ jobLocation: { address: { addressLocality: 'Sydney' } } }))), job);
    expect(job.location).toBe('Sydney');
  });

  it('falls back to the location name when there is no address', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ jobLocation: { name: 'Head Office' } }))), job);
    expect(job.location).toBe('Head Office');
  });

  it('reads TELECOMMUTE as remote', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ jobLocationType: 'TELECOMMUTE' }))), job);
    expect(job.remote).toBe(true);
  });

  it('does not claim remote merely because jobLocationType is present', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ jobLocationType: 'ON_SITE' }))), job);
    expect(job.remote).toBeNull();
  });
});

describe('walking the JSON-LD payload', () => {
  it('finds a posting inside @graph', () => {
    const found = collectPostings({ '@graph': [{ '@type': 'WebPage' }, posting({ title: 'In graph' })] });
    expect(found).toHaveLength(1);
    expect(found[0].title).toBe('In graph');
  });

  it('finds a posting inside a bare array', () => {
    expect(collectPostings([{ '@type': 'Organization' }, posting()])).toHaveLength(1);
  });

  it('accepts @type given as an array', () => {
    expect(collectPostings({ '@type': ['Thing', 'JobPosting'] })).toHaveLength(1);
  });

  it('returns nothing for null, a string, or a number', () => {
    expect(collectPostings(null)).toEqual([]);
    expect(collectPostings('JobPosting')).toEqual([]);
    expect(collectPostings(7)).toEqual([]);
  });

  it('skips a script whose JSON does not parse, rather than throwing', () => {
    // One malformed block on a page must not lose the posting in the next.
    const bad = el('script', { attrs: { type: 'application/ld+json' }, text: '{ not json' });
    const job = emptyJob();
    fromJsonLd(doc(bad, ld(posting({ title: 'Survived' }))), job);
    expect(job.title).toBe('Survived');
  });

  it('strips HTML out of description, which is HTML in practice', () => {
    const job = emptyJob();
    fromJsonLd(doc(ld(posting({ description: '<p>Build <b>things</b></p>' }))), job);
    expect(job.adText).toBe('Build things');
  });
});

describe('nameOf', () => {
  it('reads a plain string', () => expect(nameOf('Acme')).toBe('Acme'));
  it('reads .name from an object', () => expect(nameOf({ name: 'Acme' })).toBe('Acme'));
  it('falls back to legalName', () => expect(nameOf({ legalName: 'Acme Pty Ltd' })).toBe('Acme Pty Ltd'));
  it('takes the first of an array', () => expect(nameOf([{ name: 'First' }, { name: 'Second' }])).toBe('First'));
  it('returns null for a number, a boolean or an empty array', () => {
    expect(nameOf(42)).toBeNull();
    expect(nameOf(true)).toBeNull();
    expect(nameOf([])).toBeNull();
  });
});

describe('meta fallbacks', () => {
  it('takes title and company from Open Graph when JSON-LD had none', () => {
    const job = emptyJob();
    fromMeta(doc(
      meta('property', 'og:title', 'Platform Engineer'),
      meta('property', 'og:site_name', 'Acme'),
    ), job);
    expect(job.title).toBe('Platform Engineer');
    expect(job.company).toBe('Acme');
    expect(job._from.title).toBe('og');
  });

  it('does not overwrite a value JSON-LD already supplied', () => {
    // Provenance matters: JSON-LD is the structured source and og: is a
    // fallback, so the fallback must never win.
    const job = emptyJob();
    job.title = 'From JSON-LD';
    job._from.title = 'json-ld';
    fromMeta(doc(meta('property', 'og:title', 'From OG')), job);
    expect(job.title).toBe('From JSON-LD');
    expect(job._from.title).toBe('json-ld');
  });

  it('falls back from twitter:title and from name="description"', () => {
    const job = emptyJob();
    fromMeta(doc(
      meta('name', 'twitter:title', 'Twitter Title'),
      meta('name', 'description', 'A described role'),
    ), job);
    expect(job.title).toBe('Twitter Title');
    expect(job.adText).toBe('A described role');
  });
});

describe('DOM fallbacks, the part expected to rot', () => {
  it('takes the title from h1 when nothing structured had one', () => {
    const job = emptyJob();
    fromDom(doc(el('h1', { text: 'Senior Engineer' })), job);
    expect(job.title).toBe('Senior Engineer');
    expect(job._from.title).toBe('h1');
  });

  it('takes the ad body as the largest text block', () => {
    const job = emptyJob();
    const small = el('div', { text: 'x'.repeat(400) });
    const big = el('article', { text: 'y'.repeat(900) });
    fromDom(doc(small, big), job);
    expect(job.adText.length).toBe(900);
    expect(job._from.adText).toBe('largest-text-block');
  });

  it('ignores blocks under the 300-character floor', () => {
    const job = emptyJob();
    fromDom(doc(el('div', { text: 'too short' })), job);
    expect(job.adText).toBeFalsy();
  });

  it('replaces a short JSON-LD description with a longer visible body', () => {
    // A 40-character og:description is not the advertisement; the gate would
    // be judging requirements it never read.
    const job = emptyJob();
    job.adText = 'short blurb';
    fromDom(doc(el('article', { text: 'z'.repeat(800) })), job);
    expect(job.adText.length).toBe(800);
  });
});

describe('readJobPage: what it concludes, and what it admits it could not read', () => {
  it('reads a complete posting end to end and calls it usable', () => {
    const job = readJobPage(doc(ld(posting({
      title: 'Network Engineer',
      hiringOrganization: { name: 'Acme' },
      description: LONG,
    }))), 'https://example.com/job/1');

    expect(job.usable).toBe(true);
    expect(job.missing).toEqual([]);
    expect(job.whyUnusable).toBeNull();
    expect(job.url).toBe('https://example.com/job/1');
  });

  it('names every field it could not read', () => {
    const job = readJobPage(doc(), null);
    expect(job.usable).toBe(false);
    expect(job.missing).toEqual(['title', 'company', 'adText']);
    expect(job.whyUnusable).toMatch(/Could not read/);
  });

  it('refuses a posting whose body is too short to have been read', () => {
    // The failure this guards is the dangerous one: everything present, so
    // the job looks fine, but the requirements never loaded.
    const job = readJobPage(doc(ld(posting({
      title: 'Engineer',
      hiringOrganization: { name: 'Acme' },
      description: 'Apply within.',
    }))), 'https://example.com/job/2');

    expect(job.usable).toBe(false);
    expect(job.missing).toContain('adText (too short)');
    expect(job.whyUnusable).toMatch(/applying unread/i);
    expect(job.adText.length).toBeLessThan(MIN_AD_TEXT);
  });

  it('infers remote from the ad text when the posting did not say', () => {
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      description: `${LONG} This is a fully remote role.`,
    }))), 'u');
    expect(job.remote).toBe(true);
  });

  it('reads a years-of-experience minimum out of the ad text', () => {
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      description: `${LONG} We need 5+ years experience with networks.`,
    }))), 'u');
    expect(job.minYearsExperience).toBe(5);
    expect(job._from.minYearsExperience).toBe('ad-text');
  });

  it('reads a dollar range out of the ad text only when JSON-LD gave none', () => {
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      description: `${LONG} Paying $90,000 - $110,000 plus super.`,
    }))), 'u');
    expect(job.salaryMin).toBe(90000);
    expect(job.salaryMax).toBe(110000);
    expect(job._from.salaryMin).toBe('ad-text');
  });

  it('prefers the structured salary over the one in the prose', () => {
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      baseSalary: { value: { minValue: 100000, unitText: 'YEAR' } },
      description: `${LONG} Was previously $50,000 - $60,000.`,
    }))), 'u');
    expect(job.salaryMin).toBe(100000);
    expect(job._from.salaryMin).toBe('json-ld');
  });

  it('passes the ad text to an injected skills parser and keeps both lists', () => {
    const seen = [];
    const parseSkills = (t) => { seen.push(t); return { required: ['bgp'], preferred: ['python'] }; };
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      description: LONG,
    }))), 'u', parseSkills);

    expect(seen).toHaveLength(1);
    expect(job.requiredSkills).toEqual(['bgp']);
    expect(job.preferredSkills).toEqual(['python']);
    expect(job._from.skills).toBe('ad-text');
  });

  it('works without a skills parser, since it is injected and optional', () => {
    const job = readJobPage(doc(ld(posting({
      hiringOrganization: { name: 'Acme' },
      description: LONG,
    }))), 'u');
    expect(job.usable).toBe(true);
    expect(job._from.skills).toBeUndefined();
  });
});
