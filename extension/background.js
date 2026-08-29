/**
 * background.js — the service worker.
 *
 * MV3 service workers are killed after roughly thirty seconds idle, which is
 * shorter than a multi-step Workday form. So this holds NO state in memory:
 * every read and write goes through chrome.storage, and a worker that has been
 * restarted picks up exactly where the last one left off.
 *
 * Anything kept in a module-level variable here would survive testing on a
 * fast machine and vanish in real use, which is the worst kind of bug.
 */

const KEY = 'jobpilot.state.v1';

async function load() {
  const got = await chrome.storage.local.get(KEY);
  return got[KEY] || { profile: {}, answers: {}, seen: [], log: [], mode: 'review' };
}

async function save(patch) {
  const state = await load();
  const next = { ...state, ...patch };
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  (async () => {
    if (msg.type === 'GET_STATE') respond(await load());
    else if (msg.type === 'SET_STATE') respond(await save(msg.patch));
    else if (msg.type === 'RECORD') {
      const state = await load();
      const seen = new Set(state.seen);
      if (msg.entry.key && msg.entry.outcome !== 'blocked') seen.add(msg.entry.key);
      respond(await save({
        seen: [...seen],
        // Bounded: an unbounded log in extension storage eventually hits the
        // quota and every write starts failing silently.
        log: [msg.entry, ...state.log].slice(0, 500)
      }));
    } else respond({ ok: false, error: 'unknown message' });
  })();
  return true;
});
