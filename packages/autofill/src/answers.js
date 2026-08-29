/**
 * answers.js — the answer bank for screening questions.
 *
 * WHY THIS IS A SEPARATE, EXPLICIT THING
 *
 * The published complaints about every hands-off applier land in the same
 * place: it answered a screening question wrong, and it did so on every
 * application before anyone noticed. A mis-toggled work-authorisation answer
 * is not a small error — most applicant tracking systems treat those fields
 * as auto-reject filters, so the application dies before a person reads it.
 *
 * The fix is not better guessing. It is refusing to guess: the user answers
 * each knockout question ONCE, deliberately, and the runner stops on any
 * question that has no answer. A stopped run costs a minute. Forty silently
 * wrong applications cost the search.
 *
 * The bank is also where free-text screening answers live, so the same
 * question asked by the fourteenth employer is answered consistently — which
 * is worth having on its own, since inconsistent answers across applications
 * to the same company group is a real way to get filtered.
 */

/**
 * The questions worth answering once. Each carries WHY it matters, because a
 * user filling this in deserves to know which answers are load-bearing.
 */
const STANDARD = [
  { key: 'workAuthorisation', type: 'choice', options: ['Yes', 'No'],
    question: 'Are you legally authorised to work in the country this job is in?',
    why: 'An auto-reject filter in nearly every ATS. Answered wrong, nothing else you wrote matters.' },
  { key: 'visaSponsorship', type: 'choice', options: ['Yes', 'No'],
    question: 'Will you now or in the future require visa sponsorship?',
    why: 'Also an auto-reject filter, and the one most often answered backwards — note that ' +
      '"Yes" here means you DO need sponsorship, which many employers screen out.' },
  { key: 'salaryExpectation', type: 'text',
    question: 'Your salary expectation',
    why: 'A number here is a commitment. Some fields will not accept a range or "negotiable", ' +
      'which is why it needs a considered answer rather than a default.' },
  { key: 'noticePeriod', type: 'text',
    question: 'Your notice period, or earliest start date',
    why: 'Used to filter for urgent roles. Wrong by a month and you are out of the shortlist.' },
  { key: 'willingToRelocate', type: 'choice', options: ['Yes', 'No'],
    question: 'Are you willing to relocate?',
    why: 'A yes you did not mean leads to interviews in cities you will not move to.' },
  { key: 'driversLicence', type: 'choice', options: ['Yes', 'No'],
    question: 'Do you hold a current driver\'s licence?',
    why: 'A hard requirement for many roles and trivially checkable.' },
  { key: 'securityClearance', type: 'text',
    question: 'Security clearance held, if any',
    why: 'Government and defence roles gate on this. Claiming one you do not hold is not a ' +
      'grey area — it is checked, and it ends more than the application.' },
  { key: 'criminalRecord', type: 'choice', options: ['Yes', 'No'],
    question: 'Do you have a criminal record that would affect this role?',
    why: 'Answer honestly. This is verified at background check, and a false answer is grounds ' +
      'for dismissal after hiring, which is worse than not being hired.' },
  { key: 'previouslyEmployed', type: 'choice', options: ['Yes', 'No'],
    question: 'Have you previously worked for this employer?',
    why: 'Checked against their own records. Getting it wrong looks like carelessness at best.' },
  { key: 'referredBy', type: 'text',
    question: 'How did you hear about this role? (or who referred you)',
    why: 'A real referral name is one of the strongest signals in an application. Leave it ' +
      'blank rather than inventing one.' },
  { key: 'currentSalary', type: 'text',
    question: 'Your current salary',
    why: 'Illegal to ask in several jurisdictions and you are rarely obliged to answer. Consider ' +
      'leaving this empty so the field pauses and you can decide per employer.' }
];

const BY_KEY = new Map(STANDARD.map((q) => [q.key, q]));

/** Answers stored but never provided for a question we know about. */
function missing(bank) {
  const b = bank || {};
  return STANDARD.filter((q) => {
    const v = b[q.key];
    return v === undefined || v === null || v === '';
  });
}

/** Answers stored for questions that are not in the standard set. */
function custom(bank) {
  const b = bank || {};
  return Object.keys(b).filter((k) => !BY_KEY.has(k)).map((k) => ({ key: k, answer: b[k] }));
}

/**
 * Free-text screening questions, matched by their wording.
 *
 * Deliberately an exact-ish match on the normalised question rather than a
 * fuzzy one: answering "Why do you want to work here?" with the answer saved
 * for "Why do you want to leave your current role?" is worse than not
 * answering at all.
 */
function normaliseQuestion(q) {
  return String(q || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function lookupFreeText(question, bank) {
  const b = (bank && bank._freeText) || {};
  const n = normaliseQuestion(question);
  if (b[n]) return { found: true, answer: b[n], exact: true };

  // A saved question that contains, or is contained by, the asked one — the
  // same question with a different employer's name in it.
  for (const key of Object.keys(b)) {
    if (key.length > 25 && (n.indexOf(key) !== -1 || key.indexOf(n) !== -1)) {
      return { found: true, answer: b[key], exact: false, matchedOn: key };
    }
  }
  return { found: false };
}

function remember(bank, question, answer) {
  const b = { ...(bank || {}) };
  b._freeText = { ...(b._freeText || {}) };
  b._freeText[normaliseQuestion(question)] = answer;
  return b;
}

/**
 * Is this bank complete enough to run unattended?
 *
 * Not a boolean by itself — it names what is missing, because "you cannot run
 * yet" without saying why is the least useful message a tool can produce.
 */
function readiness(bank) {
  const gaps = missing(bank);
  // These four are asked by nearly every application. Without them the runner
  // will stop on almost every job, which is not automation.
  const essential = ['workAuthorisation', 'visaSponsorship', 'noticePeriod', 'salaryExpectation'];
  const essentialGaps = gaps.filter((g) => essential.indexOf(g.key) !== -1);

  return {
    ready: essentialGaps.length === 0,
    missing: gaps,
    essentialMissing: essentialGaps,
    advice: essentialGaps.length
      ? `${essentialGaps.length} question${essentialGaps.length === 1 ? '' : 's'} that almost every ` +
        'application asks are unanswered. Until they are, the runner will stop on nearly every job ' +
        '— which is the correct behaviour and also not automation. Answer them once here.'
      : gaps.length
        ? `Ready. ${gaps.length} less-common question${gaps.length === 1 ? '' : 's'} still unanswered; ` +
          'the runner will pause if a form asks one, rather than guessing.'
        : 'Every standard question is answered. The runner will only stop on something new.'
  };
}

module.exports = { STANDARD, BY_KEY, missing, custom, readiness, lookupFreeText, remember, normaliseQuestion };
