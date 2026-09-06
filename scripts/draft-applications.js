#!/usr/bin/env node
/**
 * draft-applications.js — write a letter for every job that cleared the gate.
 *
 * DRAFTS. NOT APPLICATIONS.
 *
 * Nothing here sends anything, and that is deliberate rather than a
 * limitation — packages/tracker/src/pipeline.js explains why at length. Each
 * file is a letter to read, edit and send yourself.
 *
 * WHAT IT REFUSES TO DO
 *
 * It will not claim experience the resume does not support. The letter is
 * assembled by packages/documents/src/cover-letter.js, which quotes real
 * achievements out of `profile.resumeText` and marks anything it cannot
 * support with a visible [bracket]. A draft with brackets in it is not
 * finished, and the summary says so rather than letting it look done.
 *
 * Every draft is scanned by packages/documents/src/tells.js before it is
 * written, so "it reads like a person wrote it" is a check rather than a
 * claim.
 *
 * Usage:
 *   node scripts/draft-applications.js
 *   node scripts/draft-applications.js --query "identity"
 */

const fs = require('fs');
const path = require('path');
const { search, keylessSources, ADAPTERS } = require('../packages/discovery/src/sources');
const { campaignReason } = require('../packages/matching/src/package-value');
const { coverLetter } = require('../packages/documents/src/cover-letter');
const { emailDraft, enrich } = require('../packages/discovery/src/campaign');
const { tells, rhythm } = require('../packages/documents/src/tells');
const { COMPANY_SLUGS } = require('./find-jobs');

const PROFILE_PATH = path.join(__dirname, '..', 'profile.local.json');
const DRAFTS_DIR = path.join(__dirname, '..', 'drafts');

/**
 * Researched, per-employer material.
 *
 * Keyed by company slug. This is the paragraph that decides whether a letter
 * gets read, and it cannot be generated — it has to be looked up. Anything
 * not in here falls back to a visible gap rather than a compliment.
 *
 * `gapAnswers` answers a required skill the resume genuinely lacks. Naming a
 * gap yourself is stronger than leaving it to be found, but only when the
 * answer is true.
 */
const RESEARCH = {
  cultureamp: {
    // The board gives a slug, not a brand. "cultureamp" in a salutation is a
    // small thing that reads as automated, so the display name is stated.
    displayName: 'Culture Amp',
    whyThem:
      "The part that interests me is whose identity you are governing. Culture Amp holds " +
      "employee feedback for around 25 million people across roughly 6,000 companies, and " +
      "that data is only worth what the access controls around it are worth. Identity is not " +
      "back-office there. It is the product's credibility.",
    gapAnswers: {
      okta:
        "I have not administered Okta. I have run the same work in Entra ID and Active " +
        "Directory — joiner, mover and leaver, provisioning, MFA policy, access reviews — " +
        "and the concepts port; SAML, SCIM and OIDC are not vendor-specific. I picked up " +
        "Intune and Defender the same way, and I am partway through Security+.",
    },
  },
};

function loadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    console.error(`No profile at ${PROFILE_PATH}. It is gitignored on purpose — it holds a salary.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
}

function sourceList() {
  const list = [];
  for (const s of keylessSources()) {
    if (ADAPTERS[s].perCompany) {
      for (const company of COMPANY_SLUGS[s] || []) list.push({ source: s, company });
    } else {
      list.push({ source: s });
    }
  }
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) list.push({ source: 'adzuna' });
  if (process.env.JOOBLE_KEY) list.push({ source: 'jooble' });
  return list;
}

const slugify = (s) => String(s || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const qi = process.argv.indexOf('--query');
  const query = qi !== -1 ? process.argv[qi + 1] : 'security';

  const profile = loadProfile();
  const found = await search(sourceList(), { query, country: 'au' });

  const matches = [];
  for (const job of found.jobs) {
    const reason = campaignReason(profile, job, { homeCity: profile.homeCity, ...(profile.packageOptions || {}) });
    if (reason) matches.push({ job, reason });
  }

  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  console.log('');
  console.log(`DRAFTS — ${matches.length} match(es) from ${found.jobs.length} jobs`);
  console.log('='.repeat(72));

  for (const { job: raw, reason } of matches) {
    const research = RESEARCH[String(raw.company || '').toLowerCase()] || {};

    // enrich() parses the requirements out of the ad body. Without it the job
    // arrives with requiredSkills undefined, the letter has nothing to match
    // against, and it quotes whatever the resume happens to say loudest —
    // which produced a letter leading on a machine-learning side project for
    // an identity role. The ad text was there the whole time; nobody read it.
    const job = Object.assign({}, enrich(raw), {
      company: research.displayName || raw.company,
    });

    const letter = coverLetter(profile, job, {
      salutation: 'hi-sir-madam',
      whyThem: research.whyThem,
      gapAnswers: research.gapAnswers,
    });
    const draft = emailDraft(profile, job, letter.text, {
      salutation: letter.greeting,
      signoff: letter.signoff.split('\n')[0],
    });

    const found_tells = tells(letter.text);
    const r = rhythm(letter.text);
    const file = path.join(DRAFTS_DIR, `${slugify(job.company)}-${slugify(job.title)}.txt`);

    const header = [
      `ROLE      ${job.title}`,
      `EMPLOYER  ${job.company || 'not stated'}`,
      `WHERE     ${job.location || 'not stated'} — ${reason.where ? reason.where.kind.toUpperCase() : 'unchecked'}`,
      reason.where ? `          ${reason.where.note}` : '',
      `WHY       ${reason.reason} — ${reason.detail}`,
      `LINK      ${job.url || 'no url'}`,
      `SEND VIA  ${draft.deliverBy}`,
      `READINESS ${letter.readiness} (${letter.gaps} gap${letter.gaps === 1 ? '' : 's'} to fill)`,
      `TELLS     ${found_tells.length ? found_tells.map((t) => t.text).join(' | ') : 'none'}`,
      `RHYTHM    ${r.sentences} sentences, ${r.min}-${r.max} words${r.monotonous ? ' — TOO EVEN, break one short' : ''}`,
      '',
      `SUBJECT   ${draft.subject}`,
      '-'.repeat(72),
      '',
    ].filter((l) => l !== '').join('\n');

    fs.writeFileSync(file, `${header}${letter.text}\n\n${'-'.repeat(72)}\n${draft.reminder}\n`);

    console.log('');
    console.log(`${job.title} — ${job.company}`);
    console.log(`  ${reason.where ? reason.where.kind : '?'} · readiness: ${letter.readiness} · ${letter.gaps} gap(s) · tells: ${found_tells.length}`);
    console.log(`  written to drafts/${path.basename(file)}`);
    if (found_tells.length) for (const t of found_tells) console.log(`    tell: ${t.text} — ${t.why}`);
  }

  console.log('');
  console.log('-'.repeat(72));
  console.log('These are DRAFTS. Read each one, fill any [bracketed] gap, and send it yourself.');
  console.log('Nothing here has been sent, and nothing here can send.');
  console.log('');
}

if (require.main === module) {
  main().catch((e) => { console.error('Failed:', e.message); process.exit(1); });
}

module.exports = { RESEARCH, slugify };
