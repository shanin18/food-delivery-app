const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/payment.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exported });
const now = new Date(2026, 9, 9);
test('demo cards retain only masked metadata', () => {
  const card = exported.validateDemoCard(' Demo User ', '4242 4242 4242 4242', '12/28', '123', now);
  assert.equal(card.brand, 'Visa');
  assert.equal(card.last4, '4242');
  assert.equal(card.holder, 'Demo User');
  assert.equal('number' in card, false);
  assert.equal('cvc' in card, false);
  assert.equal(exported.validateDemoCard('Demo', '5555555555554444', '10/26', '123', now).brand, 'Mastercard');
});
test('rejects non-demo cards and invalid required fields', () => {
  assert.throws(() => exported.validateDemoCard('Demo', '4111111111111111', '12/28', '123', now), /Use test/);
  assert.throws(() => exported.validateDemoCard('', '4242424242424242', '12/28', '123', now), /holder/);
  assert.throws(() => exported.validateDemoCard('Demo', '4242424242424242', '09/26', '123', now), /expiry/);
  assert.throws(() => exported.validateDemoCard('Demo', '4242424242424242', '13/28', '123', now), /expiry/);
  assert.throws(() => exported.validateDemoCard('Demo', '4242424242424242', '12/28', '12', now), /CVC/);
});
