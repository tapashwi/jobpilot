/**
 * content.js — read the form on this page, execute a plan, report what
 * happened.
 *
 * ALL THE JUDGEMENT LIVES IN engine.js, which is generated from the tested
 * packages. This file does the two things that can only happen in a page:
 * find the fields, and set their values. It decides nothing.
 *
 * THE THREE THINGS THAT ACTUALLY BREAK BROWSER AUTOFILL
 *
 * 1. Setting .value does not notify React. React tracks the last value it
 *    wrote on the DOM node; assigning directly leaves that tracker stale, so
 *    the framework's state never updates. The field LOOKS filled and submits
 *    empty. The fix is the native setter plus a real InputEvent, below.
 *
 * 2. Shadow DOM. Workday and SAP put inputs inside shadow roots, and
 *    document.querySelectorAll does not cross them. OPEN roots can be walked
 *    — this does — so "cannot pierce shadow DOM" is only true of closed ones,
 *    which are rare.
 *
 * 3. Cross-origin iframes. Genuinely impossible from the parent, so the
 *    manifest declares all_frames and this script runs inside them instead of
 *    trying to reach in.
 */

(function () {
  'use strict';

  const JP = globalThis.JobPilot;

  /* ------------------------------------------------------------ discovery */

  /** Walk the document and every OPEN shadow root beneath it. */
  function deepQueryAll(selector, root, out) {
    out = out || [];
    root = root || document;
    for (const el of root.querySelectorAll(selector)) out.push(el);
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) deepQueryAll(selector, el.shadowRoot, out);
    }
    return out;
  }

  /** The label a human sees for this control, tried in order of reliability. */
  function labelFor(el) {
    if (el.id) {
      const root = el.getRootNode();
      const lab = root.querySelector && root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab && lab.textContent.trim()) return lab.textContent.trim();
    }
    const wrapping = el.closest && el.closest('label');
    if (wrapping && wrapping.textContent.trim()) return wrapping.textContent.trim();

    if (el.getAttribute('aria-labelledby')) {
      const ids = el.getAttribute('aria-labelledby').split(/\s+/);
      const text = ids.map((id) => {
        const n = document.getElementById(id);
        return n ? n.textContent.trim() : '';
      }).filter(Boolean).join(' ');
      if (text) return text;
    }

    // Last resort: the nearest preceding text in the same group. Enough ATS
    // ship unassociated labels that skipping this loses real fields.
    const group = el.closest('div,fieldset,li,td,section');
    if (group) {
      const text = [...group.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .filter((t) => t.length > 2 && t.length < 160)
        .join(' ');
      if (text) return text;
    }
    return '';
  }

  function isVisible(el) {
    if (el.type === 'hidden' || el.disabled || el.readOnly) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /** Every fillable control on the page, in the shape the planner expects. */
  function readForm() {
    const els = deepQueryAll('input, textarea, select').filter(isVisible);
    const fields = els.map((el, i) => {
      const label = labelFor(el);
      return {
        _index: i,
        label,
        ariaLabel: el.getAttribute('aria-label') || '',
        name: el.name || '',
        id: el.id || '',
        placeholder: el.placeholder || '',
        title: el.title || '',
        type: el.type || el.tagName.toLowerCase(),
        required: el.required || el.getAttribute('aria-required') === 'true',
        options: el.tagName === 'SELECT' ? [...el.options].map((o) => o.text) : undefined
      };
    });
    return { fields, elements: els };
  }

  /* -------------------------------------------------------------- filling */

  /**
   * Set a value in a way React, Vue and Angular all actually notice.
   *
   * The native setter bypasses React's value tracker, and the InputEvent tells
   * the framework to read the DOM again. Without both, the field shows the
   * text and the app's state stays empty — which is the failure mode where an
   * automated submission sends a half-empty application and the applicant
   * finds out by never hearing back.
   */
  function setNativeValue(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillOne(el, value) {
    el.focus();

    if (el.tagName === 'SELECT') {
      const want = String(value).toLowerCase();
      const match = [...el.options].find((o) =>
        o.text.toLowerCase() === want || o.value.toLowerCase() === want) ||
        [...el.options].find((o) => o.text.toLowerCase().indexOf(want) !== -1);
      if (!match) return { ok: false, why: `no option matching "${value}"` };
      setNativeValue(el, match.value);
      return { ok: true, wrote: match.text };
    }

    if (el.type === 'checkbox') {
      const want = /^(yes|true|1)$/i.test(String(value));
      if (el.checked !== want) el.click();
      return { ok: true, wrote: String(el.checked) };
    }

    if (el.type === 'radio') {
      // Radios come as a group; the caller passes the one whose label matches.
      if (!el.checked) el.click();
      return { ok: true, wrote: el.value };
    }

    setNativeValue(el, String(value));
    el.blur();

    // VERIFY. An assignment that did not stick is the whole reason automated
    // applications arrive empty, so it is checked rather than assumed.
    const stuck = String(el.value) === String(value);
    return stuck ? { ok: true, wrote: el.value }
      : { ok: false, why: 'the value did not stick — the page is managing this field itself' };
  }

  /* ---------------------------------------------------------- the message */

  function execute(plan, elements) {
    const results = [];
    for (const step of plan) {
      const el = elements[step.field._index];
      if (!el) { results.push({ ...step, executed: false, why: 'the field disappeared' }); continue; }
      if (step.action !== 'fill') { results.push({ ...step, executed: false }); continue; }
      const r = fillOne(el, step.value);
      results.push({ ...step, executed: r.ok, wrote: r.wrote, why: r.why });
    }
    return results;
  }

  function findSubmit() {
    const candidates = deepQueryAll('button, input[type=submit], [role=button]').filter(isVisible);
    return candidates.find((b) => /^(submit|apply|send application|submit application)$/i
      .test((b.textContent || b.value || '').trim())) || null;
  }

  if (globalThis.chrome && chrome.runtime && chrome.runtime.onMessage)
  chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
    try {
      if (msg.type === 'READ_FORM') {
        const { fields } = readForm();
        respond({ ok: true, url: location.href, fields });
        return true;
      }

      if (msg.type === 'RUN') {
        const { fields, elements } = readForm();
        const decision = JP.runOne(msg.profile, msg.job, { fields }, {
          mode: msg.mode, answers: msg.answers, seen: msg.seen
        });

        if (decision.outcome === 'blocked' || decision.outcome === 'duplicate') {
          respond({ ok: true, decision, executed: [], submitted: false });
          return true;
        }

        const executed = execute(decision.plan, elements);
        const failed = executed.filter((e) => e.action === 'fill' && !e.executed);

        // A field that would not accept its value is a blocker like any other.
        // Submitting anyway is precisely how a half-empty application is sent.
        const submittable = decision.outcome === 'submitted' && failed.length === 0;
        let submitted = false;
        if (submittable) {
          const btn = findSubmit();
          if (btn) { btn.click(); submitted = true; }
        }

        respond({
          ok: true,
          decision,
          executed,
          failedFills: failed,
          submitted,
          note: submittable && !submitted
            ? 'Everything filled and verified, but no submit button was found — finish it by hand.'
            : failed.length
              ? `${failed.length} field(s) would not accept a value; nothing was submitted.`
              : undefined
        });
        return true;
      }
    } catch (e) {
      respond({ ok: false, error: String(e && e.message ? e.message : e) });
    }
    return true;
  });

  // Exposed so the DOM half can be exercised in a real browser against real
  // ATS-shaped markup. Everything above decides nothing; this is the part that
  // can only be verified by running it in a page, so it has to be reachable.
  globalThis.__jobpilotContent = { readForm, fillOne, deepQueryAll, labelFor, isVisible, findSubmit };

  if (globalThis.chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'CONTENT_READY', url: location.href }).catch(() => {});
  }
})();
