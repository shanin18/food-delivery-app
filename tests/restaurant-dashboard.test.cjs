const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/data/restaurant-dashboard.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exported, require: () => ({ dishes: [{ id: 'burger', name: 'Burger Bistro', price: 40, image: 'burger.png' }] }) });
test('dashboard data yields the displayed counts and revenue', () => {
  const orders = exported.initialRestaurantOrders(new Date(2026, 9, 16, 17));
  assert.equal(orders.filter(order => order.status === 'running').length, 20);
  assert.equal(orders.filter(order => order.status === 'requested').length, 5);
  assert.equal(orders.filter(order => order.status === 'completed').reduce((sum, order) => sum + order.amount, 0), 2241);
});
test('accept, done, and cancel update only active orders', () => {
  const original = exported.initialRestaurantOrders(new Date(2026, 9, 16));
  const request = original.find(order => order.status === 'requested');
  const accepted = exported.updateRestaurantOrder(original, request.id, 'accept');
  assert.equal(accepted.find(order => order.id === request.id).status, 'running');
  assert.equal(request.status, 'requested');
  const finished = exported.updateRestaurantOrder(accepted, request.id, 'done');
  assert.equal(finished.find(order => order.id === request.id).status, 'completed');
  assert.equal(exported.updateRestaurantOrder(finished, request.id, 'cancel').find(order => order.id === request.id).status, 'completed');
  const other = original.find(order => order.status === 'running');
  assert.equal(exported.updateRestaurantOrder(original, other.id, 'cancel').find(order => order.id === other.id).status, 'cancelled');
});
