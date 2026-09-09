# GLG Assignment Continuity

## Current state

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
- `TASKS.md` remains the exercise owner. Application setup, order processing,
  PDF repair, and cancellation work have not been performed by bootstrap.
- Setup deletes existing tables; rebuild attempts volume deletion. Inspect
  current data and obtain reset authority before using those commands.

## Next actions

- Start a fresh project-root agent session to load the new guidance automatically.
- For assignment work, inspect current Docker availability and local state,
  then follow the requested exercise scope and record runtime evidence.
