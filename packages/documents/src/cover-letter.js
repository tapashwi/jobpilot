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
const { canonicalise, surfaceForm } = require('../../matching/src/skills');

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
   * Recover the word the advertisement actually used. The mechanism lives in
   * skills.js, because the interview prep needs exactly the same thing.
   */
  const fromAd = (canonical) => (j.adText ? surfaceForm(canonical, j.adText, null) : null);

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

  /**
   * The salutation, and the signoff that has to agree with it.
   *
   * Convention is not decoration here. "Yours faithfully" belongs with "Dear
   * Sir/Madam" and "Yours sincerely" with a named person; getting that pair
   * wrong is a small error an HR reader notices immediately. And "Hi"
   * anything pairs with neither — it takes "Kind regards".
   *
   * Worth saying once, since the default was chosen deliberately against it:
   * an unnamed salutation tells the reader nobody looked up who they are,
   * which is the first signal of a mass send. A name beats all of these.
   */
  const salutation = o.salutation || 'auto';
  const greeting = j.hiringManager
    ? `Dear ${j.hiringManager},`
    : salutation === 'hi-sir-madam'
      ? 'Hi Sir/Madam,'
      : salutation === 'sir-madam'
        ? 'Dear Sir/Madam,'
        : salutation === 'hiring-manager'
          ? 'Dear Hiring Manager,'
          : typeof salutation === 'string' && salutation !== 'auto'
            ? salutation
            : tone === 'formal'
              ? 'Dear Hiring Manager,'
              : 'Hello,';

  const years = Number(p.yearsExperience);
  const opener = (() => {
    // NOT "I am writing to apply for" — the reader knows why you wrote, and
    // packages/documents/src/tells.js flags it. Lead with the fact instead.
    const stem = `I would like to be considered for the ${role} role at ${company}.`;
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

  // ONE QUOTE, ONE PARAGRAPH (2026-09-06).
  //
  // evidenceFor() scores every statement against every skill, so one resume
  // line legitimately wins for several of them. Emitted naively that produced
  // two consecutive paragraphs quoting the SAME sentence verbatim — "On
  // Active Directory: ..." and "On Entra: ..." word for word — which is the
  // most obviously machine-written thing a letter can do.
  //
  // The first skill to claim a line keeps it; later ones fall through to
  // their next-best evidence or drop out.
  const quoted = new Set();

  for (const e of body) {
    const key = String(e.text || '').trim().toLowerCase();
    if (quoted.has(key)) continue;
    quoted.add(key);
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
  const gapAnswers = o.gapAnswers || {};
  const answerFor = (skill) => gapAnswers[skill] || gapAnswers[label(skill)] || null;

  if (unbacked.length === 1) {
    const answered = answerFor(unbacked[0].skill);
    paragraphs.push(
      answered
        ? `The advertisement asks for ${label(unbacked[0].skill)}, which my resume does not ` +
          `cover. ${String(answered).trim()}`
        : `The advertisement asks for ${label(unbacked[0].skill)}, which my resume does not ` +
          `cover. ${GAP('one sentence: the closest thing you have done, or how quickly you have ' +
          'picked up something comparable')}`
    );
  } else if (unbacked.length > 1 && unbacked.every((u) => answerFor(u.skill))) {
    // Several gaps normally means skip the job. But when the caller has a real
    // answer for each — usually "same work, different vendor" — naming them is
    // stronger than hoping nobody checks.
    for (const u of unbacked) {
      paragraphs.push(`On ${label(u.skill)}: ${String(answerFor(u.skill)).trim()}`);
    }
  } else if (unbacked.length > 1) {
    paragraphs.push(
      GAP(`${unbacked.length} required skills have no supporting achievement in your resume ` +
        `(${list(unbacked.map((u) => label(u.skill)))}). Addressing them all in a cover ` +
        'letter draws attention to the gap. Consider whether this application is worth sending')
    );
  }

  // The paragraph that decides whether the letter gets read. Supplying real
  // researched text is the point of opts.whyThem; the GAP is what happens
  // when nobody did the reading, and it stays visible rather than being
  // filled with a compliment.
  const why = o.whyThem
    ? String(o.whyThem).trim()
    : j.company
      ? `${GAP(`why ${company} specifically — one concrete thing about them, not a compliment. ` +
          'This is the paragraph recruiters use to tell a tailored letter from a template')}`
      : GAP('why this employer specifically');
  paragraphs.push(why);

  const closer = tone === 'warm'
    ? 'I would genuinely like to talk about this one. Thank you for your time.'
    : tone === 'formal'
      ? 'I would welcome the opportunity to discuss my application further. Thank you for your consideration.'
      : 'I would be glad to talk it through. Thank you for reading.';

  const closingFor = (g) => {
    if (/^Hi\b/i.test(g)) return 'Kind regards,';
    if (/Sir\/Madam/i.test(g)) return 'Yours faithfully,';
    if (j.hiringManager) return 'Yours sincerely,';
    // "Dear Hiring Manager" names a role, not a person, so it takes YOURS
    // FAITHFULLY. Sincerely belongs with a name — that is the whole
    // distinction the block above exists to keep, and this branch used to
    // break it, handing a formal tone "Yours sincerely" after an unnamed
    // greeting. Found by adding the option to the web app and reading the
    // pair it produced.
    return tone === 'formal' ? 'Yours faithfully,' : 'Regards,';
  };

  const signoff = [
    closingFor(greeting),
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
