# Task 3: Receipt total

This note covers the PDF receipt fix in [TASKS.md](../TASKS.md).

The PDF previously displayed the submitted `order.amount`, but intake generates
random items independently of that amount. The displayed total could therefore
disagree with the receipt's quantities and unit prices.

The receipt now calculates its display total as the sum of each item's quantity
times its unit price. Generated prices have two decimal places; the calculation
converts each price to integer cents before multiplying and summing, then formats
the result with two decimal places. For example, `2 × $12.50 + 3 × $4.25` displays
`$37.75`, even when the submitted amount is `$42.50`.

The item table labels each unit cost as **Unit price** and shows a **Total price**
for each row (quantity times unit price). Row totals and the overall total use
the same calculated cent values. The four columns are Item, Quantity, Unit price,
and Total price, with both price columns aligned to the right.

This is a display-only fix. API routes, request/response fields, stored amounts,
random item generation, and the processing status are unchanged.
The stored/API amount can still differ from the PDF total. Previously emailed
attachments are not regenerated.

## Verification

Run the focused regression check from the repository root after installing the
pipeline dependencies:

```sh
cd pipeline
node -r ts-node/register/transpile-only test/receipt-total.cjs
```

For a running Docker stack, restart the receipt worker from the repository root
after changing the TSX template: `docker compose --profile dev restart order-processor`.
Submit a fresh synthetic order and inspect its MailHog attachment; existing
attachments will still contain their original totals.

## Potential follow-up after the required tasks

Upstream reconciliation is intentionally deferred. First decide which value is
authoritative; the current synthetic data cannot establish that business rule.

- **Items determine the amount:** calculate the total during intake and save
  details and amount in the same database update. This would replace the submitted
  amount, so document the change between the initial POST response and later
  reads, and decide how to handle existing orders before adopting it.
- **The submitted amount is authoritative:** constrain the random generator to a
  budget in cents. Generate items within that budget and use a final quantity-one
  item for the remainder. Define rules for small/zero amounts, valid quantities,
  minimum prices, and division remainders. This changes fixture generation and
  makes it less representative of independently priced products.
- **Accept real item details through the API:** as a separate API task, validate
  quantities/prices and calculate the amount server-side, or reject a supplied
  amount that disagrees. Define currency, rounding, compatibility, and existing
  data handling first; keep the duplicated app/pipeline definitions aligned.

For any chosen approach, add deterministic consistency checks across API, stored
order, and receipt, then exercise the local queue-to-MailHog flow. Receipt status
wording and retry reliability are separate follow-ups; they are not part of this
receipt pricing change.
