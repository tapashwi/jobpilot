/**
 * skills.js — normalise and match skills.
 *
 * THE WHOLE MATCHER RESTS ON THIS FILE. If a resume says "k8s" and a posting
 * says "Kubernetes" and these do not resolve to the same thing, every number
 * downstream is wrong — and wrong in the direction that tells someone they are
 * unqualified for a job they can do.
 *
 * The alias table is DATA (data/skill-aliases.json), not code, so it can grow
 * without a release and a user can extend it. Fuzzy string similarity is a
 * fallback AFTER the alias check, never instead of it: "Java" and "JavaScript"
 * are 80% similar as strings and completely different as skills, which is
 * exactly the mistake fuzzy-first matching makes.
 */

const ALIASES = require('../data/skill-aliases.json');

/** Lower-case, strip punctuation, collapse whitespace. Keeps + and # — c++ and c# are real. */
function normalise(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** alias -> canonical, built once. */
const LOOKUP = (() => {
  const map = new Map();
  for (const canonical of Object.keys(ALIASES)) {
    if (canonical.startsWith('_')) continue;
    map.set(normalise(canonical), canonical);
    for (const alias of ALIASES[canonical]) map.set(normalise(alias), canonical);
  }
  return map;
})();

/** The canonical name for a skill, or the normalised input when unknown. */
function canonicalise(skill) {
  const n = normalise(skill);
  return LOOKUP.get(n) || n;
}

/** Is this skill known to the dictionary at all? */
function isKnown(skill) {
  return LOOKUP.has(normalise(skill));
}

/**
 * Find every known skill mentioned in a block of free text.
 *
 * Matches on word boundaries so "ad" does not fire inside "advanced" and
 * "go" does not fire inside "government" — the failure that makes naive
 * substring extraction useless on real resumes.
 */
function extractSkills(text) {
  const hay = normalise(text);
  const found = new Set();

  for (const [alias, canonical] of LOOKUP) {
    if (!alias) continue;
    // Escape regex metacharacters — c++, c#, .net and ci/cd all contain them.
    const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // \b is useless here: it treats +, # and . as boundaries, so "c" would
    // match inside "c++". These lookarounds do the job properly.
    //
    // The subtlety is the full stop. It has to be a boundary — "deployed to
    // AWS." is how people actually write — but NOT when it joins a name, or
    // "node" would match inside "node.js" and shadow the longer alias. So a
    // period only counts as part of the token when a letter or digit follows
    // it. An earlier version simply excluded '.' from the boundary set and
    // silently missed every skill that ended a sentence.
    const re = new RegExp(
      '(?<![a-z0-9+#])(?<![a-z0-9]\\.)' + esc + '(?![a-z0-9+#])(?!\\.[a-z0-9])',
      'i'
    );
    if (re.test(hay)) found.add(canonical);
  }
  return [...found].sort();
}

/**
 * Compare a candidate's skills against what a job asks for.
 *
 * Required and preferred are kept apart throughout. Missing a required skill
 * is a different problem from missing a preferred one, and collapsing them
 * into one "missing" list is how a tool ends up telling someone not to apply
 * for a job they would get.
 */
function matchSkills(candidateSkills, jobRequired, jobPreferred) {
  const have = new Set((candidateSkills || []).map(canonicalise));
  const required = [...new Set((jobRequired || []).map(canonicalise))];
  const preferred = [...new Set((jobPreferred || []).map(canonicalise))].filter((s) => !required.includes(s));

  const matchedRequired = required.filter((s) => have.has(s));
  const missingRequired = required.filter((s) => !have.has(s));
  const matchedPreferred = preferred.filter((s) => have.has(s));
  const missingPreferred = preferred.filter((s) => !have.has(s));

  return {
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    // Ratios are reported, never used as the headline. A job listing three
    // skills against a candidate listing thirty is not "1000% matched".
    requiredRatio: required.length ? matchedRequired.length / required.length : 1,
    preferredRatio: preferred.length ? matchedPreferred.length / preferred.length : 1
  };
}

module.exports = { normalise, canonicalise, isKnown, extractSkills, matchSkills, LOOKUP, ALIASES };

/**
 * Split a job ad's skills into required and preferred.
 *
 * WHY THIS EXISTS. Reading every skill out of an ad as "required" produces the
 * single worst failure this tool can have: telling someone a nice-to-have
 * blocks them. An ad saying "Azure, Defender and SIEM essential. KQL a plus."
 * must not report KQL as a gate.
 *
 * It is deliberately crude and its limits are stated rather than hidden: it
 * looks for preference markers and treats everything from the first marker
 * onward as preferred. Ads that interleave the two, or that bury a
 * nice-to-have in a paragraph of essentials, will be read wrongly — which is
 * why the UI lets the user override the lists by hand.
 */
const PREFERRED_MARKERS = [
  'a plus', 'nice to have', 'nice-to-have', 'desirable', 'preferred', 'preferably',
  'bonus', 'advantageous', 'an advantage', 'would be great', 'ideally', 'highly regarded',
  'well regarded', 'not essential', 'beneficial'
];

function parseJobSkills(text) {
  const raw = String(text == null ? '' : text);
  const lower = raw.toLowerCase();

  // The earliest marker wins — everything after it is treated as preference.
  let cut = -1;
  for (const marker of PREFERRED_MARKERS) {
    const at = lower.indexOf(marker);
    if (at !== -1 && (cut === -1 || at < cut)) cut = at;
  }

  if (cut === -1) {
    return { required: extractSkills(raw), preferred: [], splitAt: null };
  }

  // Back up to the start of the sentence carrying the marker, so "KQL a plus"
  // puts KQL on the preferred side rather than leaving it with the essentials.
  const boundary = Math.max(
    raw.lastIndexOf('.', cut),
    raw.lastIndexOf('\n', cut),
    raw.lastIndexOf(';', cut)
  );
  const head = raw.slice(0, boundary + 1);
  const tail = raw.slice(boundary + 1);

  const required = extractSkills(head);
  const preferred = extractSkills(tail).filter((s) => !required.includes(s));
  return { required, preferred, splitAt: boundary + 1 };
}

module.exports.parseJobSkills = parseJobSkills;
module.exports.PREFERRED_MARKERS = PREFERRED_MARKERS;
