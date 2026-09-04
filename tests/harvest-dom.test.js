/**
 * harvest() — reading job listings off a search-results page.
 *
 * WHY THIS EXISTS
 *
 * harvest.js sat at 34% of statements. The existing discovery suite tests
 * boardFor() and readCard() thoroughly, and stops before harvest() itself —
 * the DOM walk that finds the anchors, resolves their URLs, and decides which
 * of several anchors pointing at the same job is the one worth keeping.
 *
 * That walk is where the interesting failures live. SEEK, Indeed and LinkedIn
 * have no public API, so this reading-the-rendered-page path is how most of
 * the Australian market reaches the queue at all. If it silently returns
 * nothing, the product looks broken; if it returns a job with the wrong
 * employer, the cover letter is addressed to the wrong company.
 *
 * NO jsdom. The repo's only devDependency is jest, and harvest() takes its
 * document as a parameter specifically so it "runs under a test as readily as
 * in a page" — the author designed for injection. So this builds the smallest
 * DOM that satisfies what the module actually calls, and tests the real
 * function rather than installing a browser to do it.
 */

const { harvest, cardSegments, supportedBoards } = require('../packages/discovery/src/harvest');

/**
 * A minimal element. Supports exactly the surface harvest.js uses:
 * getAttribute, textContent, children, childNodes, querySelectorAll, closest.
 */
function el(tag, { attrs = {}, text = null, children = [], className = '' } = {}) {
  const node = {
    tagName: tag.toUpperCase(),
    nodeType: 1,
    className,
    attrs,
    children,
    parentElement: null,
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
    get childNodes() {
      return text !== null ? [{ nodeType: 3, textContent: text }, ...children] : children;
    },
    get textContent() {
      return text !== null ? text : children.map((c) => c.textContent).join('');
    },
    querySelectorAll(sel) {
      const all = [];
      (function walk(n) {
        for (const c of n.children) { all.push(c); walk(c); }
      })(node);
      return sel === '*' ? all : all.filter((n) => n.tagName === 'A' && n.getAttribute('href') !== null);
    },
    closest(sel) {
      // Selectors here are class-based card hints. Walk up for a match.
      const names = String(sel).split(',').map((s) => s.trim().replace(/^\./, ''));
      let cur = node;
      while (cur) {
        if (names.some((n) => n && String(cur.className || '').includes(n))) return cur;
        cur = cur.parentElement;
      }
      return null;
    },
  };
  for (const c of children) c.parentElement = node;
  return node;
}

const text = (t) => el('span', { text: t });
const anchor = (href, label) => el('a', { attrs: { href }, text: label });

/** A document whose querySelectorAll('a[href]') finds every anchor in the tree. */
function doc(...roots) {
  const container = el('body', { children: roots });
  return {
    querySelectorAll(sel) {
      const all = [];
      (function walk(n) { for (const c of n.children) { all.push(c); walk(c); } })(container);
      if (sel === 'a[href]') return all.filter((n) => n.tagName === 'A' && n.getAttribute('href'));
      return all;
    },
  };
}

describe('knowing where it is', () => {
  it('refuses a page that is not a supported board, with a usable message', () => {
    const r = harvest(doc(), 'https://example.com/jobs');
    expect(r.jobs).toEqual([]);
    expect(r.board).toBeNull();
    expect(r.error).toMatch(/not a job board/i);
  });

  it('names the boards it can read, so the message can tell the user where to go', () => {
    const boards = supportedBoards();
    expect(boards.length).toBeGreaterThan(0);
    expect(boards.every((b) => b.id && b.label)).toBe(true);
  });
});

