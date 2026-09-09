'use strict';

const $ = (id) => document.getElementById(id);
let orders = [];
let pageIndex = 0;
let pageSize = 10;
let selected = null;
let mutationPending = false;
let detailPending = false;
// Only the latest read may update its part of the page.
let listRequest = 0;
let detailRequest = 0;

function message(id, text, error = false) {
  $(id).textContent = text;
  $(id).classList.toggle('error', error);
}

function textNode(tag, value) {
  const node = document.createElement(tag);
  node.textContent = value == null || value === '' ? 'Not available' : String(value);
  return node;
}

function date(value) {
  if (value == null) return 'Not available';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toLocaleString();
}

function amount(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : 'Not available';
}

function cancellationReason() {
  if (mutationPending) return 'Wait for the current action to finish.';
  if (detailPending) return 'Wait for the order lookup or refresh to finish.';
  if (!selected) return 'Select an order first.';
  if (selected.status === 'cancelled') return 'This order is already cancelled.';
  if (!selected.details?.customer?.email) return 'Customer email is not available yet. Refresh the order after intake processing.';
  if (!['processing', 'completed', 'error'].includes(selected.status)) return 'This order status cannot be cancelled.';
  return '';
}

function syncControls() {
  $('create-fields').disabled = mutationPending;
  $('lookup-fields').disabled = mutationPending;
  $('refresh-order').disabled = mutationPending || detailPending || !selected;
  document.querySelectorAll('#orders button').forEach((button) => { button.disabled = mutationPending; });
  $('page-size').disabled = mutationPending;
  $('previous-page').disabled = mutationPending || pageIndex === 0;
  $('next-page').disabled = mutationPending || (pageIndex + 1) * pageSize >= orders.length;
  const reason = cancellationReason();
  $('cancel-order').disabled = Boolean(reason);
  $('cancel-reason').textContent = reason || 'You will be asked to confirm cancellation.';
}

function setMutationPending(pending) {
  mutationPending = pending;
  if (pending) {
    // Reads started before this action must not restore an older order status.
    ++listRequest;
    ++detailRequest;
    detailPending = false;
    message('list-message', 'Refresh the list after this action to get current orders.');
  }
  $('refresh-list').disabled = pending;
  syncControls();
}

