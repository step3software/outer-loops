# Refactoring decisions and open design questions

**Approved:** RF01–RF06 scope, broad sequencing, and preservation of behavior except explicit safety fixes. **Not approved:** implementation, migration/reformat of existing saves, adding runtime dependencies, rewriting the UI framework, or changing game rules/balance. This file records **provisional implementation choices**, which must be confirmed by source/test evidence when the relevant milestone is authorized.

| Key | Milestone | Provisional choice | Decision needed before change? |
| --- | --- | --- | --- |
| D01 | RF01 | Add synthetic, version-labeled fixture builders and deterministic execution adapters rather than hard-coded real saves. Extend existing Node model and Chrome harness in small increments. | Only if existing browser/worker behavior cannot be characterized |
| D02 | RF01 | Compare predictor to a known replay of action outcomes using a defined field-level parity contract (not broad object JSON equality). | Yes: select acceptable numerical tolerance for fractional mana and nondeterministic actions |
| D03 | RF02 | Retain `ILSV01` and legacy decode, parse/migrate/validate off live state and commit only after successful preparation. | Yes: choose exact backup retention/storage key and recovery UX; ensure no existing backup overwritten |
| D04 | RF02 | Prefer additive version tagging of internal migration logic without changing exported compatibility envelope. | Yes if a new externally observable version/format is contemplated |
| D05 | RF03 | Use typed numeric/boolean resource operations behind compatibility wrappers initially; migrate call sites gradually. | Yes: decide treatment of existing string/undefined sentinel assignments based on full call-site audit |
| D06 | RF03 | Keep `canStart` pure and introduce a deliberate action-start transition for `Escape`. | Yes: verify timing semantics for repeated checks and stalled/aborted actions |
| D07 | RF04 | Select challenge policy via state/context and stable dispatch functions instead of overwriting function declarations. | Yes: API/ADR for rule composition and overrides |
| D08 | RF05 | Split classic scripts without introducing a bundler; preserve exact original ordered `Action` registry construction and worker/editor manifests. | Yes: choose script-loading manifest/source layout and settle whether a generated script manifest is justified |
| D09 | RF06 | Decompose `View` into internal responsibilities while preserving the existing public methods, event IDs, ordering, and `Views` registry. | Yes: agree internal ownership and any new view lifecycle contracts |
| D10 | Program | Keep separate, reviewable milestone PRs with sequential adoption, leaving fallback/rollback paths intact. | Reorder only with explicit rationale and refreshed tests |

## Dependency interpretation

Hard gates are test or API prerequisites, not excuses to stall unconnected preparatory research. RF01 may be implemented in slices; later milestones can start only once the **relevant** RF01 characterization/parity tests are landed and green. RF02 should precede save-affecting RF03 changes. RF03's DOM-free rules and pure predicates precede RF04's stable challenge policy and RF06's view boundary. RF05's action split should follow stabilization of challenge/gameplay surfaces so the same declarations do not move while being refactored.

## Change control

When implementation begins, resolve the milestone's decisions in a reviewed PR or [ADR](../decisions/TEMPLATE.md). Mark accepted/rejected with evidence, and update the related milestone and handoff. No table entry here is permission to start or merge code.
