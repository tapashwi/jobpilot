/**
 * ats-check.js — tell someone what an applicant tracking system will actually
 * do to their resume, and what it will fail to find.
 *
 * THE FRAMING THAT MAKES THIS HONEST
 *
 * We do not parse PDFs. That is deliberate and it is also the source of this
 * module's single best property: **the text the user pastes in is very close
 * to what an ATS extracts.** Both come from the same PDF text layer. So if the
 * pasted text has columns interleaved, dates detached from employers, or
 * bullet characters turned into mojibake, that is not a paste problem to
 * apologise for — it is a preview of the parse, and it is the most useful
 * thing we can show.
 *
 * That reframing means every check below runs on the thing that matters,
 * rather than on a guess about a file we never opened.
 *
 * WHAT THIS DELIBERATELY DOES NOT CLAIM
 *
 * There is no such thing as an "ATS score". Vendors do not publish one,
 * Workday and Greenhouse rank differently from each other, and most systems
 * do not auto-reject at all — a recruiter filters a search. Any tool showing
 * "your ATS score is 74" invented that number. So this returns findings with
 * severities and a plain count, never a score out of a hundred.
 */

const { extractSkills, canonicalise, normalise, ALIASES } = require('../../matching/src/skills');

/** Section headings an ATS looks for. Anything else is a heading it may ignore. */
const STANDARD_SECTIONS = {
  experience: ['experience', 'employment', 'work history', 'professional experience', 'career history', 'employment history'],
  education: ['education', 'qualifications', 'academic', 'academic background'],
  skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'competencies'],
  summary: ['summary', 'profile', 'objective', 'professional summary', 'about me', 'career summary']
};

/**
 * Headings people invent that read well to a human and mean nothing to a
 * parser looking for known labels.
 */
const CREATIVE_HEADINGS = [
  'what i bring', 'my journey', 'the story so far', 'where i have been',
  'things i am good at', 'my toolkit', 'superpowers', 'what drives me',
  'my impact', 'highlights reel'
];

/** Verbs that describe presence rather than contribution. */
const WEAK_OPENERS = [
  'responsible for', 'duties included', 'tasked with', 'helped with',
  'worked on', 'involved in', 'participated in', 'assisted with',
  'in charge of', 'my role was'
];

const CONTACT = {
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  // Deliberately loose: international formats vary wildly and a false
  // "you have no phone number" is worse than missing an odd one.
  phone: /(\+?\d[\d\s().-]{7,}\d)/,
  linkedin: /linkedin\.com\/in\/[a-z0-9-]+/i
};

/** A finding, in the shape every check returns. */
function finding(id, severity, title, detail, fix) {
  return { id, severity, title, detail, fix };
}

function lines(text) {
  return String(text || '').split(/\r?\n/);
}

function words(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean);
}

/**
 * Does this line look like a heading? Short, no terminal full stop, and
 * either title case or all caps.
 */
function looksLikeHeading(line) {
  const t = line.trim();
  if (!t || t.length > 60) return false;
  if (/[.!?,;]$/.test(t)) return false;
  return words(t).length <= 6;
}

function headings(text) {
  return lines(text).filter(looksLikeHeading).map((l) => l.trim());
}

/* ---------------------------------------------------------------- checks */

/**
 * Interleaved columns. A two-column resume extracts as alternating fragments.
 *
 * THIS CHECK IS DELIBERATELY HARD TO TRIGGER. It is the most alarming finding
 * the tool can report, so a false positive costs more than a miss: someone
 * told to rebuild a resume that was fine will distrust every other finding on
 * the page.
 *
 * The naive signal — "lots of short lines" — fires on every normal resume,
 * because headings, bullets and contact lines are all legitimately short. It
 * did exactly that on the first test case. So short lines are not the signal.
 *
 * The real signature of a broken reading order is a FRAGMENT: a line that is
 * short, is not a heading, is not a bullet, and does not finish a sentence —
 * because the rest of that sentence is physically in the other column. Those
 * are counted, and only those.
 */
