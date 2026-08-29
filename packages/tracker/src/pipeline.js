/**
 * pipeline.js — take a pile of job advertisements, work out which are worth
 * applying to, and produce a finished application pack for each one.
 *
 * THIS IS THE "APPLY TO EVERYTHING THAT MATCHES" ENGINE.
 *
 * It does every part of applying that can be done well in bulk: read each
 * advertisement, pull out the requirements, gate it against the profile, rank
 * what survives, and generate a tailored cover letter, a resume gap list and
 * selection-criteria responses for each. What would take a person forty
 * minutes per job takes one paste.
 *
 * WHERE IT STOPS, AND WHY IT STOPS THERE
 *
 * It does not press submit on SEEK or Workday, and that is a deliberate
 * engineering decision rather than squeamishness:
 *
 *   - SEEK, Workday, PageUp and JobAdder all prohibit automated submission in
 *     their terms. The enforcement mechanism is not a lawsuit, it is bot
 *     detection terminating the account — including the SEEK profile with the
 *     applicant's history in it, and every application already in flight.
 *   - Workday's form widgets are shadow-DOM custom components that ignore
 *     programmatic value changes. An automated submission there does not fail
 *     loudly; it submits a half-empty application, and the applicant finds out
 *     by never hearing back.
 *   - A submission is irreversible. There is no unsend. A batch bug that would
 *     be a bad afternoon anywhere else is, here, forty employers holding a
 *     wrong application with the applicant's name on it.
 *
 * So the queue takes it to the last step and hands over: every field prepared,
 * every document written, one job at a time, one click each. That is the fast
 * part automated and the irreversible part left with the person whose name is
 * on the application.
 */

const { assess, rank } = require('../../matching/src/match');
const { parseJobSkills, extractSkills } = require('../../matching/src/skills');
const { coverLetter } = require('../../documents/src/cover-letter');
const { draftAll, parseCriteria } = require('../../documents/src/selection-criteria');
const { checkResume } = require('../../ats/src/ats-check');

/** Where an application can be. */
const STATUSES = ['queued', 'ready', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'skipped'];

/**
 * Split one pasted blob into separate advertisements.
 *
 * People collect jobs by copying several into one document. The separators
 * they actually use are a run of dashes, a run of equals signs, or a form
 * feed — plus the one this tool tells them to use.
 */
