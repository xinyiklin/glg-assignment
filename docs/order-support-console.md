# Order support console

The console is a small local support tool added alongside the assignment tasks.
It makes repeated order creation, inspection, and cancellation easier to demo
and investigate without assembling curl requests or filling Swagger forms each
time. Swagger remains available for the API contract and exploratory requests.

## Scope and UX choices

Open <http://localhost:9000> with the local stack running. One page provides
synthetic sample input, order creation, a bounded order list, exact ID/reference
lookup, customer/item details, the raw response, and confirmed cancellation.
Links to Swagger, MailHog, and the queue dashboard support deeper investigation.

- **Manual refresh:** processing is asynchronous. Explicit refresh keeps the
  implementation small and makes it clear when the displayed state was fetched.
- **Small pages:** 10/25/50 rows per page make the loaded list easier to scan.
  Pagination covers up to 50 returned orders in no guaranteed order; it does
  not fetch further server pages. Exact lookup can find an order outside that set.
- **Clear action state:** pending actions disable conflicting controls, and
  cancellation asks for confirmation. Older reads cannot overwrite a newer
  create/cancel result. Uncertain write errors advise checking the order before
  retrying because persistence may have succeeded.
- **Native controls:** labelled forms, tables, status messages, visible focus,
  and responsive CSS keep common actions accessible without a component library.

The console uses the existing API. It does not change order definitions,
processing, receipt calculation, or cancellation delivery. The submitted amount
can differ from the receipt total; a cancelled status does not prove email
delivery. See [Task 3](task-3-receipt-total.md) and
[Task 4](task-4-order-cancellation.md) for those boundaries.

## Why plain JavaScript instead of TypeScript or React?

[index.html](../app/public/index.html), [styles.css](../app/public/styles.css),
and [app.js](../app/public/app.js) are served by the existing Express application.
The browser executes `app.js` directly. This needs no new dependencies, frontend
build step, or separate service, matching the small local-tool scope.

TypeScript is already used by the backend, but its current configuration checks
`app/src`, not `app/public/app.js`. Authoring the frontend in TypeScript would
require a compilation step and development/startup wiring to serve the emitted
JavaScript. That is feasible with the existing compiler; it does not require
React or a bundler. JavaScript was a simplicity tradeoff, not a technical
restriction or a claim that TypeScript would be overengineering.

The cost is losing compile-time checks for frontend order shapes, status values,
and DOM access. Browser checks verify behavior but do not replace those checks;
TypeScript types would also not validate incoming API JSON at runtime.

React is a separate choice from the language. Direct DOM updates are manageable
for this single page. Repeated components or more complex shared UI state could
justify React later; more API interactions or frequent model changes could
justify TypeScript even without React. Neither migration is required now.

## Verification

The implementation was checked in the browser for create, lookup, refresh,
cancellation, pagination, pending/error states, stale reads, and desktop/mobile
layout. A synthetic local order was followed through processing, its MailHog
PDF receipt, and a retained cancellation with a confirmation email. These are
implementation-time checks, not a committed frontend test suite.

For a manual smoke check, fill sample data, create an order, refresh its details,
look it up by ID/reference, and exercise page sizes with enough loaded records.
Once customer details are available, cancel it and verify the retained record
and confirmation in MailHog. Use synthetic data and local services only.
