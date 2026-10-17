# Refactoring decisions and open design questions

**Status (2026-10-17):** The RF01–RF06 scopes and broad sequencing are approved; **RF01 implementation merged via PR #4**. **RF02 implementation has subsequently been authorized and opened in [PR #6](https://github.com/step3software/outer-loops/pull/6)**, not yet merged or fully verified; see [implementation evidence](rf02-evidence.md) and [prospective matrix](rf02-test-matrix.md). **Not approved:** changing save formats, adding runtime dependencies, rewriting gameplay/UI or starting RF02–RF06 code merely because this planning document exists. Entries remain provisional choices unless explicitly accepted during the relevant authorized milestone.

| Key | Milestone | Provisional choice | Decision needed before change? |
| --- | --- | --- | --- |
| D01 | RF01 | Add synthetic, version-labeled fixture builders and deterministic execution adapters rather than hard-coded real saves. Extend existing Node model and Chrome harness in small increments. | Only if existing browser/worker behavior cannot be characterized |
| D02 | RF01 | Compare predictor to a known replay of action outcomes using a defined field-level parity contract (not broad object JSON equality). | Yes: select acceptable numerical tolerance for fractional mana and nondeterministic actions |
| D03 | RF02 | Retain `ILSV01` and legacy decode, parse/migrate/validate off live state and commit only after successful preparation. | Yes: choose exact backup retention/storage key and recovery UX; ensure no existing backup overwritten |
| D04 | RF02 | Prefer additive version tagging of internal migration logic without changing exported compatibility envelope. | Yes if a new externally observable version/format is contemplated |
| D11 | RF02 | Use import-specific, per-slot recoverable prior copies, **not** existing `prestigeBackup`; abort if safe backup/commit cannot be guaranteed. | Yes: approve key names, bounded retention/rotation, quota and rollback behavior before writing persistent storage; [readiness](rf02-readiness.md) |
| D12 | RF02 | Validate and normalize legacy challenge data **without** executing current `doLoad` save/reload side effects during preflight. | Yes: choose staged apply/recovery mechanics and exercise P16/P17/P22 |
| D13 | RF02 | Separate a deliberate confirmed blank-import deletion from malformed encoded input, with no mutation on cancellation. | Yes: approve preserved or improved confirmation/recovery UX; P19 |
| D14 | RF02 | Size and unknown/future-field policies based on measured fixtures rather than arbitrary strict rejection. | Yes: approve limits and compatibility behavior; P13/P18 |
| D05 | RF03 | Use typed numeric/boolean resource operations behind compatibility wrappers initially; migrate call sites gradually. | Yes: decide treatment of existing string/undefined sentinel assignments based on full call-site audit |
| D06 | RF03 | Keep `canStart` pure and introduce a deliberate action-start transition for `Escape`. | Yes: verify timing semantics for repeated checks and stalled/aborted actions |
| D07 | RF04 | Select challenge policy via state/context and stable dispatch functions instead of overwriting function declarations. | Yes: API/ADR for rule composition and overrides |
| D08 | RF05 | Split classic scripts without introducing a bundler; preserve exact original ordered `Action` registry construction and worker/editor manifests. | Yes: choose script-loading manifest/source layout and settle whether a generated script manifest is justified |
| D09 | RF06 | Decompose `View` into internal responsibilities while preserving the existing public methods, event IDs, ordering, and `Views` registry. | Yes: agree internal ownership and any new view lifecycle contracts |
| D10 | Program | Keep separate, reviewable milestone PRs with sequential adoption, leaving fallback/rollback paths intact. | Reorder only with explicit rationale and refreshed tests |

## Dependency interpretation

Hard gates are test or API prerequisites, not excuses to stall unconnected preparatory research. RF01 has been merged. RF02 can be separately authorized now; later milestones can start only after their **relevant** prior characterization/contracts are landed and green. RF02 should precede save-affecting RF03 changes. RF03's DOM-free rules and pure predicates precede RF04's stable challenge policy and RF06's view boundary. RF05's action split should follow stabilization of challenge/gameplay surfaces so the same declarations do not move while being refactored.

## Change control

When implementation begins, resolve the milestone's decisions in a reviewed PR or [ADR](../decisions/TEMPLATE.md). Mark accepted/rejected with evidence, and update the related milestone and handoff. No table entry here is permission to start or merge code.
