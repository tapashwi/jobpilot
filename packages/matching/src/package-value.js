/**
 * package-value.js — comparing an advertised salary against what you already
 * have, on the only basis that is honest: the whole package.
 *
 * WHY THIS EXISTS
 *
 * The naive comparison is advertised base against current base, and for
 * someone in the public or not-for-profit sector it is badly wrong in a
 * direction that costs money. A statutory or NFP employer typically offers:
 *
 *   - employer superannuation above the statutory minimum,
 *   - FBT-exempt salary packaging, which is paid from PRE-tax income and so
 *     is worth far more than its face value,
 *   - leave loading,
 *   - and more recreation leave than the private-sector standard.
 *
 * Salary packaging is the one that breaks intuition. Receiving $15,900 free
 * of tax is not worth $15,900 of salary — it is worth whatever gross salary
 * would leave you with $15,900 after tax, which at a 32% marginal rate is
 * about $23,400. Ignore that and a private offer that looks like a $20,000
 * raise can be a pay cut.
 *
 * So every number here is grossed up to a single comparable figure, and the
 * assumptions are parameters rather than constants, because they change with
 * the employer, the bracket and the financial year.
 *
 * NOTHING HERE IS TAX ADVICE. It is an apples-to-apples estimate for deciding
 * which advertisements are worth reading.
 */

/**
 * Defaults reflecting a Northern Territory public-sector-style package.
 *
 * Sources: NTPS Enterprise Agreement 2025-2029 for super and leave loading;
 * the FBT-exempt caps are the long-standing public-benevolent-institution and
 * health-promotion caps. Every one of these is overridable, and should be
 * checked against an actual payslip rather than trusted.
 */
const DEFAULTS = {
  superRate: 0.12,           // 12% employer contribution
  leaveLoadingRate: 0.175,   // 17.5%, paid on four weeks
  leaveLoadingWeeks: 4,
  packagingCapGeneral: 15900,
  packagingCapMeals: 2650,
  marginalRate: 0.32,        // 30% bracket + 2% Medicare levy
};

// Named toNumber, not num, because match.js already declares a `num` at the
// top level and scripts/build-engine.js concatenates every module into ONE
// shared scope. Two top-level `const num` declarations is a syntax error that
// takes the whole browser app down on load — the exact failure the build
// script's header warns about. The build now refuses to emit on a collision,
// so this comment is a reminder rather than the only defence.
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * What salary packaging is really worth, expressed as the gross salary that
 * would leave you with the same amount after tax.
 *
 * This is the number people leave out, and it is usually the largest single
 * component after base and super.
 */
function packagingGrossEquivalent(opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const taxFree = (toNumber(o.packagingCapGeneral) || 0) + (toNumber(o.packagingCapMeals) || 0);
  const rate = toNumber(o.marginalRate);
  if (!taxFree) return 0;
  // A marginal rate of 1 or more would divide by zero or flip the sign; treat
  // an implausible rate as "no gross-up" rather than returning nonsense.
  if (rate === null || rate <= 0 || rate >= 1) return taxFree;
  return Math.round(taxFree / (1 - rate));
}

/**
 * The full value of a package, itemised.
 *
 * Returns the breakdown as well as the total, because a single number nobody
 * can decompose is a number nobody should act on.
 */
function effectivePackage(base, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const b = toNumber(base);
  if (b === null || b <= 0) return null;

  const superannuation = Math.round(b * (toNumber(o.superRate) || 0));
  const leaveLoading = Math.round(
    b * (toNumber(o.leaveLoadingRate) || 0) * ((toNumber(o.leaveLoadingWeeks) || 0) / 52),
  );
  const packaging = o.packagingAvailable === false ? 0 : packagingGrossEquivalent(o);

  return {
    base: b,
    superannuation,
    leaveLoading,
    packaging,
    total: b + superannuation + leaveLoading + packaging,
  };
}

/**
 * What an advertisement is worth on the same basis.
 *
 * `imputed` is the important field. Most ads quote base only, so super has to
 * be assumed — and an assumption folded silently into a comparison is how a
 * tool tells you a job is better than it is. Callers are expected to show it.
 */
