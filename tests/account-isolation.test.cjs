const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the providers with persistent hook slots and guarded re-renders.
// Native navigation/rendering remains a separate device acceptance check.
function harness(file, exportName, dependencies) {
  const slots = []; let cursor = 0; let changed = false; let user = 'customer-a';
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useState: initial => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], update => { slots[index] = typeof update === 'function' ? update(slots[index]) : update; changed = true; }];
    },
    useRef: initial => { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
  };
  const imports = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    '@/providers/auth-provider': { useAuth: () => ({ session: user ? { user: { id: user } } : null }) },
    ...dependencies,
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: name => { if (!(name in imports)) throw new Error(name); return imports[name]; } });
  return {
    switchUser: next => { user = next; },
    render: () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        cursor = 0; changed = false;
        const result = exports[exportName]({ children: null });
        if (!changed) return result.props.value;
      }
      throw new Error('Provider did not settle');
    },
  };
}

test('cart and favorites survive same-account refresh but clear on switch and logout', () => {
  const h = harness('src/providers/food-provider.tsx', 'FoodProvider', {
    '@/hooks/use-saved-address': { useSavedAddress: () => ({ address: '', setAddress: async () => {}, addressLoading: false, addressStorageError: null }) },
  });
  let state = h.render();
  state.addItem({ dishId: 'burger', size: 'M', quantity: 2, unitPrice: 40 });
  state.toggleFavorite('burger');
  assert.equal(h.render().items.length, 1);
  h.switchUser('customer-a');
  assert.equal(h.render().favorites.length, 1);
  h.switchUser('customer-b');
  state = h.render();
  assert.equal(state.items.length, 0); assert.equal(state.favorites.length, 0);
  state.addItem({ dishId: 'pizza', size: 'M', quantity: 1, unitPrice: 20 });
  h.switchUser(null);
  assert.equal(h.render().items.length, 0);
});

test('masked cards and payment selections are isolated between accounts', () => {
  const h = harness('src/providers/payment-provider.tsx', 'PaymentProvider', {
    '@/hooks/use-order-history': { useOrderHistory: () => ({ orders: [], setOrders: () => {}, ordersLoading: false, storageError: null }) },
    '@/lib/orders': { cancelOrder: orders => orders },
    '@/data/catalog': { dishes: [] },
    '@/providers/food-provider': { useFood: () => ({ items: [], address: '', clearCart: () => {} }) },
  });
  h.render().saveCard({ id: 'card-a', brand: 'Visa', last4: '4242', holder: 'Customer A' });
  assert.equal(h.render().selectedCard, 'card-a');
  h.switchUser('customer-b');
  const state = h.render();
  assert.equal(state.cards.length, 0); assert.equal(state.selectedCard, null); assert.equal(state.method, 'Mastercard');
});
