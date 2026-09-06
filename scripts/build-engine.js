#!/usr/bin/env node
/**
 * build-engine.js — bundle the matching engine into one browser file.
 *
 * A concatenation instead of a bundler. The app is a handful of modules and a
 * JSON file; adding Vite to move them would be more configuration than code.
 *
 * ORDER MATTERS, and it is the only fragile thing here: every module lands in
 * one shared scope, so a module must appear after the ones it uses. Two
 * modules declaring the same `const` is a syntax error that takes the whole
 * app down on load, which is why GAP lives in evidence.js and not in both
 * generators that need it.
 *
 * The point is that the browser build is GENERATED, so it cannot drift from
 * the source the tests exercise. Maintaining a hand-written "browser copy" is
 * how a project ends up with tested logic and shipped logic that disagree.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf-8');

/** Strip the CommonJS seams; everything shares one scope inside the bundle. */
function strip(src) {
  return src
    .replace(/^const .*= require\(.*\);?\s*$/gm, '')
    // Catches `module.exports = {...}` AND `module.exports.foo = foo` — an
    // earlier version matched only the first form, so a later
    // `module.exports.parseJobSkills = ...` leaked into the browser bundle
    // and threw "module is not defined" on load, taking the whole app with it.
    .replace(/^module\.exports\b[\s\S]*?;\s*$/gm, '');
}

/**
 * Every top-level `const`/`let`/`var`/`function`/`class` a module contributes
 * to the shared scope.
 *
 * Deliberately anchored to column zero. A declaration indented by even one
 * space is inside a function and cannot collide with anything, so matching it
 * would report collisions that are not real — and a checker that cries wolf
 * gets switched off.
 */
function topLevelNames(src) {
  const names = [];
  const re = /^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(src)) !== null) names.push(m[1]);
  return names;
}

/**
 * Refuse to emit a bundle that cannot parse.
 *
 * The header above has warned about this since the first version, and a
 * warning in a comment is not a check. `num` was declared at the top level of
 * BOTH match.js and package-value.js, so adding the second to MODULES would
 * have produced "Identifier 'num' has already been declared" — a syntax error,
 * which means the whole app fails to load, every tab at once. The tests would
 * have stayed green throughout, because they require the modules separately
 * and never see the shared scope. Better to fail the build.
 */
function assertNoCollisions(sources) {
  const seen = new Map();
  const clashes = [];
  for (const { module: mod, src } of sources) {
    for (const name of topLevelNames(src)) {
      if (seen.has(name) && seen.get(name) !== mod) {
        clashes.push(`  ${name} — declared in both ${seen.get(name)} and ${mod}`);
      } else {
        seen.set(name, mod);
      }
    }
  }
  if (clashes.length) {
    throw new Error(
      `${clashes.length} name(s) declared at the top level of more than one module.\n` +
      'Every module lands in one shared scope, so this would be a syntax error and the ' +
      `app would not load at all:\n${clashes.join('\n')}\n` +
      'Rename one of them — the newer module, by convention.',
    );
  }
}

const aliases = read('packages/matching/data/skill-aliases.json');

// Dependency order, innermost first.
const MODULES = [
  'packages/matching/src/skills.js',
  'packages/matching/src/match.js',
  'packages/matching/src/package-value.js',
  'packages/documents/src/evidence.js',
  'packages/documents/src/cover-letter.js',
  'packages/documents/src/tells.js',
  'packages/documents/src/selection-criteria.js',
  'packages/ats/src/ats-check.js',
  'packages/tracker/src/pipeline.js',
  'packages/prep/src/interview.js',
  'packages/prep/src/tailor.js',
  'packages/prep/src/followup.js',
  'packages/autofill/src/fieldmap.js',
  'packages/autofill/src/answers.js',
  'packages/autofill/src/runner.js',
  'packages/autofill/src/orchestrator.js',
  'packages/discovery/src/sources.js',
  'packages/discovery/src/harvest.js',
  'packages/discovery/src/campaign.js',
  'packages/discovery/src/jobpage.js'
];

