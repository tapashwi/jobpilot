/**
 * tells.js — find the phrases that make a letter read as machine-written.
 *
 * WHY A CHECKER AND NOT A REWRITER
 *
 * "Humanised" is the kind of claim that is easy to assert and impossible to
 * verify, which is exactly the sort of claim that turns out to be false. So
 * this does not rewrite anything. It reads a finished draft and names the
 * phrases a recruiter's eye snags on, and the caller has to deal with them.
 *
 * A rewriter would also be self-defeating here: the thing being detected is
 * generated prose, and generating the replacement is how you get a different
 * batch of the same fingerprint.
 *
 * THE LIST IS NOT INVENTED. It comes from
 * Bootstrap/.claude/skills/humanizer/SKILL.md, which is this project's own
 * blacklist, already used on every script and blog post before publishing.
 * Reusing it means a letter and a video script are held to one standard, and
 * that the list improves in one place.
 *
 * Cover letters get a few entries of their own on top, because the genre has
 * its own dead phrases — "I am writing to apply", "I am excited by the
 * opportunity", "team player", "hit the ground running" — which no recruiter
 * has read with interest since about 1997.
 */

/** Single words that mark generated prose. */
const TELL_WORDS = [
  'delve', 'tapestry', 'testament', 'moreover', 'furthermore', 'notably',
  'crucial', 'pivotal', 'foster', 'harness', 'realm', 'seamless', 'robust',
  'elevate', 'unlock', 'embark', 'boast', 'game-changer', 'revolutionize',
  'revolutionise', 'synergy', 'holistic', 'myriad', 'plethora',
];

/** Verb uses that are tells; the noun forms are often fine. */
const TELL_PHRASES = [
  { re: /\bleverag(e|ing|ed)\b/i, why: 'the verb "leverage" — say "use"' },
  { re: /\bnavigat(e|ing)\s+(the|this|a)\s+\w+\s+(landscape|space|world)\b/i, why: 'metaphorical "navigate the landscape"' },
  { re: /\bin today'?s\s+(fast-paced|ever-changing|digital)\b/i, why: '"in today\'s fast-paced world"' },
  // Both contractions and the expanded form. The first version required
  // "it's" and sailed straight past "It is not just a job, it is a calling",
  // which is the same tell wearing a tie.
  { re: /\bit('s| is| was)\s+not\s+just\b[^.]*\bit('s| is| was)\b/i, why: '"it\'s not just X, it\'s Y" — the single commonest tell' },
  { re: /\bnot\s+just\s+\w+[^.]*\s+but\s+\w+/i, why: '"not just X but Y"' },
  { re: /\bnot only\b[^.]*\bbut also\b/i, why: '"not only X but also Y"' },
  { re: /\bwhether you'?re a\b/i, why: '"whether you\'re a X or a Y"' },
  { re: /\blet'?s (dive in|break it down|unpack)\b/i, why: '"let\'s dive in"' },
  { re: /\bcould potentially\b|\bmay possibly\b/i, why: 'stacked hedging' },
];

/**
 * Cover-letter specific. These are not AI tells so much as dead conventions,
 * but they fail the same way: the reader's eye slides off them.
 */
const LETTER_CLICHES = [
  { re: /\bI am writing to (apply|express)\b/i, why: '"I am writing to apply" — they know why you wrote' },
  { re: /\bI am (excited|thrilled|passionate)\b/i, why: 'stated enthusiasm; show it with a fact instead' },
  { re: /\bteam player\b/i, why: '"team player"' },
  { re: /\bhit the ground running\b/i, why: '"hit the ground running"' },
  { re: /\bthink outside the box\b/i, why: '"think outside the box"' },
  { re: /\bproven track record\b/i, why: '"proven track record" — prove it with one number' },
  { re: /\bwealth of experience\b/i, why: '"a wealth of experience"' },
  { re: /\bperfect (fit|candidate)\b/i, why: 'claiming to be the perfect fit; let them conclude it' },
  { re: /\bI believe (I|my)\b/i, why: '"I believe I would be" — hedged and weak' },
  { re: /\bdynamic (environment|team|role)\b/i, why: '"dynamic environment"' },
];

/** A rule-of-three list: "fast, simple, and powerful". */
const TRIAD = /\b(\w+),\s+(\w+),?\s+and\s+(\w+)\b/g;

function sentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Every sentence the same length is itself a tell, so this reports the spread
 * rather than a single number. Human writing varies hard; generated writing
 * settles around one comfortable length.
 */
function rhythm(text) {
  const lens = sentences(text).map((s) => s.split(/\s+/).filter(Boolean).length);
  if (lens.length < 3) return { sentences: lens.length, min: null, max: null, spread: null, monotonous: false };
  const min = Math.min(...lens);
  const max = Math.max(...lens);
  return {
    sentences: lens.length,
    min,
    max,
    spread: max - min,
    // A spread under 8 words across a whole letter means every sentence has
    // roughly the same shape, which reads as machine-set even when no
    // individual phrase is wrong.
    //
    // The spread ALONE is not enough, and the absolute threshold on its own
    // was wrong: "Three years running identity for a legal aid commission. No
    // Okta yet. The shape is the same." runs 9, 3 and 5 words — as varied as
    // prose gets — and scored a spread of 6, so it was flagged. Short
    // sentences cannot clear an 8-word bar without one of them being 13+
    // words, which is the opposite of what the rule is asking for. So the
    // ratio has to agree: 9 against 3 is a threefold swing and settles it.
    // Both measures must say monotonous before it is called.
    //
    // And four sentences is the floor. Three is a sample, not a habit.
    monotonous: lens.length >= 4 && max - min < 8 && max / Math.max(min, 1) < 2,
  };
}

/**
 * Scan a draft. Returns one finding per problem, each naming the exact text
 * so it can be found and changed rather than hunted for.
 */
function tells(text) {
  const t = String(text || '');
  const found = [];

  for (const w of TELL_WORDS) {
    const re = new RegExp(`\\b${w}\\b`, 'i');
    const m = t.match(re);
    if (m) found.push({ kind: 'word', text: m[0], why: `"${w}" is on the AI-tell list` });
  }

  for (const { re, why } of TELL_PHRASES.concat(LETTER_CLICHES)) {
    const m = t.match(re);
    if (m) found.push({ kind: 'phrase', text: m[0].trim(), why });
  }

  // Triads are only a tell in quantity. One is a sentence; three is a habit.
  const triads = [...t.matchAll(TRIAD)];
  if (triads.length >= 3) {
    found.push({
      kind: 'rhythm',
      text: triads.slice(0, 3).map((m) => m[0]).join(' / '),
      why: `${triads.length} rule-of-three lists — vary the count`,
    });
  }

  const r = rhythm(t);
  if (r.monotonous) {
    found.push({
      kind: 'rhythm',
      text: `${r.sentences} sentences, ${r.min}-${r.max} words`,
      why: 'every sentence is roughly the same length; break one short',
    });
  }

  return found;
}

module.exports = { tells, rhythm, sentences, TELL_WORDS, TELL_PHRASES, LETTER_CLICHES };
