/**
 * The letter, and knowing where the job is.
 *
 * EVERY CASE HERE CAME OUT OF A DRAFT THAT WAS ACTUALLY GENERATED.
 *
 * None of these were imagined. The first run produced a letter containing
 * "I *Identity & Cloud:** Microsoft Entra ID" and reported itself
 * "readiness: complete, 0 gaps, 0 tells" while being unsendable. Each test
 * below pins one thing that went wrong on the way from that to a draft worth
 * reading.
 */

const { statements } = require('../packages/documents/src/evidence');
const { coverLetter } = require('../packages/documents/src/cover-letter');
const { tells, rhythm } = require('../packages/documents/src/tells');
const { emailDraft } = require('../packages/discovery/src/campaign');
const { reachability, requiresPresence, isFullyRemote } = require('../packages/matching/src/package-value');
const { extractSkills } = require('../packages/matching/src/skills');

describe('reading a resume that happens to be markdown', () => {
  test('a bold label line is never quoted as an achievement', () => {
    // "**Identity & Cloud:** Microsoft Entra ID, Active Directory, ..." names
    // technologies. It does not say what the person DID with any of them, and
    // it reached a letter as "I *Identity & Cloud:** Microsoft Entra ID".
    const md = '**Identity & Cloud:** Microsoft Entra ID, Active Directory, Microsoft Intune, Microsoft 365';
    const out = statements(md);
    expect(out.map((s) => s.text).join(' ')).not.toContain('*');
    // A pure list of tools is not evidence of anything, so it is dropped.
    expect(out).toHaveLength(0);
  });

  test('markdown headings are skipped', () => {
    expect(statements('## Experience\n### Legal Aid NT — Oct 2023')).toHaveLength(0);
  });

  test('a bullet wrapped across two lines is one bullet', () => {
    // The real failure: "...and manage access via" reached a letter with
    // "Active Directory" — the last two words — dropped for being a short
    // continuation line. It was the most relevant sentence in the resume.
    const md = [
      '- Run user onboarding/offboarding — device setup, licensing, permissions — and manage access via',
      '  Active Directory.',
    ].join('\n');
    const out = statements(md);
    expect(out).toHaveLength(1);
    expect(out[0].text).toMatch(/manage access via Active Directory\.$/);
  });

  test('hard-wrapped prose is one paragraph, not one statement per line', () => {
    // Wrapped prose chopped mid-clause produced "I focused on network
    // administration, Active Directory and Intune device management,." —
    // a continuation quoted as a whole achievement.
    const md = [
      'Focused on network administration, Active Directory and Intune device management,',
      'Microsoft Defender endpoint security, and Windows server administration.',
    ].join('\n');
    const out = statements(md);
    expect(out.every((s) => /[.!?]$/.test(s.text))).toBe(true);
  });
});

describe('the skills dictionary knows the identity market', () => {
  test('Okta is extractable — it was not, and it is the dominant vendor', () => {
    // The Culture Amp ad said "Okta" eight times and the parser returned
    // nothing for it, so the letter never knew the headline requirement
    // existed and the prepared answer for it never fired.
    expect(extractSkills('Hands-on Okta administration.')).toContain('okta');
  });

  test('joiner/mover/leaver is recognised in the slash form resumes use', () => {
    expect(extractSkills('Run user onboarding/offboarding for staff.')).toContain('joiner mover leaver');
  });

  test('SCIM and MFA are their own skills, not swallowed by iam', () => {
    const s = extractSkills('SCIM provisioning with multi factor authentication.');
    expect(s).toContain('scim');
    expect(s).toContain('mfa');
  });
});

