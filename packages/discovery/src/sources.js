/**
 * sources.js — find the vacancies, from everywhere that will actually give
 * them to us.
 *
 * WHAT IS AND IS NOT POSSIBLE, MEASURED RATHER THAN ASSUMED
 *
 * Probed live on 2026-08-29. This matters because most write-ups on the
 * subject are years stale and cite APIs that no longer exist.
 *
 *   KEYLESS, WORKING RIGHT NOW
 *     Greenhouse  boards-api.greenhouse.io/v1/boards/{company}/jobs
 *                 574 jobs for one company, no key, no rate limit hit.
 *                 Thousands of employers use Greenhouse, so a list of company
 *                 slugs IS a job board.
 *     Lever       api.lever.co/v0/postings/{company}?mode=json
 *                 Same idea. 404s on a wrong slug, which is how you validate.
 *     Arbeitnow   arbeitnow.com/api/job-board-api — 175 jobs, Europe/remote.
 *     RemoteOK    remoteok.com/api
 *     Remotive    remotive.com/api/remote-jobs
 *
 *   WITH A FREE KEY THE USER SUPPLIES
 *     Adzuna, Jooble — aggregators covering many countries, including the
 *     Australian market.
 *
 *   NO PUBLIC API AT ALL
 *     SEEK, Indeed, LinkedIn. Indeed withdrew its public job-search API and
 *     LinkedIn's is partner-only. There is no key to apply for as an
 *     individual.
 *
 * That last group is most of the Australian market, so pretending otherwise
 * would make this useless. They are handled a different way — see harvest.js —
 * by reading the search results page the user is already logged into and
 * looking at. The extension does not log in, does not solve anything, and does
 * not fetch pages the user has not opened; it reads what is on screen.
 *
 * EVERY SOURCE NORMALISES TO ONE SHAPE, so the gate, the matcher and the
 * applier do not care where a job came from.
 */

