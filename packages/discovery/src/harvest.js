/**
 * harvest.js — read job listings off a search-results page the user is
 * already looking at.
 *
 * WHY THIS EXISTS AT ALL
 *
 * SEEK, Indeed and LinkedIn have no public job-search API. Indeed withdrew
 * its public one and LinkedIn's is partner-only; there is nothing an
 * individual can apply for. Between them that is most of the Australian
 * market, so a tool that only handled the API-having boards would miss the
 * jobs the user actually wants.
 *
 * So these are read from the page. The extension does not log in, does not
 * defeat anything, and does not fetch pages the user has not opened — it
 * reads the results already rendered in front of them, the same list they can
 * see, and turns it into a queue.
 *
 * MATCHED ON URL SHAPE, NOT ON CSS CLASSES.
 *
 * Every scraper written against class names dies at the next redeploy, and
 * these sites ship obfuscated, generated class names specifically because of
 * that. A job URL, by contrast, is a permalink: seek.com.au/job/12345678 has
 * had that shape for years, because changing it would break every inbound
 * link and every bookmark. Anchors are found by URL pattern and the
 * surrounding element is then read for context, which degrades to "a link and
 * a title" rather than to nothing.
 */

/**
 * Per-board URL patterns and how to pull an id out.
 *
 * `card` is the ancestor most likely to hold the title, employer and
 * location. It is a hint, not a requirement.
 */
