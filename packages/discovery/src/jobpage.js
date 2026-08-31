/**
 * jobpage.js — read one job posting off its own page.
 *
 * WHY THIS EXISTS
 *
 * The gate is the whole safety story, and the gate needs a job: a title, an
 * employer, the required skills, the experience floor, the salary. Without
 * those, assess() judges an empty object and passes everything — the guarantee
 * is inert. The extension was in exactly that state: it sent `job: {}`.
 *
 * THE STRATEGY, IN ORDER OF DURABILITY
 *
 * 1. JSON-LD. Almost every job board emits schema.org JobPosting structured
 *    data, because Google Jobs requires it to index them. That makes it the
 *    most stable thing on the page by a wide margin — it is a contract with
 *    Google, not an implementation detail, so it survives redesigns that break
 *    every CSS selector. It is also already normalised: title, hiringOrganization,
 *    baseSalary, employmentType, datePosted.
 *
 * 2. Open Graph and standard meta tags. Also maintained for external
 *    consumers, also stable.
 *
 * 3. Heuristics over the visible DOM. Last, because it is the part that breaks.
 *
 * Each strategy fills only the fields the previous ones left empty, and every
 * field records which strategy produced it — so when something is wrong, it is
 * obvious where it came from.
 */

/** Everything the gate and the applier need from a posting. */
/**
 * How much ad body counts as having actually read the advertisement.
 *
 * Not arbitrary, and it is load-bearing. The requirement extraction — skills,
 * years, salary — all runs on this text, and when there is too little of it
 * the extraction finds nothing. An empty requiredSkills list makes the skills
 * gate PASS, so a page whose body never loaded sails through and gets applied
 * to unread. That is the precise failure this whole tool is built against.
 *
 * An og:description is capped near 160 characters by convention, so a page
 * offering only meta tags will sit under this — correctly. It has given us a
 * title and an employer, not the requirements.
 */
const MIN_AD_TEXT = 400;

function emptyJob() {
  return {
    title: null, company: null, location: null, adText: '',
    salaryMin: null, salaryMax: null, employmentType: null,
    postedAt: null, url: null, remote: null,
    minYearsExperience: null,
    requiredSkills: [], preferredSkills: [],
    _from: {}
  };
}

function text(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

/** schema.org allows a string, an object, or an array almost everywhere. */
function firstOf(v) {
  if (Array.isArray(v)) return v.length ? firstOf(v[0]) : null;
  return v === undefined ? null : v;
}

function nameOf(v) {
  const x = firstOf(v);
  if (!x) return null;
  if (typeof x === 'string') return text(x);
  if (typeof x === 'object') return text(x.name || x.legalName || null) || null;
  return null;
}

/** Walk a JSON-LD payload, which may be a graph, an array, or a bare object. */
function collectPostings(node, out) {
  out = out || [];
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const n of node) collectPostings(n, out);
    return out;
  }
  const type = node['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (types.indexOf('JobPosting') !== -1) out.push(node);
  if (node['@graph']) collectPostings(node['@graph'], out);
  return out;
}

function fromJsonLd(doc, job) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    let parsed;
    try { parsed = JSON.parse(s.textContent); } catch (e) { continue; }
    for (const p of collectPostings(parsed)) {
      const set = (field, value) => {
        if (job[field] === null || job[field] === '' ) {
          if (value !== null && value !== undefined && value !== '') {
            job[field] = value;
            job._from[field] = 'json-ld';
          }
        }
      };

      set('title', text(p.title) || null);
      set('company', nameOf(p.hiringOrganization));

      const loc = firstOf(p.jobLocation);
      if (loc) {
        const addr = (loc.address && firstOf(loc.address)) || loc;
        const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry]
          .map((x) => nameOf(x)).filter(Boolean);
        set('location', parts.join(', ') || nameOf(loc.name));
      }
      if (p.jobLocationType && /telecommute/i.test(String(p.jobLocationType))) {
        if (job.remote === null) { job.remote = true; job._from.remote = 'json-ld'; }
      }

      const sal = firstOf(p.baseSalary);
      if (sal) {
        const v = firstOf(sal.value) || sal;
        const min = Number(v.minValue !== undefined ? v.minValue : v.value);
        const max = Number(v.maxValue !== undefined ? v.maxValue : v.value);
        // schema.org allows hourly and monthly; a gate comparing an hourly
        // rate against an annual minimum would block every job on earth.
        const unit = String(v.unitText || '').toUpperCase();
        const annualise = unit === 'HOUR' ? 1900 : unit === 'DAY' ? 240
          : unit === 'WEEK' ? 52 : unit === 'MONTH' ? 12 : 1;
        if (Number.isFinite(min) && min > 0) set('salaryMin', Math.round(min * annualise));
        if (Number.isFinite(max) && max > 0) set('salaryMax', Math.round(max * annualise));
      }

      set('employmentType', nameOf(p.employmentType));
      set('postedAt', text(p.datePosted) || null);

      if (!job.adText && p.description) {
        // description is HTML in practice, despite the spec calling it text.
        job.adText = text(String(p.description).replace(/<[^>]+>/g, ' '));
        job._from.adText = 'json-ld';
      }
    }
  }
  return job;
}

