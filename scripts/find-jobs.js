#!/usr/bin/env node
/**
 * find-jobs.js — run a real campaign against a real profile and print what
 * clears the bar.
 *
 * WHAT THIS CAN AND CANNOT REACH, so the output is not mistaken for the market
 *
 *   Reachable here: Greenhouse and Lever employer boards, Arbeitnow, RemoteOK,
 *   Remotive — all keyless. Adzuna and Jooble too, when their free keys are in
 *   the environment; those are the ones that actually cover Australia.
 *
 *   NOT reachable here, and no key exists to change that: SEEK, Indeed,
 *   LinkedIn, Gumtree. See the header of packages/discovery/src/sources.js,
 *   probed live. Those are read by the extension from a results page you are
 *   already logged into and looking at — which is a browser, not this script.
 *
 * So a short list from this script means "few matches on the boards it can
 * see", never "few jobs exist". It prints the distinction rather than leaving
 * it to be inferred.
 *
 * THE PAY ARM OF THE GATE IS ALMOST ALWAYS INERT. Measured 2026-09-06 across
 * 1,394 collected jobs: **13 stated a salary at all — 0.9%**. Two of those
 * were reachable, and none beat the current package.
 *
 * That is a fact about the market, not a bug: employers on these boards do not
 * publish pay. It means the "or a better package" half of the campaign can
 * only ever evaluate about one job in a hundred, and every match this script
 * reports in practice comes through the security-discipline arm instead. Worth
 * knowing before anyone tunes the salary thresholds expecting the list to
 * move — correcting the current-package figure by $49k changed the match count
 * by zero, for exactly this reason.
 *
 * Usage:
 *   node scripts/find-jobs.js                 # keyless sources
 *   node scripts/find-jobs.js --query "security analyst"
 *   ADZUNA_APP_ID=.. ADZUNA_APP_KEY=.. node scripts/find-jobs.js
 */

const fs = require('fs');
const path = require('path');
const { search, keylessSources, ADAPTERS } = require('../packages/discovery/src/sources');
const { campaignReason, effectivePackage, isSecurityRole } = require('../packages/matching/src/package-value');

const PROFILE_PATH = path.join(__dirname, '..', 'profile.local.json');

/**
 * Employers whose boards are worth polling for this profile.
 *
 * Greenhouse and Lever are per-employer, so a list of slugs IS the job board.
 * These are Australian or AU-hiring technology and security employers; a wrong
 * slug 404s harmlessly and is reported, so the list is cheap to extend.
 */
const COMPANY_SLUGS = {
  // EVERY SLUG HERE RETURNED LIVE JOBS when probed on 2026-09-06. The first
  // list was guessed from brand names and six of nine 404'd — canva,
  // atlassian, airwallex and safetyculture do not use these ATSes under those
  // slugs. A wrong slug 404s harmlessly and is reported, so it costs nothing
  // to check and silently costs recall not to.
  //
  // Probed and NOT added, because they returned nothing under any obvious
  // slug: employmenthero, deputy, linktree, go1, zeller, hipages, tyro,
  // dovetail, myob, xero, wisetechglobal, nearmap, megaport, datacom, iress,
  // pexa — and all 30 SmartRecruiters candidates. SmartRecruiters keys its
  // boards on an internal company id rather than the brand name, so those
  // cannot be guessed at all; that ATS needs a real board URL to add.
  greenhouse: [
    'cultureamp', 'octopusdeploy', 'eucalyptus', 'prospa',
    // Security vendors. Not Australian employers, but they hire into
    // Australia and every posting they publish is a security posting — which
    // is the discipline being searched for. The location gate decides which
    // of them are actually reachable; that is its job, not this list's.
    'cloudflare', 'okta', 'elastic',
  ],
  lever: ['immutable', 'kasada', 'brighte', 'mable'],
  ashby: ['relevanceai'],
};

function loadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    console.error(`No profile at ${PROFILE_PATH}.`);
    console.error('It is gitignored on purpose — it holds a salary figure. Create it before running.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
}

function buildSourceList(opts) {
  const list = [];
  for (const s of keylessSources()) {
    if (ADAPTERS[s].perCompany) {
      for (const company of COMPANY_SLUGS[s] || []) list.push({ source: s, company });
    } else {
      list.push({ source: s });
    }
  }
  if (opts.adzunaAppId && opts.adzunaAppKey) list.push({ source: 'adzuna' });
  if (opts.joobleKey) list.push({ source: 'jooble' });
  return list;
}