const BOARDS = [
  {
    id: 'seek',
    label: 'SEEK',
    host: /(^|\.)seek\.com\.au$/i,
    jobUrl: /\/job\/(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: 'article, [data-card-type], [data-testid*="job"], li'
  },
  {
    id: 'indeed',
    label: 'Indeed',
    host: /(^|\.)indeed\.(com|com\.au|co\.uk)$/i,
    // Both the modern viewjob link and the older redirect carry jk=.
    jobUrl: /[?&]jk=([a-z0-9]+)/i,
    idFrom: (m) => m[1],
    cardSelector: '.job_seen_beacon, [data-jk], td.resultContent, li'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    host: /(^|\.)linkedin\.com$/i,
    jobUrl: /\/jobs\/view\/(?:[^/?#]*-)?(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: '.job-card-container, [data-job-id], li'
  },
  {
    id: 'greenhouse',
    label: 'Greenhouse',
    host: /greenhouse\.io$/i,
    jobUrl: /\/jobs\/(\d+)/,
    idFrom: (m) => m[1],
    cardSelector: '.opening, li'
  },
  {
    id: 'lever',
    label: 'Lever',
    host: /lever\.co$/i,
    jobUrl: /jobs\.lever\.co\/[^/]+\/([0-9a-f-]{8,})/i,
    idFrom: (m) => m[1],
    cardSelector: '.posting, li'
  }
];

function boardFor(url) {
  let host;
  try { host = new URL(url).hostname; } catch (e) { return null; }
  return BOARDS.find((b) => b.host.test(host)) || null;
}

function clean(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

/**
 * The card's text as separate pieces, one per leaf element.
 *
 * Anything with element children is skipped, because its textContent is the
 * concatenation of its descendants — which is the blob this exists to avoid.
 */
function cardSegments(card) {
  if (!card) return [];
  const out = [];
  const leaves = card.querySelectorAll ? card.querySelectorAll('*') : [];
  for (const el of leaves) {
    if (el.children && el.children.length) continue;
    const t = clean(el.textContent);
    if (t) out.push(t);
  }
  // Direct text nodes of the card itself, which belong to no element.
  for (const n of card.childNodes || []) {
    if (n.nodeType === 3) {
      const t = clean(n.textContent);
      if (t) out.push(t);
    }
  }
  return out;
}

/**
 * Pull the fields out of a card's text.
 *
 * Deliberately conservative. A wrong employer name on a queued job leads to a
 * cover letter addressed to the wrong company, so a field that cannot be read
 * confidently is left null for the job page itself to supply later.
 */
function readCard(segments, title) {
  // SEGMENTS, not one blob of text. Element.textContent concatenates sibling
  // elements with no separator at all, so a card rendering
  // <span>Canva</span><span>Sydney NSW</span><span>$140,000</span>
  // arrives as "CanvaSydney NSW$140,000" and every field parsed out of it is
  // wrong. A wrong employer name is not cosmetic — it addresses the cover
  // letter to the wrong company — so the caller passes the leaf elements'
  // text separately and this never sees a blob.
  const lines = (Array.isArray(segments) ? segments : String(segments || '').split('\n'))
    .map(clean).filter(Boolean);
  const t = clean(title);
  // Substring containment is too aggressive: it drops "Austin TX" when the
  // title happens to be "X", and would drop "Engineering Services Pty Ltd"
  // for a role called "Engineer". Only an exact match, or a segment that
  // opens with a title long enough to be distinctive, counts as the title
  // repeated.
  const withoutTitle = lines.filter(
    (l) => l && l !== t && !(t.length >= 6 && l.indexOf(t) === 0)
  );
  const cardText = lines.join('\n');

  // Salary, if the card advertises one.
  const salary = (() => {
    const m = String(cardText || '').match(/\$\s?([\d,]{4,})(?:\s*(?:-|–|to)\s*\$?\s?([\d,]{4,}))?/);
    if (!m) return { min: null, max: null };
    const n = (x) => (x ? Number(String(x).replace(/,/g, '')) : null);
    return { min: n(m[1]), max: n(m[2]) };
  })();

  // A salary range contains a comma ("$140,000 - $170,000"), so a comma alone
  // is not evidence of a place — the first version happily reported the pay
  // band as the location. Money-shaped segments are excluded first.
  const looksLikeMoney = (l) => /\$|\bper\s+(hour|day|week|annum|year)\b|\bp\.?a\.?\b|\bsalary\b/i.test(l);
  // Australian and US listings routinely write "Sydney NSW" or "Austin TX"
  // with no comma at all, so a comma cannot be the only signal — that missed
  // the most common local format.
  const REGION = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT|AL|AK|AZ|CA|CO|CT|FL|GA|IL|MA|MI|NY|NC|OH|OR|PA|TX|VA|WA)\b/;
  const looksLikePlace = (l) =>
    /,/.test(l) || /\bremote\b|\bhybrid\b|\bon-?site\b/i.test(l) || REGION.test(l);
  const location = withoutTitle.find(
    (l) => !looksLikeMoney(l) && looksLikePlace(l) && l.length < 60
  ) || null;
  return {
    // The employer is the first segment that is not the title, not the
    // location and not a salary.
    company: withoutTitle.find((l) => l !== location && !looksLikeMoney(l) && l.length < 60) || null,
    location: location,
    salaryMin: salary.min,
    salaryMax: salary.max,
    remote: /\bremote\b/i.test(cardText || '') ? true : null
  };
}

/**
 * Harvest from a DOM.
 *
 * `doc` is injected so this runs under a test as readily as in a page.
 */
function harvest(doc, pageUrl) {
  const board = boardFor(pageUrl);
  if (!board) {
    return { board: null, jobs: [], error: 'This is not a job board JobPilot knows how to read.' };
  }

  const anchors = [...doc.querySelectorAll('a[href]')];
  const byId = new Map();

  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    let abs = href;
    try { abs = new URL(href, pageUrl).toString(); } catch (e) { /* keep as written */ }

    const m = abs.match(board.jobUrl);
    if (!m) continue;
    const id = board.idFrom(m);
    if (!id) continue;

    const title = clean(a.getAttribute('aria-label') || a.textContent);
    // An anchor with no text is usually an image wrapper around the same job;
    // the titled one for this id will be found in the same pass.
    if (!title || title.length < 3) continue;

    const card = (a.closest && a.closest(board.cardSelector)) || a.parentElement;
    const fields = readCard(cardSegments(card), title);

    const existing = byId.get(id);
    // Prefer the entry with the most context: several anchors point at the
    // same job and only one of them sits inside the full card.
    const score = (fields.company ? 1 : 0) + (fields.location ? 1 : 0) + (fields.salaryMin ? 1 : 0);
    if (existing && existing._score >= score) continue;

    byId.set(id, {
      id: `${board.id}:${id}`,
      title,
      company: fields.company,
      location: fields.location,
      remote: fields.remote,
      salaryMin: fields.salaryMin,
      salaryMax: fields.salaryMax,
      url: abs.split('#')[0],
      adText: '',
      source: board.id,
      applyVia: 'web',
      applyEmail: null,
      _score: score
    });
  }

  const jobs = [...byId.values()].map((j) => { const { _score, ...rest } = j; return rest; });
  return {
    board: board.id,
    boardLabel: board.label,
    jobs,
    error: jobs.length ? null
      : 'No job links found on this page. Open the search results themselves rather than the ' +
        'landing page, and scroll far enough for the listings to load.'
  };
}

/** Which boards can be harvested, for telling the user where to go. */
function supportedBoards() {
  return BOARDS.map((b) => ({ id: b.id, label: b.label }));
}

module.exports = { harvest, boardFor, readCard, cardSegments, supportedBoards, BOARDS };
