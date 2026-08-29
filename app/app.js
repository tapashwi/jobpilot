/**
 * app.js — the browser front end.
 *
 * All logic lives in engine.js, which is GENERATED from the packages the tests
 * exercise. Nothing here decides anything; it reads inputs, calls the engine
 * and renders. That separation is why the shipped behaviour cannot drift from
 * the tested behaviour.
 */
(function () {
  'use strict';

  var JP = window.JobPilot;
  var $ = function (s) { return document.querySelector(s); };
  var STORE = 'jobpilot.profile.v1';

  /* ------------------------------------------------------------------ tabs */

  var tabs = [].slice.call(document.querySelectorAll('[role=tab]'));

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      // Toggle the property, not a style rule: the page's own
      // `[role=tabpanel][hidden]{display:none!important}` needs the attribute,
      // and setting display directly would be overridden by it.
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight') { selectTab(tabs[(i + 1) % tabs.length]); tabs[(i + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft') { var p = (i - 1 + tabs.length) % tabs.length; selectTab(tabs[p]); tabs[p].focus(); }
    });
  });

  /* --------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /** Render [bracketed blanks] as visible marks the eye cannot skip over. */
  function withGaps(text) {
    return esc(text).replace(/\[([^\]]+)\]/g, function (_, inner) {
      return '<mark>' + inner + '</mark>';
    });
  }

  function list(items, cls) {
    if (!items || !items.length) return '';
    return '<div class="chips">' + items.map(function (i) {
      return '<span class="chip ' + (cls || '') + '">' + esc(i) + '</span>';
    }).join('') + '</div>';
  }

  function num(el) {
    var v = Number($(el).value);
    return Number.isFinite(v) && $(el).value !== '' ? v : null;
  }

  function copyText(text, btn) {
    var label = btn.textContent;
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = label; }, 1400);
    }, function () {
      btn.textContent = 'Press Ctrl+C';
    });
  }

  /* --------------------------------------------------------------- profile */

  function profile() {
    return {
      name: $('#name').value.trim(),
      email: $('#email').value.trim(),
      phone: $('#phone').value.trim(),
      resumeText: $('#resume').value,
      skills: JP.extractSkills($('#resume').value),
      yearsExperience: num('#years'),
      minSalary: num('#minsal'),
      requiresRemote: $('#remote').checked,
      needsSponsorship: $('#sponsor').checked
    };
  }

  function saveProfile() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        name: $('#name').value, email: $('#email').value, phone: $('#phone').value,
        resume: $('#resume').value, years: $('#years').value, minsal: $('#minsal').value,
        remote: $('#remote').checked, sponsor: $('#sponsor').checked
      }));
      $('#profileState').textContent = 'Saved on this device.';
    } catch (e) {
      // Private windows and blocked site data both throw here. Say so — the
      // alternative is a Save button that silently does nothing.
      $('#profileState').textContent = 'This browser will not let the page store anything, so nothing was saved.';
    }
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var d = JSON.parse(raw);
      $('#name').value = d.name || ''; $('#email').value = d.email || '';
      $('#phone').value = d.phone || ''; $('#resume').value = d.resume || '';
      $('#years').value = d.years || ''; $('#minsal').value = d.minsal || '';
      $('#remote').checked = !!d.remote; $('#sponsor').checked = !!d.sponsor;
      $('#profileState').textContent = 'Loaded from this device.';
    } catch (e) { /* nothing stored, or storage unreadable — start blank */ }
  }

  function needResume(outSel) {
    if ($('#resume').value.trim()) return false;
    $(outSel).innerHTML = '<div class="verdict block"><h2>No resume yet</h2>' +
      '<p>Paste your resume under <strong>Your profile</strong> first. Everything here is built ' +
      'from what is actually in it.</p></div>';
    return true;
  }

  /* ----------------------------------------------------------- check a job */

  function readJob(adSel, reqSel, yearsSel, minSel, maxSel) {
    var ad = $(adSel).value;
    var typed = reqSel && $(reqSel).value.trim();
    var parsed = JP.parseJobSkills(ad);
    return {
      adText: ad,
      requiredSkills: typed ? typed.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : parsed.required,
      preferredSkills: typed ? [] : parsed.preferred,
      minYearsExperience: yearsSel ? num(yearsSel) : null,
      salaryMin: minSel ? num(minSel) : null,
      salaryMax: maxSel ? num(maxSel) : null
    };
  }

  function renderMatch(a) {
    var v = a.verdict;
    var cls = v.level === 'blocked' ? 'block' : v.level === 'strong' ? 'pass' : 'warn';
    var html = '<div class="verdict ' + cls + '"><h2>' + esc(v.headline) + '</h2><p>' + esc(v.advice) + '</p>';
    if (a.blockers.length) {
      html += '<ul class="blockers">' + a.blockers.map(function (b) {
        return '<li><strong>' + esc(b.reason) + '</strong><span>' + esc(b.detail || '') + '</span></li>';
      }).join('') + '</ul>';
    }
    html += '</div><div class="card">';
    html += '<h3>You have, and the ad asks for</h3>' + (list(a.skills.matchedRequired, 'have') || '<p class="note">Nothing overlaps.</p>');
    html += '<h3>The ad asks for, and you do not list</h3>' + (list(a.skills.missingRequired, 'miss') || '<p class="note">Nothing missing.</p>');
    if (a.skills.missingPreferred.length) {
      html += '<h3>Nice to have, and you do not list</h3>' + list(a.skills.missingPreferred);
      html += '<p class="note">These are preferences, not gates — they do not stop you applying.</p>';
    }
    html += '</div>';
    return html;
  }

  $('#go').addEventListener('click', function () {
    if (needResume('#matchOut')) return;
    var job = readJob('#job', '#jreq', '#jyears', '#jmin', '#jmax');
    $('#matchOut').innerHTML = renderMatch(JP.assess(profile(), job));
  });
  $('#clearJob').addEventListener('click', function () {
    $('#job').value = ''; $('#matchOut').innerHTML = '';
  });

  /* ------------------------------------------------------------- ats check */

  function renderFindings(findings) {
    return findings.map(function (f) {
      return '<div class="finding ' + f.severity + '">' +
        '<h4><span class="sev ' + f.severity + '">' + f.severity + '</span>' + esc(f.title) + '</h4>' +
        '<p>' + esc(f.detail) + '</p>' +
        '<p class="fix"><strong>Fix:</strong> ' + esc(f.fix) + '</p></div>';
    }).join('');
  }

  $('#runAts').addEventListener('click', function () {
    if (needResume('#atsOut')) return;
    var r = JP.checkResume($('#resume').value, $('#atsJob').value || null);
    var c = r.counts;
    var html = '<div class="stats">' +
      '<div class="stat"><b>' + c.critical + '</b><span>critical</span></div>' +
      '<div class="stat"><b>' + c.warning + '</b><span>worth fixing</span></div>' +
      '<div class="stat"><b>' + c.info + '</b><span>minor</span></div>' +
      (r.coverage ? '<div class="stat"><b>' + r.coverage.present.length + '/' + r.coverage.total +
        '</b><span>ad keywords present</span></div>' : '') + '</div>';

    html += r.findings.length ? renderFindings(r.findings)
      : '<div class="verdict pass"><h2>Nothing to fix</h2><p>Every check passed.</p></div>';

    html += '<div class="card"><h3>What was checked</h3><ul class="src">' +
      r.checked.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul><p class="note">There is deliberately no score out of a hundred. No such number ' +
      'exists: vendors do not publish one, Workday and Greenhouse rank differently from each ' +
      'other, and most systems do not auto-reject at all — a recruiter filters a search. Any ' +
      'tool showing you an "ATS score" invented it.</p></div>';
    $('#atsOut').innerHTML = html;
  });

  /* ----------------------------------------------------------- cover letter */

  var lastLetter = '';

  $('#runLetter').addEventListener('click', function () {
    if (needResume('#letterOut')) return;
    var parsed = JP.parseJobSkills($('#lJob').value);
    var r = JP.coverLetter(profile(), {
      title: $('#lTitle').value.trim() || null,
      company: $('#lCompany').value.trim() || null,
      hiringManager: $('#lManager').value.trim() || null,
      adText: $('#lJob').value,
      requiredSkills: parsed.required,
      preferredSkills: parsed.preferred
    }, { tone: $('#lTone').value });

    lastLetter = r.text;
    var badge = '<span class="readiness' + (r.gaps === 0 ? ' done' : '') + '">' + esc(r.readiness) + '</span>';
    var html = '<div class="card"><h3 style="margin-top:0">Draft' + badge + '</h3>' +
      '<div class="doc">' + withGaps(r.text) + '</div>' +
      '<p class="note" style="margin-top:.8rem">' + r.wordCount + ' words. ' +
      'The highlighted blanks are yours to fill — they are the parts no tool can know.</p></div>';

    if (r.sources.length) {
      html += '<div class="card"><h3 style="margin-top:0">Where each claim came from</h3><ul class="src">' +
        r.sources.map(function (s) {
          return '<li><strong>' + esc(s.skill) + '</strong> — “' + esc(s.quotedFrom) + '”' +
            (s.quantified ? '' : ' <em>(no number in this one)</em>') + '</li>';
        }).join('') + '</ul>' +
        '<p class="note">Every line above is already in your resume. Nothing was invented, which ' +
        'is why you can defend all of it in the interview.</p></div>';
    }
    if (r.unbackedRequired.length) {
      html += '<div class="verdict warn"><h2>Asked for, and not in your resume</h2>' +
        '<p>' + esc(r.unbackedRequired.join(', ')) + '</p></div>';
    }
    $('#letterOut').innerHTML = html;
  });

  $('#copyLetter').addEventListener('click', function () { copyText(lastLetter, this); });

  /* ------------------------------------------------------ selection criteria */

  var lastCriteria = '';

  $('#runCriteria').addEventListener('click', function () {
    if (needResume('#criteriaOut')) return;
    var r = JP.draftAll($('#cText').value, $('#resume').value, { length: $('#cLen').value });

    if (!r.responses.length) {
      $('#criteriaOut').innerHTML = '<div class="verdict block"><h2>No criteria found</h2><p>' +
        esc(r.note) + '</p></div>';
      return;
    }

    lastCriteria = r.responses.map(function (x, i) {
      return (i + 1) + '. ' + x.criterion + '\n\n' + x.text;
    }).join('\n\n\n');

    var html = '<div class="verdict warn"><h2>' + r.responses.length + ' criteria, ' +
      r.totalGaps + ' blanks to fill</h2><p>' + esc(r.note) + '</p></div>';

    html += r.responses.map(function (x, i) {
      return '<div class="card"><h3 style="margin-top:0">' + (i + 1) + '. ' + esc(x.criterion) + '</h3>' +
        '<p class="note">Aim for about ' + x.wordLimit + ' words. ' +
        (x.evidenceUsed ? 'Your own achievement is already in the Action.' :
          'Nothing in your resume matched this one — the Action is yours to write.') + '</p>' +
        '<div class="doc">' + withGaps(x.text) + '</div></div>';
    }).join('');

    if (r.unsupported.length) {
      html += '<div class="verdict warn"><h2>' + r.unsupported.length +
        ' criteria have no supporting evidence in your resume</h2>' +
        '<p>Those responses are scaffolds only. A panel scores each criterion on its own, so an ' +
        'unanswered one is a zero for that criterion rather than a slightly lower total.</p></div>';
    }
    $('#criteriaOut').innerHTML = html;
  });

  $('#copyCriteria').addEventListener('click', function () { copyText(lastCriteria, this); });

  /* ------------------------------------------------------------------ queue */

  var lastQueue = null;

  $('#runQueue').addEventListener('click', function () {
    if (needResume('#queueOut')) return;
    var ads = JP.splitAdvertisements($('#qBlob').value);
    if (!ads.length) {
      $('#queueOut').innerHTML = '<div class="verdict block"><h2>No advertisements found</h2>' +
        '<p>Paste one or more job ads, separated by a line of three dashes.</p></div>';
      return;
    }
    var q = JP.buildQueue(profile(), ads);
    lastQueue = q;
    var s = q.summary;

    var html = '<div class="stats">' +
      '<div class="stat"><b>' + s.total + '</b><span>advertisements</span></div>' +
      '<div class="stat"><b>' + s.ready + '</b><span>ready to send</span></div>' +
      '<div class="stat"><b>' + s.fixFirst + '</b><span>fix the resume first</span></div>' +
      '<div class="stat"><b>' + s.skipped + '</b><span>blocked</span></div>' +
      '<div class="stat"><b>' + s.totalGaps + '</b><span>blanks to fill</span></div></div>';

    if (q.sharedResumeFixes.length) {
      html += '<div class="verdict warn"><h2>Fix these once and every application improves</h2>' +
        '<ul class="blockers">' + q.sharedResumeFixes.map(function (f) {
          return '<li><strong>' + esc(f.title) + '</strong><span>Affects ' + f.affectsJobs +
            ' of these jobs. ' + esc(f.fix) + '</span></li>';
        }).join('') + '</ul></div>';
    }

    html += q.packs.map(function (p, i) {
      var t = p.job.title || 'Untitled role';
      var c = p.job.company ? ' — ' + p.job.company : '';
      var meta = p.recommendation === 'skip'
        ? 'Blocked: ' + p.why.join('; ')
        : (p.assessment.score !== null ? 'Fit ' + p.assessment.score + '/100. ' : '') +
          p.gapsToFill + ' blank' + (p.gapsToFill === 1 ? '' : 's') + ' to fill.';
      return '<div class="qrow ' + p.recommendation + '">' +
        '<div><h4>' + esc(t + c) + '</h4><div class="meta">' + esc(meta) + '</div></div>' +
        '<div>' + (p.documents
          ? '<button class="ghost" data-pack="' + i + '">Open pack</button>'
          : '<span class="chip miss">no documents</span>') + '</div></div>';
    }).join('');

    html += '<div class="card"><h3 style="margin-top:0">The last step is yours</h3>' +
      '<p class="note">JobPilot does not press submit on SEEK or Workday, and that is deliberate. ' +
      'Their terms prohibit automated submission and the enforcement is bot detection terminating ' +
      'the account — including your SEEK profile and every application already in flight. ' +
      'Workday\'s form widgets also ignore programmatic changes, so an automated submission there ' +
      'does not fail loudly; it sends a half-empty application and you find out by never hearing ' +
      'back. A submission cannot be undone. So everything up to the button is prepared here, and ' +
      'the button stays with the person whose name is on the application.</p></div>';

    html += '<div id="packOut"></div>';
    $('#queueOut').innerHTML = html;

    [].slice.call(document.querySelectorAll('[data-pack]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = q.packs[Number(btn.getAttribute('data-pack'))];
        var d = p.documents;
        var out = '<div class="card"><h3 style="margin-top:0">' +
          esc((p.job.title || 'Role') + (p.job.company ? ' — ' + p.job.company : '')) + '</h3>' +
          (p.job.url ? '<p class="src"><a href="' + esc(p.job.url) + '" rel="noopener">Open the advertisement</a></p>' : '') +
          '<div class="doc">' + withGaps(d.coverLetter.text) + '</div></div>';
        if (d.atsCheck.findings.length) {
          out += '<div class="card"><h3 style="margin-top:0">Resume gaps for this one</h3>' +
            renderFindings(d.atsCheck.findings.slice(0, 5)) + '</div>';
        }
        if (d.selectionCriteria && d.selectionCriteria.responses.length) {
          out += '<div class="card"><h3 style="margin-top:0">Selection criteria</h3>' +
            d.selectionCriteria.responses.map(function (x, n) {
              return '<h4>' + (n + 1) + '. ' + esc(x.criterion) + '</h4><div class="doc">' +
                withGaps(x.text) + '</div>';
            }).join('') + '</div>';
        }
        $('#packOut').innerHTML = out;
        $('#packOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  });

  $('#exportQueue').addEventListener('click', function () {
    if (!lastQueue) return;
    copyText(JSON.stringify({
      generatedAt: new Date().toISOString(),
      summary: lastQueue.summary,
      jobs: lastQueue.packs.map(function (p) {
        return {
          title: p.job.title, company: p.job.company, url: p.job.url,
          recommendation: p.recommendation, why: p.why,
          score: p.assessment.score,
          coverLetter: p.documents ? p.documents.coverLetter.text : null
        };
      })
    }, null, 2), this);
  });

  /* ------------------------------------------------------------------- boot */

  $('#saveProfile').addEventListener('click', saveProfile);
  $('#clearProfile').addEventListener('click', function () {
    ['#name', '#email', '#phone', '#resume', '#years', '#minsal'].forEach(function (s) { $(s).value = ''; });
    $('#remote').checked = false; $('#sponsor').checked = false;
    try { localStorage.removeItem(STORE); } catch (e) { /* nothing to remove */ }
    $('#profileState').textContent = 'Cleared.';
  });

  loadProfile();
})();
