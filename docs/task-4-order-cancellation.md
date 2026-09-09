# Task 4: order cancellation

The existing `DELETE /api/orders` endpoint now cancels an order instead of
deleting it. Send the order ID in the JSON body:

```sh
curl -X DELETE http://localhost:9000/api/orders \
  -H 'content-type: application/json' \
  -d '{"orderId":"<order-id>"}'
```

The order remains available through `GET /api/orders/<order-id>` with
`status: "cancelled"` and a `cancelledAt` timestamp. Cancellation requires the
intake worker to have generated customer details, because that stored email is
the recipient. An early request returns `409 CUSTOMER_DETAILS_UNAVAILABLE` and
can be retried after intake completes. Missing or non-string IDs return 400;
unknown IDs return 404. Repeating cancellation is safe and retains the order.
Two simultaneous cancellation requests can yield one success and one 500 when
the conditional update rejects the second request; GET confirms the retained
cancelled state, and a later DELETE returns `ORDER_ALREADY_CANCELLED`.

The email worker uses the existing local email queue and sends a confirmation
without a PDF attachment. A receipt that was already admitted for sending may
still arrive; a cancelled order is never changed back to `completed` by normal
processing. A receipt job that observes cancellation removes its generated PDF
without sending it.

## Delivery limitations and local inspection

The database update and queue send are separate operations. If enqueueing fails,
DELETE returns 500 but the order remains cancelled. Repeating DELETE does not
enqueue a replacement confirmation. Check the order with GET and search MailHog
for its order ID before treating the email as delivered.

Inspect the local workers with `docker compose logs --tail=100 order-emailer`
and the queues at <http://localhost:9325>. SMTP failures leave the message on the
queue for the existing worker to retry. If no cancellation message was queued,
manual re-enqueueing of `{ orderId, kind: "cancellation" }` is required after the
queue is healthy; there is no API retry endpoint. Inspect MailHog first, because
a send can succeed before acknowledgement fails. Duplicate queue deliveries can
send duplicate confirmations. This exercise does not guarantee exactly-once
delivery.

## Possible production follow-up

For a production API, `POST /api/orders/123/cancel` could express this operation
more clearly: cancellation is a business action that changes order state and
sends a notification, while the order remains available for lookup and audit.
Task 4 explicitly asks for DELETE, so this exercise keeps the existing endpoint.

This is an API design recommendation, not a rule that DELETE must physically
erase stored data. HTTP defines DELETE around removing the target resource's
association with its functionality; it also gives DELETE request bodies no
generally defined semantics. An explicit POST action avoids relying on a DELETE
body to identify the order. See [RFC 9110, DELETE semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.5).
POST does not itself make retries safe: the production action would still need
repeat-request handling to avoid duplicate notifications. This route is a future
alternative and is not implemented here.

A transactional outbox could make cancellation and its notification request
durable together. Notification status and idempotency keys could support safe
retries and clearer API responses. A dedicated cancellation queue could isolate
failures; retry dashboards and SMTP reconciliation could help operators resolve
uncertain sends. Concurrent-request response handling could also return the
retained cancellation directly. These are documented alternatives, outside the
Task 4 implementation.

Verify the email in MailHog at <http://localhost:1080> and use a synthetic order
only. Do not reset the local tables or send real email.
