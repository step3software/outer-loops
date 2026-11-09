# Refactoring decisions and open design questions

**Status (2026-10-17):** The RF01–RF06 scopes and broad sequencing are approved; **RF01 implementation merged via PR #4**. **RF02 implementation has now been explicitly authorized in this chat and is being developed in draft PR #16; merging/deployment remain unauthorized**, but [readiness](rf02-readiness.md) and [prospective P01–P22 tests](rf02-test-matrix.md) are prepared. **Not approved:** changing save formats, adding runtime dependencies, rewriting gameplay/UI or starting RF02–RF06 code merely because this planning document exists. Entries remain provisional choices unless explicitly accepted during the relevant authorized milestone.

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
| D05 | RF03 | **Owner-approved A (2026-11-07):** enforce strict finite numeric deltas/results and explicit boolean flags, preserving valid callers through checked adapters. **No legacy sentinel exceptions.** | Resolved by owner; implementation still needs review |
| D06 | RF03 | **Owner-approved A (2026-11-07):** pure `canStart`; `Escape` becomes sticky only on its first positive mana-spending execution step while `effectiveTime < 60`. Zero-spend/probe/aborted checks never commit. | Resolved by owner; implementation still needs review |
| D07 | RF04 | Select challenge policy via state/context and stable dispatch functions instead of overwriting function declarations. | Yes: API/ADR for rule composition and overrides |
| D08 | RF05 | Split classic scripts without introducing a bundler; preserve exact original ordered `Action` registry construction and worker/editor manifests. | Yes: choose script-loading manifest/source layout and settle whether a generated script manifest is justified |
| D09 | RF06 | Decompose `View` into internal responsibilities while preserving the existing public methods, event IDs, ordering, and `Views` registry. | Yes: agree internal ownership and any new view lifecycle contracts |
| D10 | Program | Keep separate, reviewable milestone PRs with sequential adoption, leaving fallback/rollback paths intact. | Reorder only with explicit rationale and refreshed tests |

## Dependency interpretation

Hard gates are test or API prerequisites, not excuses to stall unconnected preparatory research. RF01 has been merged. RF02 can be separately authorized now; later milestones can start only after their **relevant** prior characterization/contracts are landed and green. RF02 should precede save-affecting RF03 changes. RF03's DOM-free rules and pure predicates precede RF04's stable challenge policy and RF06's view boundary. RF05's action split should follow stabilization of challenge/gameplay surfaces so the same declarations do not move while being refactored.

## Change control

When implementation begins, resolve the milestone's decisions in a reviewed PR or [ADR](../decisions/TEMPLATE.md). Mark accepted/rejected with evidence, and update the related milestone and handoff. No table entry here is permission to start or merge code.

## RF02 owner decisions — 2026-11-07

After review of the RF02 implementation plan, the owner explicitly accepted the three options below and separately requested implementation. This is owner direction reported in the current conversation, not a claim that Orcha's legacy workflow records have received an accepted-plan hash or preparation receipt.

| Decision | Accepted owner selection | Scope boundary |
| --- | --- | --- |
| RF02-D01 | **A: canonical source is main** | Update source configuration/instructions and PR target; do not activate Pages deployment |
| RF02-D02 | **A: one previous pre-import backup per slot plus recovery journal** | Preserve both save slots and prestigeBackup; verify rollback and interrupted boot |
| RF02-D03 | **A: reject incompatible unknown fields without changing existing saves** | Preserve recognized legacy data; reject future unsupported state safely |

The chosen design is documented in [ADR 001](../decisions/ADR-001-recoverable-save-import.md). PR #16 is merged; its bounded correction remains unmerged and milestone completion still requires [A1–A8 evidence](rf02-evidence.md) and owner-controlled merge.