function advertisedValue(job, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const j = job || {};
  // Prefer the top of an advertised range: it is what the employer says is
  // reachable, and the bottom is usually for a less experienced candidate.
  const stated = toNumber(j.salaryMax) !== null ? toNumber(j.salaryMax) : toNumber(j.salaryMin);
  if (stated === null || stated <= 0) {
    return { stated: null, total: null, imputed: [], unknown: true };
  }

  const imputed = [];
  let superannuation;
  if (j.superIncluded === true) {
    superannuation = 0; // already inside the quoted figure
  } else {
    superannuation = Math.round(stated * (toNumber(o.superRate) || 0));
    imputed.push(`super at ${Math.round((toNumber(o.superRate) || 0) * 100)}% (the ad did not say)`);
  }

  // Private employers are not FBT-exempt, so no packaging is assumed. Saying
  // so explicitly matters: its ABSENCE is most of the gap being measured.
  return {
    stated,
    superannuation,
    packaging: 0,
    total: stated + superannuation,
    imputed,
    unknown: false,
  };
}

/**
 * Words that mean the role is a security role.
 *
 * Deliberately broad on the discipline and narrow on the false friends:
 * "security guard", "security clearance" as a requirement on a non-security
 * job, and "social security" all match a naive substring check for "security".
 */
const SECURITY_TERMS = [
  'security analyst', 'security engineer', 'security operations', 'soc analyst',
  'cyber security', 'cybersecurity', 'information security', 'infosec',
  'incident response', 'threat', 'vulnerability', 'penetration test', 'pentest',
  'red team', 'blue team', 'purple team', 'siem', 'sentinel', 'defender',
  'grc', 'governance risk', 'iso 27001', 'essential eight', 'ism ', 'ceh',
  'identity and access', 'iam ', 'privileged access', 'pam ',
  'security consultant', 'security specialist', 'security architect',
  'malware', 'forensic', 'cryptograph',
  // Added after a live run dropped real roles: "Senior DevSecOps Engineer"
  // matched nothing at all, because the list had no term for it.
  'devsecops', 'appsec', 'application security', 'cloud security',
  'network security', 'zero trust', 'edr', 'xdr', 'soar', 'cissp', 'oscp',
];

const SECURITY_FALSE_FRIENDS = [
  'security guard', 'security officer', 'social security', 'security licence',
  'security license', 'securities',
];

/**
 * Titles that are not engineering roles, whatever the employer sells.
 *
 * Found by running this against real boards: KnowBe4, Ping Identity and
 * Tenable are security vendors, so EVERY posting they publish mentions
 * security repeatedly — and the two-signal body rule happily returned
 * "Account Executive (Mid-Market)" and "Director, Sales (Middle East)" as
 * cybersecurity jobs.
 *
 * The body cannot distinguish these, because the body is genuinely full of
 * security language. The title can, so the title is where this is decided.
 */
const NON_PRACTITIONER_TITLES = [
  'account executive', 'account manager', 'sales', 'business development',
  'partner manager', 'channel manager', 'customer success', 'recruiter',
  'talent acquisition', 'marketing', 'copywriter', 'content strategist',
  'product marketing', 'community manager', 'sales development',
  // Pre-sales, found in the second live run. "Solutions Architect" at a
  // security vendor is a pre-sales title, and Elastic and NICE both returned
  // them as security roles. Note this deliberately does NOT block "Security
  // Architect", which is a real practitioner role and has no "solutions".
  'solutions architect', 'solution architect', 'presales', 'pre-sales',
  'solutions consultant', 'solutions engineer', 'sales engineer',
];

/**
 * Postings that are not vacancies.
 *
 * The second live run surfaced "Don't see your role — Apply here" from a
 * talent pool. It is a real posting on a real board and there is no job in
 * it, so it cannot be applied to and should never reach a queue.
 */
const NOT_A_VACANCY = [
  "don't see your role", 'dont see your role', 'see your role',
  'general application', 'spontaneous application', 'open application',
  'talent pool', 'talent community', 'future opportunit',
  'expression of interest', 'register your interest', 'speculative',
];

