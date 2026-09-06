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
 * Board slugs are not brand names.
 *
 * Greenhouse, Lever and Ashby key on a slug, and the adapter has nothing else
 * to call the employer — so a letter opened "the Security Engineer role at
 * mable", lower case, which reads as exactly what it is: a machine printing a
 * database key. Only employers a draft has actually been written for need to
 * be here; anything absent falls back to the slug, and the fix is to add it.
 */
const DISPLAY_NAMES = {
  cultureamp: 'Culture Amp',
  mable: 'Mable',
  octopusdeploy: 'Octopus Deploy',
  eucalyptus: 'Eucalyptus',
  relevanceai: 'Relevance AI',
  immutable: 'Immutable',
  kasada: 'Kasada',
  brighte: 'Brighte',
  prospa: 'Prospa',
  cloudflare: 'Cloudflare',
  okta: 'Okta',
  elastic: 'Elastic',
};

/**
 * Answers to requirements the resume genuinely does not support.
 *
 * Written ONCE and shared, because the same gaps recur across employers and
 * the answer to "have you run a SIEM" does not change with the logo. Each one
 * follows the same shape: name the gap in the first clause, then the nearest
 * real thing, then stop. No answer here claims anything the resume cannot
 * back — that is the whole point of naming a gap rather than hoping.
 *
 * Keys are CANONICAL skill names (`canonicalise('AWS')` → 'amazon web
 * services'), not the words an advertisement happens to use. Keying on the
 * ad's wording would mean the prepared answer silently never fires, which is
 * exactly what happened with Okta before it was in the alias dictionary.
 */
const COMMON_GAP_ANSWERS = {
  siem:
    "I have not run a SIEM in production. The closest is triage in Microsoft Defender and " +
    "Trend Micro, and a university unit in data analytics for cyber security that I finished " +
    "at 80 — that was detection logic over logs rather than a product. It is the platform I " +
    "would be learning, not the reason for it.",
  'detection engineering':
    "Detection engineering is not something I have done as a named job. I have written and " +
    "tuned endpoint policy in Defender and Trend Micro and handled what it raised, which is " +
    "the consuming end of the same work.",
  kubernetes:
    "No production Kubernetes. My container work is confined to my own projects, so I would " +
    "be starting from fundamentals here rather than from experience.",
  'amazon web services':
    "My cloud administration is Microsoft rather than AWS — Azure, M365 tenancy, Intune and " +
    "Entra ID, with AZ-900 behind it. The identity and network concepts carry across, but I " +
    "would not claim AWS operational experience.",
  'google cloud platform':
    "I have not administered GCP. My cloud work is Azure and M365, and I would rather say so " +
    "than stretch the word cloud to cover it.",
  python:
    "I write Python for my own work rather than in production. The strongest piece is an " +
    "eight-class speech-emotion classifier — a CNN over Mel-spectrogram features trained on " +
    "RAVDESS, TESS and CREMA-D, with pitch-shift and time-stretch augmentation to hold down " +
    "overfitting. I can walk through every decision in it.",
  coding:
    "I am not coming from a software engineering role. I automate my own work and I built " +
    "two projects end to end, one of them a CNN audio classifier in Python, so I am not " +
    "starting from zero — but production engineering at scale would be new.",
  'penetration testing':
    "I have worked the defending side, not the offensive one. I have no professional " +
    "pentesting engagements to point to, and I would rather be straight about that than " +
    "dress up a home lab as experience.",
  'iso 27001':
    "I have not run an ISO 27001 programme. I work inside a legal aid commission, so I " +
    "operate under a public-sector control environment and its access and records " +
    "obligations daily — that is living with controls rather than certifying them.",
  'soc 2':
    "No SOC 2 audit experience. The nearest thing is producing evidence — access reviews, " +
    "asset registers, backup verification — inside a public-sector environment that is " +
    "audited on the same kinds of controls.",
  'threat modelling':
    "Not as a formal practice with a named methodology. In routine work I decide what an " +
    "exposed service or a new integration puts at risk before it goes in, which is the " +
    "instinct without the framework.",
  terraform:
    "I have not used Terraform. My infrastructure work has been directly administered rather " +
    "than declared as code, and that is a genuine gap rather than a preference.",
  go:
    "I do not write Go. Python is the language I actually use.",
};

/**
 * Researched, per-employer material.
 *
 * Keyed by company slug, lower-cased. This is the paragraph that decides
 * whether a letter gets read, and it cannot be generated — it has to be looked
 * up. Anything not in here falls back to a visible gap rather than a
 * compliment, and every `whyThem` below carries the source and the date it was
 * checked, because a figure quoted back to the company that published it had
 * better be right.
 */