describe('salutation and the signoff that has to agree with it', () => {
  const p = { name: 'A Person' };
  const j = { title: 'Engineer', company: 'Acme' };

  test('"Hi Sir/Madam" takes "Kind regards"', () => {
    // "Yours faithfully" after "Hi" is a mismatch a reader notices.
    const l = coverLetter(p, j, { salutation: 'hi-sir-madam' });
    expect(l.greeting).toBe('Hi Sir/Madam,');
    expect(l.signoff.split('\n')[0]).toBe('Kind regards,');
  });

  test('"Dear Sir/Madam" takes "Yours faithfully"', () => {
    const l = coverLetter(p, j, { salutation: 'sir-madam' });
    expect(l.greeting).toBe('Dear Sir/Madam,');
    expect(l.signoff.split('\n')[0]).toBe('Yours faithfully,');
  });

  test('"Dear Hiring Manager" takes "Yours faithfully", never sincerely', () => {
    // It names a role, not a person. Sincerely belongs with a name, and a
    // formal tone used to get "Yours sincerely" here — the exact convention
    // error the salutation block was written to prevent, found by adding the
    // option to the web app and reading the pair it produced.
    const l = coverLetter(p, j, { salutation: 'hiring-manager', tone: 'formal' });
    expect(l.greeting).toBe('Dear Hiring Manager,');
    expect(l.signoff.split('\n')[0]).toBe('Yours faithfully,');
  });

  test('an unrecognised salutation token is used verbatim — the escape hatch', () => {
    // Pinning this because it is a trap as much as a feature: a typo becomes
    // the most visible line of the letter, silently. It is kept because a
    // custom greeting is genuinely useful, so callers pass a full greeting or
    // one of the known tokens, never a shorthand of their own invention.
    expect(coverLetter(p, j, { salutation: 'Dear Team,' }).greeting).toBe('Dear Team,');
  });

  test('a named recipient takes "Yours sincerely", and beats the option', () => {
    // Convention, and also the right outcome: a name always wins over an
    // unnamed salutation, so asking for Sir/Madam must not override one.
    const l = coverLetter(p, { ...j, hiringManager: 'Jane Doe' }, { salutation: 'hi-sir-madam' });
    expect(l.greeting).toBe('Dear Jane Doe,');
    expect(l.signoff.split('\n')[0]).toBe('Yours sincerely,');
  });
});

