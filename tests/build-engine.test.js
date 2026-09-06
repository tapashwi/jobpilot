/**
 * The browser bundle is a concatenation, so the build has one job beyond
 * copying: refusing to emit something that cannot parse.
 *
 * scripts/build-engine.js drops every module into ONE shared scope. Two
 * modules declaring the same top-level `const` is a syntax error, which means
 * the entire app fails to load — every tab, on every page, at once. And the
 * test suite stays green throughout, because tests require the modules
 * separately and never see the shared scope.
 *
 * That is not hypothetical. `num` was declared at the top level of both
 * match.js and package-value.js, and adding the second to the bundle would
 * have shipped exactly that.
 */

const fs = require('fs');
const path = require('path');
const { topLevelNames, assertNoCollisions, MODULES } = require('../scripts/build-engine');

describe('the bundle refuses to ship a name collision', () => {
  test('two modules declaring the same const is a build failure, not a warning', () => {
    expect(() => assertNoCollisions([
      { module: 'a.js', src: 'const num = 1;\n' },
      { module: 'b.js', src: 'const num = 2;\n' },
    ])).toThrow(/num/);
  });

  test('the error names both modules, so it can be acted on', () => {
    let message = '';
    try {
      assertNoCollisions([
        { module: 'matching/match.js', src: 'const num = 1;\n' },
        { module: 'matching/package-value.js', src: 'const num = 2;\n' },
      ]);
    } catch (e) { message = e.message; }
    expect(message).toContain('matching/match.js');
    expect(message).toContain('matching/package-value.js');
  });

  test('a name declared twice in the SAME module is not a collision', () => {
    // Modules are read once each. Reporting a module against itself would be
    // noise, and a checker that cries wolf gets switched off.
    expect(() => assertNoCollisions([{ module: 'a.js', src: 'const x = 1;\nconst x = 2;\n' }]))
      .not.toThrow();
  });

  test('an indented declaration is inside a function and cannot collide', () => {
    // The commonest false positive there is: every module has local `const`s
    // with ordinary names. Only column zero reaches the shared scope.
    expect(topLevelNames('function f() {\n  const num = 1;\n}\n')).toEqual(['f']);
  });

  test('every declaration form is seen', () => {
    expect(topLevelNames('const a=1;\nlet b=2;\nvar c=3;\nfunction d(){}\nclass E{}\n'))
      .toEqual(['a', 'b', 'c', 'd', 'E']);
  });

  test('the real module list passes — this is the regression guard', () => {
    const root = path.join(__dirname, '..');
    const sources = MODULES.map((m) => ({
      module: m,
      src: fs.readFileSync(path.join(root, m), 'utf-8'),
    }));
    expect(() => assertNoCollisions(sources)).not.toThrow();
  });
});

describe('the generated engine carries what the app calls', () => {
  // app/app.js calls these by name. A missing export is a TypeError at click
  // time, on a page nothing here would otherwise exercise.
  const engine = fs.readFileSync(path.join(__dirname, '..', 'app', 'engine.js'), 'utf-8');

  test.each([
    'tells', 'rhythm', 'reachability', 'coverLetter', 'assess', 'parseJobSkills',
  ])('%s is exported', (name) => {
    expect(engine).toMatch(new RegExp(`^\\s*${name}: `, 'm'));
  });

  test('app and extension are byte-identical', () => {
    const app = path.join(__dirname, '..', 'app', 'engine.js');
    const ext = path.join(__dirname, '..', 'extension', 'engine.js');
    expect(fs.readFileSync(ext, 'utf-8')).toBe(fs.readFileSync(app, 'utf-8'));
  });
});
