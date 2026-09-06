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
    if (canonical.startsWith('_')) continue; // _comment, _format, _ambiguous
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
/**
 * Skill names that are also ordinary English words.
 *
 * "Go" is the clearest case: a resume saying "go live", "go to market" or
 * "ready to go" would otherwise be credited with the Go programming language,
 * and the applicant would be matched to jobs they cannot do. The same applies
 * to "R", "C" and "Swift".
 *
 * These are not dropped — that would lose every genuine mention. They are
 * accepted only with corroboration, which is either:
 *
 *   (a) an unambiguous form appearing anywhere in the same text ("golang"), or
 *   (b) the term appearing inside a delimited list, which is what a skills
 *       section looks like: "Go, Python, Rust" or a bullet that is just "Go".
 *
 * Prose can produce (b) only by accident and rarely does; a skills list
 * produces it always. That asymmetry is the whole trick.
 */
const AMBIGUOUS = ALIASES._ambiguous || {};

function inListContext(raw, esc) {
  // MUST run on the raw text, not the normalised text. normalise() strips
  // punctuation and collapses whitespace, so by the time text reaches the
  // matcher "Skills: Go, Python, Rust" has become "skills go python rust" —
  // every delimiter this function looks for has already been deleted. Testing
  // the normalised string here made the list case unreachable, which is the
  // only case that lets a bare "Go" through at all.
  const D = '(?:^|[,;:/|•·\\-\\n\\t]|\\s{2,})\\s*';
  const E = '\\s*(?:$|[,;:/|•·\\n\\t]|\\s{2,})';
  return new RegExp(D + esc + E, 'im').test(String(raw).toLowerCase());
}

function extractSkills(text) {
  const hay = normalise(text);
  const found = new Set();

  // Corroborating forms present anywhere in this text.
  const corroborated = new Set();
  for (const [canonical, unambiguous] of Object.entries(AMBIGUOUS)) {
    for (const form of unambiguous) {
      if (hay.indexOf(normalise(form)) !== -1) {
        corroborated.add(canonical);
        break;
      }
    }
  }

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
    if (!re.test(hay)) continue;

    // An ambiguous canonical needs corroboration, unless the alias that
    // matched was itself one of the unambiguous forms.
    if (AMBIGUOUS[canonical] && !corroborated.has(canonical)) {
      const unambiguousAlias = AMBIGUOUS[canonical].some((f) => normalise(f) === alias);
      if (!unambiguousAlias && !inListContext(text, esc)) continue;
    }

    found.add(canonical);
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


/**
 * The word a piece of text actually uses for this skill.
 *
 * Canonical names are for matching, not for reading. The dictionary resolves
 * "Splunk" to the canonical "siem", so anything that shows a canonical name
 * back to a user writes "Siem" where the advertisement said Splunk — wrong,
 * and obviously machine-written.
 *
 * This lives here rather than in a generator because the same bug appeared
 * independently in the cover letter and again in the interview prep. A defect
 * that recurs in a second module is a missing abstraction, not bad luck.
 *
 * Longest form first, so "amazon web services" wins over "aws" when a document
 * contains both.
 */
function surfaceForm(canonical, text, fallback) {
  const c = canonicalise(canonical);
  if (!text) return fallback === undefined ? c : fallback;
  const forms = [c].concat(ALIASES[c] || []).sort((a, b) => b.length - a.length);
  for (const f of forms) {
    const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = String(text).match(new RegExp('(?<![a-z0-9+#])' + esc + '(?![a-z0-9+#])', 'i'));
    if (m) return m[0];
  }
  return fallback === undefined ? c : fallback;
}

module.exports = { normalise, canonicalise, isKnown, extractSkills, matchSkills, surfaceForm, LOOKUP, ALIASES, AMBIGUOUS, inListContext };

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

/**
 * Phrases that introduce a list of ALTERNATIVES rather than a list of demands.
 *
 * "You are skilled in one or more of C, Python, Go, Rust, Java, Ruby, PHP or
 * JavaScript/TypeScript" is ONE requirement with eight ways to satisfy it.
 * Read naively it becomes eight separate required skills, and a candidate who
 * writes Python is told they are missing seven things — which is what a real
 * Canonical draft said, under advice to reconsider applying for a role whose
 * language requirement was already met.
 *
 * That is the worst direction for this tool to be wrong in: it talks someone
 * out of a job they qualify for, quietly, with a number that looks objective.
 */
const ALTERNATIVE_MARKERS = [
  'one or more of', 'at least one of', 'any of the following', 'any one of',
  'one of the following', 'such as', 'for example', 'e.g.', 'including but not limited to',
  'experience in one of', 'proficient in one or more',
];

/**
 * The groups of skills an ad offers as alternatives to each other.
 *
 * Each group is satisfied by ANY one of its members. Returns canonical names,
 * so the caller compares like with like.
 */
function alternativeGroups(text) {
  const raw = String(text == null ? '' : text);
  const lower = raw.toLowerCase();
  const groups = [];

  for (const marker of ALTERNATIVE_MARKERS) {
    let from = 0;
    for (;;) {
      const at = lower.indexOf(marker, from);
      if (at === -1) break;
      from = at + marker.length;

      // The alternatives run to the end of the sentence, and no further — a
      // following sentence is a separate requirement, not another option.
      const rest = raw.slice(from, from + 300);
      const stop = rest.search(/[.;\n]|\bYou (?:have|are|can|will)\b/);
      const span = stop === -1 ? rest : rest.slice(0, stop);

      const found = extractSkills(span);
      // Two is the minimum that can be an alternative to anything. A single
      // skill after "such as" is just an example of itself, still required.
      if (found.length >= 2) groups.push(found);
    }
  }
  return groups;
}

function parseJobSkills(text) {
  const raw = String(text == null ? '' : text);
  const lower = raw.toLowerCase();

  // The earliest marker wins — everything after it is treated as preference.
  let cut = -1;
  for (const marker of PREFERRED_MARKERS) {
    const at = lower.indexOf(marker);
    if (at !== -1 && (cut === -1 || at < cut)) cut = at;
  }

  const alternatives = alternativeGroups(raw);

  if (cut === -1) {
    return { required: extractSkills(raw), preferred: [], alternatives, splitAt: null };
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
  return { required, preferred, alternatives, splitAt: boundary + 1 };
}

module.exports.parseJobSkills = parseJobSkills;
module.exports.alternativeGroups = alternativeGroups;
module.exports.ALTERNATIVE_MARKERS = ALTERNATIVE_MARKERS;
module.exports.PREFERRED_MARKERS = PREFERRED_MARKERS;