/**
 * Titles that name a DIFFERENT technical discipline.
 *
 * These are practitioners, just not security ones, and the body rule cannot
 * tell them apart: NICE and Elastic sell security software, so their
 * "Software Architect" ads are full of security language and matched two
 * body terms easily.
 *
 * Checked AFTER the title's own security terms, so "Security Software
 * Engineer" still matches on "security engineer" and only an unqualified
 * "Software Engineer" is excluded. "IT Support" is deliberately absent —
 * a support role whose body is genuinely security work is exactly the
 * sideways move this profile is looking for.
 */
const OTHER_DISCIPLINE_TITLES = [
  'software architect', 'software developer', 'software engineer',
  'frontend', 'front-end', 'backend', 'back-end', 'full stack', 'fullstack',
  'data engineer', 'data scientist', 'machine learning', 'mobile developer',
  'product manager', 'project manager', 'scrum master', 'designer',
  'ux researcher', 'technical writer', 'accountant', 'controller',
];

/** Repair UTF-8 that was decoded as Latin-1 somewhere upstream. */
function fixMojibake(s) {
  const t = String(s || '');
  if (!/[ÃÂâ][-¿–-„]/.test(t)) return t;
  try {
    return Buffer.from(t, 'latin1').toString('utf8');
  } catch {
    return t;
  }
}

/** Is this a security role, rather than a role that merely says "security"? */
function isSecurityRole(job) {
  const j = job || {};
  // "&" is written for "and" in titles constantly — "Identity & Access
  // Management Engineer" is a real security role that matched nothing until
  // this normalisation existed.
  const norm = (s) => fixMojibake(s).toLowerCase().replace(/\s*&\s*/g, ' and ');
  const title = norm(j.title);
  const haystack = [
    title,
    norm(j.adText),
    norm((j.requiredSkills || []).join(" ")),
    norm((j.preferredSkills || []).join(" ")),
  ].join(' ');

  // A talent-pool posting is not a job, whatever discipline it names.
  if (NOT_A_VACANCY.some((t) => title.includes(t))) return false;

  // A sales or recruiting title is never a practitioner role, and this has to
  // be checked BEFORE the strong-term match: "Security Sales Specialist"
  // contains "security specialist" and is still a sales job.
  if (NON_PRACTITIONER_TITLES.some((t) => title.includes(t))) return false;

  // Order matters, and getting it backwards was a real bug: "security officer"
  // is a false friend (a guard), but "Information Security Officer" is a real
  // security role that contains it. So a strong term in the title wins FIRST,
  // and only a title with no strong term is tested against the false friends.
  if (SECURITY_TERMS.some((t) => title.includes(t))) return true;

  // A false friend in the TITLE now settles it — a security guard vacancy is
  // not a cybersecurity job however often the body says "security".
  if (SECURITY_FALSE_FRIENDS.some((t) => title.includes(t))) return false;

  // "Security Software Engineer" carries none of the compound terms above —
  // "security engineer" is not a substring of it — so a standalone security
  // word in the title is its own signal. Placed AFTER the false friends so
  // "Security Guard" is already gone by here.
  if (/\b(security|cyber|cybersecurity|infosec)\b/.test(title)) return true;

  // A title naming another discipline settles it. Reached only when the title
  // carries no security signal at all.
  if (OTHER_DISCIPLINE_TITLES.some((t) => title.includes(t))) return false;

  // In the body, require two distinct terms. One mention of "threat" in a
  // generic IT support ad is not a security role.
  const hits = SECURITY_TERMS.filter((t) => haystack.includes(t));
  return hits.length >= 2;
}

/**
 * Is this job somewhere the candidate can actually take it?
 *
 * Added after the first live run returned Saarbrücken, München, Berlin and
 * London to someone in Darwin. There was no location gate at all, so every
 * European board matched on discipline and the list was mostly noise.
 *
 * `countries` is the list of country names and codes that count as home;
 * anything explicitly remote passes regardless. A job with NO stated location
 * passes too — refusing those would drop real local ads that simply omit it,
 * and the arms below still have to be satisfied.
 */
