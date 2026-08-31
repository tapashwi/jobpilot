/**
 * options.js — where the profile and the screening answers actually get set.
 *
 * This page is the seam that was missing. background.js initialised an empty
 * profile and empty answers, and nothing anywhere populated them: the popup
 * linked out to the web app, and the web app had no way back. The extension
 * therefore filled nothing and gated nothing — the gate judged an empty job
 * against an empty profile, which passes everything.
 */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const JP = globalThis.JobPilot;
  const send = (msg) => new Promise((r) => chrome.runtime.sendMessage(msg, r));

  const PROFILE_FIELDS = ['name', 'email', 'phone', 'city', 'country', 'linkedin', 'resume'];
  const NUMERIC = { years: 'yearsExperience', minsal: 'minSalary' };

  function show(kind, title, detail, list) {
    $('#status').innerHTML = `<div class="status ${kind}"><strong>${title}</strong>` +
      (detail ? `<div>${detail}</div>` : '') +
      (list && list.length ? `<ul>${list.map((x) => `<li>${x}</li>`).join('')}</ul>` : '') +
      '</div>';
  }

  function renderAnswers(saved) {
    $('#answers').innerHTML = JP.STANDARD_ANSWERS.map((q) => {
      const v = saved[q.key] === undefined ? '' : saved[q.key];
      const control = q.type === 'choice'
        ? `<select data-ans="${q.key}"><option value="">— not answered —</option>` +
          q.options.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('') + '</select>'
        : `<input type="text" data-ans="${q.key}" value="${String(v).replace(/"/g, '&quot;')}" placeholder="leave blank to be asked each time">`;
      return `<label>${q.question}</label>${control}<p class="note">${q.why}</p>`;
    }).join('');
  }

  function collectAnswers() {
    const out = {};
    document.querySelectorAll('[data-ans]').forEach((el) => {
      if (el.value !== '') out[el.getAttribute('data-ans')] = el.value;
    });
    return out;
  }

  function reportReadiness(state) {
    const p = state.profile || {};
    const r = JP.answerReadiness(state.answers || {});
    const gaps = [];
    if (!p.name || !p.email) gaps.push('Name and email — without them nothing can be filled in.');
    if (!p.resumeText || p.resumeText.length < 200) {
      gaps.push('Resume text — the gate compares each advertisement against it, and an empty ' +
        'resume matches nothing.');
    }
    if (!r.ready) gaps.push(r.advice);

    if (!gaps.length) show('ok', 'Ready', 'Profile and screening answers are set. Unattended runs are allowed.');
    else show('warn', 'Not ready yet', 'The extension will not start a run until these are filled in:', gaps);
  }

  async function refresh() {
    const state = await send({ type: 'GET_STATE' });
    const p = state.profile || {};
    $('#name').value = p.name || ''; $('#email').value = p.email || '';
    $('#phone').value = p.phone || ''; $('#city').value = p.city || '';
    $('#country').value = p.country || ''; $('#linkedin').value = p.linkedin || '';
    $('#years').value = p.yearsExperience === undefined || p.yearsExperience === null ? '' : p.yearsExperience;
    $('#minsal').value = p.minSalary === undefined || p.minSalary === null ? '' : p.minSalary;
    $('#resume').value = p.resumeText || '';
    renderAnswers(state.answers || {});
    reportReadiness(state);
  }

  function profileFromForm() {
    const p = {};
    for (const f of PROFILE_FIELDS) {
      const v = $('#' + f).value.trim();
      if (v) p[f === 'resume' ? 'resumeText' : f] = v;
    }
    for (const [id, key] of Object.entries(NUMERIC)) {
      const v = Number($('#' + id).value);
      if ($('#' + id).value !== '' && Number.isFinite(v)) p[key] = v;
    }
    // Derived once here so the field mapper does not have to guess at split
    // points on every form.
    if (p.name && !p.firstName) {
      const parts = p.name.split(/\s+/);
      p.firstName = parts[0];
      p.lastName = parts.slice(1).join(' ') || undefined;
    }
    if (p.resumeText) p.skills = JP.extractSkills(p.resumeText);
    return p;
  }

  $('#saveProfile').addEventListener('click', async () => {
    await send({ type: 'SET_STATE', patch: { profile: profileFromForm() } });
    await refresh();
  });

  $('#saveAnswers').addEventListener('click', async () => {
    await send({ type: 'SET_STATE', patch: { answers: collectAnswers() } });
    await refresh();
  });

  $('#importBlob').addEventListener('click', async () => {
    let parsed;
    try {
      parsed = JSON.parse($('#blob').value);
    } catch (e) {
      show('bad', 'That is not valid JSON',
        'Copy the whole thing, including the outer braces. ' + e.message);
      return;
    }
    if (!parsed || typeof parsed !== 'object' || (!parsed.profile && !parsed.answers)) {
      show('bad', 'That JSON is not from JobPilot',
        'It should have a "profile" and an "answers" key. Use the ' +
        '"Copy for the extension" button in the app rather than copying by hand.');
      return;
    }
    const patch = {};
    if (parsed.profile) patch.profile = parsed.profile;
    if (parsed.answers) patch.answers = parsed.answers;
    await send({ type: 'SET_STATE', patch });
    $('#blob').value = '';
    await refresh();
  });

  $('#clearAll').addEventListener('click', async () => {
    await send({ type: 'SET_STATE', patch: { profile: {}, answers: {}, seen: [], log: [] } });
    await refresh();
  });

  refresh();
})();