const RESEARCH = {
  cultureamp: {
    displayName: 'Culture Amp',
    whyThem:
      "The part that interests me is whose identity you are governing. Culture Amp holds " +
      "employee feedback for around 25 million people across roughly 6,000 companies, and " +
      "that data is only worth what the access controls around it are worth. Identity is not " +
      "back-office there. It is the product's credibility.",
    gapAnswers: {
      ...COMMON_GAP_ANSWERS,
      okta:
        "I have not administered Okta. I have run the same work in Entra ID and Active " +
        "Directory — joiner, mover and leaver, provisioning, MFA policy, access reviews — " +
        "and the concepts port; SAML, SCIM and OIDC are not vendor-specific. I picked up " +
        "Intune and Defender the same way, and I am partway through Security+.",
    },
  },

  // ubuntu.com/security/esm, checked 2026-09-06.
  canonical: {
    displayName: 'Canonical',
    whyThem:
      "What drew me is the size of the promise. An Ubuntu LTS carries five years of security " +
      "maintenance across main, which is roughly 2,300 packages; Ubuntu Pro takes that to " +
      "fifteen years and extends the same commitment to universe, which is over 36,000 " +
      "packages a release as of 24.04. That is the largest standing security-maintenance " +
      "commitment in open source, and honouring it is the job rather than a marketing line.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // elastic.co/blog — IRAP assessment at the PROTECTED level, checked 2026-09-06.
  elastic: {
    displayName: 'Elastic',
    whyThem:
      "The Canberra part is what makes this specific. Elastic Cloud has been assessed under " +
      "IRAP at the PROTECTED level across all three hyperscalers, which means the work is " +
      "measured against the ACSC's Information Security Manual rather than a generic " +
      "baseline. I already work inside an Australian public-sector environment and its " +
      "obligations, so the standard is one I answer to now rather than one I would be " +
      "meeting for the first time.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // mable.com.au/about-us, checked 2026-09-06.
  mable: {
    displayName: 'Mable',
    whyThem:
      "Mable has delivered over 32 million hours of care, connecting more than 31,000 active " +
      "NDIS and aged-care clients with over 23,000 independent support workers. That makes " +
      "worker identity and access a physical-safety control rather than a compliance one: " +
      "verification decides who is admitted to the home of someone who may not be able to " +
      "challenge them. Running joiner-mover-leaver at a legal aid commission taught me that " +
      "deprovisioning is the half everyone forgets, and here that half has a front door.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // handbook.gitlab.com, checked 2026-09-06.
  gitlab: {
    displayName: 'GitLab',
    whyThem:
      "GitLab is all-remote and publishes its entire handbook in the open, which is unusual " +
      "and useful: the way the company works can be read before joining it rather than " +
      "discovered afterwards. For security work that openness cuts both ways, and living " +
      "with it deliberately is the interesting part.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // samsara.com/company/about, checked 2026-09-06.
  samsara: {
    displayName: 'Samsara',
    whyThem:
      "Samsara's platform reaches vehicles and worksites, plus the wearables people carry, " +
      "with over 80 billion miles of real-world operator data flowing through it a year — and " +
      "cameras pointed inward at the driver. A weakness there is not a data breach in the " +
      "ordinary sense. It is surveillance of a specific person, or an instruction arriving at " +
      "physical equipment. Attack surface that touches people directly deserves more care " +
      "than attack surface that touches records.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // relevanceai.com, checked 2026-09-06.
  relevanceai: {
    displayName: 'Relevance AI',
    whyThem:
      "Relevance AI's agents do not answer questions. They act — across more than a thousand " +
      "connected applications — Salesforce and Slack among them — at over 1.24 million tasks a " +
      "month. That makes an agent a credential holder whose blast radius is everything it is " +
      "wired into, which is an access-management problem before it is a model problem. That " +
      "framing is the part of AI security I find genuinely interesting, and it sits next to " +
      "the identity work I already do.",
    gapAnswers: COMMON_GAP_ANSWERS,
  },

  // Deliberately no headline figure: Quora's own pages give 300M+ on one and
  // 400M+ on another, and third-party trackers disagree with both. Quoting a
  // contested number to a company that knows its own is worse than not
  // quoting one, so the paragraph rests on structure instead.
  quora: {
    displayName: 'Quora',
    whyThem:
      "Quora is two quite different exposures under one roof: a long-lived consumer platform " +
      "full of user-generated content and accounts, and Poe, which brokers access to other " +
      "companies' models. The second one is a credential-holding gateway, and infrastructure " +
      "security for it is a different problem from securing the first. Sitting in one " +
      "organisation, that contrast is what makes the role interesting.",
    gapAnswers: COMMON_GAP_ANSWERS,
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

/**
 * How far the role's stated level runs ahead of the candidate's experience.
 *
 * INFORMATIONAL ONLY. It drops nothing and reorders nothing — the campaign
 * surfaces on discipline and reachability, and seniority is a judgement the
 * reader should make rather than one a script should make for them. "Head of
 * Security Operations" and two Engineering Manager roles came back against
 * 3.5 years of experience, and the drafts said nothing about it.
 *
 * Read from the TITLE only. Ad bodies describe the team's seniority as often
 * as the role's, so scanning them would flag half the list.
 */
const SENIORITY_TIERS = [
  { re: /\b(head of|director|vp|vice president|chief)\b/i, level: 'executive', years: 12 },
  { re: /\b(engineering manager|em|manager)\b/i, level: 'management', years: 8 },
  { re: /\b(principal|staff|lead)\b/i, level: 'principal/staff', years: 10 },
  { re: /\b(senior|snr|sr\.?)\b/i, level: 'senior', years: 5 },
];

function seniorityNote(title, yearsExperience) {
  const t = String(title || '');
  const years = Number(yearsExperience);
  const tier = SENIORITY_TIERS.find(({ re }) => re.test(t));
  if (!tier) return null;
  if (!Number.isFinite(years)) return `${tier.level} role`;
  if (years >= tier.years) return `${tier.level} role — in range`;
  return `${tier.level} role, typically ~${tier.years}+ years — you have ${years}. A stretch, not a bar.`;
}

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
      company: research.displayName
        || DISPLAY_NAMES[String(raw.company || '').toLowerCase()]
        || raw.company,
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
      (() => {
        const n = seniorityNote(job.title, profile.yearsExperience);
        return n ? `SENIORITY ${n}` : '';
      })(),
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

module.exports = { RESEARCH, DISPLAY_NAMES, COMMON_GAP_ANSWERS, slugify, seniorityNote };