function splitAdvertisements(blob) {
  const text = String(blob || '');
  if (!text.trim()) return [];
  const parts = text.split(/\n\s*(?:-{3,}|={3,}|\*{3,}|#{3,}|\f)\s*\n/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 40);
}

/**
 * Pull structured fields out of one advertisement.
 *
 * Deliberately conservative: a field it cannot find with confidence is left
 * null for the user to fill, rather than guessed. A wrong company name on a
 * cover letter is worse than a blank one, because a blank gets noticed.
 */
function parseAdvertisement(adText) {
  const text = String(adText || '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const labelled = (re) => {
    const m = text.match(re);
    return m ? m[1].trim().replace(/[.,;]+$/, '') : null;
  };

  const title =
    labelled(/(?:^|\n)\s*(?:job\s+)?title\s*[:\-]\s*(.+)/i) ||
    labelled(/(?:^|\n)\s*position\s*[:\-]\s*(.+)/i) ||
    // Otherwise the first line, if it reads like a title rather than a sentence.
    (lines[0] && lines[0].length <= 80 && !/[.!?]$/.test(lines[0]) ? lines[0] : null);

  const company =
    labelled(/(?:^|\n)\s*(?:company|employer|organisation|organization)\s*[:\-]\s*(.+)/i) ||
    labelled(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,40})\s+(?:we|is|are)\b/);

  const location = labelled(/(?:^|\n)\s*location\s*[:\-]\s*(.+)/i);
  const url = (text.match(/https?:\/\/[^\s)]+/) || [])[0] || null;

  // Salary: a range in either order, with or without a currency symbol.
  const salary = (() => {
    const m = text.match(/\$\s?([\d,]{4,})\s*(?:-|–|to)\s*\$?\s?([\d,]{4,})/);
    if (!m) return { min: null, max: null };
    const n = (s) => Number(String(s).replace(/,/g, ''));
    return { min: n(m[1]), max: n(m[2]) };
  })();

  const years = (() => {
    const m = text.match(/(\d+)\s*\+?\s*(?:-|–|to)?\s*(\d+)?\s*years?(?:['’]|\s+of)?\s+experience/i);
    return m ? Number(m[1]) : null;
  })();

  const skills = parseJobSkills(text);
  const criteria = parseCriteria(
    (text.match(/(?:selection|key|essential)\s+criteri(?:a|on)[\s\S]{0,3000}/i) || [''])[0]
  );

  return {
    title,
    company,
    location,
    url,
    adText: text,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
    minYearsExperience: years,
    salaryMin: salary.min,
    salaryMax: salary.max,
    criteria,
    // Named so a UI can prompt for exactly what is missing rather than
    // showing a generic "check the details" warning.
    missingFields: ['title', 'company'].filter((f) => !({ title, company })[f])
  };
}

/**
 * Build the full application pack for one job.
 *
 * Everything a person needs to open the advertisement and complete it in one
 * pass, generated from their real material.
 */
function buildPack(profile, job, opts) {
  const o = opts || {};
  const assessment = assess(profile, job);

  // A blocked job gets no documents. Generating a polished cover letter for
  // an application that cannot succeed wastes the reader's attention on the
  // wrong thing, and quietly encourages sending it.
  if (!assessment.passed) {
    return {
      job,
      assessment,
      recommendation: 'skip',
      why: assessment.blockers.map((b) => b.reason),
      documents: null
    };
  }

  const letter = coverLetter(profile, job, o.letter);
  const criteria = (job.criteria && job.criteria.length)
    ? draftAll(job.criteria, profile.resumeText, o.criteria)
    : null;
  const ats = checkResume(profile.resumeText, job.adText);

  const blockingAts = ats.findings.filter((f) => f.severity === 'critical');
  const recommendation = blockingAts.length ? 'fix-first' : 'ready';

  return {
    job,
    assessment,
    recommendation,
    why: blockingAts.length
      ? blockingAts.map((f) => f.title)
      : [assessment.verdict.headline],
    documents: {
      coverLetter: letter,
      selectionCriteria: criteria,
      atsCheck: ats
    },
    // Total human work left, so the queue can be ordered by effort as well as
    // by fit — the honest answer to "what should I do next".
    gapsToFill: letter.gaps + (criteria ? criteria.totalGaps : 0)
  };
}

/**
 * The whole batch.
 *
 * `jobs` may be parsed advertisement objects, or raw text blobs which are
 * parsed here.
 */
function buildQueue(profile, jobs, opts) {
  const packs = (jobs || []).map((j) => {
    const job = typeof j === 'string' ? parseAdvertisement(j) : j;
    return buildPack(profile, job, opts);
  });

  const ranked = rank(packs.map((p) => p.assessment));
  const order = new Map(ranked.map((a, i) => [a, i]));
  packs.sort((a, b) => order.get(a.assessment) - order.get(b.assessment));

  const byRec = (r) => packs.filter((p) => p.recommendation === r);

  return {
    packs,
    ready: byRec('ready'),
    fixFirst: byRec('fix-first'),
    skip: byRec('skip'),
    summary: {
      total: packs.length,
      ready: byRec('ready').length,
      fixFirst: byRec('fix-first').length,
      skipped: byRec('skip').length,
      totalGaps: packs.reduce((n, p) => n + (p.gapsToFill || 0), 0)
    },
    // One fix to the resume can move every job out of fix-first at once, so
    // it is worth doing before touching the queue.
    sharedResumeFixes: sharedFixes(packs)
  };
}

/**
 * Findings that apply to the resume itself rather than to one advertisement.
 * These are the highest-leverage work in the whole queue: fix once, and every
 * application improves.
 */
function sharedFixes(packs) {
  const counts = new Map();
  for (const p of packs) {
    if (!p.documents) continue;
    for (const f of p.documents.atsCheck.findings) {
      if (f.id === 'job-keyword-gap') continue; // per-advertisement, not shared
      const seen = counts.get(f.id) || { finding: f, jobs: 0 };
      seen.jobs += 1;
      counts.set(f.id, seen);
    }
  }
  return [...counts.values()]
    .filter((c) => c.jobs > 1)
    .sort((a, b) => b.jobs - a.jobs)
    .map((c) => ({ ...c.finding, affectsJobs: c.jobs }));
}

/**
 * Move an application along. Returns a new record rather than mutating, and
 * keeps the whole history — "when did I apply" is the question this answers.
 */
function transition(record, status, note) {
  if (STATUSES.indexOf(status) === -1) throw new Error('Unknown status: ' + status);
  const at = new Date().toISOString();
  return {
    ...record,
    status,
    updatedAt: at,
    history: (record.history || []).concat([{ status, at, note: note || null }])
  };
}

/** Applications that have gone quiet. Following up is the cheapest win there is. */
function needsFollowUp(records, days) {
  const cutoff = Date.now() - (days || 10) * 86400000;
  return (records || []).filter((r) => {
    if (r.status !== 'applied') return false;
    const t = Date.parse(r.updatedAt || '');
    return Number.isFinite(t) && t < cutoff;
  });
}

module.exports = {
  splitAdvertisements,
  parseAdvertisement,
  buildPack,
  buildQueue,
  sharedFixes,
  transition,
  needsFollowUp,
  STATUSES
};
