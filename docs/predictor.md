# Predictor, worker and snapshot model

## Components

- `predictor.js` defines the `Koviko` prediction subsystem, UI integration, simulation of queued actions and worker orchestration.
- `predictor-worker.js` is the background worker; it uses classic `importScripts(...)` for a **subset** of the game and predictor logic, without browser DOM views.
- `data.js` implements registered object graphs and snapshot/delta operations (`Data`, `DataSnapshot`, `DataRecorder`, `DeltaRecorder`).
- `saving.js` registers simulation state via `Data.registerAll(...)`, captures defaults in `loadDefaults()`, and exposes `needsDataSnapshots()` based on `options.predictor` and `options.predictorBackgroundThread`.

The predictor's job is to model likely effects of the planned action queue. It is not a second authoritative gameplay engine; game mechanics remain in `actionList.js`, `actions.js`, `stats.js`, `town.js` and associated functions.

## Worker execution

`predictor-worker.js` explicitly imports:

`data.js`, `localization.js`, `helpers.js`, `save-import.js`, `actionList.js`, `driver.js`, `stats.js`, `actions.js`, `town.js`, `prestige.js`, `saving.js`, `challenges.js`, and `predictor.js`.

It calls `loadDefaults()`, constructs `Koviko.initWorkerPredictor()` and exchanges typed messages with the page. Message categories include `setOptions`, `verifyDefaultIds`, `importSnapshots`, `startUpdate`, `getSnapshots`, `update`, `endUpdate` and `error`. New simulation dependencies must work in **both** these execution environments.

Because `selfIsWorker` / `selfIsGame` are inferred from the environment, a helper that reaches for `window`, `document`, `localStorage`, a view or DOM-derived data can fail only when the predictor is enabled. Keep worker-imported logic DOM-independent or intentionally guarded.

## Snapshots and prediction

`Data.registerAll` identifies mutable roots; `Data.recordDefaults` captures a baseline and `Data.recordBase` / other snapshot operations support later comparisons. Worker updates can import serialized snapshots and apply state before simulation. Some UI, cached labels and ephemeral view properties are intentionally omitted through `Data.omitProperties`.

An algorithm that writes around registered state, mutates unsnapshotted objects, makes irreversible global changes or introduces non-serializable references can cause forecast drift even when the game plays. The predictor is sensitive to stale snapshots, reference identity, queue loop types, rounding and branch-specific cost formulas.

## RF03 explicit gameplay-rule state

`stats.js` `getBuffCap` reads `saving.js`'s authoritative `buffCaps`, never an `HTMLInputElement`. The existing saved `buffCaps` field is also a registered `Data` snapshot root and is projected into browser inputs; the worker can evaluate cap-dependent ritual and imbuement predicates without DOM. Loop resources are validated against `resourcesTemplate` and reset in place to preserve `Data.rootObjects.resources` identity. `Escape.canStart` only reads state; `Actions.tick` commits its sticky flag upon the first positive mana-spending execution step. The predictor's Escape threshold uses strict `< 60` effective seconds. `Koviko.Prediction` for Dark Ritual and Imbue Mind also applies the corresponding cap against current buff level plus predicted queue gains; the predictor cache includes all buff levels and caps in its reset identity, preventing stale forecasts after a cap edit.

The predictor's internal `state.resources` is a separate forecast model; it is not an excuse to introduce arbitrary keys into the gameplay `resources` object. Browser and actual-worker prediction parity must be validated for relevant queues; a DOM-less Node model alone is insufficient.

## RF04 challenge policy forecasts

Original challenge mode selection overwrote Action methods, combat functions and `restart`, while the Worker did not import `challenges.js`. RF04 uses `getChallengePolicy(mode)` from the same browser/Worker classic script. Existing entry point function identities remain stable and policy helpers have no DOM dependencies.

The forecast carries `state.resources.challengeMode` and `state.resources.manaBought` (the current `totalMerchantMana`) in serialized `runData`. The Worker's default unsnapshotted `challengeSave` is not the selected mode. Buy Mana Z1's modeled admission, mana cost, gold conversion and purchase use that mode; combat helpers call the same policies as runtime. The cache identity includes mode, merchant mana and RF03 buff/cap state. Mana Burn's non-positive budget and missing normal-only reset operations are preserved; a forecast spanning that boundary still needs dedicated field-level validation.

Actual Chrome and production `predictor-worker.js` comparisons were added to the smoke suite; they are **not claimed passing** until executed. See [RF04 evidence](refactoring/rf04-evidence.md).

## Change checklist

When editing an action, cost formula, prestige, option, save field or resource:

1. Trace which global roots are read/mutated and whether the worker imports their definitions.
2. Confirm the action does not rely on `view` or DOM side effects during simulation.
3. Confirm all new state is initialized and participates in snapshot imports/reverts as needed.
4. Compare real execution and predictor result for the same short queue and initial save.
5. Run with predictor disabled, predictor on the main thread (where supported by current options), and background-thread mode.
6. Exercise queue edits, pause/restart, limited actions, multipart segment boundaries, prestige modifiers, and finite-number edge cases.

## Limitations

The RF03 Chrome smoke now includes real foreground/`predictor-worker.js` snapshot-protocol comparisons for edited caps and the Escape boundary, but these new cases have not yet been executed in normal CI. Static syntax validation cannot demonstrate that predictions match real game state. Record the exact predicted vs. actual discrepancy, queue and save conditions in the PR when behavior is uncertain.
