# Outer Loops refactoring program — RF01–RF06

**Approval/status (2026-10-17):** [RF01 regression coverage PR #4](https://github.com/step3software/outer-loops/pull/4) and prerequisite documentation PRs #1–#3 are **merged into `dmchurch`**. **RF02 implementation is in progress in unmerged [PR #6](https://github.com/step3software/outer-loops/pull/6)**, stacked on preparation PR #5, with [readiness brief](rf02-readiness.md) and [test matrix](rf02-test-matrix.md). RF03–RF06 remain planned/unimplemented. These documents do not authorize persistence code edits, broader gameplay changes or merging.

**Repository:** `step3software/outer-loops` · production/default branch `dmchurch`. These plans depend on the AI-development foundation in [the technical/gameplay audit](../audit/README.md) and [root agent instructions](../../AGENTS.md). Existing tests and files cited here refer to that baseline; agents must verify the current default branch and source before starting any milestone.

## Portfolio and sequence

| ID | Milestone / charter | Hard prerequisites | Principal acceptance gate | Implementation handoff |
| --- | --- | --- | --- | --- |
| [RF01](RF01-regression-coverage.md) | Expand regression coverage | Foundation docs and existing smoke tests | Deterministic fixture and execution/parity matrix protects current behavior | [RF01 handoff](handoffs/RF01.md) |
| [RF02](RF02-persistence-safety.md) | Persistence safety | RF01 save/import and challenge fixtures | Malformed imports cannot replace or lose the current save; legacy import/export preserved | [RF02 handoff](handoffs/RF02.md) |
| [RF03](RF03-gameplay-rules-and-resources.md) | Pure gameplay rules and resources | RF01 parity cases, RF02 save contracts | DOM-free rule evaluation; pure eligibility; typed numeric/flag resources | [RF03 handoff](handoffs/RF03.md) |
| [RF04](RF04-challenge-rule-isolation.md) | Challenge rule isolation | RF01 challenge baseline, RF02 slots, RF03 rules | Modes 1–3 behave identically without replacing global functions | [RF04 handoff](handoffs/RF04.md) |
| [RF05](RF05-action-module-organization.md) | Action module organization | RF01 registry/sequence baseline; recommend RF03–RF04 stable | All 157 actions, construction order, gameplay and three entry points unchanged | [RF05 handoff](handoffs/RF05.md) |
| [RF06](RF06-view-layer-decomposition.md) | View layer decomposition | RF03 clean rule boundary, RF05 stable script layout | Existing UI behavior, callbacks, queued updates, theme and accessibility characteristics retained | [RF06 handoff](handoffs/RF06.md) |

The **recommended delivery order is RF01 → RF02 → RF03 → RF04 → RF05 → RF06**. Dependencies marked "hard" are evidence or compatibility gates. RF05's architectural move could technically follow RF01 before RF04, but doing so adds conflicts with active gameplay-rule refactors and is not recommended; explain and obtain a decision before reordering. See [decision log](decision-log.md).

## RF01 implementation evidence

[RF01 coverage and verification ledger](rf01-evidence.md) maps A1–A8 and F01–F15 to **merged** tests from [PR #4](https://github.com/step3software/outer-loops/pull/4), including synthetic legacy imports and reproducible Chrome/Worker scenarios. R01/R04/R08/R15 remain known risks (not gameplay fixes). **RF02 source changes and regression tests are now under review in [PR #6](https://github.com/step3software/outer-loops/pull/6)**. Review [implementation evidence and remaining verification gaps](rf02-evidence.md). No RF02 change has been merged.

## Product-direction reconciliation — new Real World system

The later [Real World outer-loop concept](../design/outer-loop/README.md) supersedes **the eventual product presentation** of the inherited standalone Prestige Perks and Challenges menus, but it does **not** change this refactoring program's approval status or retroactively rewrite RF acceptance tests. [Integration guidance](../design/outer-loop/integration-with-refactoring.md) identifies the **RF04 scope tension**: a refactor that preserves old challenge behavior may still be useful for compatibility, but final Real World may adapt or retire those modes. Obtain explicit revised implementation authorization before changing RF04's scope. RF01/RF02 remain critical to preserving veterans' saved data.

## Global invariants

Every milestone implementation must:

1. Preserve `Action.*` identity, action `name` and `varName`, all nine numeric town indices, registration order, and normal gameplay/balance unless the milestone explicitly authorizes a change. The [generated runtime mechanics](../reference/action-mechanics.generated.md) is an index, not a specification for changing costs.
2. Maintain the existing `ILSV01` export envelope and legacy data loads, ordinary/challenge save slots (`idleLoops1`, `idleLoopsChallenge`), queue/loadouts, stories, and prestige/normal-loop lifetimes.
3. Preserve classic script boot order and the independent browser, predictor-worker, and experimental editor entry points. Do not introduce React/Vue, a bundler, a backend or a new runtime package manager as an incidental cleanup.
4. Avoid player-provided save fixtures, external OAuth credentials, production account writes and real cloud tests. Use synthetic test state or isolated browser profiles.
5. Submit a focused PR with before/after behavior evidence, rollback notes, documented skipped tests and references to the implementing milestone and any ADR. **Never auto-merge.**

## Validation policy

See the [cross-milestone validation matrix](validation-matrix.md) for exact scenarios and [existing validation guidance](../development/validation.md) for baseline commands. The merged baseline exposes `npm run check`, `npm run test:model`, `npm run test:action`, **`npm run test:rf01:model`**, **`npm run test:rf01:challenges`**, `npm run check:mechanics`, `python3 scripts/check-xml.py`, and `npm run test:browser`. These existing checks are a starting point; they are **not sufficient** on their own to accept any of these refactors.

- **Behavior-preserving milestone:** compare a known initial state and identical operations *before and after* the change. Assert precise outputs/counters, not merely absence of thrown errors.
- **Intentional safety correction:** first record the failing old behavior, then assert the desired safe behavior while retaining previously valid results.
- **Coverage:** capture **normal / challenge / prestige / predictor / browser** applicability, including "not relevant" or "not run".
- **CI and manual tests:** record actual command output and actual browser/browser-version observations. Do not claim unexecuted tests passed.

## Execution and review workflow

Each approved milestone is a separate prospective implementation effort. When separately authorized:

1. Read its milestone file, [implementation handoff](handoffs/), the root/nested agent rules, and audit references.
2. Refresh current `dmchurch` and active PR status. Start one focused implementation branch and PR for the authorized milestone; break into sequential PRs only if a clear testable seam makes that safer.
3. Capture characterization tests and baseline fixtures before changing behavior. Treat recorded historic behavior as evidence, not necessarily a product requirement if it is confirmed unsafe.
4. Implement only the accepted scope. Open an ADR when changing a long-lived API, data schema, global rule contract or script layout.
5. Run baseline and milestone-specific checks, verify full PR diff, update docs and hand off for review; **do not merge**.

The milestone plans are **not** stand-alone authorization to fix findings unrelated to the approved scope (e.g. cloud OAuth or narrative rewriting). Their test sections specify future work, not tests already run.

## Documents and status

- [RF01: Regression coverage](RF01-regression-coverage.md) · [implementation evidence and coverage](rf01-evidence.md)
- [RF02: Persistence safety](RF02-persistence-safety.md) · [implementation evidence](rf02-evidence.md) · [readiness](rf02-readiness.md) · [test matrix](rf02-test-matrix.md)
- [RF03: Gameplay rules / resources](RF03-gameplay-rules-and-resources.md)
- [RF04: Challenge rule isolation](RF04-challenge-rule-isolation.md)
- [RF05: Action modules](RF05-action-module-organization.md)
- [RF06: View decomposition](RF06-view-layer-decomposition.md)
- [Validation matrix](validation-matrix.md)
- [Decision log and unresolved choices](decision-log.md)
- [Reusable implementation handoffs](handoffs/README.md)

**Status register:** **RF01 Merged** · **RF02 Implemented in PR #6 — unmerged; full CI/browser verification outstanding** · RF03 Planned · RF04 Planned · RF05 Planned · RF06 Planned. RF02 gameplay/source changes remain unstarted and not yet authorized.
