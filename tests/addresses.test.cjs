const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/addresses.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exported });
test('map messages accept only finite geographic coordinates', () => {
  assert.equal(exported.validCoordinates({ latitude: 23.8, longitude: 90.4 }), true);
  for (const value of [null, {}, { latitude: '23', longitude: 90 }, { latitude: NaN, longitude: 90 }, { latitude: 90, longitude: 90 }, { latitude: 20, longitude: 181 }]) assert.equal(exported.validCoordinates(value), false);
});
test('geocoding extracts street and postcode without inventing apartment data', () => {
  const fields = exported.parseGeocodedAddress({ display_name: '12 Test Road, Dhaka', address: { house_number: '12', road: 'Test Road', postcode: '1212' } });
  assert.equal(fields.address, '12 Test Road, Dhaka');
  assert.equal(fields.street, '12 Test Road');
  assert.equal(fields.postcode, '1212');
  assert.equal(exported.parseGeocodedAddress({ display_name: 'Park' }).postcode, '');
});
test('checkout uses the saved apartment and address within its storage limit', () => {
  assert.equal(exported.formatAddress({ apartment: '3B', address: '12 Test Road' }), 'Apt 3B, 12 Test Road');
  assert.equal(exported.formatAddress({ apartment: '', address: '12 Test Road' }), '12 Test Road');
  assert.equal(exported.formatAddress({ apartment: '3B', address: 'x'.repeat(400) }).length, 300);
});
