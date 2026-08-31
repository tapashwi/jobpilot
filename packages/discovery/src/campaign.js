/**
 * campaign.js — one search across many boards, gated, ranked, queued.
 *
 * This is the piece that makes the rest a machine rather than a set of tools.
 * A campaign is: what you are looking for, where to look, and what to do with
 * what comes back.
 *
 *   discover  →  gate  →  rank  →  queue  →  (the extension applies)
 *
 * THE ORDER IS THE PRODUCT. Every complaint about automated appliers is that
 * they apply first and filter never. Here the gate runs on every job before
 * anything is queued, so a run that finds four hundred vacancies and queues
 * eleven has done its job — the eleven are the ones worth an application.
 *
 * Nothing here touches a browser or sends anything. It produces a plan, and
 * the plan is inspectable before a single application is made.
 */

const { search } = require('./sources');
const { assess, rank } = require('../../matching/src/match');
const { parseJobSkills } = require('../../matching/src/skills');
const { jobKey } = require('../../autofill/src/runner');

/**
 * An email address advertised as the way to apply.
 *
 * Deliberately narrow. A job ad contains addresses that are not application
 * addresses — a privacy officer, a general enquiries line — and mailing those
 * an application is both useless and rude. An address only counts when the
 * surrounding words say to send an application to it.
 */
const APPLY_CONTEXT = /(appl(y|ications?)|send|forward|email|resume|cv|expressions? of interest|eoi)/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const NOT_APPLY = /(privacy|unsubscribe|noreply|no-reply|donotreply|abuse|legal|webmaster|postmaster)/i;

function applicationEmail(adText) {
  const text = String(adText || '');
  const found = [];
  let m;
  EMAIL_RE.lastIndex = 0;
  while ((m = EMAIL_RE.exec(text)) !== null) {
    const address = m[0];
    if (NOT_APPLY.test(address)) continue;
    // The sentence around it has to be about applying.
    const from = Math.max(0, m.index - 140);
    const context = text.slice(from, m.index + address.length + 60);
    if (!APPLY_CONTEXT.test(context)) continue;
    found.push({ address, context: context.replace(/\s+/g, ' ').trim() });
  }
  return found[0] || null;
}

/**
 * Turn a discovered job into something the gate can judge.
 *
 * The board listing rarely states the requirements — those are in the ad body
 * — so the skills are parsed out of whatever text came with it.
 */
function enrich(job) {
  const skills = parseJobSkills(job.adText || '');
  const email = applicationEmail(job.adText);
  const years = (() => {
    const m = String(job.adText || '').match(/(\d+)\s*\+?\s*(?:-|–|to)?\s*\d*\s*years?(?:['’]|\s+of)?\s+experience/i);
    return m ? Number(m[1]) : null;
  })();

  return {
    ...job,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
    minYearsExperience: years,
    applyVia: email ? 'email' : 'web',
    applyEmail: email ? email.address : null,
    applyEmailContext: email ? email.context : null
  };
}

/**
 * Run a campaign.
 *
 * `already` is the set of jobKeys applied to previously, so a campaign run
 * daily does not re-queue yesterday's applications.
 */
async function run(profile, config, options) {
  const c = config || {};
  const o = options || {};
  const already = new Set(o.already || []);

  const found = await search(c.sources || [], { ...o, query: c.query, where: c.where, ...c.credentials });

  const seen = new Set(already);
  const queued = [];
  const rejected = [];
  let duplicates = 0;

  for (const raw of found.jobs) {
    const job = enrich(raw);
    const key = jobKey(job);

    if (seen.has(key)) { duplicates += 1; continue; }
    seen.add(key);

    // Keyword filter first, if the campaign narrows by title. Cheaper than
    // the gate and it is what the user asked for.
    if (c.titleMustMatch && !new RegExp(c.titleMustMatch, 'i').test(job.title || '')) {
      rejected.push({ job, reason: `title does not match /${c.titleMustMatch}/` });
      continue;
    }
    if (c.excludeTitle && new RegExp(c.excludeTitle, 'i').test(job.title || '')) {
      rejected.push({ job, reason: `title matches the exclusion /${c.excludeTitle}/` });
      continue;
    }

    const assessment = assess(profile, job);
    if (!assessment.passed) {
      rejected.push({ job, key, assessment, reason: assessment.blockers.map((b) => b.reason).join('; ') });
      continue;
    }
    queued.push({ job, key, assessment });
  }

  // Best fit first, so a capped run spends its applications on the best jobs.
  const order = new Map(rank(queued.map((q) => q.assessment)).map((a, i) => [a, i]));
  queued.sort((a, b) => order.get(a.assessment) - order.get(b.assessment));

  const capped = c.dailyCap ? queued.slice(0, c.dailyCap) : queued;
  const deferred = c.dailyCap ? queued.slice(c.dailyCap) : [];

  return {
    queue: capped,
    deferred,
    rejected,
    sources: found.sources,
    summary: {
      discovered: found.jobs.length,
      duplicatesAcrossSources: found.duplicatesMerged,
      alreadyApplied: duplicates,
      rejected: rejected.length,
      queued: capped.length,
      deferredByCap: deferred.length,
      byEmail: capped.filter((q) => q.job.applyVia === 'email').length,
      byWeb: capped.filter((q) => q.job.applyVia === 'web').length
    },
    // The number that actually matters, said plainly.
    advice: capped.length
      ? `${found.jobs.length} vacancies found, ${capped.length} worth applying to. The other ` +
        `${rejected.length} failed a stated requirement — they are listed with the reason, not hidden.`
      : found.jobs.length
        ? `${found.jobs.length} vacancies found and none cleared your gates. Widen the search, or ` +
          'look at the rejection reasons — if they are all the same requirement, that is the thing to fix.'
        : 'No vacancies came back. Check the sources reported below; a per-employer board needs a ' +
          'company slug and an aggregator needs its key.'
  };
}

/**
 * The email application for one queued job.
 *
 * Returns a draft. It does NOT send: sending on someone's behalf needs their
 * mail credentials, and a tool that can silently mail hundreds of employers is
 * a spam cannon whatever its intent. The draft goes to their mail client, from
 * their own address, and they press send — which is also what makes the reply
 * land in their inbox rather than nowhere.
 */
function emailDraft(profile, job, coverLetterText) {
  if (!job.applyEmail) return null;
  const p = profile || {};
  const subject = `Application — ${job.title || 'your advertised role'}` +
    (p.name ? ` — ${p.name}` : '');

  const body = [
    'Hello,',
    '',
    `I am applying for the ${job.title || 'advertised role'}` +
      (job.company ? ` at ${job.company}` : '') + '.',
    '',
    coverLetterText || '[paste your cover letter here]',
    '',
    'My resume is attached.',
    '',
    'Regards,',
    p.name || '[your name]',
    [p.email, p.phone].filter(Boolean).join('  •  ')
  ].join('\n');

  return {
    to: job.applyEmail,
    subject,
    body,
    // Opening the user's own mail client, so the message is genuinely from
    // them and the attachment is added by them.
    mailto: `mailto:${encodeURIComponent(job.applyEmail)}` +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    reminder: 'Attach your resume before sending — a mailto link cannot carry an attachment, ' +
      'and an application email without one is deleted unread.',
    foundBecause: job.applyEmailContext
  };
}

module.exports = { run, enrich, applicationEmail, emailDraft };
