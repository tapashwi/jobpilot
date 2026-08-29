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

const { matchSkills, canonicalise } = require('./skills');

/** Do two inclusive ranges overlap? Either being open-ended counts as overlap. */
function rangesOverlap(aMin, aMax, bMin, bMax) {
  const lo1 = Number.isFinite(aMin) ? aMin : -Infinity;
  const hi1 = Number.isFinite(aMax) ? aMax : Infinity;
  const lo2 = Number.isFinite(bMin) ? bMin : -Infinity;
  const hi2 = Number.isFinite(bMax) ? bMax : Infinity;
  return lo1 <= hi2 && lo2 <= hi1;
}

/**
 * Number, or null.
 *
 * The explicit null check is load-bearing. `Number(null)` is 0 and 0 is
 * finite, so the obvious one-liner turned "this job did not state a salary"
 * into "this job pays zero" — and the salary gate then blocked every job
 * without an advertised range for anyone who had set a minimum. It only
 * escaped notice because callers that OMIT the field give undefined, which
 * becomes NaN and behaves correctly; the browser sends explicit nulls from
 * empty inputs, so the bug appeared in the app and not in any test.
 */
const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

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

module.exports = { assess, rank, softScore, rangesOverlap, GATES, canonicalise };