/** The one job shape. Everything downstream depends only on this. */
function normalised(fields) {
  return {
    id: fields.id || null,
    title: fields.title || null,
    company: fields.company || null,
    location: fields.location || null,
    remote: fields.remote === undefined ? null : !!fields.remote,
    url: fields.url || null,
    adText: fields.adText || '',
    salaryMin: fields.salaryMin === undefined ? null : fields.salaryMin,
    salaryMax: fields.salaryMax === undefined ? null : fields.salaryMax,
    postedAt: fields.postedAt || null,
    source: fields.source,
    // How the application is actually made. This decides which machinery runs.
    applyVia: fields.applyVia || 'web',
    applyEmail: fields.applyEmail || null
  };
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    // An inline tag removed from mid-sentence leaves a space before the
    // punctuation that followed it: "<b>Kubernetes</b>." becomes
    // "Kubernetes ." Cosmetic in isolation, and this text is what the matcher
    // and the cover letter quote from, so it ends up in the output.
    .replace(/\s+([.,;:!?)])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .split('\n').map((l) => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ------------------------------------------------------------- adapters */

const ADAPTERS = {
  /**
   * Greenhouse. Per-company rather than a search, which is a feature: these
   * are the employer's own postings, first-hand, with no aggregator lag and
   * no duplicate reposts.
   */
  greenhouse: {
    label: 'Greenhouse',
    keyless: true,
    perCompany: true,
    url: (company) => `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(company)}/jobs?content=true`,
    parse: (body, company) => (body.jobs || []).map((j) => normalised({
      id: `greenhouse:${company}:${j.id}`,
      title: j.title,
      company,
      location: j.location && j.location.name,
      url: j.absolute_url,
      adText: stripHtml(j.content),
      postedAt: j.updated_at,
      source: 'greenhouse'
    }))
  },

  lever: {
    label: 'Lever',
    keyless: true,
    perCompany: true,
    url: (company) => `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`,
    parse: (body, company) => (Array.isArray(body) ? body : []).map((j) => normalised({
      id: `lever:${company}:${j.id}`,
      title: j.text,
      company,
      location: j.categories && j.categories.location,
      url: j.hostedUrl || j.applyUrl,
      adText: stripHtml(j.descriptionPlain || j.description),
      remote: /remote/i.test((j.categories && j.categories.location) || ''),
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      source: 'lever'
    }))
  },

  arbeitnow: {
    label: 'Arbeitnow',
    keyless: true,
    url: () => 'https://www.arbeitnow.com/api/job-board-api',
    parse: (body) => (body.data || []).map((j) => normalised({
      id: `arbeitnow:${j.slug}`,
      title: j.title,
      company: j.company_name,
      location: j.location,
      remote: j.remote,
      url: j.url,
      adText: stripHtml(j.description),
      postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
      source: 'arbeitnow'
    }))
  },

  remoteok: {
    label: 'RemoteOK',
    keyless: true,
    url: () => 'https://remoteok.com/api',
    // The first element is a licence notice, not a job. Slicing blindly would
    // put "API Terms of Service" in the queue as a vacancy.
    parse: (body) => (Array.isArray(body) ? body : []).filter((j) => j && j.id && j.position)
      .map((j) => normalised({
        id: `remoteok:${j.id}`,
        title: j.position,
        company: j.company,
        location: j.location || 'Remote',
        remote: true,
        url: j.url,
        adText: stripHtml(j.description),
        salaryMin: j.salary_min || null,
        salaryMax: j.salary_max || null,
        postedAt: j.date,
        source: 'remoteok'
      }))
  },

  remotive: {
    label: 'Remotive',
    keyless: true,
    url: (_c, q) => `https://remotive.com/api/remote-jobs${q ? `?search=${encodeURIComponent(q)}` : ''}`,
    parse: (body) => (body.jobs || []).map((j) => normalised({
      id: `remotive:${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location,
      remote: true,
      url: j.url,
      adText: stripHtml(j.description),
      postedAt: j.publication_date,
      source: 'remotive'
    }))
  },

  /** Needs a free key from developer.adzuna.com. Covers Australia. */
  adzuna: {
    label: 'Adzuna',
    keyless: false,
    needs: ['appId', 'appKey'],
    url: (_c, q, opts) => {
      const o = opts || {};
      const country = o.country || 'au';
      const params = new URLSearchParams({
        app_id: o.appId || '', app_key: o.appKey || '',
        results_per_page: String(o.limit || 50),
        'content-type': 'application/json'
      });
      if (q) params.set('what', q);
      if (o.where) params.set('where', o.where);
      if (o.salaryMin) params.set('salary_min', String(o.salaryMin));
      return `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
    },
    parse: (body) => (body.results || []).map((j) => normalised({
      id: `adzuna:${j.id}`,
      title: j.title,
      company: j.company && j.company.display_name,
      location: j.location && j.location.display_name,
      url: j.redirect_url,
      adText: stripHtml(j.description),
      salaryMin: j.salary_min || null,
      salaryMax: j.salary_max || null,
      postedAt: j.created,
      source: 'adzuna'
    }))
  },

  jooble: {
    label: 'Jooble',
    keyless: false,
    needs: ['apiKey'],
    method: 'POST',
    url: (_c, _q, opts) => `https://jooble.org/api/${(opts && opts.apiKey) || ''}`,
    body: (q, opts) => ({ keywords: q || '', location: (opts && opts.where) || '' }),
    parse: (body) => (body.jobs || []).map((j) => normalised({
      id: `jooble:${j.id || j.link}`,
      title: j.title,
      company: j.company,
      location: j.location,
      url: j.link,
      adText: stripHtml(j.snippet),
      postedAt: j.updated,
      source: 'jooble'
    }))
  }
};

/** Sources usable right now with nothing configured. */
function keylessSources() {
  return Object.keys(ADAPTERS).filter((k) => ADAPTERS[k].keyless);
}

/** What a source still needs before it can run. */
function missingCredentials(source, opts) {
  const a = ADAPTERS[source];
  if (!a) throw new Error('Unknown source: ' + source);
  if (a.keyless) return [];
  return (a.needs || []).filter((n) => !(opts && opts[n]));
}

/**
 * Fetch one source. `fetchImpl` is injected so this is testable without a
 * network and usable from both a browser and Node.
 */
async function fetchSource(source, options) {
  const o = options || {};
  const a = ADAPTERS[source];
  if (!a) throw new Error('Unknown source: ' + source);

  const missing = missingCredentials(source, o);
  if (missing.length) {
    return { source, ok: false, jobs: [], error: `needs ${missing.join(' and ')}`, needsCredentials: missing };
  }
  if (a.perCompany && !o.company) {
    return { source, ok: false, jobs: [],
      error: `${a.label} is per-employer — give it a company slug (its board is at ${a.label.toLowerCase()}.io/{company})` };
  }

  const doFetch = o.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!doFetch) return { source, ok: false, jobs: [], error: 'no fetch available in this environment' };

  const url = a.url(o.company, o.query, o);
  try {
    const init = a.method === 'POST'
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(a.body(o.query, o)) }
      : { headers: { accept: 'application/json' } };
    const res = await doFetch(url, init);
    if (!res.ok) {
      return { source, ok: false, jobs: [],
        error: res.status === 404 && a.perCompany
          ? `no ${a.label} board for "${o.company}" — the slug is wrong, or they use a different ATS`
          : `HTTP ${res.status}` };
    }
    const body = await res.json();
    return { source, ok: true, jobs: a.parse(body, o.company), error: null };
  } catch (e) {
    return { source, ok: false, jobs: [], error: String((e && e.message) || e) };
  }
}

/**
 * Fetch several sources and merge.
 *
 * Deduped on employer plus title, because the same role genuinely does appear
 * on an aggregator and on the employer's own board — and the employer's own
 * posting is the better one to apply through, so it wins.
 */
const SOURCE_RANK = { greenhouse: 0, lever: 0, adzuna: 2, jooble: 2, arbeitnow: 3, remotive: 3, remoteok: 3 };

async function search(sources, options) {
  const results = [];
  for (const s of sources || []) {
    const spec = typeof s === 'string' ? { source: s } : s;
    results.push(await fetchSource(spec.source, { ...(options || {}), ...spec }));
  }

  const byKey = new Map();
  const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const r of results) {
    for (const job of r.jobs) {
      const key = `${norm(job.company)}::${norm(job.title)}`;
      const held = byKey.get(key);
      if (!held || (SOURCE_RANK[job.source] ?? 9) < (SOURCE_RANK[held.source] ?? 9)) byKey.set(key, job);
    }
  }

  return {
    jobs: [...byKey.values()],
    sources: results.map((r) => ({ source: r.source, ok: r.ok, count: r.jobs.length, error: r.error })),
    duplicatesMerged: results.reduce((n, r) => n + r.jobs.length, 0) - byKey.size
  };
}

module.exports = { ADAPTERS, normalised, stripHtml, keylessSources, missingCredentials, fetchSource, search, SOURCE_RANK };