describe('finding jobs on a results page', () => {
  it('reads a listing and its surrounding card', () => {
    const card = el('article', {
      className: 'job-card',
      children: [anchor('/job/12345678', 'Support Engineer'), text('Acme Pty Ltd'), text('Darwin NT')],
    });
    const r = harvest(doc(card), 'https://www.seek.com.au/jobs?keywords=support');

    expect(r.board).toBe('seek');
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].title).toBe('Support Engineer');
    expect(r.jobs[0].company).toBe('Acme Pty Ltd');
    expect(r.jobs[0].location).toBe('Darwin NT');
    expect(r.jobs[0].source).toBe('seek');
  });

  it('resolves a relative href against the page it came from', () => {
    // Boards render relative links. A queue full of "/job/123" applies to
    // nothing.
    const card = el('article', { className: 'job-card', children: [anchor('/job/999', 'Analyst')] });
    const r = harvest(doc(card), 'https://www.seek.com.au/jobs');
    expect(r.jobs[0].url).toBe('https://www.seek.com.au/job/999');
  });

  it('strips the fragment, so the same job through two links is one job', () => {
    const card = el('article', {
      className: 'job-card',
      children: [anchor('https://www.seek.com.au/job/555#apply', 'Engineer')],
    });
    expect(harvest(doc(card), 'https://www.seek.com.au/jobs').jobs[0].url)
      .toBe('https://www.seek.com.au/job/555');
  });

  it('ignores links that are not job links', () => {
    const card = el('article', {
      className: 'job-card',
      children: [anchor('/about-us', 'About'), anchor('/job/321', 'Real Job')],
    });
    const r = harvest(doc(card), 'https://www.seek.com.au/jobs');
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].title).toBe('Real Job');
  });

  it('skips an untitled anchor — usually an image wrapping the same job', () => {
    const card = el('article', {
      className: 'job-card',
      children: [anchor('/job/777', ''), anchor('/job/777', 'Network Engineer'), text('Beta Ltd')],
    });
    const r = harvest(doc(card), 'https://www.seek.com.au/jobs');
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].title).toBe('Network Engineer');
  });
});

describe('when several anchors point at the same job', () => {
  it('keeps the one with the most context, not the first one seen', () => {
    // A results page links the same job from a bare list item and from inside
    // the full card. Taking the first would throw away the employer and
    // location that the other one has.
    const bare = el('div', { className: 'x', children: [anchor('/job/42', 'Support Engineer')] });
    const rich = el('article', {
      className: 'job-card',
      children: [anchor('/job/42', 'Support Engineer'), text('Acme Pty Ltd'), text('Darwin NT'), text('$95,000')],
    });
    const r = harvest(doc(bare, rich), 'https://www.seek.com.au/jobs');

    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].company).toBe('Acme Pty Ltd');
    expect(r.jobs[0].salaryMin).toBe(95000);
  });

  it('keeps the richer entry regardless of which came first in the document', () => {
    const rich = el('article', {
      className: 'job-card',
      children: [anchor('/job/43', 'Analyst'), text('Gamma Corp'), text('Sydney NSW')],
    });
    const bare = el('div', { className: 'x', children: [anchor('/job/43', 'Analyst')] });
    const r = harvest(doc(rich, bare), 'https://www.seek.com.au/jobs');
    expect(r.jobs).toHaveLength(1);
    expect(r.jobs[0].company).toBe('Gamma Corp');
  });
});

describe('the shape handed on to the rest of the pipeline', () => {
  it('does not leak the internal scoring field', () => {
    const card = el('article', { className: 'job-card', children: [anchor('/job/1', 'Engineer')] });
    const r = harvest(doc(card), 'https://www.seek.com.au/jobs');
    expect(r.jobs[0]._score).toBeUndefined();
  });

  it('marks harvested jobs as web applications with a namespaced id', () => {
    const card = el('article', { className: 'job-card', children: [anchor('/job/808', 'Engineer')] });
    const j = harvest(doc(card), 'https://www.seek.com.au/jobs').jobs[0];
    expect(j.applyVia).toBe('web');
    expect(j.applyEmail).toBeNull();
    expect(j.id).toBe('seek:808');
  });
});

describe('an empty results page', () => {
  it('explains what to do rather than just returning nothing', () => {
    const r = harvest(doc(), 'https://www.seek.com.au/jobs');
    expect(r.jobs).toEqual([]);
    expect(r.board).toBe('seek');
    expect(r.error).toMatch(/search results themselves|scroll/i);
  });
});

describe('cardSegments', () => {
  it('returns leaf text separately, never one concatenated blob', () => {
    // textContent on a parent joins siblings with no separator, which is how
    // "CanvaSydney NSW$140,000" happens and every field parsed from it is
    // wrong.
    const card = el('div', { children: [text('Canva'), text('Sydney NSW'), text('$140,000')] });
    expect(cardSegments(card)).toEqual(['Canva', 'Sydney NSW', '$140,000']);
  });

  it('is safe on a missing card', () => {
    expect(cardSegments(null)).toEqual([]);
  });
});