const REMOTE_WORDS = ['remote', 'work from home', 'anywhere', 'distributed'];

const AU_PLACES = [
  'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'hobart',
  'darwin', 'nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt',
  'gold coast', 'newcastle', 'wollongong', 'geelong', 'cairns', 'townsville',
  'alice springs', 'palmerston', 'katherine',
];

/** Cities the candidate can reach without moving house, keyed by home city. */
const COMMUTE_ZONES = {
  darwin: ['darwin', 'palmerston', 'nt', 'northern territory'],
  sydney: ['sydney', 'nsw', 'new south wales', 'parramatta', 'newcastle', 'wollongong'],
  melbourne: ['melbourne', 'vic', 'victoria', 'geelong'],
  brisbane: ['brisbane', 'qld', 'queensland', 'gold coast', 'ipswich'],
  perth: ['perth', 'wa', 'western australia', 'fremantle'],
  adelaide: ['adelaide', 'sa', 'south australia'],
  canberra: ['canberra', 'act'],
  hobart: ['hobart', 'tas', 'tasmania'],
};

/** Does the posting say you have to be in the office, at least sometimes? */
function requiresPresence(job) {
  const j = job || {};
  const text = `${j.location || ''} ${j.workArrangement || ''} ${j.adText || ''}`.toLowerCase();
  if (/\bhybrid\b/.test(text)) return true;
  if (/\b(on-?site|in[- ]office|in the office)\b/.test(text)) return true;
  if (/\b\d\s*days?\s*(a|per)\s*week\b/.test(text)) return true;
  return false;
}

function isFullyRemote(job) {
  const j = job || {};
  const loc = String(j.location || '').toLowerCase();
  const arrangement = String(j.workArrangement || '').toLowerCase();
  if (!REMOTE_WORDS.some((w) => loc.includes(w) || arrangement.includes(w))) return false;
  // "Remote (hybrid, 2 days in Melbourne)" is not remote. Presence wins.
  return !requiresPresence(j);
}

/**
 * Is the job in a country the candidate can work in?
 *
 * This is the coarse filter. It answers "is this the right country", and
 * deliberately NOT "can you get to the office" — see reachability() for that,
 * and read the comment there before assuming this is enough.
 */
function isReachable(job, opts = {}) {
  const j = job || {};
  const countries = (opts.countries || ['australia', 'au', 'aus']).map((c) => c.toLowerCase());
  const loc = String(j.location || '').toLowerCase();
  const arrangement = String(j.workArrangement || '').toLowerCase();

  if (REMOTE_WORDS.some((w) => loc.includes(w) || arrangement.includes(w))) return true;
  if (!loc.trim()) return true; // unstated: let the other gates decide
  if (countries.some((c) => loc.includes(c))) return true;

  const places = opts.places || AU_PLACES;
  return places.some((p) => new RegExp(`\\b${p}\\b`).test(loc));
}

/**
 * Can the candidate actually take this job, and if not, what would it cost?
 *
 * WHY THIS IS SEPARATE FROM isReachable (2026-09-06)
 *
 * The first version had only the country check, and it passed a Melbourne
 * role to someone in Darwin because Melbourne is in Australia. The role was
 * hybrid, two days a week in the office. That is a relocation, not a commute,
 * and 3,000 km is not a detail the reader should have to notice for
 * themselves in the ad.
 *
 * It does NOT drop those jobs. An interstate role may be exactly what someone
 * wants, and a tool that silently hides them is as unhelpful as one that
 * silently pretends they are local. It labels them instead:
 *
 *   'local'      same commute zone, or no presence required
 *   'remote'     fully remote and stays that way
 *   'relocation' another city AND the posting requires presence
 *   'unstated'   nothing said about location; nothing claimed either
 */
