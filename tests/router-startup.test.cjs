const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('initial-link callback waits for commit and ignores updates after unmount', () => {
  const root = path.dirname(require.resolve('expo-router/package.json'));
  const source = fs.readFileSync(path.join(root, 'build/fork/NavigationContainer.js'), 'utf8');
  const start = source.indexOf('    // food-delivery: defer initial linking updates until commit');
  const end = source.indexOf('    const { getInitialState }', start);
  assert.ok(start >= 0 && end > start, 'The startup patch must be installed');
  assert.ok(source.includes('}, handleUnhandledLink);'));
  const updates = [];
  let effect;
  const context = {
    setLastUnhandledLink: value => updates.push(value),
    react_1: { default: {
      useRef: value => ({ current: value }),
      useEffect: callback => { effect = callback; },
      useCallback: callback => callback,
    } },
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + '\nglobalThis.callback = handleUnhandledLink;', context);
  context.callback('/auth-callback');
  assert.deepEqual(updates, []);
  const cleanup = effect();
  assert.deepEqual(updates, ['/auth-callback']);
  context.callback('/home');
  assert.deepEqual(updates, ['/auth-callback', '/home']);
  cleanup();
  context.callback('/discarded');
  assert.equal(updates.length, 2);
  // React Strict Mode runs effect cleanup and setup again.
  effect();
  context.callback('/login');
  assert.equal(updates.at(-1), '/login');
});
