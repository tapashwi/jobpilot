/**
 * evidence.js — find the sentences in someone's own resume that support a
 * claim about a skill.
 *
 * THIS IS THE FILE THAT KEEPS THE DOCUMENT GENERATORS HONEST.
 *
 * A cover letter generator that writes "I have extensive experience with
 * Kubernetes" from nothing but the word "Kubernetes" is producing a claim its
 * user has to defend in an interview. Everything the generators emit is built
 * from lines that already exist in the resume, and every generated sentence
 * carries the line it came from, so the user can see what they are signing.
 *
 * Where there is no evidence, the generators emit a marked gap rather than
 * prose. A blank the user has to fill is a worse-looking draft and a better
 * application.
 */

const { canonicalise, extractSkills, normalise } = require('../../matching/src/skills');

/**
 * A blank the applicant must fill, rendered visibly wherever it appears.
 *
 * Defined here rather than in each generator because it is one concept — "we
 * have no evidence for this and will not invent any" — and because both
 * generators land in a single shared scope in the browser bundle, where two
 * `const GAP` declarations are a syntax error that takes the whole app down.
 */
const GAP = (what) => `[${what}]`;

/** Split a resume into candidate evidence lines: bullets and sentences. */
function statements(resumeText) {
  const out = [];

  // HARD-WRAPPED PROSE IS ONE PARAGRAPH, NOT SIX STATEMENTS (2026-09-06).
  //
  // A resume written in markdown wraps its prose at 80-90 characters, and
  // treating each physical line as a statement chops sentences mid-clause.
  // That put "I focused on network administration, Active Directory and
  // Intune device management,." into a cover letter — a continuation line
  // quoted as though it were a whole achievement.
  //
  // Bullets stay one-per-line, because that is what a bullet is. Everything
  // else is joined until a blank line or the next bullet.
  const rawLines = String(resumeText || '').split(/\r?\n/);
  const lines = [];
  let buffer = '';
  const flush = () => { if (buffer.trim()) lines.push(buffer.trim()); buffer = ''; };
  for (const raw of rawLines) {
    const t = raw.trim();
    // A BULLET WRAPS TOO. The first version flushed a bullet immediately and
    // left its continuation to be dropped for being under the length floor,
    // so "...and manage access via" reached a letter without the "Active
    // Directory" that finished the sentence — the single most relevant line
    // in the resume, truncated one word from the end.
    const isNewBlock = !t || /^[-•*●▪]\s/.test(t) || /^#{1,6}\s/.test(t) || /^\*\*[^*]+:\*\*/.test(t);
    if (isNewBlock) {
      flush();
      if (t) buffer = t;   // start the new block; its wrapped lines join it
      continue;
    }
    buffer = buffer ? `${buffer} ${t}` : t;
  }
  flush();

  for (const raw of lines) {
    let line = raw.trim();
    if (!line) continue;

    // MARKDOWN (2026-09-06). Resumes arrive as markdown often enough that
    // ignoring it corrupts the output rather than merely missing something.
    //
    // The bullet test below matches "*", which is also markdown emphasis, so
    // "**Identity & Cloud:** Microsoft Entra ID, Active Directory" was read as
    // a bullet, had ONE asterisk stripped, and reached a cover letter as
    // "I *Identity & Cloud:** Microsoft Entra ID". That shipped in a draft.
    if (/^#{1,6}\s/.test(line)) continue;              // heading
    const labelled = line.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
    if (labelled) line = `${labelled[1]}: ${labelled[2]}`;  // "Label: content"
    line = line.replace(/\*\*/g, '').replace(/(^|\s)_(?=\S)/g, '$1');

    const isBullet = /^[-•●▪]\s+/.test(line) || /^\*\s+/.test(line);
    const body = line.replace(/^[-•*●▪]\s*/, '').trim();
    if (body.length < 20) continue; // headings, dates, contact fragments

    // A SKILLS LIST IS NOT EVIDENCE (2026-09-06).
    //
    // "Identity & Cloud: Microsoft Entra ID, Active Directory, Microsoft
    // Intune, Microsoft 365" names technologies; it does not say what the
    // person did with any of them. Quoted into a letter it became "On Active
    // Directory: I identity & Cloud: Microsoft Entra ID..." — ungrammatical,
    // and it displaced the one line that actually mattered, which was
    // "Run user onboarding/offboarding ... manage access via Active Directory".
    //
    // Detected by shape rather than by a keyword list: a short label, a colon,
    // then several comma-separated fragments none of which is a clause.
    const listed = body.match(/^[A-Z][\w &/]{2,30}:\s*(.+)$/);
    if (listed) {
      const parts = listed[1].split(/[,·]/).map((x) => x.trim()).filter(Boolean);
      const shortParts = parts.filter((x) => x.split(/\s+/).length <= 4).length;
      if (parts.length >= 3 && shortParts / parts.length >= 0.7) continue;
    }

    if (isBullet) {
      out.push({ text: body, kind: 'bullet' });
      continue;
    }
    // Prose: split into sentences so one long paragraph does not become one
    // enormous unusable "statement".
    for (const s of body.split(/(?<=[.!?])\s+/)) {
      const t = s.trim();
      if (t.length >= 30) out.push({ text: t, kind: 'sentence' });
    }
  }
  return out;
}

/** Does this statement carry a measurable outcome? Those are worth more. */
function isQuantified(text) {
  return /\b\d[\d,.]*\s*(%|percent|k\b|m\b|x\b|hours?|days?|weeks?|months?|years?|ms\b|s\b|people|users?|customers?|records?|transactions?|services?|teams?)/i.test(text) ||
    /\b\d[\d,.]*\b/.test(text);
}

/**
 * Score a statement as evidence for one skill.
 *
 * Mentioning the skill is necessary. Beyond that, a quantified outcome beats
 * an unquantified one, and a bullet beats buried prose, because that is the
 * order a reader's eye gives them anyway.
 */
function scoreStatement(statement, skill) {
  const hay = normalise(statement.text);
  const canonical = canonicalise(skill);
  const mentioned = extractSkills(statement.text).indexOf(canonical) !== -1;
  if (!mentioned) return 0;

  let score = 10;
  if (isQuantified(statement.text)) score += 8;
  if (statement.kind === 'bullet') score += 2;
  // A statement naming several relevant things is stronger than one naming one.
  score += Math.min(4, extractSkills(statement.text).length);
  // Very long lines are usually a whole paragraph and read poorly when quoted.
  if (statement.text.length > 220) score -= 4;
  return score;
}

/**
 * The best evidence in this resume for each of these skills.
 *
 * Returns one entry per skill, ALWAYS — including skills with no evidence,
 * because "you claim this and cannot show it" is the most useful thing the
 * caller can know.
 */
function evidenceFor(resumeText, skills) {
  const all = statements(resumeText);
  const used = new Set();
  const out = [];

  for (const skill of skills || []) {
    const canonical = canonicalise(skill);
    const ranked = all
      .map((s) => ({ statement: s, score: scoreStatement(s, canonical) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // Prefer evidence not already spent on another skill, so a letter does not
    // quote the same bullet three times.
    const fresh = ranked.filter((r) => !used.has(r.statement.text));
    const pick = fresh[0] || ranked[0] || null;
    if (pick) used.add(pick.statement.text);

    out.push({
      skill: canonical,
      hasEvidence: !!pick,
      text: pick ? pick.statement.text : null,
      quantified: pick ? isQuantified(pick.statement.text) : false,
      score: pick ? pick.score : 0,
      alternatives: ranked.slice(0, 3).map((r) => r.statement.text)
    });
  }
  return out;
}

/** The strongest statements overall, regardless of skill. */
function strongest(resumeText, limit) {
  return statements(resumeText)
    .map((s) => ({ text: s.text, quantified: isQuantified(s.text), skills: extractSkills(s.text) }))
    .filter((s) => s.skills.length > 0)
    .sort((a, b) => {
      if (a.quantified !== b.quantified) return a.quantified ? -1 : 1;
      return b.skills.length - a.skills.length;
    })
    .slice(0, limit || 5);
}

module.exports = { statements, evidenceFor, strongest, isQuantified, scoreStatement, GAP };
