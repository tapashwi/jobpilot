/**
 * fieldmap.js — decide what a form field is asking for, and what to put in it.
 *
 * THIS IS THE ENGINE THE WHOLE AUTO-APPLY RESTS ON.
 *
 * Every hands-off applier on the market has the same documented failure:
 * it fills fields with errors at scale. A wrong work-authorisation answer, a
 * mis-typed salary band, a yes that should have been a no — replicated across
 * forty applications before anyone notices, each one a silent knockout.
 *
 * That failure is not inevitable. It comes from mapping fields by guesswork
 * and never checking the result. So this module does three things differently:
 *
 *   1. It identifies a field from EVERY signal available — the associated
 *      <label>, aria-label, name, id, placeholder, and the surrounding text —
 *      and scores them, rather than pattern-matching one attribute.
 *   2. It returns a CONFIDENCE, and the runner refuses to fill low-confidence
 *      fields rather than guessing.
 *   3. It marks knockout fields. Those are never inferred, ever. If the user
 *      has not given an explicit answer, the application stops.
 *
 * A field this module cannot identify is reported as unknown. That is the
 * correct answer and it is what keeps the machine honest.
 */

/**
 * KNOCKOUT FIELDS.
 *
 * Answer one of these wrong and the application is dead before a human sees
 * it — most ATS treat them as auto-reject filters. They are never guessed,
 * never defaulted, and never inferred from the resume. The user sets them
 * once, explicitly, or the run stops.
 */
const KNOCKOUT = new Set([
  'workAuthorisation', 'visaSponsorship', 'salaryExpectation', 'noticePeriod',
  'rightToWork', 'securityClearance', 'driversLicence', 'willingToRelocate',
  'criminalRecord', 'referredBy', 'previouslyEmployed'
]);

/**
 * Field definitions. `patterns` are matched against the field's combined
 * signals; `weight` breaks ties when two definitions both match, so the more
 * specific one wins ("current salary" must not resolve to "salary expected").
 */
