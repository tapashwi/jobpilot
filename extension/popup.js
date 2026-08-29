/**
 * popup.js — the control surface.
 *
 * The mode selector is the most consequential control in the product, so it
 * explains itself rather than being a switch labelled "auto". Someone turning
 * on unattended submission should know what they have turned on, before they
 * find out from a recruiter.
 */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const MODE_NOTES = {
    review: 'Nothing is submitted. Every field is filled and left for you to check — the safest ' +
      'setting and the one worth starting on for a new employer.',
    confirm: 'Filled, then it asks. Good once you trust the answers but still want eyes on the form.',
    auto: 'Submits without asking — but only when the job cleared every gate, every field resolved, ' +
      'and every screening answer came from your saved bank. Any doubt at all and it drops back to ' +
      'fill-only rather than guessing.'
  };

  function send(msg) {
    return new Promise((res) => chrome.runtime.sendMessage(msg, res));
  }

  async function refresh() {
    const state = await send({ type: 'GET_STATE' });
    $('#mode').value = state.mode || 'review';
    $('#modeNote').textContent = MODE_NOTES[$('#mode').value];

    const r = (globalThis.JobPilot && JobPilot.answerReadiness)
      ? JobPilot.answerReadiness(state.answers)
      : null;

    const box = $('#bank');
    if (!r) {
      box.className = 'box';
      box.innerHTML = '<b>Answer bank</b><span>Open the full app to set your screening answers.</span>';
      return;
    }
    box.className = 'box ' + (r.ready ? 'ok' : 'warn');
    box.innerHTML = '<b>' + (r.ready ? 'Answer bank ready' : 'Answer bank incomplete') + '</b>' +
      '<span>' + r.advice + '</span>' +
      (r.essentialMissing.length
        ? '<ul>' + r.essentialMissing.map((q) => '<li>' + q.question + '</li>').join('') + '</ul>'
        : '');
  }

  $('#mode').addEventListener('change', async () => {
    $('#modeNote').textContent = MODE_NOTES[$('#mode').value];
    await send({ type: 'SET_STATE', patch: { mode: $('#mode').value } });
  });

  $('#open').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://jobpilot-ay8.pages.dev/' });
  });

  $('#run').addEventListener('click', async () => {
    const state = await send({ type: 'GET_STATE' });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    $('#out').innerHTML = '<div class="box"><b>Working…</b></div>';

    let res;
    try {
      res = await chrome.tabs.sendMessage(tab.id, {
        type: 'RUN',
        mode: state.mode || 'review',
        profile: state.profile,
        answers: state.answers,
        seen: state.seen,
        job: state.currentJob || {}
      });
    } catch (e) {
      // The content script is not in this page — which is the normal answer on
      // a site the manifest does not cover, and worth saying plainly.
      $('#out').innerHTML = '<div class="box bad"><b>Not an application page</b>' +
        '<span>JobPilot only runs on the job sites it declares in its permissions. ' +
        'Open the application form itself and try again.</span></div>';
      return;
    }

    if (!res || !res.ok) {
      $('#out').innerHTML = '<div class="box bad"><b>Something went wrong</b><span>' +
        ((res && res.error) || 'no response from the page') + '</span></div>';
      return;
    }

    const d = res.decision;
    await send({ type: 'RECORD', entry: { key: d.key, outcome: d.outcome, at: new Date().toISOString(),
      url: tab.url, record: d.record } });

    const cls = res.submitted ? 'ok' : d.outcome === 'blocked' || d.outcome === 'duplicate' ? 'bad' : 'warn';
    const hard = (d.blockers || []).filter((b) => b.blocking !== false);

    $('#out').innerHTML = '<div class="box ' + cls + '"><b>' +
      (res.submitted ? 'Submitted'
        : d.outcome === 'blocked' ? 'Skipped — you do not meet a stated requirement'
          : d.outcome === 'duplicate' ? 'Skipped — already applied'
            : 'Filled, not submitted') +
      '</b><span>' + (res.note || d.why) + '</span>' +
      (hard.length ? '<ul>' + hard.map((b) => '<li>' + b.label + '</li>').join('') + '</ul>' : '') +
      '</div>' +
      (d.record && d.record.length
        ? '<div class="box"><b>What went in</b><ul>' +
          d.record.map((e) => '<li>' + e.field + ': ' + e.value + (e.knockout ? ' (screening answer)' : '') + '</li>').join('') +
          '</ul></div>'
        : '');
    refresh();
  });

  refresh();
})();
