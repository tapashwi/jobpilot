/**
 * selection-criteria.js — draft STAR responses to selection criteria.
 *
 * WHY THIS IS A SEPARATE THING FROM A COVER LETTER
 *
 * Australian public-sector and university applications ask you to "address
 * the selection criteria": a numbered list, each answered separately, each
 * scored separately by a panel against a rubric. A cover letter that gestures
 * at all of them scores zero on all of them, because the panel is ticking off
 * one criterion at a time and needs to find the answer under its heading.
 *
 * The expected form is STAR — Situation, Task, Action, Result. Panels are
 * trained on it, and a response missing the Result is the single most common
 * reason a competent applicant does not progress: they describe what they were
 * responsible for and never say what changed.
 *
 * WHAT THIS DOES AND DOES NOT DO
 *
 * It finds the applicant's strongest real evidence for each criterion and
 * arranges it into the STAR frame, then marks every part it cannot fill. It
 * does not invent a Situation. It cannot: the situation is a specific thing
 * that happened at a specific place, and a plausible fabrication is precisely
 * what a panel probes for at interview.
 *
 * So the output is a scaffold with the applicant's own achievement already in
 * the Action and Result slots, and named blanks everywhere else.
 */

const { evidenceFor, statements, isQuantified, GAP } = require('./evidence');
const { extractSkills, canonicalise, normalise } = require('../../matching/src/skills');

/** Typical word limits panels set. Used for guidance, not enforcement. */
const LIMITS = { brief: 150, standard: 250, detailed: 500 };

/**
 * Pull the individual criteria out of pasted text.
 *
 * Real postings number them, bullet them, or write them as headed paragraphs.
 * Anything shorter than a clause is not a criterion — it is a fragment of the
 * heading above it.
 */
function parseCriteria(text) {
  const raw = String(text || '');
  if (!raw.trim()) return [];

  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];

  for (const line of lines) {
    // Strip a leading number, letter or bullet marker.
    const stripped = line
      .replace(/^\(?\d+[.)]\s*/, '')
      .replace(/^\(?[a-z][.)]\s*/i, '')
      .replace(/^[-•*●▪]\s*/, '')
      .trim();

    // A heading like "Selection Criteria" is not itself a criterion.
    if (/^(selection|key|essential|desirable)\s+criteri(a|on)\b:?$/i.test(stripped)) continue;
    if (stripped.length < 25) continue;
    // A criterion is a demand; a sentence of company blurb usually is not.
    out.push(stripped.replace(/[.;]+$/, ''));
  }
  return out;
}

/** Which of the applicant's skills does this criterion actually ask about? */
function skillsInCriterion(criterion) {
  return extractSkills(criterion);
}

/**
 * Some criteria are behavioural rather than technical — "demonstrated ability
 * to work in a team", "high-level communication skills". No skill dictionary
 * will match those, and pretending otherwise produces an empty response with
 * no explanation. They get a different scaffold.
 */
const BEHAVIOURAL = [
  { id: 'communication', match: /communicat|written and verbal|stakeholder|liais|present/i,
    prompt: 'a time you explained something difficult to someone who needed it and did not have your background' },
  { id: 'teamwork', match: /team|collaborat|work(ing)? with others|cross-functional/i,
    prompt: 'a time the outcome depended on other people and you made that work' },
  { id: 'problem-solving', match: /problem|analytic|troubleshoot|resolve|diagnos/i,
    prompt: 'a problem nobody had solved yet, and what you did that was not obvious' },
  { id: 'initiative', match: /initiative|autonom|self-?direct|minimal supervision|proactiv/i,
    prompt: 'something you started that nobody asked you to start' },
  { id: 'planning', match: /plan|priorit|deadline|competing demands|time management|organis/i,
    prompt: 'a period with more work than time, and how you decided what not to do' },
  // "supervis" alone matches "minimal supervision", which is a criterion about
  // working WITHOUT supervision — the opposite of leading people. Only the
  // verb forms count.
  { id: 'leadership', match: /lead(ership|ing a team)?\b|supervis(e|ed|ing|or)\b|mentor|manag(e|ing) (a )?(team|staff|people)/i,
    prompt: 'a time you were responsible for other people\'s output as well as your own' },
  { id: 'change', match: /change|adapt|ambigu|shifting|evolv/i,
    prompt: 'a time the goal moved after you had started' },
  { id: 'integrity', match: /integrity|ethic|values|code of conduct|confidential/i,
    prompt: 'a time doing the right thing cost you something' }
];

