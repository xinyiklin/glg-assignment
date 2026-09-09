// Run from pipeline/: node -r ts-node/register/transpile-only test/receipt-total.cjs
const assert = require('node:assert/strict');
const { ReceiptDocument } = require('../src/services/receipt/ReceiptDocument');

function textContent(node) {
  if (node == null) return '';
  if (Array.isArray(node)) return node.map(textContent).join('');
  if (typeof node !== 'object') return String(node);
  return textContent(node.props?.children);
}

const cases = [
  { items: [{ name: 'A', quantity: 2, price: 12.5 }, { name: 'B', quantity: 3, price: 4.25 }], expected: '37.75', rows: ['A2$12.50$25.00', 'B3$4.25$12.75'] },
  { items: [{ name: 'A', quantity: 3, price: 0.1 }, { name: 'B', quantity: 1, price: 0.2 }], expected: '0.50', rows: ['A3$0.10$0.30', 'B1$0.20$0.20'] },
  { items: [{ name: 'A', quantity: 9, price: 19.99 }], expected: '179.91', rows: ['A9$19.99$179.91'] },
  { items: [{ name: 'A', quantity: 1, price: 1.15 }], expected: '1.15', rows: ['A1$1.15$1.15'] },
  { items: [], expected: '0.00', rows: [] },
];

for (const { items, expected, rows } of cases) {
  const order = {
    orderId: 'synthetic-test', userId: 'synthetic', referenceId: 'synthetic-test',
    amount: 42.5, status: 'processing', createdAt: 0, updatedAt: 0,
    details: {
      customer: { name: 'Synthetic Customer', email: 'test@example.invalid',
        address: { street: 'Test Street', city: 'Test City', state: 'NY', country: 'US', zip: '10001' } },
      items,
    },
  };
  const original = JSON.stringify(order);
  const text = textContent(ReceiptDocument({ order }));
  assert.ok(text.includes('ItemQuantityUnit priceTotal price'), 'Label unit and total prices separately');
  for (const row of rows) assert.ok(text.includes(row), `Expected item row ${row}; got ${text}`);
  assert.ok(text.includes(`Total Amount:$${expected}`), `Expected item total $${expected}; got ${text}`);
  assert.equal(JSON.stringify(order), original, 'Rendering must not change the stored order amount or items');
}
console.log('PASS: 5 receipt cases with unit/total price columns, quantities, decimal cents, empty items, and unchanged order data');