function metaContent(doc, selectors) {
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    const v = el && (el.getAttribute('content') || el.getAttribute('value'));
    if (v && text(v)) return text(v);
  }
  return null;
}

function fromMeta(doc, job) {
  const set = (field, value, how) => {
    if ((job[field] === null || job[field] === '') && value) {
      job[field] = value;
      job._from[field] = how;
    }
  };
  set('title', metaContent(doc, ['meta[property="og:title"]', 'meta[name="twitter:title"]']), 'og');
  set('company', metaContent(doc, ['meta[property="og:site_name"]']), 'og');
  if (!job.adText) {
    const d = metaContent(doc, ['meta[property="og:description"]', 'meta[name="description"]']);
    if (d) { job.adText = d; job._from.adText = 'og'; }
  }
  return job;
}

/**
 * Visible-DOM heuristics. Last resort, and the only part expected to rot.
 *
 * The ad body is taken as the largest block of text on the page, which is a
 * crude rule that holds well: a job page's biggest text block is the job
 * description, because that is what the page is for.
 */
function fromDom(doc, job) {
  if (!job.title) {
    const h1 = doc.querySelector('h1');
    if (h1 && text(h1.textContent)) {
      job.title = text(h1.textContent);
      job._from.title = 'h1';
    }
  }

  if (!job.adText || job.adText.length < 200) {
    let best = null;
    const candidates = doc.querySelectorAll(
      'article, [class*="description"], [class*="Description"], [data-automation*="description"], main, section, div'
    );
    for (const el of candidates) {
      // Skip containers whose text is mostly their children's chrome.
      const t = text(el.textContent);
      if (t.length < 300) continue;
      if (!best || t.length > best.length) best = t;
    }
    if (best && best.length > (job.adText || '').length) {
      job.adText = best;
      job._from.adText = 'largest-text-block';
    }
  }
  return job;
}

/**
 * Read the posting.
 *
 * `parseSkills` is injected rather than imported so this module stays free of
 * the matcher — the caller supplies it, and tests can check the extraction
 * without pulling the dictionary in.
 */
function readJobPage(doc, pageUrl, parseSkills) {
  const job = emptyJob();
  job.url = pageUrl || null;

  fromJsonLd(doc, job);
  fromMeta(doc, job);
  fromDom(doc, job);

  if (job.adText) {
    if (job.remote === null && /\bremote\b|\bwork from home\b/i.test(job.adText)) job.remote = true;

    const m = job.adText.match(/(\d+)\s*\+?\s*(?:-|–|to)?\s*\d*\s*years?(?:['’]|\s+of)?\s+experience/i);
    if (m && job.minYearsExperience == null) {
      job.minYearsExperience = Number(m[1]);
      job._from.minYearsExperience = 'ad-text';
    }

    if (job.salaryMin === null) {
      const s = job.adText.match(/\$\s?([\d,]{4,})\s*(?:-|–|to)\s*\$?\s?([\d,]{4,})/);
      if (s) {
        const n = (x) => Number(String(x).replace(/,/g, ''));
        job.salaryMin = n(s[1]);
        job.salaryMax = n(s[2]);
        job._from.salaryMin = 'ad-text';
      }
    }

    if (parseSkills) {
      const sk = parseSkills(job.adText);
      job.requiredSkills = sk.required;
      job.preferredSkills = sk.preferred;
      job._from.skills = 'ad-text';
    }
  }

  // What is missing matters as much as what was found: the gate cannot judge
  // a requirement that was never read, and pretending otherwise is how a tool
  // "passes" every job.
  job.missing = ['title', 'company', 'adText'].filter((f) => !job[f]);
  if (!job.missing.length && job.adText.length < MIN_AD_TEXT) job.missing.push('adText (too short)');

  job.usable = job.missing.length === 0;
  job.whyUnusable = job.usable ? null
    : job.adText && job.adText.length < MIN_AD_TEXT
      ? `Only ${job.adText.length} characters of advertisement were readable, which is not enough ` +
        'to have read the requirements. The body probably did not load, or the posting is behind ' +
        'a login. Applying now would mean applying unread.'
      : `Could not read: ${job.missing.join(', ')}. This may not be a job page, or it needs a login.`;

  return job;
}

module.exports = { readJobPage, emptyJob, MIN_AD_TEXT, collectPostings, fromJsonLd, fromMeta, fromDom, nameOf };
