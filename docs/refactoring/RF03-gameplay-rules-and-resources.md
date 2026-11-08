# RF03 — Pure gameplay rules and typed resources

**Status:** Planned — approved scope; implementation not authorized
- **Priority:** After RF02
- **Hard dependencies:** RF01's action/worker/predicate characterization and RF02's persistence contracts
- **Enables:** RF04 stable challenge rules; RF06 UI-only rendering boundary
- **Primary implementation handoff:** [RF03](handoffs/RF03.md)
- **Preparation candidate (documentation only):** [source-anchored implementation contract](rf03-readiness.md) · [G01–G24 prospective test matrix](rf03-test-matrix.md)

## Objective

Make core gameplay eligibility and calculations evaluable from **explicit game state without DOM access or hidden mutations**, and enforce finite numeric versus boolean resource semantics. This is a narrowly scoped behavior-preserving refactor plus intentional invalid-input safety correction, **not** a rebalance.

### Observed coupling

- `stats.js` `getBuffCap(buff)` currently reads `document.getElementById` and requires an `HTMLInputElement`, while `Action.DarkRitual.canStart` and related imbuement paths use it. `predictor-worker.js` has no DOM; [R04](../audit/findings.md) identifies possible parity failures.
- `Action.Escape.canStart` in `actionList.js` sets `escapeStarted = true` while answering an eligibility query if `effectiveTime < 60`. Calling an eligibility predicate can therefore commit state even when the action never executes ([R08](../audit/findings.md)).
- `driver.js` `addResource` increments finite numbers but assigns all other values directly, including intended booleans **and invalid NaN/Infinity** ([R02](../audit/findings.md)). `resourcesTemplate` in `saving.js` contains numeric and boolean keys.

## In scope

1. **Rule state ownership:** store authoritative buff caps in mutable state (`buffCaps` already exists) and make `getBuffCap` use that state, not an HTML input. Inputs become projections and validated setters. Record save/default/snapshot rules for the authoritative values.
2. **Pure predicates:** audit calls of `visible()`, `unlocked()`, `canStart()` and `getNextValidAction` for side effects. Make observed eligibility checks repeatable without changing game state. For Escape, move setting `escapeStarted` to an explicit actual-execution transition, preserving the original timing threshold, sticky eligibility within the run, and reset behavior.
3. **Resource contracts:** inventory every `resources` key and `addResource` call site (including indirect `finish`/`cost`). Introduce guarded helpers/typedefs for numeric deltas and boolean flag assignment. Per approved RF03-D05 A, enforce strict numeric/boolean typing with **no legacy non-number sentinel exception**; reject NaN, Infinity, strings, undefined and any other invalid numeric value, including non-finite arithmetic results.
4. **Compatibility adapters:** preserve existing call signatures where practical until callers are migrated and tests pass. Ensure `resetResource`/`resetResources`, `Data.registerAll` snapshots, serialized state and worker simulation observe identical values.
5. **Safety failures:** surface invalid operations in controlled, testable ways without silently turning them into zero or corrupting player saves.

## Approved owner planning decisions (2026-11-07)

- **RF03-D05 A:** Strict typed resource enforcement, with no legacy sentinel exception. Preserve finite numeric operations and explicit boolean flags; reject invalid values before state or UI mutation.
- **RF03-D06 A:** Escape activation occurs **only on the first positive mana-spending execution step**, never during a predicate query, zero-mana probe, pause or aborted/failed queue. Evaluate the original `effectiveTime < 60` boundary at that first spending step; once activated, eligibility remains sticky until run restart.

These decisions approve planning choices **only**, not implementation, merge, deployment or an Orcha lifecycle stage. See the [preparation candidate](rf03-readiness.md) for exact prospective source changes and unresolved prerequisites (RF02 merge/verification, canonical-branch metadata and recorded Orcha plan hash).

## Explicitly excluded

Changing existing valid costs/rewards, buff caps, travel unlock thresholds, the 60-second Escape rule, challenge mode rules (RF04), action file layout (RF05), general state-store adoption, full TypeScript conversion or visual redesign (RF06).

## Acceptance criteria

- **A1:** With equivalent state, gameplay calculations produce the same results in the browser and DOM-less worker-like execution. Neither `getBuffCap` nor dependent ritual/imbue calculation accesses an HTML element.
- **A2:** Repeated eligibility queries cause no changes to `resources`, `escapeStarted`, quest/story/level counters or any other game state; the actual start/commit event is explicit and executed once as appropriate.
- **A3:** Escape activates only on its first positive mana-spending execution step under the original effective-time constraint (`effectiveTime < 60`), unless previously activated in the run; queries and zero-mana ticks never commit. `restart` clears the flag. Tests cover below, equal to, and above the threshold, plus sticky continuation.
- **A4:** Numeric resource inputs **and resulting values** are finite and validated; unknown keys, wrong-class assignments, string/undefined/null and non-finite arithmetic are rejected without mutation. Boolean resources (e.g. `supplies`, `pickaxe`, `key`, `stone`) still set/clear correctly, with no legacy sentinel exception. Known valid callers preserve their existing effects, and invalid values cannot poison save state.
- **A5:** Current saves and RF02 legacy fixtures roundtrip without key renames or new required fields; predictor snapshots and run resets reflect new authoritative state consistently.
- **A6:** Buff cap inputs remain editable and reflect saved caps, while rule calculations remain valid before UI initialization and in a worker.
- **A7:** Current action, queue, story and challenge behavior passes the RF01 matrix. Neither player-visible economy nor action metadata changes unexpectedly. Any deviation is explicitly documented and approved as a safety correction.
- **A8:** Ownership of key resource/buff/predicate functions is described in code/documentation, with a regression test for each previously confirmed failure mode.

## Test plan

Use RF01 F01–F07 and specifically F10–F12. Characterize before and after:

- DOM absent/present: ritual cap, Imbue Mind/Body and any `getBuffCap` caller in both foreground and worker. UI edits propagate to state, save and reload.
- Escape predicate queried 1×, 10× and by predictor; no mutation. The first **positive mana-spending** step below 60 sets the flag; at or after 60 it fails unless already activated. Probe-only, zero-spending, paused/failed/aborted queues must never activate; subsequent eligibility remains sticky only after actual positive spending.
- Each resource class: positive and negative finite deltas, boolean true/false, reset; attempted NaN/Infinity/string/undefined write; replay and JSON save serialization.
- Queue progression, dungeon/trial rewards, prestige effects and challenge modes, ensuring no unintended cost/threshold changes.
- Run the existing static, model, generated-doc and Chrome commands, plus new focused tests and foreground/background predictor parity.

## Implementation boundaries and handoff

Use **one focused draft implementation PR** with individually reviewable characterization → buff caps → pure eligibility/positive-spend Escape activation → numeric/boolean resource API commits. Avoid a massive global state rewrite. An accepted ADR is needed if introducing new global rule lifecycle hooks or a different serialized resource representation. Retain compatibility shims until all call sites and worker imports pass.

Rollback requires restoring old access paths without losing RF02 backups; invalid numeric rejection is an intentional protective behavior that must remain tested. RF04 begins only once gameplay rules can be selected from explicit state without DOM or hidden predicate side effects. Implementation requires a separate user instruction; do not merge automatically.
