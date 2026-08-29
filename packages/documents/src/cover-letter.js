/**
 * cover-letter.js — assemble a tailored cover letter from the applicant's own
 * resume, with every claim traceable to the line it came from.
 *
 * WHY THERE IS NO MODEL HERE
 *
 * A language model writes a fluent cover letter instantly, and that is the
 * problem: fluent, generic, and indistinguishable from the other four hundred
 * the recruiter received, because they were produced by the same model from
 * the same advertisement. Worse, it invents. "I led the migration of a
 * monolith to microservices" is a sentence a model will happily produce for
 * someone who has never done it, and the applicant finds out in the interview.
 *
 * So this assembles rather than writes. It selects the applicant's real
 * achievements, matches them to what the advertisement asks for, and arranges
 * them. The prose scaffolding is fixed and deliberately plain; the content is
 * entirely theirs. Where it has nothing, it leaves a marked blank instead of
 * filling it.
 *
 * The output is a strong draft that needs a human pass — which is the honest
 * ceiling for this problem, and better than a polished draft that is not true.
 */

const { evidenceFor, strongest, GAP } = require('./evidence');
const { canonicalise, ALIASES } = require('../../matching/src/skills');

function titleCase(s) {
  return String(s || '').replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** A readable list: "a, b and c". */
function list(items) {
  const a = (items || []).filter(Boolean);
  if (!a.length) return '';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
}

/** Trim a resume bullet into something that reads inside a sentence. */
function asClause(text) {
  let t = String(text || '').trim().replace(/[.;]+$/, '');
  t = t.replace(/^(I\s+|We\s+)/i, '');
  // Bullets are usually written in past tense already; lower-case the first
  // letter unless it is an acronym or proper noun.
  if (/^[A-Z][a-z]/.test(t)) t = t[0].toLowerCase() + t.slice(1);
  return t;
}

/**
 * Build the letter.
 *
 * profile: { name, email, phone, resumeText, yearsExperience }
 * job:     { title, company, requiredSkills, preferredSkills, adText, hiringManager }
 * opts:    { tone: 'plain'|'warm'|'formal', maxEvidence: 3 }
 */
function coverLetter(profile, job, opts) {
  const p = profile || {};
  const j = job || {};
  const o = opts || {};
  const tone = o.tone || 'plain';
  const maxEvidence = o.maxEvidence || 3;

  const role = j.title || GAP('role title');
  const company = j.company || GAP('company name');
  const required = (j.requiredSkills || []).map(canonicalise);
  const preferred = (j.preferredSkills || []).map(canonicalise);

  // Canonical names are for matching, not for reading. The alias dictionary
  // resolves "Splunk" to the canonical "siem", and a letter that says "the
  // advertisement asks for Siem" when the advertisement said Splunk is both
  // wrong and obviously machine-written. Keep what the ad actually called it.
  const display = new Map();
  for (const raw of (j.requiredSkills || []).concat(j.preferredSkills || [])) {
    const c = canonicalise(raw);
    const surface = String(raw).trim();
    // Only useful if the caller passed the ad's own wording. The app passes
    // the output of parseJobSkills(), which is already canonical, so this
    // resolves "siem" to "siem" and the fix would quietly do nothing.
    if (!display.has(c) && canonicalise(surface) === c && surface.toLowerCase() !== c) {
      display.set(c, surface);
    }
  }

  /**
   * Recover the word the advertisement actually used.
   *
   * The alias dictionary maps "Splunk" to the canonical "siem", and a letter
   * that says "the advertisement asks for Siem" when the advertisement said
   * Splunk is both wrong and obviously machine-written. So when the caller
   * hands over canonical names, go back to the ad text and find whichever
   * form of this skill is really written there.
   */
  const fromAd = (canonical) => {
    if (!j.adText) return null;
    const forms = [canonical].concat(ALIASES[canonical] || []);
    // Longest first: prefer "amazon web services" over "aws" when both appear.
    forms.sort((a, b) => b.length - a.length);
    for (const f of forms) {
      const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = j.adText.match(new RegExp('(?<![a-z0-9+#])' + esc + '(?![a-z0-9+#])', 'i'));
      if (m) return m[0];
    }
    return null;
  };

  const label = (canonical) => display.get(canonical) || fromAd(canonical) || titleCase(canonical);

  const ev = evidenceFor(p.resumeText, required.concat(preferred));
  const backed = ev.filter((e) => e.hasEvidence);
  const unbacked = ev.filter((e) => !e.hasEvidence && required.indexOf(e.skill) !== -1);

  // Lead with quantified evidence for required skills; those are the sentences
  // that answer "can you do the job" rather than "have you heard of it".
  const lead = backed
    .filter((e) => required.indexOf(e.skill) !== -1)
    .sort((a, b) => (b.quantified - a.quantified) || (b.score - a.score))
    .slice(0, maxEvidence);

  const fallback = lead.length ? [] : strongest(p.resumeText, maxEvidence).map((s) => ({
    skill: s.skills[0], text: s.text, quantified: s.quantified, hasEvidence: true, score: 0
  }));
  const body = lead.length ? lead : fallback;

  const greeting = j.hiringManager
    ? `Dear ${j.hiringManager},`
    : tone === 'formal'
      ? 'Dear Hiring Manager,'
      : 'Hello,';

  const years = Number(p.yearsExperience);
  const opener = (() => {
    const stem = `I am writing to apply for the ${role} position at ${company}.`;
    if (Number.isFinite(years) && years > 0) {
      const covered = body.map((e) => e.skill).filter(Boolean);
      return covered.length
        ? `${stem} I have ${years} year${years === 1 ? '' : 's'} of experience, most of it in ${list(covered.map(label))}.`
        : `${stem} I have ${years} year${years === 1 ? '' : 's'} of experience in the field.`;
    }
    return stem;
  })();

  const paragraphs = [];
  const sources = [];

  for (const e of body) {
    const clause = asClause(e.text);
    paragraphs.push(
      e.quantified
        ? `On ${label(e.skill)}: I ${clause}.`
        : `On ${label(e.skill)}: I ${clause}. ${GAP('add the scale or the outcome — how many, how much, how much faster')}`
    );
    sources.push({ skill: e.skill, quotedFrom: e.text, quantified: e.quantified });
  }

  if (!body.length) {
    paragraphs.push(
      GAP('no achievement in your resume mentions anything this advertisement asks for — ' +
        'either the resume is missing the work, or this job is not a match')
    );
  }

  // Naming a gap yourself is stronger than leaving it to be discovered, but
  // only when it is one gap. Several is a job you should probably skip.
  if (unbacked.length === 1) {
    paragraphs.push(
      `The advertisement asks for ${label(unbacked[0].skill)}, which my resume does not ` +
        `cover. ${GAP('one sentence: the closest thing you have done, or how quickly you have ' +
        'picked up something comparable')}`
    );
  } else if (unbacked.length > 1) {
    paragraphs.push(
      GAP(`${unbacked.length} required skills have no supporting achievement in your resume ` +
        `(${list(unbacked.map((u) => label(u.skill)))}). Addressing them all in a cover ` +
        'letter draws attention to the gap. Consider whether this application is worth sending')
    );
  }

  const why = j.company
    ? `${GAP(`why ${company} specifically — one concrete thing about them, not a compliment. ` +
        'This is the paragraph recruiters use to tell a tailored letter from a template')}`
    : GAP('why this employer specifically');
  paragraphs.push(why);

  const closer = tone === 'warm'
    ? 'I would genuinely like to talk about this one. Thank you for your time.'
    : tone === 'formal'
      ? 'I would welcome the opportunity to discuss my application further. Thank you for your consideration.'
      : 'I would be glad to talk it through. Thank you for reading.';

  const signoff = [
    tone === 'formal' ? 'Yours sincerely,' : 'Regards,',
    p.name || GAP('your name'),
    [p.email, p.phone].filter(Boolean).join('  •  ') || GAP('email and phone')
  ].join('\n');

  const text = [greeting, '', opener, '', ...paragraphs.map((x) => x + '\n'), closer, '', signoff]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const gaps = (text.match(/\[[^\]]+\]/g) || []).length;

  return {
    text,
    greeting,
    opener,
    paragraphs,
    closer,
    signoff,
    sources,
    gaps,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    // Stated plainly so no caller can present this as finished work.
    readiness: gaps === 0
      ? 'complete'
      : gaps <= 2
        ? 'draft — fill the marked blanks'
        : 'skeleton — several blanks need you before this is sendable',
    unbackedRequired: unbacked.map((u) => u.skill)
  };
}

module.exports = { coverLetter, asClause, list, GAP };
