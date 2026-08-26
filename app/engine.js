/**
 * GENERATED FILE — do not edit.
 *
 * Built from packages/matching/src by scripts/build-engine.js.
 * Edit the source and run `npm run build:engine`. The tests run against the
 * source, so a hand-edit here would be untested code shipping to users.
 */
(function (root) {
  'use strict';

  const ALIASES = {
  "_comment": "Skill aliases. THE MATCHER LIVES OR DIES HERE: if a resume says 'k8s' and a posting says 'Kubernetes' and this file does not connect them, every number downstream is wrong. Data, not code, so it can be extended without a release. Canonical name -> every form seen in the wild.",
  "_format": "canonical: [alias, ...]. Matching is case-insensitive and punctuation-insensitive; do not add case variants.",

  "kubernetes": ["k8s", "kube"],
  "docker": ["containerisation", "containerization", "docker containers"],
  "amazon web services": ["aws", "amazon aws"],
  "microsoft azure": ["azure", "ms azure", "windows azure"],
  "google cloud platform": ["gcp", "google cloud"],
  "microsoft entra id": ["azure ad", "azure active directory", "aad", "entra"],
  "active directory": ["ad ds", "windows active directory", "on-prem ad"],
  "microsoft intune": ["intune", "endpoint manager", "mem", "microsoft endpoint manager"],
  "microsoft defender": ["defender", "defender for endpoint", "mde", "windows defender"],
  "microsoft 365": ["m365", "o365", "office 365", "microsoft office 365"],
  "powershell": ["ps1", "windows powershell"],
  "javascript": ["js", "ecmascript", "es6", "es2015"],
  "typescript": ["ts"],
  "python": ["python3", "py"],
  "c#": ["c sharp", "csharp", "dotnet c#"],
  ".net": ["dotnet", "dot net", ".net core", "asp.net"],
  "sql": ["t-sql", "tsql", "structured query language"],
  "postgresql": ["postgres", "psql"],
  "microsoft sql server": ["mssql", "sql server"],
  "mysql": ["maria db", "mariadb"],
  "terraform": ["hashicorp terraform", "iac terraform"],
  "ansible": ["red hat ansible"],
  "ci/cd": ["cicd", "continuous integration", "continuous delivery", "continuous deployment", "build pipeline"],
  "github actions": ["gh actions"],
  "azure devops": ["ado", "vsts", "tfs", "team foundation server"],
  "jenkins": [],
  "git": ["version control", "source control"],
  "linux": ["unix", "rhel", "red hat enterprise linux", "ubuntu server", "centos"],
  "windows server": ["win server", "windows server administration"],
  "vmware": ["vsphere", "esxi", "vcenter"],
  "hyper-v": ["hyperv", "microsoft hyper-v"],
  "networking": ["tcp/ip", "tcpip", "lan", "wan", "routing and switching"],
  "cisco": ["ios-xe", "cisco ios"],
  "firewall": ["firewalls", "palo alto", "fortinet", "fortigate", "checkpoint", "asa"],
  "vpn": ["virtual private network", "ipsec", "ssl vpn"],
  "siem": ["security information and event management", "splunk", "sentinel", "microsoft sentinel", "qradar", "log analytics"],
  "kql": ["kusto", "kusto query language"],
  "soc": ["security operations centre", "security operations center"],
  "incident response": ["ir", "dfir", "digital forensics and incident response"],
  "penetration testing": ["pen testing", "pentest", "pentesting", "ethical hacking"],
  "vulnerability management": ["vuln management", "patch management", "nessus", "qualys", "tenable"],
  "iso 27001": ["iso27001", "isms", "iso/iec 27001"],
  "essential eight": ["essential 8", "e8", "acsc essential eight"],
  "nist": ["nist csf", "nist cybersecurity framework", "nist 800-53"],
  "itil": ["itil v4", "itil 4", "service management"],
  "servicenow": ["snow", "service now"],
  "jira": ["atlassian jira"],
  "confluence": ["atlassian confluence"],
  "agile": ["scrum", "kanban", "agile delivery"],
  "react": ["react.js", "reactjs"],
  "node.js": ["node", "nodejs"],
  "rest api": ["restful api", "rest apis", "web api", "api development"],
  "power bi": ["powerbi", "microsoft power bi"],
  "excel": ["microsoft excel", "advanced excel"],
  "sharepoint": ["microsoft sharepoint", "sharepoint online"],
  "backup and recovery": ["veeam", "backup", "disaster recovery", "dr", "bcp"],
  "help desk": ["helpdesk", "service desk", "desktop support", "level 1 support", "l1 support", "level 2 support", "l2 support"]
}
;

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



/**
 * match.js — decide whether a job is worth applying to, and say why.
 *
 * WHY THIS IS NOT A WEIGHTED SUM
 *
 * The obvious design — skills 30%, experience 20%, location 15%, salary 10% —
 * is wrong, and wrong in a way that produces confident nonsense:
 *
 *   Salary is BINARY. If the ranges do not overlap it is a no, not a 10%
 *   deduction that a strong skills match can paper over.
 *   Location is usually binary too. "Must be in Adelaide" is not 15% of a
 *   decision, it is the decision.
 *   Experience is not linear. "5 years required" is not 60% satisfied by 3.
 *   Education is a minimum, so it passes or fails.
 *
 * So: HARD GATES FIRST. Anything that fails a gate is reported as a failure
 * with the specific reason. Only jobs that clear every gate get a soft score,
 * and that score ranks jobs against each other rather than pretending to be
 * an absolute percentage. "72%" invites a precision that does not exist.
 */


/** Do two inclusive ranges overlap? Either being open-ended counts as overlap. */
function rangesOverlap(aMin, aMax, bMin, bMax) {
  const lo1 = Number.isFinite(aMin) ? aMin : -Infinity;
  const hi1 = Number.isFinite(aMax) ? aMax : Infinity;
  const lo2 = Number.isFinite(bMin) ? bMin : -Infinity;
  const hi2 = Number.isFinite(bMax) ? bMax : Infinity;
  return lo1 <= hi2 && lo2 <= hi1;
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * The gates. Each returns null when it passes, or { id, reason, detail }
 * when it fails.
 *
 * Every message names the specific mismatch, because "not a match" tells
 * someone nothing they can act on. "Requires 5 years, your profile says 3"
 * tells them whether to apply anyway.
 */
const GATES = [
  {
    id: 'required-skills',
    check(profile, job) {
      const m = matchSkills(profile.skills, job.requiredSkills, job.preferredSkills);
      if (!m.missingRequired.length) return null;
      return {
        reason: `Missing ${m.missingRequired.length} required skill${m.missingRequired.length === 1 ? '' : 's'}`,
        detail: m.missingRequired.join(', ')
      };
    }
  },
  {
    id: 'experience',
    check(profile, job) {
      const need = num(job.minYearsExperience);
      const have = num(profile.yearsExperience);
      if (need === null || have === null) return null;
      if (have >= need) return null;
      return {
        reason: `Requires ${need} years of experience`,
        // The shortfall is what decides whether to apply anyway. Six months
        // short of five years is worth a shot; four years short is not.
        detail: `Your profile says ${have} — ${(need - have).toFixed(1)} short`
      };
    }
  },
  {
    id: 'salary',
    check(profile, job) {
      const wantMin = num(profile.minSalary);
      if (wantMin === null) return null;
      const jobMin = num(job.salaryMin);
      const jobMax = num(job.salaryMax);
      if (jobMin === null && jobMax === null) return null;
      if (rangesOverlap(wantMin, null, jobMin, jobMax)) return null;
      return {
        reason: 'Pay is below your minimum',
        detail: `Job pays up to ${jobMax === null ? 'unspecified' : jobMax.toLocaleString()}; you need at least ${wantMin.toLocaleString()}`
      };
    }
  },
  {
    id: 'work-arrangement',
    check(profile, job) {
      // Only a gate when the candidate has stated a hard requirement.
      if (!profile.remoteRequired) return null;
      const arr = String(job.workArrangement || '').toLowerCase();
      if (!arr) return null;
      if (arr.includes('remote') || arr.includes('hybrid')) return null;
      return {
        reason: 'On-site only, and you require remote',
        detail: `The posting says ${job.workArrangement}`
      };
    }
  },
  {
    id: 'sponsorship',
    check(profile, job) {
      // The one that wastes the most time when it is missed.
      if (!profile.needsSponsorship) return null;
      if (job.sponsorshipOffered !== false) return null;
      return {
        reason: 'No visa sponsorship',
        detail: 'You need sponsorship and this employer states they do not offer it'
      };
    }
  }
];

/**
 * The soft score, for jobs that already cleared every gate.
 *
 * Deliberately narrow: preferred-skill coverage plus a small bonus for
 * comfortably exceeding the experience minimum. It is a tie-breaker for
 * ranking, NOT a verdict — the verdict was the gates.
 */
function softScore(profile, job) {
  const m = matchSkills(profile.skills, job.requiredSkills, job.preferredSkills);
  let score = m.preferredRatio * 100;

  const need = num(job.minYearsExperience);
  const have = num(profile.yearsExperience);
  if (need !== null && have !== null && need > 0) {
    // Capped: twice the required experience is not twice as good a fit, and
    // past a point it reads as overqualified.
    score += Math.min(15, ((have - need) / need) * 15);
  }
  return Math.max(0, Math.round(Math.min(100, score)));
}

/**
 * Assess one job against one profile.
 *
 * Returns everything needed to explain the outcome. Nothing here is a bare
 * number without the reasoning beside it.
 */
function assess(profile, job) {
  const p = profile || {};
  const j = job || {};

  const blockers = [];
  for (const gate of GATES) {
    const fail = gate.check(p, j);
    if (fail) blockers.push({ id: gate.id, ...fail });
  }

  const skills = matchSkills(p.skills, j.requiredSkills, j.preferredSkills);
  const passed = blockers.length === 0;

  return {
    passed,
    blockers,
    skills,
    // Only meaningful when the gates passed; null otherwise, so no screen can
    // accidentally show a score beside a hard failure.
    score: passed ? softScore(p, j) : null,
    verdict: verdictFor(passed, blockers, skills),
    checkedGates: GATES.map((g) => g.id)
  };
}

function verdictFor(passed, blockers, skills) {
  if (!passed) {
    const only = blockers.length === 1 ? blockers[0] : null;
    return {
      level: 'blocked',
      headline: only ? only.reason : `${blockers.length} requirements not met`,
      advice:
        'This does not meet a stated requirement. Applying anyway is your call — ' +
        'employers do stretch on some of these, but know which one you are stretching.'
    };
  }
  if (!skills.missingPreferred.length) {
    return { level: 'strong', headline: 'Meets every requirement listed', advice: 'Worth applying.' };
  }
  return {
    level: 'clear',
    headline: 'Meets every hard requirement',
    advice: `Missing some preferred skills: ${skills.missingPreferred.join(', ')}. These are usually negotiable.`
  };
}

/**
 * Rank several assessed jobs. Blocked jobs sort last and keep their reason —
 * they are not hidden, because "why was this filtered out" is a question
 * people actually ask.
 */
function rank(assessments) {
  return [...(assessments || [])].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? -1 : 1;
    if (!a.passed) return a.blockers.length - b.blockers.length;
    return (b.score || 0) - (a.score || 0);
  });
}



  root.JobPilot = {
    normalise: normalise,
    canonicalise: canonicalise,
    isKnown: isKnown,
    extractSkills: extractSkills,
    matchSkills: matchSkills,
    assess: assess,
    rank: rank,
    softScore: softScore,
    parseJobSkills: parseJobSkills,
    PREFERRED_MARKERS: PREFERRED_MARKERS,
    GATES: GATES
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
