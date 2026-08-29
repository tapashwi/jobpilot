/**
 * tailor.js — concrete edits to make one resume fit one advertisement.
 *
 * WHERE THE LINE IS
 *
 * Tailoring a resume is legitimate and expected: you emphasise the relevant
 * work and use the words the reader is searching for. Inventing experience is
 * not, and the boundary between them is exactly the boundary this module
 * enforces — it will only ever suggest surfacing something you already wrote,
 * or rewording something you already wrote. It will never suggest adding a
 * skill that is not in your resume.
 *
 * Where the advertisement asks for something you genuinely do not have, the
 * suggestion is "you do not have this", not "add this". That is the difference
 * between a tool that gets you an interview and one that gets you caught out
 * in it.
 */

const { extractSkills, canonicalise, surfaceForm, ALIASES, normalise } = require('../../matching/src/skills');
const { statements, isQuantified } = require('../../documents/src/evidence');

/** An edit the user can accept or ignore, with the reason attached. */
function edit(kind, severity, what, why, how) {
  return { kind, severity, what, why, how };
}

/**
 * Words the advertisement leans on that the resume never uses — but only where
 * the resume ALREADY demonstrates the thing under another name. That is a
 * rewording suggestion, not a fabrication.
 */
function vocabularyEdits(resumeText, job) {
  const out = [];
  const ad = String(job.adText || '');
  const inResume = new Set(extractSkills(resumeText));

  for (const skill of (job.requiredSkills || []).concat(job.preferredSkills || [])) {
    const c = canonicalise(skill);
    if (!inResume.has(c)) continue;

    const theirWord = surfaceForm(c, ad, null);
    const yourWord = surfaceForm(c, resumeText, null);
    if (!theirWord || !yourWord) continue;
    if (normalise(theirWord) === normalise(yourWord)) continue;

    out.push(edit(
      'vocabulary', 'high',
      `They write "${theirWord}", your resume writes "${yourWord}"`,
      'A keyword search matches the literal string. A recruiter filtering on their own wording ' +
        'will not find yours, even though you have the skill.',
      `Use both once: "${yourWord} (${theirWord})". One mention of each form covers both searches ` +
        'and costs you nine characters.'
    ));
  }
  return out;
}

/**
 * Achievements that mention a required skill but are buried at the bottom.
 * Moving one line is the cheapest edit there is.
 */
function orderEdits(resumeText, job) {
  const all = statements(resumeText);
  if (all.length < 6) return [];
  const required = (job.requiredSkills || []).map(canonicalise);
  if (!required.length) return [];

  const out = [];
  const lastThird = all.slice(Math.floor(all.length * 0.66));
  const firstThird = all.slice(0, Math.floor(all.length * 0.34));
  const topSkills = new Set(firstThird.flatMap((s) => extractSkills(s.text)));

  for (const st of lastThird) {
    const hits = extractSkills(st.text).filter((s) => required.indexOf(s) !== -1 && !topSkills.has(s));
    if (!hits.length) continue;
    out.push(edit(
      'order', 'high',
      `A required skill only appears near the end: ${hits.join(', ')}`,
      'A recruiter reads the top third. An achievement below it is filed as "not their focus", ' +
        'whatever it says.',
      `Move this line up, or echo it in your summary: "${st.text.slice(0, 110)}${st.text.length > 110 ? '…' : ''}"`
    ));
  }
  return out.slice(0, 3);
}

/** Achievements with no number, where the job is one that will ask for numbers. */
function evidenceEdits(resumeText, job) {
  const required = (job.requiredSkills || []).map(canonicalise);
  const out = [];
  for (const st of statements(resumeText)) {
    if (isQuantified(st.text)) continue;
    const hits = extractSkills(st.text).filter((s) => required.indexOf(s) !== -1);
    if (!hits.length) continue;
    out.push(edit(
      'evidence', 'medium',
      `No measure on a line about ${hits.join(', ')}`,
      'This is the work they are hiring for, and the line does not say how much of it you did ' +
        'or what changed.',
      `Add scale or outcome to: "${st.text.slice(0, 110)}${st.text.length > 110 ? '…' : ''}" — ` +
        'how many, how much, how much faster. An approximation is fine; an invention is not.'
    ));
  }
  return out.slice(0, 3);
}

/** Requirements you genuinely do not have. Stated, never "fixed". */
function honestGaps(resumeText, job) {
  const inResume = new Set(extractSkills(resumeText));
  const missing = (job.requiredSkills || [])
    .map(canonicalise)
    .filter((s) => !inResume.has(s));

  return missing.map((s) => edit(
    'gap', 'critical',
    `The ad requires ${surfaceForm(s, job.adText, s)} and your resume does not mention it`,
    'This is a real gap, not a wording problem.',
    'If you have done it, add a real achievement. If you have not, do NOT add the keyword — ' +
      'you would pass the filter and fail the first technical question, having spent the ' +
      'interview slot to do it.'
  ));
}

/**
 * The summary line at the top, which is the highest-leverage 30 words on the
 * page and is usually written once and never touched again.
 */
function summaryEdit(resumeText, job) {
  const first = statements(resumeText)[0];
  const required = (job.requiredSkills || []).map(canonicalise).slice(0, 3);
  if (!required.length) return [];
  const inSummary = first ? new Set(extractSkills(first.text)) : new Set();
  const absent = required.filter((s) => !inSummary.has(s));
  if (!absent.length) return [];

  return [edit(
    'summary', 'high',
    `Your opening lines do not mention ${absent.map((s) => surfaceForm(s, job.adText, s)).join(', ')}`,
    'The summary is read first and skimmed hardest, and it is the part most people write once ' +
      'and never revisit per application.',
    'Rewrite the summary for this job, naming the two or three things the ad leads with — ' +
      'provided you can back them up further down.'
  )];
}

function tailor(profile, job) {
  const resumeText = (profile || {}).resumeText || '';
  const j = job || {};
  if (!resumeText.trim()) {
    return { edits: [], counts: { critical: 0, high: 0, medium: 0 }, note: 'No resume to tailor.' };
  }

  const edits = [
    ...honestGaps(resumeText, j),
    ...vocabularyEdits(resumeText, j),
    ...summaryEdit(resumeText, j),
    ...orderEdits(resumeText, j),
    ...evidenceEdits(resumeText, j)
  ];

  const rank = { critical: 0, high: 1, medium: 2 };
  edits.sort((a, b) => rank[a.severity] - rank[b.severity]);

  return {
    edits,
    counts: {
      critical: edits.filter((e) => e.severity === 'critical').length,
      high: edits.filter((e) => e.severity === 'high').length,
      medium: edits.filter((e) => e.severity === 'medium').length
    },
    note: edits.length
      ? 'Every suggestion above either surfaces or rewords something already in your resume. ' +
        'None of them adds experience you do not have — that is the line between tailoring and ' +
        'lying, and it is where this tool stops.'
      : 'Nothing to change for this one. Your resume already uses their vocabulary and leads ' +
        'with what they asked for.'
  };
}

module.exports = { tailor, vocabularyEdits, orderEdits, evidenceEdits, honestGaps, summaryEdit };
