const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/search.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exportsObject });

test('search ignores case and extra whitespace, and requires every word', () => {
  assert.equal(exportsObject.matchesSearch('  HOT   dog ', 'Sausage Hot Dog'), true);
  assert.equal(exportsObject.matchesSearch('burger salad', 'Classic Burger'), false);
  assert.equal(exportsObject.matchesSearch('', 'Classic Burger'), true);
  assert.equal(exportsObject.matchesSearch('pizza', 'Classic Burger'), false);
});

test('recent searches are deduplicated, ordered, bounded, and clearable', () => {
  exportsObject.clearRecentSearches();
  exportsObject.rememberSearch(' Burger ');
  assert.equal(exportsObject.rememberSearch('burger').length, 1);
  for (let i = 0; i < 10; i++) exportsObject.rememberSearch(`Food ${i}`);
  const recent = exportsObject.getRecentSearches();
  assert.equal(recent.length, 6);
  assert.equal(recent[0], 'Food 9');
  recent.push('External edit');
  assert.equal(exportsObject.getRecentSearches().length, 6);
  assert.equal(exportsObject.clearRecentSearches().length, 0);
});