function checkColumnDamage(text) {
  const all = lines(text).map((l) => l.trim()).filter(Boolean);
  // Too little text to distinguish a broken parse from a terse resume.
  if (all.length < 25) return null;

  const isBullet = (l) => /^[-•*●▪]/.test(l);
  const isContact = (l) => CONTACT.email.test(l) || CONTACT.phone.test(l) || CONTACT.linkedin.test(l);
  const endsCleanly = (l) => /[.!?:;,]$/.test(l);

  // Exclude only lines that are RECOGNISED section headings, not anything
  // heading-SHAPED. looksLikeHeading() accepts any short line without terminal
  // punctuation — which is the exact shape of the fragments being hunted, so
  // using it here excluded the evidence and the check could never fire.
  const KNOWN_HEADINGS = new Set(
    Object.values(STANDARD_SECTIONS).flat().concat(CREATIVE_HEADINGS, [
      'certifications', 'certification', 'projects', 'publications', 'awards',
      'references', 'interests', 'volunteering', 'languages', 'contact'
    ])
  );
  const isKnownHeading = (l) => KNOWN_HEADINGS.has(normalise(l));

  const candidates = all.filter((l) => !isKnownHeading(l) && !isBullet(l) && !isContact(l));
  if (candidates.length < 15) return null;

  const fragments = candidates.filter((l) => words(l).length <= 4 && !endsCleanly(l));
  const ratio = fragments.length / candidates.length;

  // Two independent conditions, both required.
  if (ratio < 0.45 || fragments.length < 10) return null;

  return finding(
    'column-damage',
    'critical',
    'This looks like it came out of a multi-column layout',
    `${fragments.length} of ${candidates.length} body lines are short fragments that do not ` +
      'finish a sentence. That is what happens when a parser reads a two-column page across ' +
      'instead of down: text from the sidebar lands in the middle of a sentence from the main ' +
      'column, and neither is readable afterwards.',
    'Rebuild the resume in a single column. This matters more than everything else on this ' +
      'list, because a scrambled parse loses information rather than merely presenting it ' +
      'badly — and nothing downstream can recover it.'
  );
}

function checkContact(text) {
  const out = [];
  if (!CONTACT.email.test(text)) {
    out.push(finding('no-email', 'critical', 'No email address found',
      'An email is the primary key in every applicant tracking system. If it is in a header ' +
        'or footer, most parsers never see it — headers and footers are outside the text flow.',
      'Put your email in the body of the first page, as plain text, not in a header.'));
  }
  if (!CONTACT.phone.test(text)) {
    out.push(finding('no-phone', 'warning', 'No phone number found',
      'Recruiters filter on having one, and some systems mark a record incomplete without it.',
      'Add it as plain digits in the body. Avoid rendering it inside an image or an icon font.'));
  }
  if (!CONTACT.linkedin.test(text)) {
    out.push(finding('no-linkedin', 'info', 'No LinkedIn URL found',
      'Not required, but it is the field recruiters click first when a resume is borderline.',
      'Add the full URL as text — a hyperlink behind the word "LinkedIn" extracts as the word.'));
  }
  return out;
}

/** Standard section headings. */
function checkSections(text) {
  const hs = headings(text).map((h) => normalise(h));
  const body = normalise(text);
  const out = [];

  for (const [key, labels] of Object.entries(STANDARD_SECTIONS)) {
    const found = labels.some((l) => hs.some((h) => h === l || h.startsWith(l)));
    if (found) continue;
    // A missing summary is a style choice; missing experience or education is not.
    const severity = key === 'summary' ? 'info' : key === 'skills' ? 'warning' : 'critical';
    out.push(finding(`no-section-${key}`, severity, `No "${labels[0]}" section heading`,
      `Parsers map content to fields by looking for known headings. Without one, everything ` +
        `under it is filed as unclassified text and stops matching a search for that field.`,
      `Use the plain word: "${labels.slice(0, 3).join('", "')}". Creative headings cost you the field.`));
  }

  const creative = hs.filter((h) => CREATIVE_HEADINGS.indexOf(h) !== -1);
  if (creative.length) {
    out.push(finding('creative-headings', 'warning', 'Headings a parser will not recognise',
      `Found: ${creative.join(', ')}. These read well to a person and are invisible to a keyword map.`,
      'Keep the personality in the sentences. Make the headings boring.'));
  }

  // A skills heading with nothing recognisable under it is worse than none.
  if (!out.some((f) => f.id === 'no-section-skills')) {
    const known = extractSkills(body);
    if (known.length < 3) {
      out.push(finding('thin-skills', 'warning', 'Very few recognisable skills',
        `Only ${known.length} skill${known.length === 1 ? '' : 's'} in the dictionary appeared anywhere in this resume.`,
        'Name the technologies explicitly. "Modern cloud tooling" matches no search; ' +
          '"AWS, Terraform, Kubernetes" matches three.'));
    }
  }
  return out;
}

