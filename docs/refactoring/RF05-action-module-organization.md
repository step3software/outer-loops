# RF05 — Organize action modules by shared code and nine zones

- **Status:** Planned — approved scope; implementation not authorized
- **Priority:** After behavior and challenge contracts have stabilized
- **Hard dependencies:** RF01 exact ordered registry/entrypoint baseline; recommend RF02–RF04 completed before moving declarations
- **Enables:** Smaller per-zone AI patches and RF06's stable script organization
- **Primary implementation handoff:** [RF05](handoffs/RF05.md)

## Objective

Decompose the approximately **7,700-line `actionList.js`** into navigable, reviewable units (shared classes, factories and nine zone action declarations) **without changing a single action, its identity, load order, balance formula, callback execution, registration order or availability**. This is a structural refactor, not an action rewrite.

## Existing architecture and constraints

- `actionList.js` defines shared constructors `Action`, `MultipartAction`, `DungeonAction`, `TrialAction` and `AssassinAction`, helpers (`getTravelNum`, `getPossibleTravel`, `getXMLName`, rank/adjustment methods), shared factory definitions (`SurveyAction`, `RuinsAction`, `HaulAction`) and 157 `Action.*` registrations for nine zero-indexed towns.
- Some shared actions (surveys, ruins, hauling, assassins) are registered **before** the main zone sections. `lateGameActions` depends on registration at its construction point. `saving.js` `initializeActions()` walks the properties of `Action`, and `Town` construction uses that ordered list. A simple move "all actions into their corresponding zone file" may change ordering even when the final action set is identical.
- `index.html` uses ordered **classic** scripts; `predictor-worker.js` has a different explicit `importScripts` list, and `editor.html` has a third script dependency list. Imports and global lexical declarations require testing in all three.
- The experimental `data/actionList.xml` is **not** the executable source of truth, and generated docs/`scripts/generate-action-mechanics.mjs` inspect the current runtime.

## Proposed organization (not a committed module design)

```text
actions/
  core.js                  # action classes and common contracts
  factories.js             # Survey/Ruins/Haul/Assassin shared builders
  helpers.js               # travel, rank and adjustment logic
  registration.js           # ordered registry/bootstrap where needed
  zones/
    00-beginnersville.js
    01-forest-path.js
    02-merchanton.js
    03-mt-olympus.js
    04-valhalla.js
    05-startington.js
    06-jungle-path.js
    07-commerceville.js
    08-valley-of-olympus.js
```

This is a **suggested physical layout**, not a requirement to adopt new ES modules. Determine whether compatibility stubs, a tested manifest or explicit script tags are safer. Do not introduce a frontend bundler just to make the directory change.

## In scope

1. Inventory and preserve **exact** ordered `Object.keys(Action)` and `totalActionList` values, every ```name```, ```varName```, `townNum`, `type`, constructor/factory, stats/skills, callbacks and original registration position.
2. Extract shared constructors, factories and helpers into well-defined classic-script files while retaining accessible globals or compatibility aliases as needed.
3. Split only the **source organization** of zone actions into the nine files. Preserve the order of early shared action registrations and each zone's original relative actions; keep helper dependency order explicit.
4. Update `index.html`, `predictor-worker.js` and `editor.html` loading/inclusion separately, with deterministic manifests and completeness tests; adapt existing Node model test harnesses.
5. Update generated action references, code map, agent instructions, workflows and runtime traceability after relocation. Generated action source links need to point to the new locations.
6. Avoid changes to story text, icons, save schema, challenge behavior or DOM rendering.

## Explicit non-goals

Migrate actions into `data/actionList.xml`; change action APIs/identity; add new actions, rework travel, rewrite the predictor, adopt ES modules or TypeScript compiling, redesign the editor, rebalance resources or alter any graphics.

## Acceptance criteria

- **A1:** All **157** current actions exist exactly once, with identical registry key, name, `varName`, town, type, constructor behavior, stat/skill weights, gates, costs, direct/indirect effects and story callbacks. No additions or removals.
- **A2:** The full **ordered** registration list (not just sorted sets) is byte-for-byte/entry-for-entry equivalent to the pre-refactor baseline. `lateGameActions`, shared factory registrations and displayed action ordering match.
- **A3:** Fresh game `index.html`, separate `editor.html` and `predictor-worker.js` load without unresolved globals and produce consistent action identities/outputs. Worker foreground/background parity tests are green.
- **A4:** Representative action execution, routing and completion (normal/limited/multipart, dungeon/trial, both alternate routes, real opening queue) produces unchanged results with equivalent state and timing.
- **A5:** Existing save and challenge fixtures load unchanged. Old queue/loadout entries keep working; ```towns[0..8]``` progress and all `SurveyZ0..8` state persist.
- **A6:** The action catalog and generated mechanics remain current; their source links, scripts and docs are updated to the new file structure. Validator detects missing/duplicate script or action registration.
- **A7:** No new runtime dependencies, no bundler, no changes to Pages behavior; full CI, XML and Chrome smoke pass.
- **A8:** A narrow, reviewable migration log explains every moved symbol and its new owner; no unrelated logic or formatting churn obscures the diff.

## Test plan

Use RF01 F01–F08 and RF05 F14 in [validation matrix](validation-matrix.md). Build and commit a pre-refactor golden **ordered registration fingerprint**, plus key-by-key metadata/behavior snapshots of all 157 executable actions. Test script manifest completeness for game, editor and worker; test multiple queue reorder/travel routes, a freshly initialized browser, predictor foreground/background and legacy save names. Run existing `npm run check`, `npm run test:model`, `npm run test:action`, `npm run check:mechanics`, `python scripts/check-xml.py` and `npm run test:browser`, adapting their source locations without weakening assertions.

## Suggested staged PR strategy

A staged series is safer than one giant move: (1) registry/order and entry-point load tests; (2) pure shared classes/factories/helpers while preserving a compatibility entry; (3) zone file extractions in original registration sequence; (4) update runtime scripts/worker/editor and documentation; (5) remove compatibility shim **only after** all entry points pass. If a partial PR cannot run standalone, keep the dependent changes together.

An ADR is required before selecting a new manifest/public registration contract. Rollback should be a source move revert with **no save migration**. Implementation and merging require separate authorization.