function behaviouralKind(criterion) {
  return BEHAVIOURAL.filter((b) => b.match.test(criterion));
}

/**
 * Draft one response.
 *
 * Returns the four STAR parts separately as well as assembled text, so a UI
 * can let someone edit them individually — which is how people actually work
 * on these.
 */
function draftResponse(criterion, resumeText, opts) {
  const o = opts || {};
  const limit = LIMITS[o.length || 'standard'] || LIMITS.standard;

  const technical = skillsInCriterion(criterion);
  const behavioural = behaviouralKind(criterion);
  const ev = technical.length ? evidenceFor(resumeText, technical) : [];
  const backed = ev.filter((e) => e.hasEvidence).sort((a, b) => (b.quantified - a.quantified) || (b.score - a.score));
  const best = backed[0] || null;

  const situation = GAP(
    behavioural.length
      ? `Situation — ${behavioural[0].prompt}. Name the employer, the team and roughly when.`
      : 'Situation — where this happened: the employer, the team, roughly when, and what was going wrong or needed doing'
  );

  const task = GAP(
    'Task — what you specifically were accountable for. Not the team: you. ' +
      'A panel scores the word "we" as unassessable'
  );

  let action;
  let result;
  if (best) {
    // The resume line is an achievement, which usually collapses Action and
    // Result into one sentence. Split it where it is splittable, and say so
    // where it is not.
    action = `Action — ${best.text}`;
    result = best.quantified
      ? `Result — ${GAP('restate the figure from the line above as the outcome, and add what it meant: ' +
          'what became possible, what stopped happening, who noticed')}`
      : `Result — ${GAP('this achievement has no number in it. Add one: how much, how many, ' +
          'how much faster, how much cheaper. A Result without a measure is the most common ' +
          'reason a strong response scores badly')}`;
  } else {
    action = `Action — ${GAP(
      technical.length
        ? `nothing in your resume mentions ${technical.join(', ')}. Either add the work, or ` +
          'answer from experience the resume does not currently cover'
        : 'what you actually did, step by step. Three or four sentences — this is the part ' +
          'the panel scores most heavily'
    )}`;
    result = `Result — ${GAP('what changed, with a number')}`;
  }

  const parts = { situation, task, action, result };
  const text = [situation, task, action, result].join('\n\n');
  const gaps = (text.match(/\[[^\]]+\]/g) || []).length;

  return {
    criterion,
    parts,
    text,
    technical,
    behavioural: behavioural.map((b) => b.id),
    evidenceUsed: best ? best.text : null,
    gaps,
    wordLimit: limit,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    readiness: best ? 'draft — your achievement is in, fill the rest' : 'skeleton — no matching evidence found'
  };
}

/** Draft every criterion in a posting. */
function draftAll(criteriaText, resumeText, opts) {
  const criteria = Array.isArray(criteriaText) ? criteriaText : parseCriteria(criteriaText);
  const responses = criteria.map((c) => draftResponse(c, resumeText, opts));
  return {
    criteria,
    responses,
    unsupported: responses.filter((r) => !r.evidenceUsed).map((r) => r.criterion),
    totalGaps: responses.reduce((n, r) => n + r.gaps, 0),
    // A panel scores each criterion separately, so a single weak response is a
    // single low score rather than a diluted average. Worth saying.
    note: responses.length
      ? 'Each response is scored on its own. One unanswered criterion is a zero for that ' +
        'criterion, not a slightly lower overall mark.'
      : 'No criteria found. Paste the numbered or bulleted list from the position description.'
  };
}

module.exports = { parseCriteria, draftResponse, draftAll, skillsInCriterion, behaviouralKind, LIMITS, BEHAVIOURAL };