const FIELDS = [
  // --- identity -----------------------------------------------------------
  { key: 'firstName', weight: 10, patterns: [/\bfirst\s*name\b/, /\bgiven\s*name\b/, /^fname$/, /\bforename\b/] },
  { key: 'lastName', weight: 10, patterns: [/\blast\s*name\b/, /\bsurname\b/, /\bfamily\s*name\b/, /^lname$/] },
  { key: 'fullName', weight: 5, patterns: [/\bfull\s*name\b/, /^name$/, /\byour\s*name\b/, /\blegal\s*name\b/] },
  { key: 'preferredName', weight: 8, patterns: [/\bpreferred\s*name\b/, /\bnickname\b/, /\bgoes\s*by\b/] },
  { key: 'email', weight: 12, patterns: [/\be-?mail\b/, /\bemail\s*address\b/] },
  { key: 'phone', weight: 10, patterns: [/\bphone\b/, /\bmobile\b/, /\btelephone\b/, /\bcontact\s*number\b/] },

  // --- location -----------------------------------------------------------
  { key: 'addressLine1', weight: 9, patterns: [/\baddress\s*(line\s*)?1\b/, /\bstreet\s*address\b/, /^address$/] },
  { key: 'city', weight: 10, patterns: [/\bcity\b/, /\bsuburb\b/, /\btown\b/, /\blocality\b/] },
  { key: 'state', weight: 9, patterns: [/\bstate\b/, /\bprovince\b/, /\bregion\b/, /\bcounty\b/] },
  { key: 'postcode', weight: 10, patterns: [/\bpost\s*code\b/, /\bzip\b/, /\bpostal\s*code\b/] },
  { key: 'country', weight: 9, patterns: [/\bcountry\b/] },

  // --- links --------------------------------------------------------------
  { key: 'linkedin', weight: 12, patterns: [/\blinked\s*in\b/] },
  { key: 'github', weight: 12, patterns: [/\bgit\s*hub\b/] },
  { key: 'portfolio', weight: 8, patterns: [/\bportfolio\b/, /\bpersonal\s*(web)?site\b/, /\bwebsite\b/] },

  // --- documents ----------------------------------------------------------
  { key: 'resume', weight: 12, patterns: [/\bresume\b/, /\bcv\b/, /\bcurriculum\s*vitae\b/] },
  { key: 'coverLetter', weight: 12, patterns: [/\bcover\s*letter\b/, /\bmotivation\s*letter\b/] },

  // --- knockouts ----------------------------------------------------------
  // Ordered before the looser salary/experience patterns so the specific
  // wording wins.
  { key: 'workAuthorisation', weight: 20, knockout: true,
    patterns: [/\bwork\s*authorisation\b/, /\bwork\s*authorization\b/, /\blegally\s*(?:authoris|authoriz)ed\b/,
               /\beligible\s*to\s*work\b/, /\bright\s*to\s*work\b/, /\bwork\s*permit\b/] },
  { key: 'visaSponsorship', weight: 20, knockout: true,
    patterns: [/\bsponsorship\b/, /\bvisa\s*support\b/, /\brequire\s*sponsorship\b/, /\bsponsor(ing)?\s*(a\s*)?visa\b/] },
  { key: 'salaryExpectation', weight: 18, knockout: true,
    patterns: [/\b(?:salary|compensation|remuneration)\s*(?:expectation|expected|requirement)/,
               /\bexpected\s*(?:salary|compensation|pay)\b/, /\bdesired\s*(?:salary|compensation)\b/] },
  { key: 'currentSalary', weight: 19,
    patterns: [/\bcurrent\s*(?:salary|compensation|pay)\b/, /\bpresent\s*salary\b/] },
  { key: 'noticePeriod', weight: 18, knockout: true,
    patterns: [/\bnotice\s*period\b/, /\bhow\s*soon\s*can\s*you\s*start\b/, /\bavailab(?:le|ility)\s*(?:to\s*)?start\b/,
               /\bstart\s*date\b/] },
  { key: 'securityClearance', weight: 20, knockout: true,
    patterns: [/\bsecurity\s*clearance\b/, /\bbaseline\s*clearance\b/, /\bnv1\b/, /\bnegative\s*vetting\b/] },
  { key: 'driversLicence', weight: 18, knockout: true,
    patterns: [/\bdriver'?s?\s*licen[cs]e\b/, /\bvalid\s*licen[cs]e\b/] },
  { key: 'willingToRelocate', weight: 18, knockout: true,
    patterns: [/\brelocat(?:e|ion)\b/, /\bwilling\s*to\s*move\b/] },
  { key: 'criminalRecord', weight: 20, knockout: true,
    patterns: [/\bcriminal\s*(?:record|history|conviction)\b/, /\bpolice\s*check\b/, /\bbackground\s*check\b/] },
  { key: 'referredBy', weight: 15, knockout: true,
    patterns: [/\breferred\s*by\b/, /\bhow\s*did\s*you\s*hear\b/, /\breferral\s*source\b/] },
  { key: 'previouslyEmployed', weight: 18, knockout: true,
    patterns: [/\bpreviously\s*(?:employed|worked)\b/, /\bformer\s*employee\b/, /\bworked\s*(?:here|for\s*us)\b/] },

  // --- experience ---------------------------------------------------------
  { key: 'yearsExperience', weight: 12,
    patterns: [/\byears\s*of\s*experience\b/, /\bhow\s*many\s*years\b/, /\bexperience\s*\(years\)/] },

  // --- equal opportunity --------------------------------------------------
  // Identified so it can be deliberately SKIPPED, not filled. These are
  // voluntary and legally sensitive, and a bot answering them for someone is
  // the wrong default in every jurisdiction.
  { key: 'eeoGender', weight: 20, voluntary: true, patterns: [/\bgender\b/, /\bsex\b/] },
  { key: 'eeoRace', weight: 20, voluntary: true, patterns: [/\brace\b/, /\bethnic(?:ity)?\b/] },
  { key: 'eeoDisability', weight: 20, voluntary: true, patterns: [/\bdisabilit(?:y|ies)\b/] },
  { key: 'eeoVeteran', weight: 20, voluntary: true, patterns: [/\bveteran\b/, /\bmilitary\s*service\b/] },
  { key: 'eeoIndigenous', weight: 20, voluntary: true,
    patterns: [/\baboriginal\b/, /\btorres\s*strait\b/, /\bindigenous\b/, /\bfirst\s*nations\b/] }
];

/** Never touched, whatever the labels say. */
const NEVER_FILL = [
  { key: 'password', patterns: [/\bpassword\b/, /\bpasscode\b/] },
  { key: 'payment', patterns: [/\bcard\s*number\b/, /\bcvv\b/, /\bcredit\s*card\b/, /\biban\b/, /\bbsb\b/, /\baccount\s*number\b/] },
  { key: 'government-id', patterns: [/\bssn\b/, /\bsocial\s*security\b/, /\btax\s*file\s*number\b/, /\btfn\b/, /\bpassport\s*number\b/] },
  { key: 'captcha', patterns: [/\bcaptcha\b/, /\brecaptcha\b/, /\bare\s*you\s*(?:a\s*)?human\b/] }
];

function normaliseLabel(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Every signal a field carries about what it wants.
 *
 * Taking all of them, rather than one, is what makes this work across ATS
 * platforms that each expose a different subset: Greenhouse gives clean
 * labels, Workday leans on aria-label, older systems have nothing but a
 * cryptic `name`.
 */
function signals(field) {
  const f = field || {};
  return [f.label, f.ariaLabel, f.name, f.id, f.placeholder, f.title, f.nearbyText]
    .filter(Boolean).map(normaliseLabel);
}

/**
 * Identify one field.
 *
 * Returns { key, confidence, knockout, voluntary, matchedOn } — or a key of
 * null when nothing matched well enough, which is a real answer and not a
 * failure.
 */
function identify(field) {
  const sig = signals(field);
  if (!sig.length) return { key: null, confidence: 0, reason: 'the field carries no label, name, id or placeholder' };

  const type = normaliseLabel((field || {}).type);
  if (type === 'password') {
    return { key: null, confidence: 1, refuse: 'password', reason: 'password fields are never filled' };
  }

  for (const n of NEVER_FILL) {
    for (const s of sig) {
      if (n.patterns.some((p) => p.test(s))) {
        return { key: null, confidence: 1, refuse: n.key,
          reason: `looks like a ${n.key} field, which is never filled automatically` };
      }
    }
  }

  let best = null;
  for (const def of FIELDS) {
    for (let i = 0; i < sig.length; i++) {
      const s = sig[i];
      if (!def.patterns.some((p) => p.test(s))) continue;
      // A hit on the visible label beats a hit on a machine name: labels are
      // what the human reading the form sees, and are far less likely to be
      // reused for something else.
      const positionBonus = i === 0 ? 3 : i === 1 ? 2 : 0;
      const score = def.weight + positionBonus;
      if (!best || score > best.score) {
        best = { key: def.key, score, knockout: !!def.knockout, voluntary: !!def.voluntary, matchedOn: sig[i] };
      }
    }
  }

  if (!best) {
    return { key: null, confidence: 0,
      reason: `no rule matched "${sig[0]}" — this field needs a human, or an answer-bank entry` };
  }

  // Confidence is the score normalised against the strongest possible match.
  const confidence = Math.min(1, best.score / 23);
  return {
    key: best.key,
    confidence: Math.round(confidence * 100) / 100,
    knockout: best.knockout,
    voluntary: best.voluntary,
    matchedOn: best.matchedOn
  };
}

/**
 * What to put in an identified field, given a profile and an answer bank.
 *
 * The refusals here are the product. A knockout field with no explicit answer
 * returns a pause, not a guess — that single rule is the difference between
 * this and every tool whose reviews complain about mis-toggled work
 * authorisation across forty applications.
 */
function valueFor(id, profile, answers) {
  const p = profile || {};
  const a = answers || {};

  // Refusal is checked BEFORE the null-key case. Both have key === null, so
  // testing the key first swallowed every refusal and reported it as an
  // ordinary skip — losing the difference between "I could not identify this"
  // and "I will never touch this", which is exactly the distinction the audit
  // log exists to show.
  if (id && id.refuse) return { action: 'refuse', why: id.reason, refused: id.refuse };
  if (!id || !id.key) return { action: 'skip', why: (id && id.reason) || 'unidentified field' };

  if (id.voluntary) {
    return {
      action: 'skip',
      why: 'Equal-opportunity questions are voluntary and legally sensitive. A machine should ' +
        'not answer them on your behalf — fill these yourself if you want to.'
    };
  }

  if (id.knockout) {
    const explicit = a[id.key];
    if (explicit === undefined || explicit === null || explicit === '') {
      return {
        action: 'pause',
        why: `"${id.key}" is a knockout question — answered wrong, the application is rejected ` +
          'before a person sees it. There is no saved answer, and it will not be guessed.'
      };
    }
    return { action: 'fill', value: explicit, source: 'answer-bank', knockout: true };
  }

  if (id.confidence < 0.55) {
    return { action: 'pause', why: `not confident enough about this field (${id.confidence}) to fill it` };
  }

  const direct = {
    firstName: p.firstName || (p.name || '').split(/\s+/)[0],
    lastName: p.lastName || (p.name || '').split(/\s+/).slice(1).join(' '),
    fullName: p.name,
    preferredName: p.preferredName || p.firstName || (p.name || '').split(/\s+/)[0],
    email: p.email,
    phone: p.phone,
    addressLine1: p.addressLine1,
    city: p.city,
    state: p.state,
    postcode: p.postcode,
    country: p.country,
    linkedin: p.linkedin,
    github: p.github,
    portfolio: p.portfolio,
    yearsExperience: p.yearsExperience,
    currentSalary: a.currentSalary,
    resume: p.resumeFileName,
    coverLetter: p.coverLetterText
  }[id.key];

  if (direct === undefined || direct === null || direct === '') {
    return { action: 'pause', why: `nothing in your profile answers "${id.key}"` };
  }
  return { action: 'fill', value: String(direct), source: 'profile', knockout: false };
}

module.exports = { identify, valueFor, signals, normaliseLabel, FIELDS, KNOCKOUT, NEVER_FILL };
