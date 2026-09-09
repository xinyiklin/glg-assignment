# GLG Assignment Continuity

## Current state

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
- `TASKS.md` remains the exercise owner. Setup and synthetic order processing
  have now been exercised; PDF repair and cancellation work remain untouched.
- Setup deletes existing tables; rebuild attempts volume deletion. Inspect
  current data and obtain reset authority before using those commands.

## Next actions

- Continue remaining assignment exercises only when requested.