/**
 * Acronym and expansion. Recruiters search for one or the other, and roughly
 * half search for the term the resume does not contain.
 */
function checkAcronyms(text) {
  const body = normalise(text);
  const missing = [];
  for (const canonical of Object.keys(ALIASES)) {
    if (canonical.startsWith('_')) continue;
    const aliases = ALIASES[canonical];
    // An acronym-shaped alias: short, and the canonical is a longer phrase.
    const acronyms = aliases.filter((a) => a.length <= 5 && /^[a-z0-9+#]+$/i.test(a));
    if (!acronyms.length) continue;
    if (canonical.split(' ').length < 2) continue;

    const hasLong = body.indexOf(normalise(canonical)) !== -1;
    const shortHit = acronyms.filter((a) => new RegExp(`(?<![a-z0-9])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i').test(body));
    if (shortHit.length && !hasLong) {
      missing.push({ have: shortHit[0], add: canonical });
    } else if (hasLong && !shortHit.length) {
      missing.push({ have: canonical, add: acronyms[0] });
    }
  }
  if (!missing.length) return null;
  const sample = missing.slice(0, 6);
  return finding('acronym-coverage', 'warning', 'Write the acronym and the full name once',
    'A keyword search matches the literal string. These appear in only one of their two forms: ' +
      sample.map((m) => `"${m.have}" without "${m.add}"`).join('; ') +
      (missing.length > sample.length ? `, and ${missing.length - sample.length} more` : ''),
    'Spell it out once with the acronym in brackets — "Amazon Web Services (AWS)" — then use ' +
      'whichever you like. One mention of each form covers both searches.');
}

/** Achievements that carry a number are the ones that survive a skim. */
function checkQuantification(text) {
  const bullets = lines(text).filter((l) => /^\s*[-•*•●]/.test(l));
  if (bullets.length < 3) return null;
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const ratio = withNumbers / bullets.length;
  if (ratio >= 0.35) return null;
  return finding('no-numbers', 'warning', 'Almost none of the bullets carry a number',
    `${withNumbers} of ${bullets.length} bullets contain a figure. Without one, a claim is a ` +
      'description of a job rather than evidence of doing it well.',
    'Add scale or outcome to the ones where you know it: how many, how much, how much faster, ' +
      'how many people. A range or an approximation is fine. Leave the rest alone rather than ' +
      'inventing figures.');
}

/** Bullets that open by describing a job description rather than a result. */
function checkWeakOpeners(text) {
  const body = normalise(text);
  const hits = WEAK_OPENERS.filter((w) => body.indexOf(w) !== -1);
  if (!hits.length) return null;
  return finding('weak-openers', 'info', 'Phrases that describe the role, not the work',
    `Found: ${hits.slice(0, 4).map((h) => `"${h}"`).join(', ')}. These come from the job ` +
      'description you were given, so every other applicant for that role has them too.',
    'Open with what you did: "Cut deployment time from 40 minutes to 6" rather than ' +
      '"Responsible for the deployment pipeline."');
}

/** Length, which matters mostly at the extremes. */
function checkLength(text) {
  const n = words(text).length;
  if (n < 200) {
    return finding('too-short', 'warning', `Only ${n} words`,
      'There is not enough here for a keyword search to match on, whatever the quality.',
      'Two pages is normal and safe for anything past a first job. One page is a constraint ' +
        'people impose on themselves that no ATS asks for.');
  }
  if (n > 1400) {
    return finding('too-long', 'info', `${n} words is long`,
      'Nothing will reject it, but a recruiter reads the top third and the parse quality of ' +
        'later pages tends to be worse.',
      'Move the oldest roles to one line each. Keep detail where it is recent and relevant.');
  }
  return null;
}

/** Characters that survive a PDF but not always a parser. */
function checkCharacters(text) {
  const bad = [];
  if (/[-]/.test(text)) bad.push('private-use icon glyphs (from an icon font)');
  if (/[�]/.test(text)) bad.push('replacement characters, meaning something already failed to decode');
  if (/\t{2,}/.test(text)) bad.push('runs of tabs, which usually indicate a table');
  if (!bad.length) return null;
  return finding('bad-characters', 'warning', 'Characters that will not survive extraction',
    `Found ${bad.join('; ')}.`,
    'Replace icon fonts with words, and rebuild tables as plain paragraphs or simple bullets.');
}

/**
 * Coverage of the words the job ad actually uses. This is the check that is
 * specific to one application rather than to the resume in general.
 */
function keywordCoverage(resumeText, jobText) {
  const inJob = extractSkills(jobText);
  const inResume = new Set(extractSkills(resumeText));
  const present = inJob.filter((s) => inResume.has(s));
  const absent = inJob.filter((s) => !inResume.has(s));
  return {
    total: inJob.length,
    present,
    absent,
    ratio: inJob.length ? present.length / inJob.length : null
  };
}

/**
 * Run everything.
 *
 * `jobText` is optional: without it you get the general checks, with it you
 * also get coverage against that specific advertisement.
 */
function checkResume(resumeText, jobText) {
  const text = String(resumeText || '');
  const findings = [];

  const push = (f) => {
    if (!f) return;
    if (Array.isArray(f)) findings.push(...f.filter(Boolean));
    else findings.push(f);
  };

  if (!text.trim()) {
    return {
      findings: [finding('empty', 'critical', 'No resume text', 'Nothing was provided to check.',
        'Paste the text of your resume. Select all in the PDF and copy — what you get is ' +
          'close to what the ATS gets, which is the point.')],
      counts: { critical: 1, warning: 0, info: 0 },
      coverage: null,
      checked: []
    };
  }

  push(checkColumnDamage(text));
  push(checkContact(text));
  push(checkSections(text));
  push(checkAcronyms(text));
  push(checkQuantification(text));
  push(checkWeakOpeners(text));
  push(checkLength(text));
  push(checkCharacters(text));

  const coverage = jobText ? keywordCoverage(text, jobText) : null;
  if (coverage && coverage.absent.length) {
    findings.push(finding('job-keyword-gap', coverage.ratio < 0.5 ? 'critical' : 'warning',
      `${coverage.absent.length} skill${coverage.absent.length === 1 ? '' : 's'} in the ad are not in your resume`,
      `The advertisement names ${coverage.total}; your resume contains ${coverage.present.length}. ` +
        `Missing: ${coverage.absent.join(', ')}.`,
      'Add only the ones you genuinely have, using the ad\'s own wording. If you have used ' +
        'it, name it — a skill you did not write down is a skill you do not have, as far as a ' +
        'search is concerned. Do not add the others; being caught out in the interview is worse ' +
        'than not being shortlisted.'));
  }

  const order = { critical: 0, warning: 1, info: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    findings,
    counts: {
      critical: findings.filter((f) => f.severity === 'critical').length,
      warning: findings.filter((f) => f.severity === 'warning').length,
      info: findings.filter((f) => f.severity === 'info').length
    },
    coverage,
    checked: [
      'column/reading-order damage', 'contact fields', 'standard section headings',
      'acronym and expansion coverage', 'quantified achievements', 'opening verbs',
      'length', 'characters that break extraction'
    ].concat(jobText ? ['keyword coverage against this advertisement'] : [])
  };
}

module.exports = {
  checkResume,
  keywordCoverage,
  headings,
  looksLikeHeading,
  STANDARD_SECTIONS,
  CREATIVE_HEADINGS,
  WEAK_OPENERS
};
