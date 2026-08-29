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

const aliases = read('packages/matching/data/skill-aliases.json');

// Dependency order, innermost first.
const MODULES = [
  'packages/matching/src/skills.js',
  'packages/matching/src/match.js',
  'packages/documents/src/evidence.js',
  'packages/documents/src/cover-letter.js',
  'packages/documents/src/selection-criteria.js',
  'packages/ats/src/ats-check.js',
  'packages/tracker/src/pipeline.js'
];
const body = MODULES.map((m) => `  // ---- ${m}\n${strip(read(m))}`).join('\n');

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
    STATUSES: STATUSES
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
`;

fs.writeFileSync(path.join(ROOT, 'app/engine.js'), out);
console.log('app/engine.js built —', out.split('\n').length, 'lines');
