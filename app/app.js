/**
 * app.js — the paste-and-check UI.
 *
 * Deliberately does not persist anything yet. Local storage of jobs is on the
 * roadmap, but shipping a store before the matcher has been used in anger
 * would be building on an unvalidated foundation.
 */
(function () {
  'use strict';
  const JP = window.JobPilot;
  const $ = (id) => document.getElementById(id);
  const num = (v) => (v === '' || v === null ? null : Number(v));

  function listFrom(text) {
    return String(text || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function chips(items, cls) {
    if (!items.length) return '<p class="note">None</p>';
    return '<div class="chips">' + items.map((s) =>
      `<span class="chip ${cls}">${escapeHtml(s)}</span>`).join('') + '</div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  $('go').addEventListener('click', () => {
    const resumeText = $('resume').value;
    const jobText = $('job').value;

    if (!resumeText.trim() || !jobText.trim()) {
      $('out').innerHTML = '<div class="verdict block"><h2>Paste both</h2>' +
        '<p>It needs your resume and the job ad to compare anything.</p></div>';
      return;
    }

    // Skills read from the text, unless the user names them explicitly.
    //
    // parseJobSkills separates "essential" from "a plus", because reading
    // every skill in an ad as required produces the worst failure this tool
    // can have: telling someone a nice-to-have blocks them.
    const typedRequired = listFrom($('jreq').value);
    const parsed = JP.parseJobSkills(jobText);
    const jobSkills = typedRequired.length ? typedRequired : parsed.required;
    const jobPreferred = typedRequired.length ? [] : parsed.preferred;

    const profile = {
      skills: JP.extractSkills(resumeText),
      yearsExperience: num($('years').value),
      minSalary: num($('minsal').value),
      remoteRequired: $('remote').checked,
      needsSponsorship: $('sponsor').checked
    };

    const job = {
      requiredSkills: jobSkills,
      preferredSkills: jobPreferred,
      minYearsExperience: num($('jyears').value),
      salaryMin: num($('jmin').value),
      salaryMax: num($('jmax').value)
    };

    const r = JP.assess(profile, job);

    const blockers = r.blockers.length
      ? '<ul class="blockers">' + r.blockers.map((b) =>
          `<li><strong>${escapeHtml(b.reason)}</strong><span>${escapeHtml(b.detail)}</span></li>`).join('') + '</ul>'
      : '';

    $('out').innerHTML = `
      <div class="verdict ${r.passed ? 'pass' : 'block'}">
        <h2>${escapeHtml(r.verdict.headline)}</h2>
        <p>${escapeHtml(r.verdict.advice)}</p>
        ${blockers}
      </div>
      <div class="card">
        <h3>You have, and the ad asks for</h3>
        ${chips(r.skills.matchedRequired, 'have')}
        <h3>The ad asks for, and you do not list</h3>
        ${chips(r.skills.missingRequired, 'miss')}
        <h3>Nice to have, and you do not list</h3>
        ${chips(r.skills.missingPreferred, '')}
        <p class="note">These are preferences, not gates &mdash; they do not stop you applying.</p>
        <h3>Skills found in your resume</h3>
        ${chips(profile.skills, '')}
        <p class="note">Read from your text by an alias dictionary. Anything it does not
           recognise will not appear here, and will look like a gap when it is not — if a
           skill is missing from this list, add it to the required-skills box to test it
           directly.</p>
      </div>`;
  });

  $('clear').addEventListener('click', () => {
    for (const id of ['resume', 'job', 'years', 'minsal', 'jyears', 'jmin', 'jmax', 'jreq']) $(id).value = '';
    $('remote').checked = false;
    $('sponsor').checked = false;
    $('out').innerHTML = '';
  });
})();