const sources = MODULES.map((m) => ({ module: m, src: strip(read(m)) }));
assertNoCollisions(sources);
const body = sources.map(({ module: m, src }) => `  // ---- ${m}\n${src}`).join('\n');

const out = `/**
 * GENERATED FILE — do not edit.
 *
 * Built from packages/matching/src by scripts/build-engine.js.
 * Edit the source and run \`npm run build:engine\`. The tests run against the
 * source, so a hand-edit here would be untested code shipping to users.
 */
(function (root) {
  'use strict';

  const ALIASES = ${aliases};

${body}

  root.JobPilot = {
    // matching
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
    GATES: GATES,
    // evidence and documents
    statements: statements,
    evidenceFor: evidenceFor,
    strongest: strongest,
    coverLetter: coverLetter,
    tells: tells,
    rhythm: rhythm,
    // where the job is, and what the package is really worth
    reachability: reachability,
    requiresPresence: requiresPresence,
    isFullyRemote: isFullyRemote,
    effectivePackage: effectivePackage,
    advertisedValue: advertisedValue,
    parseCriteria: parseCriteria,
    draftResponse: draftResponse,
    draftAll: draftAll,
    behaviouralKind: behaviouralKind,
    LIMITS: LIMITS,
    // ats
    checkResume: checkResume,
    keywordCoverage: keywordCoverage,
    // pipeline
    splitAdvertisements: splitAdvertisements,
    parseAdvertisement: parseAdvertisement,
    buildPack: buildPack,
    buildQueue: buildQueue,
    transition: transition,
    needsFollowUp: needsFollowUp,
    STATUSES: STATUSES,
    // prep
    prepare: prepare,
    tailor: tailor,
    draftFollowUp: draft,
    suggestFollowUp: suggest,
    FOLLOWUP_TEMPLATES: TEMPLATES,
    QUESTIONS_TO_ASK: QUESTIONS_TO_ASK,
    surfaceForm: surfaceForm,
    // autofill
    identify: identify,
    valueFor: valueFor,
    planForm: planForm,
    runOne: runOne,
    runBatch: runBatch,
    jobKey: jobKey,
    answerReadiness: readiness,
    STANDARD_ANSWERS: STANDARD,
    lookupFreeText: lookupFreeText,
    rememberAnswer: remember,
    MODES: MODES,
    // discovery
    searchSources: search,
    fetchSource: fetchSource,
    keylessSources: keylessSources,
    missingCredentials: missingCredentials,
    harvest: harvest,
    supportedBoards: supportedBoards,
    runCampaign: run,
    enrichJob: enrich,
    applicationEmail: applicationEmail,
    emailDraft: emailDraft,
    readJobPage: readJobPage,
    // orchestration
    preflight: preflight,
    startRun: startRun,
    current: current,
    recordAndAdvance: recordAndAdvance,
    pauseRun: pause,
    resumeRun: resume,
    stop: stop,
    summarise: summarise
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
`;

// Written to BOTH consumers. The extension had a hand-copied engine.js for
// exactly one commit, which is one commit longer than a duplicated generated
// file should ever exist — it drifts the first time someone rebuilds one and
// not the other, and the symptom is the extension behaving differently from
// the web app for no visible reason.
if (require.main === module) {
  for (const dest of ['app/engine.js', 'extension/engine.js']) {
    fs.writeFileSync(path.join(ROOT, dest), out);
  }
  console.log('engine.js built —', out.split('\n').length, 'lines (app + extension)');
}

// Exported so the collision guard is itself tested. A safety net nobody
// exercises is the one that has quietly stopped working by the time it is
// needed — the same reason tests/unsourced-claims.test.js plants a fabrication
// rather than only asserting the count is zero.
module.exports = { topLevelNames, assertNoCollisions, MODULES };
