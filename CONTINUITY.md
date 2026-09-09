# GLG Assignment Continuity

## Current state

- 2026-09-09: Console merged through PR #6 as `51ff89c`; local `main` synced.
  Added `docs/order-support-console.md` and a README link explaining its purpose,
  minimal UX, JavaScript/TypeScript tradeoff, limits, and manual verification.
  User authorized a documentation PR and squash merge; runtime code is unchanged.
- 2026-09-09: User authorized publishing the order support console after a
  final review, through a feature PR and squash merge. Retain the minimal UI,
  documented loaded-set pagination limit, and unchanged backend contracts.
- 2026-09-09: Full console diff review reproduced and fixed a stale-list race:
  a GET started before cancellation could later restore the old table status.
  Shared mutation-state handling now invalidates prior reads and pauses list
  refresh during writes. Added four brief comments for non-obvious request and
  middleware behavior. Focused race regression, all 37 console/pagination
  checks, app typecheck, syntax, and whitespace passed. Fresh independent full
  diff review passed with no remaining findings; changes remain uncommitted.
- 2026-09-09: Added user-requested pagination to the console: Previous/Next and
  10/25/50 rows per page, default 10, over the explicitly labelled loaded set
  of up to 50 orders. API unchanged. Selection persists while paging; size
  changes reset to page 1 and refresh clamps out-of-range pages. Browser checks
  passed for boundaries, sizes, live paging, pending guards, and mobile layout.
  Fresh independent pagination review passed, including keyboard page-size
  selection; all changes remain local and uncommitted.
- 2026-09-09: Implemented a minimal local order console at `/` after Product
  Brief and Delivery Plan approval. Plain HTML/CSS/JS adds create/sample data,
  bounded list, exact lookup, details, manual refresh, and confirmed cancellation.
  Existing API, workers, schemas, receipts, and dependencies remain unchanged.
  App typecheck, existing cancellation/receipt scripts, browser flows, controlled
  async/error checks, and desktop/mobile inspection passed. A fresh synthetic
  order completed with its PDF email and was cancelled with a retained record
  and attachment-free confirmation in MailHog. Fresh independent code, browser,
  and artifact review passed with no material findings.
  Changes are local and uncommitted; no push, merge, or storage reset occurred.
- 2026-09-09: User authorized publishing Task 4 through PR review and squash
  merge when ready. Publication checks passed: both package typechecks,
  cancellation scripts, five receipt cases, Compose validation, and whitespace.
  Production alternatives remain documentation-only; no deployment is defined.
- 2026-09-09: Re-reviewed the complete Task 4 diff and plan at user request.
  No new in-scope defects or runtime fixes were needed. Both package typechecks,
  both cancellation scripts, five receipt cases, Compose validation, and
  whitespace passed fresh. Independent mb_verifier review passed. This pass did
  not rerun live orders or PDF visual checks. No commit or publication occurred.
- 2026-09-09: Task 4 implementation and plan reviewed with the user's direction
  to keep assignment scope minimal. Fixed normal cancelled receipt-job PDF
  cleanup, added cleanup/replay and pre-intake regression coverage, and documented
  queue/SMTP recovery limits and production alternatives in
  `docs/task-4-order-cancellation.md`. Both package typechecks, cancellation
  scripts, five receipt cases, Compose validation, and whitespace passed.
  Fresh local synthetic API/MailHog checks confirmed pre-intake 409, retained
  cancellation, safe repeat, stored-recipient confirmation without attachment,
  and a separate uncancelled order completing with a PDF email. Fresh independent
  mb_verifier review closed both findings with no remaining material defects.
  PDF visual layout and failure injection were not rerun. Concurrent DELETE may
  return 500 for the conditional-write loser; delivery hardening remains deferred.
  Changes remain uncommitted; no publication or storage reset was performed.
- 2026-09-09: Extended Task 3 at user request with Unit price and Total price
  columns per item. Shared calculated row cents drive both row and overall totals;
  table widths are 45/15/20/20 percent with right-aligned prices. Updated the
  existing five regression cases and task document. Regression checks, pipeline
  host/container typechecks, whitespace, and ordinary/long-name PDF text/visual
  checks passed. A fresh local order completed after receipt-worker restart;
  its MailHog PDF showed the new columns and $423.80 item total while the stored
  amount remained $42.50. API, generator, and status behavior remain unchanged.
  Independent code and artifact review passed, including the matching MailHog
  attachment bytes. No material findings; Task 3 is ready for publication through
  the repository Git workflow, as authorized by the user.
