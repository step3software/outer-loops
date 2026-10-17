# AI-assisted development lifecycle

The root [AGENTS.md](../../AGENTS.md) is the mandatory entry point. The branch target is `dmchurch`, not `main`. The current repo is a classic-script game: do not assume that a code agent can safely reorganize modules or generate a backend.

## 1. Scope and investigate

State the requested player-observable behavior and acceptance tests. Read the smallest set of relevant source files and system docs first. Map the chain from `Action` definitions through engine/state, UI, XML, persistence and worker simulation. When asked to change a behavior, distinguish existing code, proposed design and unknown assumptions. Identify compatibility and licensing implications when relevant.

For a nontrivial change, write a short implementation plan in the PR or working notes: constraints, impacted files, save/schema risks, and tests. Ask only when a product decision is genuinely blocked; do not invent mechanics.

## 2. Use a branch and small changes

- Start from the current default branch `dmchurch`; inspect open PRs and any in-progress branch before creating a duplicate.
- Name branches `feature/<short-topic>`, `fix/<short-topic>` or `docs/<short-topic>`.
- Change the narrowest functional surface; separate renames/refactors from balancing, save migration or new mechanics.
- Respect nested agent instructions in `views/`, `lang/`, `data/` and `docs/`.
- Never commit secrets, personal browser saves or generated node_modules artifacts. No hidden network/account mutations.

## 3. Preserve invariants

For gameplay, review zone indices, action identity, resource bounds, skill/stat curves, queue semantics, loop reset, save/load, stories and predictor parity. For UI, review localized keys, update hooks and responsiveness. For worker changes, avoid DOM access. Large architectural changes or new zone/additional persistence format require an ADR.

Update the docs in the same branch as the implementation: [architecture](../architecture.md), [gameplay](../gameplay.md), [state](../state-and-saving.md), [predictor](../predictor.md), [validation](validation.md), [code map](../reference/code-map.md), [action catalog](../reference/action-catalog.md).

## 4. Validate honestly

Run `npm run check` and `python scripts/check-xml.py` when the respective runtimes are available. Run the matching [manual smoke tests](validation.md) in a **disposable** browser profile. Distinguish syntax checks from gameplay verification and record any environment limitation. Never claim a test passed because it was not available.

## 5. Review and hand off

Open a PR against `dmchurch` with:

- Context and exact user-visible change.
- Files/system boundaries touched and reason.
- Save compatibility, action identifier and player progress considerations.
- Explicit automated and interactive test evidence, including **not run**.
- Potential regressions and rollback route.
- Documentation/ADR updates.

Review the diff for accidental changes, stale comments, hard-coded text, secrets, misleading claims, and framework/build creep. Avoid merging without explicit authorization.

## Ready-to-use task prompt

> Implement [specific behavior] in `step3software/outer-loops`. First read `AGENTS.md` and the related system guide. Work on a branch from `dmchurch` and preserve source/runtime/save compatibility. Update docs and action catalog where applicable. Run the checked-in static checks, exercise the relevant smoke scenarios if a browser is available, and open a PR with test evidence and outstanding risks. Do not merge.

## Documentation-only workflow

Read [documentation maintenance](../workflow/docs-maintenance.md). Verify claims against source, repair relative links, run checks and open a docs PR without touching gameplay. Documentation does not establish unverified implementation guarantees.
