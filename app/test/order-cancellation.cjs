process.env.SQS_ORDER_EMAIL_QUEUE_NAME = 'order-email-queue';
process.env.SQS_ORDER_INTAKE_QUEUE_NAME = 'order-intake-queue';
require('ts-node/register/transpile-only');

const assert = require('node:assert/strict');
const { OrdersController } = require('../src/controllers/orders/OrdersController');
const { OrdersDatabase } = require('../src/databases/OrdersDatabase');
const { SimpleQueueService } = require('../src/services/sqs/SimpleQueueService');

const originalGet = OrdersDatabase.getOrderById;
const originalCancel = OrdersDatabase.cancelOrder;
const originalSend = SimpleQueueService.sendMessage;

function request(body) { return { body }; }
function response() {
  return {
    statusCode: undefined,
    payload: undefined,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
  };
}

(async () => {
  const controller = new OrdersController();
  const order = {
    orderId: 'order-1', userId: 'user-1', referenceId: 'ref-1', amount: 10,
    status: 'processing', createdAt: 1, updatedAt: 1,
    details: { customer: { name: 'Test Customer', email: 'test@example.invalid' }, items: [] },
  };
  let queued = 0;
  let cancelled = 0;
  OrdersDatabase.getOrderById = async (id) => id === 'missing' ? null : order;
  OrdersDatabase.cancelOrder = async () => {
    cancelled += 1;
    return { ...order, status: 'cancelled', cancelledAt: 2 };
  };
  SimpleQueueService.sendMessage = async () => { queued += 1; };

  for (const body of [undefined, null, {}, { orderId: '' }, { orderId: '   ' }, { orderId: 42 }]) {
    const res = response();
    await controller.deleteOrder(request(body), res);
    assert.equal(res.statusCode, 400);
  }

  let res = response();
  await controller.deleteOrder(request({ orderId: 'missing' }), res);
  assert.equal(res.statusCode, 404);
  assert.equal(cancelled, 0);
  assert.equal(queued, 0);

  OrdersDatabase.getOrderById = async () => ({ ...order, details: undefined });
  res = response();
  await controller.deleteOrder(request({ orderId: 'order-1' }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.payload.message, 'CUSTOMER_DETAILS_UNAVAILABLE');
  assert.equal(cancelled, 0, 'pre-intake cancellation must not mutate the order');
  assert.equal(queued, 0, 'pre-intake cancellation must not enqueue mail');
  OrdersDatabase.getOrderById = async () => order;

  res = response();
  await controller.deleteOrder(request({ orderId: 'order-1' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.order.status, 'cancelled');
  assert.equal(queued, 1);

  OrdersDatabase.getOrderById = async () => ({ ...order, status: 'cancelled' });
  res = response();
  await controller.deleteOrder(request({ orderId: 'order-1' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(queued, 1, 'repeated cancellation must not enqueue another email');

  OrdersDatabase.getOrderById = originalGet;
  OrdersDatabase.cancelOrder = originalCancel;
  SimpleQueueService.sendMessage = originalSend;
  console.log('PASS: cancellation validation, missing order, pre-intake rejection, success, and idempotent retry');
})().catch((error) => {
  OrdersDatabase.getOrderById = originalGet;
  OrdersDatabase.cancelOrder = originalCancel;
  SimpleQueueService.sendMessage = originalSend;
  throw error;
});