function reachability(job, opts = {}) {
  const j = job || {};
  const home = String(opts.homeCity || '').toLowerCase().trim();
  const loc = String(j.location || '').toLowerCase();

  if (!isReachable(j, opts)) {
    return { kind: 'out-of-country', ok: false, note: 'Outside the countries you can work in.' };
  }
  if (isFullyRemote(j)) {
    return { kind: 'remote', ok: true, note: 'Fully remote.' };
  }
  if (!loc.trim()) {
    return { kind: 'unstated', ok: true, note: 'No location stated; check before applying.' };
  }
  if (!home) {
    // Without a home city there is nothing to compare against, so claiming
    // "local" would be an invention. Say what is known and no more.
    return { kind: 'unstated', ok: true, note: 'No home city set, so distance was not checked.' };
  }

  const zone = COMMUTE_ZONES[home] || [home];
  if (zone.some((z) => loc.includes(z))) {
    return { kind: 'local', ok: true, note: 'Within your commute zone.' };
  }
  if (requiresPresence(j)) {
    return {
      kind: 'relocation',
      ok: true,
      note: `Requires being in the office, and it is in ${j.location} — not commutable from ${opts.homeCity}. This is a move, not a commute.`,
    };
  }
  return {
    kind: 'unstated',
    ok: true,
    note: `Listed in ${j.location}, but the posting does not say you must be on site. Worth asking.`,
  };
}

/**
 * The campaign rule: surface a job for EITHER of two independent reasons.
 *
 * This is a union, not an intersection, and reading it the other way would
 * silently drop most of what was asked for. The two arms are:
 *
 *   1. it is a security role, at or near current pay — the deliberate career
 *      move, where a sideways step in money is the point;
 *   2. it pays more than the current package on a like-for-like basis —
 *      whatever the discipline.
 *
 * Returns null when neither arm matches, so a falsy result means "do not
 * surface" and a truthy one carries the reason to show the user.
 */
function campaignReason(profile, job, opts = {}) {
  const p = profile || {};
  const current = effectivePackage(p.currentBase, { ...opts, ...(p.packageOptions || {}) });
  const ad = advertisedValue(job, opts);
  const security = isSecurityRole(job);

  // Geography before anything else. A perfect security role in Munich is not
  // a match for someone in Darwin, and surfacing it wastes the reader's time
  // more thoroughly than a missing job does.
  //
  // Interstate is different from foreign, though, and the difference is the
  // user's to weigh: a Melbourne hybrid role is a real job that costs a house
  // move. It is surfaced WITH that label rather than dropped or, worse,
  // presented as if it were down the road.
  const where = reachability(job, { ...opts, homeCity: opts.homeCity || p.homeCity });
  if (!where.ok) return null;

  // How far below the current package a security role may sit and still be
  // worth surfacing. A career change is allowed to cost something; the
  // default says "up to 10% down", and it is a parameter, not a constant.
  const tolerance = opts.securityPayTolerance !== undefined ? opts.securityPayTolerance : 0.10;

  if (security) {
    if (!current || ad.unknown) {
      return { arm: 'security', reason: 'Security role', detail: 'Pay not stated; surfaced on discipline alone.', where };
    }
    const floor = current.total * (1 - tolerance);
    if (ad.total >= floor) {
      return {
        arm: 'security',
        reason: 'Security role within pay tolerance',
        detail: `Worth about ${ad.total.toLocaleString()} against your ${current.total.toLocaleString()}.`,
        advertised: ad,
        current,
        where,
      };
    }
    return null;
  }

  if (!current) return null;
  if (ad.unknown) return null;
  if (ad.total > current.total) {
    return {
      arm: 'pay',
      reason: 'Pays more than your current package',
      detail: `About ${(ad.total - current.total).toLocaleString()} better on a like-for-like basis.`,
      advertised: ad,
      current,
      where,
    };
  }
  return null;
}

module.exports = {
  DEFAULTS,
  packagingGrossEquivalent,
  effectivePackage,
  advertisedValue,
  isSecurityRole,
  isReachable,
  reachability,
  requiresPresence,
  isFullyRemote,
  COMMUTE_ZONES,
  fixMojibake,
  campaignReason,
  SECURITY_TERMS,
  NON_PRACTITIONER_TITLES,
  NOT_A_VACANCY,
  OTHER_DISCIPLINE_TITLES,
};