describe('the letter does not write like a machine', () => {
  test('the opener is not "I am writing to apply"', () => {
    // The generator's own opener was a cliche its own tell-checker flags.
    const l = coverLetter({ name: 'A' }, { title: 'Engineer', company: 'Acme' }, {});
    expect(l.text).not.toMatch(/I am writing to apply/i);
    expect(tells(l.text).filter((t) => /writing to apply/i.test(t.text))).toHaveLength(0);
  });

  test('the same resume line is never quoted twice', () => {
    // One line legitimately wins for several skills, and emitted naively it
    // produced two consecutive paragraphs quoting it word for word.
    const resumeText = '- Managed Active Directory and Microsoft Entra ID access for all staff daily.';
    const l = coverLetter(
      { name: 'A', resumeText },
      { title: 'Engineer', company: 'Acme', requiredSkills: ['active directory', 'microsoft entra id'] },
      {},
    );
    const quoted = (l.text.match(/Managed Active Directory/g) || []).length;
    expect(quoted).toBeLessThanOrEqual(1);
  });

  test('a line that is not an action is never quoted after "I"', () => {
    // Real output: "On Cisco: I certifications held: CCNA (Cisco Certified
    // Network Associate)." The letter writes "I " in front of the line, which
    // assumes a verb phrase; a heading or a certification list is not one, and
    // nothing downstream can rescue it.
    const resumeText = [
      '- Certifications held: CCNA (Cisco Certified Network Associate), AZ-900.',
      '- Troubleshot Windows 10/11, TCP/IP, DNS and DHCP failures across client sites.',
    ].join('\n');
    const l = coverLetter({ name: 'A', resumeText }, { title: 'E', company: 'Acme' }, {});
    expect(l.text).not.toMatch(/I certifications/i);
    expect(l.text).toMatch(/I troubleshot/i);
  });

  test('the same filter applies when there is no matching required skill', () => {
    // The fix did not take on the first attempt because it was applied only to
    // the required-skill path. When nothing matches, EVERY sentence comes from
    // the fallback — so that is the branch that most needs it.
    const resumeText = '- Speech Emotion Recognition (Machine Learning · CNN · Python) — an 8-class classifier.';
    const l = coverLetter(
      { name: 'A', resumeText },
      { title: 'E', company: 'Acme', requiredSkills: ['kubernetes'] },
      {},
    );
    expect(l.text).not.toMatch(/I speech Emotion/i);
  });

  test('a supplied why-them paragraph replaces the blank', () => {
    const l = coverLetter({ name: 'A' }, { title: 'E', company: 'Acme' }, { whyThem: 'A real specific fact.' });
    expect(l.text).toContain('A real specific fact.');
    expect(l.text).not.toMatch(/why Acme specifically/);
  });

  test('an unanswered gap stays a visible blank rather than being filled', () => {
    // The letter must never invent the answer to a missing requirement.
    const l = coverLetter(
      { name: 'A', resumeText: '- Ran networks for three years across two sites.' },
      { title: 'E', company: 'Acme', requiredSkills: ['okta'] },
      {},
    );
    expect(l.text).toMatch(/\[/);
    expect(l.readiness).not.toBe('complete');
  });
});

describe('tells', () => {
  test('catches the cover-letter cliches', () => {
    const bad = 'I am writing to apply. I am excited by this opportunity. I believe I am a perfect fit and a team player.';
    const found = tells(bad).map((t) => t.text.toLowerCase());
    expect(found.join(' ')).toMatch(/writing to apply/);
    expect(found.join(' ')).toMatch(/excited/);
    expect(found.join(' ')).toMatch(/team player/);
  });

  test('catches "it is not just X, it is Y" in both the contracted and expanded form', () => {
    // The first version required the apostrophe and sailed past the expanded
    // form, which is the same tell wearing a tie.
    expect(tells("It's not just a job, it's a calling.")).not.toHaveLength(0);
    expect(tells('It is not just a job, it is a calling.')).not.toHaveLength(0);
  });

  test('leaves plain concrete writing alone', () => {
    // 9, 3 and 5 words. As varied as prose gets, and the first version of
    // rhythm() called it monotonous, because a spread of 6 is under the
    // 8-word bar — a bar short sentences cannot clear without one of them
    // running to 13 words, which is the opposite of the point.
    const good = 'Three years running identity for a legal aid commission. No Okta yet. The shape is the same.';
    expect(rhythm(good).monotonous).toBe(false);
    expect(tells(good)).toHaveLength(0);
  });

  test('flags prose where every sentence is the same length', () => {
    const even = 'I did the first thing here. I did the second thing here. I did the third thing here. I did the fourth one.';
    expect(rhythm(even).monotonous).toBe(true);
    expect(tells(even).some((t) => t.kind === 'rhythm')).toBe(true);
  });

  test('still flags LONG sentences that are all the same length', () => {
    // Guards the ratio relaxation above: evenness at 20-odd words a sentence
    // is the commonest generated rhythm there is, and must not slip through
    // just because the numbers are bigger.
    const even = [
      'The team was responsible for the delivery of the platform across the whole of the region every quarter.',
      'The project was managed through a series of meetings that were held between the leads and the partners.',
      'The outcome was measured against the targets that had been agreed with the board at the start of it.',
      'The report was written by the group and was then circulated to everyone who had been involved in it.',
    ].join(' ');
    expect(rhythm(even).monotonous).toBe(true);
  });

  test('three sentences is a sample, not a habit', () => {
    expect(rhythm('One two three. Four five six. Seven eight nine.').monotonous).toBe(false);
  });
});

describe('where the job actually is', () => {
  const home = { homeCity: 'Darwin' };

  test('interstate plus an office requirement is a relocation, not a match', () => {
    // The whole reason this exists: a Melbourne hybrid role passed the
    // country check and was offered to someone in Darwin as though it were
    // down the road.
    const r = reachability({ location: 'Melbourne', adText: 'hybrid, 2 days per week in office' }, home);
    expect(r.kind).toBe('relocation');
    expect(r.note).toMatch(/not commutable/i);
  });

  test('the same city is local', () => {
    expect(reachability({ location: 'Darwin, NT' }, home).kind).toBe('local');
  });

  test('"Remote" in the location field loses to "hybrid" in the body', () => {
    // Postings say Remote and then require two days on site. Presence wins.
    expect(isFullyRemote({ location: 'Remote', adText: 'hybrid, 2 days a week in Melbourne' })).toBe(false);
    expect(reachability({ location: 'Remote', adText: 'hybrid, 2 days a week in Melbourne' }, home).kind).toBe('relocation');
  });

  test('genuinely remote is reachable from anywhere', () => {
    expect(reachability({ location: 'Remote' }, home).kind).toBe('remote');
  });

  test('interstate with no stated office requirement is flagged as worth asking, not assumed', () => {
    const r = reachability({ location: 'Sydney' }, home);
    expect(r.kind).toBe('unstated');
    expect(r.ok).toBe(true);
  });

  test('with no home city set it declines to guess', () => {
    // Claiming "local" without knowing where someone lives is an invention.
    expect(reachability({ location: 'Melbourne' }, {}).kind).toBe('unstated');
  });

  test('requiresPresence reads days-per-week phrasing', () => {
    expect(requiresPresence({ adText: '3 days per week onsite' })).toBe(true);
    expect(requiresPresence({ adText: 'work from wherever you like' })).toBe(false);
  });
});

describe('emailDraft without an application address', () => {
  test('still produces the letter, with no mailto', () => {
    // Most postings are web forms. Returning null for them meant the common
    // case produced nothing at all.
    const d = emailDraft({ name: 'A' }, { title: 'Engineer', company: 'Acme' }, 'LETTER BODY');
    expect(d).not.toBeNull();
    expect(d.body).toContain('LETTER BODY');
    expect(d.mailto).toBeNull();
    expect(d.deliverBy).toMatch(/form/i);
  });

  test('produces a mailto when there is somewhere to send it', () => {
    const d = emailDraft({ name: 'A' }, { title: 'E', company: 'Acme', applyEmail: 'hr@acme.com' }, 'BODY');
    expect(d.mailto).toMatch(/^mailto:/);
    expect(d.deliverBy).toBe('email');
    expect(d.reminder).toMatch(/attach your resume/i);
  });
});
