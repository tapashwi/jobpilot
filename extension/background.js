/**
 * background.js — the service worker, and the thing that drives a run.
 *
 * ALL SEQUENCING LOGIC IS IN packages/autofill/src/orchestrator.js, which is
 * pure and tested. This file is the Chrome adapter: it opens tabs, waits, and
 * writes state. It decides nothing.
 *
 * TWO MV3 FACTS THIS FILE IS BUILT AROUND
 *
 * 1. The worker is killed after roughly thirty seconds idle. A run walking
 *    forty jobs lasts far longer, so NOTHING is held in memory — every step
 *    reads state from chrome.storage and writes it back. A worker that dies
 *    mid-run resumes on the next alarm exactly where it stopped.
 *
 * 2. setTimeout does not survive that. It is the obvious way to pace a run and
 *    it silently stops working the moment the worker is collected — a bug that
 *    would pass every test on a fast machine and strand real users on job
 *    three. chrome.alarms is the only timer that persists, so the pacing goes
 *    through alarms even though the delays are short enough to look like they
 *    do not need it.
 */

// The worker has no <script> tags; importScripts is how a classic MV3 service
// worker loads a dependency. The orchestrator lives in the generated engine
// alongside everything else, so it cannot drift from the tested source.
importScripts('engine.js');

const KEY = 'jobpilot.state.v1';
const RUN = 'jobpilot.run.v1';
const ALARM = 'jobpilot-next';

async function load(key, fallback) {
  const got = await chrome.storage.local.get(key);
  return got[key] || fallback;
}

async function put(key, value) {
  await chrome.storage.local.set({ [key]: value });
  return value;
}

const loadState = () => load(KEY, { profile: {}, answers: {}, seen: [], log: [], mode: 'review' });
const loadRun = () => load(RUN, null);

async function saveState(patch) {
  const s = await loadState();
  return put(KEY, { ...s, ...patch });
}

/* ------------------------------------------------------------ the run loop */

/** Open a tab, wait for the content script to answer, and give up cleanly. */
async function openAndReach(url, timeoutMs) {
  const tab = await chrome.tabs.create({ url, active: false });
  const deadline = Date.now() + (timeoutMs || 25000);

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 700));
    try {
      const pong = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
      if (pong && pong.ok) return tab;
    } catch (e) {
      // Not injected yet, or this is not a page the manifest covers. Both are
      // normal for the first second or two.
    }
  }
  return { id: tab.id, unreachable: true };
}

async function step() {
  const run = await loadRun();
  const O = globalThis.JobPilot;
  if (!run || run.state !== 'running') return;

  const job = O.current(run);
  if (!job) {
    await put(RUN, { ...run, state: 'finished' });
    return;
  }

  const state = await loadState();
  let outcome = { outcome: 'unreadable', why: 'The page never became readable.' };
  let tabId = null;

  try {
    const tab = await openAndReach(job.url);
    tabId = tab.id;

    if (!tab.unreachable) {
      const res = await chrome.tabs.sendMessage(tab.id, {
        type: 'RUN',
        mode: run.mode,
        profile: state.profile,
        answers: state.answers,
        seen: state.seen
        // No `job` is passed: the content script reads the posting off the page
        // it is on. Sending a job from here would gate against the queue's
        // summary rather than against the advertisement itself.
      });
      if (res && res.ok) {
        outcome = {
          outcome: res.decision.outcome,
          submitted: res.submitted,
          why: res.note || res.decision.why,
          blockers: res.decision.blockers,
          record: res.decision.record
        };
      } else if (res && res.error) {
        outcome = { outcome: 'unreadable', why: res.error };
      }
    }
  } catch (e) {
    outcome = { outcome: 'unreadable', why: String((e && e.message) || e) };
  } finally {
    // Always close the tab. A run of forty that leaves them open is a browser
    // with forty tabs in it and a user who cannot find their own window.
    if (tabId) { try { await chrome.tabs.remove(tabId); } catch (e) { /* already gone */ } }
  }

  const next = O.recordAndAdvance(run, outcome);
  await put(RUN, next);

  if (outcome.outcome && outcome.outcome !== 'blocked' && outcome.outcome !== 'unreadable') {
    const seen = new Set(state.seen);
    if (job.key) seen.add(job.key);
    await saveState({
      seen: [...seen],
      log: [{ ...outcome, url: job.url, title: job.title, at: new Date().toISOString() },
        ...(state.log || [])].slice(0, 500)
    });
  }

  if (next.state === 'running') {
    // Alarms are capped at a one-minute minimum in released extensions, so a
    // shorter pace is expressed as a delayed one-minute alarm plus an
    // immediate follow-up when the worker happens to still be alive. The
    // alarm is what makes the run survive; the fast path is only an
    // optimisation.
    chrome.alarms.create(ALARM, { when: Date.now() + Math.max(1000, next.delayMs) });
  }
}

chrome.alarms.onAlarm.addListener((a) => { if (a.name === ALARM) step(); });

/* ------------------------------------------------------------------ router */

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  (async () => {
    const O = globalThis.JobPilot;
    try {
      if (msg.type === 'GET_STATE') respond(await loadState());
      else if (msg.type === 'SET_STATE') respond(await saveState(msg.patch));
      else if (msg.type === 'GET_RUN') {
        const run = await loadRun();
        respond({ run, summary: O.summarise(run) });
      } else if (msg.type === 'PREFLIGHT') {
        const s = await loadState();
        respond(O.preflight(s.profile, s.answers, msg.queue, { mode: msg.mode || s.mode }));
      } else if (msg.type === 'START_RUN') {
        const s = await loadState();
        const check = O.preflight(s.profile, s.answers, msg.queue, { mode: msg.mode || s.mode });
        if (!check.ok) { respond({ ok: false, ...check }); return; }
        const run = O.startRun(msg.queue, { mode: msg.mode || s.mode, cap: msg.cap, delayMs: msg.delayMs });
        await put(RUN, run);
        chrome.alarms.create(ALARM, { when: Date.now() + 500 });
        respond({ ok: true, run, summary: O.summarise(run) });
      } else if (msg.type === 'STOP_RUN') {
        const run = await loadRun();
        await chrome.alarms.clear(ALARM);
        const next = O.stop(run, msg.reason);
        await put(RUN, next);
        respond({ ok: true, summary: O.summarise(next) });
      } else if (msg.type === 'RECORD') {
        const s = await loadState();
        const seen = new Set(s.seen);
        if (msg.entry.key && msg.entry.outcome !== 'blocked') seen.add(msg.entry.key);
        respond(await saveState({
          seen: [...seen],
          log: [msg.entry, ...(s.log || [])].slice(0, 500)
        }));
      } else respond({ ok: false, error: 'unknown message: ' + msg.type });
    } catch (e) {
      respond({ ok: false, error: String((e && e.message) || e) });
    }
  })();
  return true;
});

// A run interrupted by the browser closing should not silently resume days
// later against a stale queue.
chrome.runtime.onStartup.addListener(async () => {
  const run = await loadRun();
  if (run && run.state === 'running') {
    await put(RUN, { ...run, state: 'paused',
      stopReason: 'Paused because the browser restarted. Resume if the queue is still current.' });
  }
});
