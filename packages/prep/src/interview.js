/**
 * interview.js — work out what you will actually be asked, and whether you
 * have an answer.
 *
 * THE INSIGHT THIS RESTS ON
 *
 * An interview is not a random quiz. For a structured or semi-structured
 * process — which is most of them now — the questions are generated from the
 * same document you already have: the advertisement. Every required skill is a
 * question. Every gap between the ad and your resume is a question, and it is
 * the one they will press on, because it is the obvious risk in your
 * application and the interviewer can see it as clearly as you can.
 *
 * So this does not guess at questions. It derives them from the requirements,
 * pairs each with the evidence already in your resume, and marks the ones
 * where you have nothing — those are the ones to prepare, and preparing three
 * of those beats rehearsing twenty you can already answer.
 *
 * No model is involved. The questions come from templates applied to the
 * requirements, which is exactly how a hiring manager writes them.
 */

const { evidenceFor } = require('../../documents/src/evidence');
const { extractSkills, canonicalise, surfaceForm } = require('../../matching/src/skills');
const { behaviouralKind } = require('../../documents/src/selection-criteria');

/**
 * Question shapes for a technical requirement.
 *
 * Deliberately the four an interviewer actually reaches for: prove it,
 * measure it, when it went wrong, and how you decide. The fourth is the one
 * candidates prepare least and senior interviewers weight most.
 */
const TECHNICAL_FRAMES = [
  { id: 'prove', ask: (s) => `Talk me through something you have built with ${s}.` },
  { id: 'depth', ask: (s) => `How deep does your ${s} experience go — what have you done beyond the basics?` },
  { id: 'failure', ask: (s) => `Tell me about a time ${s} went wrong on you. What happened and what did you change?` },
  { id: 'judgement', ask: (s) => `When would you NOT use ${s}?` }
];

/** Questions that exist because of a gap, not because of a strength. */
const GAP_FRAMES = [
  { id: 'missing', ask: (s) => `We use ${s} heavily and I do not see it on your resume. Where are you with it?` },
  { id: 'ramp', ask: (s) => `How quickly could you get productive with ${s}?` }
];

const BEHAVIOURAL_QUESTIONS = {
  communication: [
    'Tell me about a time you had to explain something technical to someone without your background.',
    'Describe a disagreement with a stakeholder and how it ended.'
  ],
  teamwork: [
    'Tell me about a time the outcome depended on someone else delivering, and they were struggling.',
    'What is the hardest team you have worked in, and why?'
  ],
  'problem-solving': [
    'Describe the hardest bug or problem you have solved. How did you narrow it down?',
    'Tell me about a time the obvious solution was the wrong one.'
  ],
  initiative: [
    'What have you started that nobody asked you to start?',
    'Tell me about a time you saw a problem outside your remit and acted on it.'
  ],
  planning: [
    'Describe a time you had more work than time. How did you decide what not to do?',
    'Tell me about a deadline you missed.'
  ],
  leadership: [
    'Tell me about someone you have mentored. Where are they now?',
    'Describe a time you had to give difficult feedback.'
  ],
  change: [
    'Tell me about a time the requirements changed after you had started.',
    'How do you work when the goal is genuinely unclear?'
  ],
  integrity: [
    'Tell me about a time doing the right thing cost you something.',
    'Describe a situation where you disagreed with a decision but had to carry it out.'
  ]
};

/** Questions worth asking THEM. The ones that get real answers. */
const QUESTIONS_TO_ASK = [
  { q: 'What does the first ninety days look like for whoever takes this?',
    why: 'A vague answer usually means the role is not scoped, which is the most common reason a good hire fails.' },
  { q: 'Why is this role open?',
    why: 'Growth and backfill are different jobs. If it is a backfill, ask what the last person found hard.' },
  { q: 'How does work get prioritised when two teams want the same thing?',
    why: 'Every organisation has this problem. The interesting part is whether they have an answer or a shrug.' },
  { q: 'What is the on-call expectation, honestly?',
    why: 'Asked plainly, this is hard to dodge, and it is the single largest quality-of-life variable.' },
  { q: 'What would make you regret hiring someone into this role?',
    why: 'Inverts the usual framing and tends to produce a genuine answer about the team, not a rehearsed one.' }
];

/**
 * Build the prep sheet.
 *
 * Ordering is the useful part: questions you cannot answer come FIRST,
 * because prep time is finite and rehearsing the ones you already have is
 * how people feel prepared and are not.
 */
function prepare(profile, job, opts) {
  const o = opts || {};
  const p = profile || {};
  const j = job || {};

  const required = (j.requiredSkills || []).map(canonicalise);
  const preferred = (j.preferredSkills || []).map(canonicalise);
  const all = required.concat(preferred.filter((s) => required.indexOf(s) === -1));

  const ev = evidenceFor(p.resumeText, all);
  const evBySkill = new Map(ev.map((e) => [e.skill, e]));

  const technical = [];
  for (const skill of all) {
    const e = evBySkill.get(skill);
    const isRequired = required.indexOf(skill) !== -1;
    const frames = e && e.hasEvidence ? TECHNICAL_FRAMES : GAP_FRAMES;

    for (const f of frames) {
      technical.push({
        id: `${skill}:${f.id}`,
        skill,
        required: isRequired,
        question: f.ask(label(skill, j)),
        haveAnswer: !!(e && e.hasEvidence),
        evidence: e && e.hasEvidence ? e.text : null,
        // The judgement frame is answerable from opinion, not from the resume,
        // so a missing line is not a gap there.
        priority: !e || !e.hasEvidence
          ? (isRequired ? 1 : 2)
          : f.id === 'failure' || f.id === 'judgement' ? 3 : 4
      });
    }
  }
  technical.sort((a, b) => a.priority - b.priority);

  // Behavioural questions come from the ad's own language.
  const adKinds = behaviouralKind(String(j.adText || '') + ' ' + (j.criteria || []).join(' '));
  const behavioural = [];
  for (const k of adKinds) {
    for (const q of BEHAVIOURAL_QUESTIONS[k.id] || []) {
      behavioural.push({ kind: k.id, question: q, prompt: k.prompt });
    }
  }
  // Every interview asks at least one of these, whatever the ad says.
  if (!behavioural.length) {
    behavioural.push(
      { kind: 'problem-solving', question: BEHAVIOURAL_QUESTIONS['problem-solving'][0], prompt: null },
      { kind: 'teamwork', question: BEHAVIOURAL_QUESTIONS.teamwork[0], prompt: null }
    );
  }

  const unanswered = technical.filter((t) => !t.haveAnswer);

  return {
    technical: o.limit ? technical.slice(0, o.limit) : technical,
    behavioural,
    questionsToAsk: QUESTIONS_TO_ASK,
    unanswered,
    summary: {
      total: technical.length + behavioural.length,
      withoutAnAnswer: unanswered.length,
      // The honest headline. "You have 24 questions" is noise; "three of them
      // you cannot currently answer" is a plan for the evening.
      advice: unanswered.length
        ? `${unanswered.length} question${unanswered.length === 1 ? '' : 's'} you have no evidence for. ` +
          'Prepare those first — they are where the interview will actually go.'
        : 'Every requirement in the ad is backed by something in your resume. Rehearse the ' +
          'failure and judgement questions; those are the ones people under-prepare.'
    }
  };
}

/** Prefer the advertisement's own word over the internal canonical name. */
function label(canonical, job) {
  return surfaceForm(canonical, job && job.adText, canonical);
}

module.exports = { prepare, TECHNICAL_FRAMES, GAP_FRAMES, BEHAVIOURAL_QUESTIONS, QUESTIONS_TO_ASK };
