# Predictor, worker and snapshot model

## Components

- `predictor.js` defines the `Koviko` prediction subsystem, UI integration, simulation of queued actions and worker orchestration.
- `predictor-worker.js` is the background worker; it uses classic `importScripts(...)` for a **subset** of the game and predictor logic, without browser DOM views.
- `data.js` implements registered object graphs and snapshot/delta operations (`Data`, `DataSnapshot`, `DataRecorder`, `DeltaRecorder`).
- `saving.js` registers simulation state via `Data.registerAll(...)`, captures defaults in `loadDefaults()`, and exposes `needsDataSnapshots()` based on `options.predictor` and `options.predictorBackgroundThread`.

The predictor's job is to model likely effects of the planned action queue. It is not a second authoritative gameplay engine; game mechanics remain in `actionList.js`, `actions.js`, `stats.js`, `town.js` and associated functions.

## Worker execution

`predictor-worker.js` explicitly imports:

`data.js`, `localization.js`, `helpers.js`, `actionList.js`, `driver.js`, `stats.js`, `actions.js`, `town.js`, `prestige.js`, `saving.js`, and `predictor.js`.

It calls `loadDefaults()`, constructs `Koviko.initWorkerPredictor()` and exchanges typed messages with the page. Message categories include `setOptions`, `verifyDefaultIds`, `importSnapshots`, `startUpdate`, `getSnapshots`, `update`, `endUpdate` and `error`. New simulation dependencies must work in **both** these execution environments.

Because `selfIsWorker` / `selfIsGame` are inferred from the environment, a helper that reaches for `window`, `document`, `localStorage`, a view or DOM-derived data can fail only when the predictor is enabled. Keep worker-imported logic DOM-independent or intentionally guarded.

## Snapshots and prediction

`Data.registerAll` identifies mutable roots; `Data.recordDefaults` captures a baseline and `Data.recordBase` / other snapshot operations support later comparisons. Worker updates can import serialized snapshots and apply state before simulation. Some UI, cached labels and ephemeral view properties are intentionally omitted through `Data.omitProperties`.

An algorithm that writes around registered state, mutates unsnapshotted objects, makes irreversible global changes or introduces non-serializable references can cause forecast drift even when the game plays. The predictor is sensitive to stale snapshots, reference identity, queue loop types, rounding and branch-specific cost formulas.

## Change checklist

When editing an action, cost formula, prestige, option, save field or resource:

1. Trace which global roots are read/mutated and whether the worker imports their definitions.
2. Confirm the action does not rely on `view` or DOM side effects during simulation.
3. Confirm all new state is initialized and participates in snapshot imports/reverts as needed.
4. Compare real execution and predictor result for the same short queue and initial save.
5. Run with predictor disabled, predictor on the main thread (where supported by current options), and background-thread mode.
6. Exercise queue edits, pause/restart, limited actions, multipart segment boundaries, prestige modifiers, and finite-number edge cases.

## Limitations

No automated parity harness was present at the documentation baseline. Static syntax validation cannot demonstrate that predictions match real game state. Record the exact predicted vs. actual discrepancy, queue and save conditions in the PR when behavior is uncertain.