- 2026-09-09: Moved Task 3 details to `docs/task-3-receipt-total.md` and the
  ElasticMQ investigation/alternative to `docs/elasticmq-compatibility.md`.
  README retains short links and the setup pin summary. Runtime code and
  configuration are unchanged by this documentation reorganization.
- 2026-09-09: Task 3 total-only repair calculates the PDF display total from
  quantity times unit price using integer cents. API, stored amount, generator,
  columns, and status are unchanged. `docs/task-3-receipt-total.md` documents
  the upstream mismatch and three deferred reconciliation approaches.
  Five regression cases passed and fail against the original template. Pipeline
  host typecheck, both container typechecks, Compose validation, and whitespace
  checks passed. The app host check lacked dependencies; its container check passed.
  Fixed-fixture PDF text/visual review verified $37.75 instead of $42.50.
  After restarting the receipt worker to load the TSX change, a fresh local
  synthetic order completed and its MailHog PDF matched the $1110.28 item total;
  submitted/stored amount stayed $42.50. The initial live attempt used the stale
  worker template. No tables reset or historical attachments regenerated.
  Independent mb_verifier code and evidence review passed with no material
  defects, including PDF text/layout and matching live MailHog attachment bytes.
  Task 4 remains open.
- 2026-09-09: Checked off tasks 1 and 2 after successful order processing and
  computer-use verification of the MailHog email and downloaded one-page PDF.
  The PDF order ID matched the email subject and attachment filename. Its total
  mismatch and generation-time `processing` status remain for receipt repair;
  tasks 3 and 4 are still open. Added a brief README alternative-considered note.
- 2026-09-08: Pinned ElasticMQ to 1.6.16 and documented the reason in README.
  Reproduced 1.7.1 with no queues and port 9325 refusing connections; its Java
  entrypoint placed Compose's config argument after the jar. Verified 1.6.16
  loads the unchanged config and starts all four queues and the legacy dashboard.
- Authorized clean reset removed this project's local containers and volumes;
  pulled service images with `--ignore-buildable`, built both packages, and ran
  `sh bin/setup.sh` and `sh bin/run.sh`. Synthetic POST returned 200, workers
  completed the order, and MailHog received its 2,669-byte PDF attachment.
  Dashboard rendered all four queues in the browser. Both package typechecks
  passed. The first polling probe used uppercase status; corrected assertion
  verified the actual `completed` enum. PDF content/layout repair remains open.
- Fresh independent `mb_verifier` review found no material defects; read-only
  queue, order, MailHog, dashboard, typecheck, and Compose checks passed.
  The development stack is running; PDF repair and cancellation remain separate
  assignment exercises.
- 2026-09-08: Initialized project-owned agent guidance, Claude adapter, Git
  workflow, and PR template through the sibling machine-bootstrap initializer.
  Filled starter placeholders using this repository's existing code and commands.
- Completed `.gitignore` environment coverage and added starter local-agent
  safety rules. Existing README, assignment tasks, source, lockfiles, and Docker
  configuration were preserved.
- Shared bootstrap check passed: eight shared skills and one Product Delivery
  workflow with Claude/Codex adapters are current.
- This task is ordinary setup; the complete Product Delivery workflow is inactive.

## Project boundaries

- `app/` and `pipeline/` are independent npm packages, containerized with the
  existing Node 20.17.0 image. Bootstrap tooling uses host Node 24 or newer;
  that prerequisite does not change the application runtime.
- `TASKS.md` remains the exercise owner. Tasks 1-4 are implemented and verified
  within assignment scope. Upstream amount reconciliation and production
  cancellation-delivery hardening are explicitly deferred.
- Setup deletes existing tables; rebuild attempts volume deletion. Inspect
  current data and obtain reset authority before using those commands.

## Next actions

- Keep documented production alternatives separate from the completed assignment
  implementation; any future implementation requires its own scope.
