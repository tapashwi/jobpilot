/**
 * followup.js — the messages people know they should send and do not.
 *
 * Following up is the cheapest advantage in a job search and almost nobody
 * does it, because writing the message from a blank page feels like begging.
 * It is not: a recruiter managing forty applications genuinely loses track,
 * and a short, specific note moves you back to the top of a list.
 *
 * These are short on purpose. A long follow-up reads as anxiety; three
 * sentences reads as professional. Everything specific is a marked blank,
 * because the specific part is what makes it work and it is the part only the
 * applicant knows.
 */

const { GAP } = require('../../documents/src/evidence');

const TEMPLATES = {
  'after-applying': {
    label: 'After applying, no response',
    wait: 10,
    subject: (j) => `Application for ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `I applied for the ${j.title || GAP('role')} role${j.company ? ' at ' + j.company : ''} on ` +
        `${GAP('date')} and wanted to make sure it reached you.`,
      '',
      `${GAP('one sentence on the single most relevant thing you have done — the one that matches ' +
        'their top requirement. Not a summary of your resume; they have that')}`,
      '',
      'Happy to answer anything useful in the meantime.',
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Send about ten working days after applying. Sooner reads as impatient; much later and ' +
      'the shortlist is closed.'
  },

  'after-interview': {
    label: 'After an interview',
    wait: 1,
    subject: (j) => `Thank you — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Thank you for your time ${GAP('yesterday / on Tuesday')}.`,
      '',
      `${GAP('name ONE specific thing from the conversation — a problem they described, a ' +
        'decision they are weighing. This is the whole point of the message: it proves you were ' +
        'listening and it is what they will remember')}`,
      '',
      `${GAP('optional, and powerful: if a question caught you out, answer it properly here in ' +
        'two sentences. Interviewers rate this highly and almost nobody does it')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Send within 24 hours, while they are still writing up their notes. This is the single ' +
      'highest-return message in the whole process.'
  },

  'chasing-decision': {
    label: 'Chasing a decision after an interview',
    wait: 7,
    subject: (j) => `Following up — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Following up on the ${j.title || GAP('role')} role — is there an update, or anything else ` +
        'you need from me?',
      '',
      `${GAP('only if true: mention a competing timeline. It is legitimate pressure and it works. ' +
        'Do not invent one — it is checkable and the bluff ends the process')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'A week after the date they gave you, not a week after the interview. If they gave no ' +
      'date, ask for one at the interview — that is what makes this message easy to write.'
  },

  'after-rejection': {
    label: 'After a rejection',
    wait: 0,
    subject: (j) => `Thank you — ${j.title || GAP('role')}`,
    body: (p, j) => [
      `Hello${j.contact ? ' ' + j.contact : ''},`,
      '',
      `Thank you for letting me know${j.company ? ' about the ' + (j.title || 'role') + ' at ' + j.company : ''}.`,
      '',
      'If you have a moment, I would genuinely value one thing I could have done better — it ' +
        'helps more than you would think.',
      '',
      `${GAP('optional: say you would like to be considered for future roles. Recruiters keep ' +
        'these notes, and a gracious rejection reply is rare enough to be memorable')}`,
      '',
      'Regards,',
      p.name || GAP('your name')
    ].join('\n'),
    note: 'Most people send nothing. A short, ungrudging reply is remembered, and second-choice ' +
      'candidates get called back more often than anyone admits.'
  }
};

function draft(kind, profile, job) {
  const t = TEMPLATES[kind];
  if (!t) throw new Error('Unknown follow-up: ' + kind);
  const p = profile || {};
  const j = job || {};
  const body = t.body(p, j);
  return {
    kind,
    label: t.label,
    subject: t.subject(j),
    body,
    note: t.note,
    waitDays: t.wait,
    gaps: (body.match(/\[[^\]]+\]/g) || []).length
  };
}

/** Which message is due, given where the application is and how long it has sat. */
function suggest(status, daysSince) {
  if (status === 'applied' && daysSince >= TEMPLATES['after-applying'].wait) return 'after-applying';
  if (status === 'interviewing' && daysSince <= 1) return 'after-interview';
  if (status === 'interviewing' && daysSince >= TEMPLATES['chasing-decision'].wait) return 'chasing-decision';
  if (status === 'rejected') return 'after-rejection';
  return null;
}

module.exports = { draft, suggest, TEMPLATES };