const money = (n) => (n === null || n === undefined ? '—' : '$' + Number(n).toLocaleString());

async function main() {
  const qIndex = process.argv.indexOf('--query');
  const query = qIndex !== -1 ? process.argv[qIndex + 1] : 'security';

  const profile = loadProfile();
  const current = effectivePackage(profile.currentBase, profile.packageOptions);

  console.log('');
  console.log('JOBPILOT CAMPAIGN — ' + profile.name);
  console.log('='.repeat(72));
  console.log(`Profile: ${profile.title}, ${profile.location}, ${profile.yearsExperience} yrs`);
  console.log('');
  console.log('YOUR CURRENT PACKAGE (the bar every ad is measured against)');
  console.log(`  base              ${money(current.base)}`);
  console.log(`  + super           ${money(current.superannuation)}`);
  console.log(`  + leave loading   ${money(current.leaveLoading)}`);
  console.log(`  + salary packaging${money(current.packaging).padStart(12)}   <- gross-equivalent, not face value`);
  console.log(`  = effective       ${money(current.total)}`);
  console.log('');
  console.log(`  So a private role needs roughly ${money(Math.round(current.total / 1.12))} base + super to MATCH.`);
  console.log('  base is an assumption in profile.local.json — correct it and this all re-computes.');
  console.log('');

  const opts = {
    query,
    adzunaAppId: process.env.ADZUNA_APP_ID,
    adzunaAppKey: process.env.ADZUNA_APP_KEY,
    joobleKey: process.env.JOOBLE_KEY,
    country: 'au',
  };

  const sources = buildSourceList(opts);
  console.log(`Searching ${sources.length} source(s) for "${query}"...`);
  const found = await search(sources, opts);

  const ok = found.sources.filter((s) => s.ok);
  const failed = found.sources.filter((s) => !s.ok);
  console.log(`  ${found.jobs.length} distinct jobs from ${ok.length} working source(s); ${found.duplicatesMerged} duplicate(s) merged.`);
  if (failed.length) {
    console.log(`  ${failed.length} source(s) returned nothing:`);
    for (const f of failed.slice(0, 8)) console.log(`    ${f.source}: ${f.error}`);
  }
  console.log('');

  const matches = [];
  for (const job of found.jobs) {
    const r = campaignReason(profile, job, profile.packageOptions);
    if (r) matches.push({ job, reason: r });
  }

  // Security first, then by how much better the money is.
  matches.sort((a, b) => {
    if (a.reason.arm !== b.reason.arm) return a.reason.arm === 'security' ? -1 : 1;
    const av = (a.reason.advertised && a.reason.advertised.total) || 0;
    const bv = (b.reason.advertised && b.reason.advertised.total) || 0;
    return bv - av;
  });

  console.log(`MATCHES: ${matches.length} of ${found.jobs.length}`);
  console.log('-'.repeat(72));
  if (!matches.length) {
    console.log('  Nothing cleared either arm of the gate on the boards reachable from here.');
  }
  for (const m of matches.slice(0, 40)) {
    const ad = m.reason.advertised;
    console.log(`[${m.reason.arm.toUpperCase().padEnd(8)}] ${m.job.title}`);
    console.log(`             ${m.job.company || 'unknown employer'} · ${m.job.location || 'location not stated'} · ${m.job.source}`);
    console.log(`             ${m.reason.detail}`);
    if (ad && ad.imputed && ad.imputed.length) {
      console.log(`             assumed: ${ad.imputed.join('; ')}`);
    }
    if (m.job.url) console.log(`             ${m.job.url}`);
    console.log('');
  }

  const security = found.jobs.filter(isSecurityRole).length;
  console.log('-'.repeat(72));
  console.log(`Of ${found.jobs.length} jobs seen, ${security} were security roles and ${matches.length} cleared the gate.`);
  console.log('');
  console.log('NOT SEARCHED, because no API exists for them: SEEK, Indeed, LinkedIn, Gumtree.');
  console.log('Those need the browser extension on a results page you are logged into.');
  if (!opts.adzunaAppId) console.log('Set ADZUNA_APP_ID / ADZUNA_APP_KEY for real Australian coverage.');
  if (!opts.joobleKey) console.log('Set JOOBLE_KEY for a second aggregator.');
  console.log('');
}

if (require.main === module) {
  main().catch((e) => { console.error('Failed:', e.message); process.exit(1); });
}

module.exports = { buildSourceList, COMPANY_SLUGS };