async function request(path, options) {
  const response = await fetch(path, options);
  let body;
  try { body = await response.json(); } catch { throw new Error('The service returned an unreadable response.'); }
  if (!response.ok || body.success !== true) {
    const descriptions = {
      ORDER_ALREADY_EXISTS: 'That reference already belongs to an order. Find it by reference.',
      ORDER_NOT_FOUND: 'No order was found for that identifier.',
      CUSTOMER_DETAILS_UNAVAILABLE: 'Customer details are not available yet. Refresh the order before trying again.',
      ORDER_NOT_CANCELLABLE: 'The order cannot be cancelled in its current state. Refresh the order.',
    };
    const error = new Error(descriptions[body.message] || `The service could not complete the request (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function returnedOrder(body) {
  if (!body.order || typeof body.order.orderId !== 'string') throw new Error('The service did not return an order.');
  return body.order;
}

function failure(error, mutation = false) {
  const detail = error instanceof TypeError ? 'Could not reach the order service.' : error.message;
  // The API can persist an order before its queue send or response fails.
  const uncertain = mutation && (!error.status || error.status >= 500);
  return `${detail} ${uncertain ? 'The action may have succeeded. Keep these details and look up or refresh the order before retrying.' : 'Check the local services if needed.'}`;
}

function renderList() {
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  pageIndex = Math.min(pageIndex, pageCount - 1);
  const start = pageIndex * pageSize;
  const visibleOrders = orders.slice(start, start + pageSize);
  $('page-summary').textContent = orders.length
    ? `${start + 1}–${start + visibleOrders.length} of ${orders.length} loaded · Page ${pageIndex + 1} of ${pageCount}`
    : '0 orders loaded';
  const focusedOrder = document.activeElement?.dataset.orderId;
  $('orders').replaceChildren();
  for (const order of visibleOrders) {
    const row = document.createElement('tr');
    row.classList.toggle('selected', selected?.orderId === order.orderId);
    for (const value of [order.orderId, order.referenceId, order.status, amount(order.amount), date(order.createdAt)]) {
      row.append(textNode('td', value));
    }
    const cell = document.createElement('td');
    const button = textNode('button', 'View');
    button.type = 'button';
    button.dataset.orderId = order.orderId;
    button.setAttribute('aria-label', `View order ${order.orderId}`);
    button.addEventListener('click', () => loadOrder('id', order.orderId, true));
    cell.append(button);
    row.append(cell);
    $('orders').append(row);
    if (focusedOrder === order.orderId) button.focus({ preventScroll: true });
  }
  syncControls();
}

function renderSelected(order) {
  selected = order;
  $('selected-order').hidden = false;
  const facts = [
    ['Order ID', order.orderId], ['Reference ID', order.referenceId], ['Status', order.status],
    ['User ID', order.userId], ['Submitted amount', amount(order.amount)],
    ['Created', date(order.createdAt)], ['Updated', date(order.updatedAt)],
    ['Completed', date(order.completedAt)], ['Cancelled', date(order.cancelledAt)],
  ];
  $('order-facts').replaceChildren(...facts.map(([label, value]) => {
    const group = document.createElement('div');
    group.append(textNode('dt', label), textNode('dd', value));
    return group;
  }));
  const customer = order.details?.customer;
  const address = customer?.address;
  $('customer').textContent = customer
    ? [customer.name, customer.email, address?.street,
      [address?.city, address?.state, address?.zip].filter(Boolean).join(', '), address?.country]
      .filter(Boolean).join('\n') || 'Customer details are not available.'
    : 'Customer details are not available yet. Refresh after intake processing.';
  const items = order.details?.items;
  $('items').replaceChildren();
  if (Array.isArray(items) && items.length) {
    const table = document.createElement('table');
    const head = document.createElement('thead');
    const headings = document.createElement('tr');
    for (const label of ['Item', 'Quantity', 'Unit price']) {
      const th = textNode('th', label);
      th.scope = 'col';
      headings.append(th);
    }
    head.append(headings);
    table.append(head);
    const body = document.createElement('tbody');
    for (const item of items) {
      const row = document.createElement('tr');
      row.append(textNode('td', item.name), textNode('td', item.quantity), textNode('td', amount(item.price)));
      body.append(row);
    }
    table.append(body);
    $('items').append(table);
  } else {
    $('items').append(textNode('p', Array.isArray(items) ? 'This order has no items.' : 'Items are not available yet. Refresh after intake processing.'));
  }
  $('raw-order').textContent = JSON.stringify(order, null, 2);
  orders = orders.map((entry) => entry.orderId === order.orderId ? order : entry);
  renderList();
}

async function refreshList() {
  if (mutationPending) return;
  const token = ++listRequest;
  $('refresh-list').disabled = true;
  message('list-message', 'Loading orders… Existing results remain visible.');
  try {
    const body = await request('/api/orders?count=50');
    if (token !== listRequest) return;
    if (!Array.isArray(body.data)) throw new Error('The service did not return an order list.');
    orders = body.data;
    renderList();
    message('list-message', orders.length ? `${orders.length} orders returned.` : 'No orders were returned. Create a sample order to get started.');
  } catch (error) {
    if (token === listRequest) message('list-message', failure(error), true);
  } finally {
    if (token === listRequest) $('refresh-list').disabled = false;
  }
}

async function loadOrder(kind, value, focusDetails = false) {
  if (mutationPending) return;
  const token = ++detailRequest;
  detailPending = true;
  syncControls();
  message('detail-message', `Loading order…${selected ? ' The previous details remain visible.' : ''}`);
  try {
    const path = kind === 'reference' ? '/api/orders/reference/' : '/api/orders/';
    const body = await request(path + encodeURIComponent(value));
    if (token !== detailRequest) return;
    renderSelected(returnedOrder(body));
    message('detail-message', 'Order loaded. Use manual refresh to check for changes.');
    if (focusDetails) $('details-heading').focus();
  } catch (error) {
    if (token === detailRequest) message('detail-message', failure(error), true);
  } finally {
    if (token === detailRequest) { detailPending = false; syncControls(); }
  }
}

$('sample').addEventListener('click', () => {
  $('user-id').value = 'demo-user';
  $('reference-id').value = `demo-${crypto.randomUUID()}`;
  $('amount').value = '42.50';
  message('create-message', 'Sample data filled. Create the order when ready.');
});

$('create-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (mutationPending) return;
  const userId = $('user-id').value.trim();
  const referenceId = $('reference-id').value.trim();
  const enteredAmount = $('amount').value;
  const value = Number(enteredAmount);
  if (!userId || !referenceId || !enteredAmount.trim() || !Number.isFinite(value) || value < 0) {
    message('create-message', 'Enter a user ID, reference ID, and finite amount of zero or more.', true);
    return;
  }
  setMutationPending(true);
  message('create-message', 'Submitting order…');
  try {
    const body = await request('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, referenceId, amount: value }) });
    renderSelected(returnedOrder(body));
    message('create-message', 'Order submitted. Processing continues asynchronously; refresh the selected order to check progress.');
    message('detail-message', 'Showing the newly submitted order.');
    $('details-heading').focus();
  } catch (error) {
    message('create-message', failure(error, true), true);
    message('detail-message', selected ? 'Previous order details retained.' : 'Find the submitted reference to check whether an order was created.');
  } finally { setMutationPending(false); }
});

$('lookup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = $('lookup-value').value.trim();
  if (!value) { message('detail-message', 'Enter an exact identifier.', true); return; }
  loadOrder($('lookup-type').value, value);
});
$('refresh-list').addEventListener('click', refreshList);
function changePage(index) {
  if (mutationPending) return;
  pageIndex = Math.max(0, index);
  renderList();
  document.querySelector('.table-scroll').scrollTop = 0;
}
$('previous-page').addEventListener('click', () => changePage(pageIndex - 1));
$('next-page').addEventListener('click', () => changePage(pageIndex + 1));
$('page-size').addEventListener('change', () => {
  if (mutationPending) return;
  pageSize = Number($('page-size').value);
  changePage(0);
});
$('refresh-order').addEventListener('click', () => { if (selected) loadOrder('id', selected.orderId); });
$('cancel-order').addEventListener('click', async () => {
  if (cancellationReason()) return;
  const orderId = selected.orderId;
  if (!window.confirm(`Cancel order ${orderId}? The order record will be retained.`)) return;
  setMutationPending(true);
  message('detail-message', 'Cancelling order…');
  try {
    const body = await request('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
    renderSelected(returnedOrder(body));
    message('detail-message', 'Order cancelled and retained. Check MailHog to verify the confirmation email.');
  } catch (error) {
    message('detail-message', failure(error, true), true);
  } finally { setMutationPending(false); }
});

refreshList();
