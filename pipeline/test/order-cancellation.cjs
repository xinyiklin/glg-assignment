process.env.SQS_ORDER_EMAIL_QUEUE_NAME = 'order-email-queue';
require('ts-node/register/transpile-only');

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { OrderEmailerInstance } = require('../src/instances/impl/OrderEmailerInstance');
const { OrdersDatabase } = require('../src/databases/OrdersDatabase');
const { EmailService } = require('../src/services/email/EmailService');

const originalGet = OrdersDatabase.getOrderById;
const originalCancellation = EmailService.sendCancellationEmail;
const originalReceipt = EmailService.sendEmail;
let fixtureDirectory;

(async () => {
  const worker = new OrderEmailerInstance();
  const order = {
    orderId: 'order-1', userId: 'user-1', referenceId: 'ref-1', amount: 10,
    status: 'cancelled', createdAt: 1, updatedAt: 2, cancelledAt: 2,
    details: { customer: { name: 'Test Customer', email: 'test@example.invalid' }, items: [] },
  };
  let sent;
  OrdersDatabase.getOrderById = async () => order;
  EmailService.sendCancellationEmail = async (params) => { sent = params; };

  await worker.process({ orderId: order.orderId, kind: 'cancellation' });
  assert.equal(sent.order.orderId, order.orderId);
  assert.equal(sent.receipt, undefined, 'cancellation email must not receive a PDF');

  fixtureDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'glg-cancellation-'));
  order.receiptFilePath = path.join(fixtureDirectory, 'order-1.pdf');
  await fs.writeFile(order.receiptFilePath, 'synthetic receipt fixture');
  let receiptSends = 0;
  EmailService.sendEmail = async () => { receiptSends += 1; };
  await worker.process({ orderId: order.orderId });
  assert.equal(receiptSends, 0, 'cancelled receipt job must not send a receipt');
  await assert.rejects(fs.access(order.receiptFilePath), { code: 'ENOENT' });
  await worker.process({ orderId: order.orderId });
  assert.equal(receiptSends, 0, 'replayed cancelled job tolerates an already-removed PDF');
  await fs.rm(fixtureDirectory, { recursive: true });
  fixtureDirectory = undefined;

  OrdersDatabase.getOrderById = originalGet;
  EmailService.sendCancellationEmail = originalCancellation;
  EmailService.sendEmail = originalReceipt;
  console.log('PASS: cancellation confirmation without a receipt; cancelled receipt cleanup and replay');
})().catch(async (error) => {
  OrdersDatabase.getOrderById = originalGet;
  EmailService.sendCancellationEmail = originalCancellation;
  EmailService.sendEmail = originalReceipt;
  if (fixtureDirectory) await fs.rm(fixtureDirectory, { recursive: true, force: true });
  throw error;
});
