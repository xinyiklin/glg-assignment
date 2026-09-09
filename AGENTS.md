# GLG Assignment Agent Guide

Canonical provider-neutral guidance for this project. Keep it self-contained
because the repository may be cloned outside its current workspace.

## Authority and ownership

1. System/platform safety, data integrity, secret protection, and explicit
   authorization boundaries.
2. The user's current request within those boundaries.
3. The nearest applicable project or scoped guide and its owning documentation.
4. Current durable facts in `CONTINUITY.md` over older conversational context.
5. Existing architecture and conventions when higher owners are silent.

Do not create intentional contradictions between instruction files or rely on
load order to resolve them. Keep this file a router to narrower owners.

## Project map

- Purpose: GLG Software Support Engineer interview exercises for a local order
  processing system. `TASKS.md` owns the requested exercises; bootstrap does not
  complete or change them.
- Stack: TypeScript, Express/Swagger API, queue workers, React PDF receipts,
  and Nodemailer. Both Dockerfiles pin `node:20.17.0-alpine`; each package has
  its own npm manifest and tracked lockfile. There is no root npm workspace.
- Entry points: `app/src/server.ts` and `pipeline/src/index.ts`.
  API routes live in `app/src/controllers/`; pipeline instances live in
  `pipeline/src/instances/impl/`; services and database adapters are package-local.
- Services: Docker Compose runs DynamoDB Local, ElasticMQ, and MailHog.
  `docker-compose.yml` owns profiles, volumes, and ports: API `9000`, MailHog
  UI `1080`, SMTP `1025`, and ElasticMQ UI `9325`. No production deployment is defined.
- `README.md`: architecture, prerequisites, and local usage.
- `docs/engineering/git-workflow.md`: branch through publication contract.
- Commands: `bin/`, both `package.json` files, and both `tsconfig.json` files.
  No automated test, lint, or CI workflow is configured.
- Nested `AGENTS.md`: none.
- `CONTINUITY.md`: bounded current handoff state.

Start a fresh project-root session to load this guide automatically. Read any
new scoped guide before subtree work; pair it with a `CLAUDE.md` import when
needed. Keep this root below 8 KiB and active guide chains below 28 KiB.

## Hard invariants

- Keep interview runs on local services with synthetic customers and MailHog;
  do not send real email or use live AWS resources without explicit authority.
- `bin/setup.sh` invokes a worker that deletes and recreates the order and
  dead-letter tables. `bin/rebuild.sh` removes images and attempts volume
  deletion. Do not use either as a harmless check; require authorization for
  resetting existing data and verify the exact storage target first.
- Keep order/message definitions compatible across `app/` and `pipeline/`;
  shared concepts are duplicated in their respective `src/definitions/` trees.
- Never put real credentials in the tracked development configuration or
  commit generated receipts from `tmp/`.

## Product-delivery hook

The installed `~/.agents/workflows/product-delivery/` contract is inactive for ordinary work.
Its complete flow activates when the user selects Product Partner or Delivery Lead,
explicitly requests the complete workflow, continues an active Product Brief or
Delivery Plan, or project guidance names required work. Selecting the Verifier
activates independent verification only and never creates missing upstream artifacts.

When active, follow the installed contract without copying its gates or
artifacts here. Project-specific additions only:

- Named work that activates the workflow: none beyond the explicit activation
  conditions above. Project bootstrap is ordinary setup work.
- Additional Change Request triggers: none.
- Required project checks: the commands below, selected for the changed surface.
- Independent reviewer: `mb_verifier` in Codex, `mb-verifier` in Claude.
- Artifact-retention policy: local while active; do not add tracked continuity
  links to ignored `.agent-work/` artifacts.

Report required workflow or review skips with their reason.

## Commands

Run from the repository root unless a command says otherwise.

- Optional host dependencies: `npm ci --prefix app` and `npm ci --prefix pipeline`.
  Docker builds install dependencies using each tracked lockfile.
- Compose validation without starting services: `docker compose --profile dev config --quiet`.
- Build: `docker compose --profile dev build`.
- Initial database setup (destructive on existing tables): `sh bin/setup.sh`.
- Dev/run: `sh bin/run.sh` (foreground); stop without deleting volumes using
  `docker compose --profile dev down`.
- Typecheck after dependency installation: run `./node_modules/.bin/tsc --noEmit`
  from `app/`, then from `pipeline/`. Runtime nodemon uses transpile-only and
  does not prove type safety.
- Tests: no automated test harness. For application changes, exercise the
  relevant `TASKS.md` flow through API, queues, stored order, MailHog email,
  and generated PDF as applicable; report each unrun step.
- Lint/format: no configured scripts. Run `git diff --check` for whitespace.

## Working method and safety

- Read current continuity and applicable guides; inspect the dirty tree and
  preserve unrelated work before editing.
- Identify the requested outcome, acceptance evidence, affected owners,
  callers, state, and consumers. Plan only in proportion to complexity.
- Implement the smallest maintainable change that satisfies the request. Avoid
  speculative features, abstractions, configuration, and drive-by cleanup.
- Ask before changing dependencies, schemas, authentication, deployment,
  destructive storage behavior, paid services, or public network exposure
  when the user's current request or prior authorization does not cover it.
  Continue authorized work; ask only for an unresolved decision or new scope.
- For dependencies, inspect compatibility and version policy, verify the latest
  compatible stable or maintainer-recommended release from official sources,
  preserve the package manager/range policy, and update a tracked lockfile.
- Never expose or commit secrets, private documents, `.env` files, provider
  bodies, broad environments, or generated private artifacts.
- Resolve exact targets before destructive actions and prefer recovery. Remote
  writes, publication, deployment, and host installation require explicit user
  authority.

## Continuity

Keep `CONTINUITY.md` below 160 lines: current state, decisions, next actions,
and open questions. Rotate resolved entries verbatim to append-only
`docs/continuity/YYYY-MM.md`; read archives only on demand.

## Verification and completion

Run the narrowest owner check while iterating, then affected consumer checks in
proportion to risk. Inspect the complete diff and surrounding code for
correctness, regressions, unintended scope, stale paths, and unrelated changes.
Verify UI, generated artifacts, file formats, migrations, and round trips when
they are part of the changed contract. If no harness exists, run the strongest
lightweight check and state the gap. Report passed, failed, unverified, and
skipped evidence honestly; missing evidence is not a pass.

Every implementation, including ordinary work outside the full workflow,
requires implementer verification and one fresh independent review before
local completion. Delegate to the reviewer named above; the installed Verifier
is `mb_verifier` in Codex and `mb-verifier` in Claude. The reviewer must not have
implemented the change. Only the user may waive review for a specific change;
record the waiver and reason, never a pass. If that reviewer is unavailable,
report the gap and request a replacement or waiver. This review alone does not
activate the full workflow or require its upstream artifacts.

## Git and existing work

Read `docs/engineering/git-workflow.md` before any branch, commit, push, PR,
merge, release, deployment, or cleanup action. Preserve unrelated work and do
not stage, publish, rewrite history, or deploy without the user's explicit
authority for that action.
