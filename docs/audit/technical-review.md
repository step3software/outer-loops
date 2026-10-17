# Technical architecture review

## Executive assessment

The architecture is workable for incremental game changes with disciplined regression testing. It is **not** a modern module-based application: classic scripts share mutable state, their load order is significant, the predictor replays selected runtime modules inside a worker, and the save shape is hand-written. A broad refactor without a behavior harness would carry substantial regression risk.

Review status: source inspection and worker-like model validation. Browser execution, real-save migration and performance profiling remain separate, unverified tasks. Consult the [coverage ledger](coverage.md).

## Execution path

`index.html` includes vendored jQuery/LZString/D3/Mousetrap, third-party analytics/Google libraries and ordered application scripts. `localization.js` requests English fallback and active game XML; its readiness promise gates `Views.draw`, localization and `startGame()`. `saving.js` calls `load()`; loading initializes `Data` defaults, restores long-term state, creates town and action lists, runs challenge overrides, initializes `View` and starts the engine clock.

Active play follows `driver.js` `tick` → `executeGameTicks` → `actions.tick`. The latter resolves the next valid queue entry, limits ticks against completion/stat level boundaries, executes multipart segments and callbacks, accounts for XP and resources, advances queue position and updates the UI via `view.requestUpdate`. `loopEnd` writes completed totals/stories, `prepareRestart` can pause and `restart` resets per-run resources and stats while preserving intended progress. See [architecture](../architecture.md).

## Core engineering risks and invariants

### 1. Mutable globals and script ordering

Global values such as `resources`, `towns`, `stats`, `skills`, `buffs`, `actions`, `options`, `storyFlags`, `storyVars`, `totals` and `prestigeValues` are read and changed by many files. `actionList.js` action callbacks reach across `driver.js`, `stats.js` and `saving.js`. The game has no dependency injection or module graph. Loading source modules in a different order can fail before UI initialization; the predictor has a *second* carefully ordered `importScripts` list.

**Implication:** prefer targeted edits with explicit affected-global and worker audits. Refactoring to modules or replacing the engine merits an ADR and an integration-test baseline first.

### 2. Timing and queue semantics

`driver.js` distinguishes accumulated wall-clock milliseconds (`gameTicksLeft`) from effective mana ticks (`timer`). `executeGameTicks` applies bonus speed, skill modifiers, fractional mana and a frame deadline. `Actions.current` is the active queue; `Actions.next` is the planned future queue. Queue entries have different `loopsType` semantics (`actions.js`): `actions`, `maxMana`, `maxEffort`, `knownGood` and `unchecked`.

There are multiple restart paths (automatic loop, manual restart, pause before restart, challenge overrides and prestige). Regression tests need to account for last action, empty list, insufficient resources, travel routes, multipart floors and new experience thresholds. A static model inventory alone does not exercise these paths.

### 3. Action model and content separation

The runtime action registry is `Action.*` in `actionList.js`, currently 157 actions. Factories `SurveyAction`, `RuinsAction` and `HaulAction` supply shared implementations. Construction classes include `Action`, `MultipartAction`, `DungeonAction`, `TrialAction` and `AssassinAction`. Their `name`/`varName` and zone indices are persistence contracts. The runtime-generated [mechanics reference](../reference/action-mechanics.generated.md) records all instances, formulas and gates without confusing them with the experimental `editor.html`/`data/actionList.xml` model.

Action callback ordering matters: for ordinary completion `actions.tick` calls `finish()` before optional `cost()`; a future refactor must preserve observable behavior and ensure affordability checks remain consistent. Multipart actions additionally perform segment/floor callbacks during work, not only at the nominal finish.

### 4. Persistence and migrations

`saving.js` hand-selects fields in `doSave()` and restores/migrates in `doLoad()`. The default localStorage save keys are `idleLoops1` and `idleLoopsChallenge`. Export prefix `ILSV01` indicates compressed JSON, with a legacy decode path. `toSave.storyReqs` retains the older serialized name while in-memory narrative state is `storyFlags`. Retaining action names and town keys matters more than preserving UI labels.

The [persistence contract](persistence-contract.md) separates loop-persistent, save-persistent, challenge and prestige state. The [findings register](findings.md) highlights a source-confirmed risky save-import ordering: imported data is stored before it is parsed and validated. Do not merge new save fields without a fixture and rollback test.

### 5. Predictor and Data snapshot graph

`predictor.js` simulates the queue in either foreground or a `predictor-worker.js` thread; `data.js` snapshots the registered object roots from `saving.js`. `Data.registerAll` plus scalar virtualization are important: an unregistered field can be accurate during play but absent from a predictor snapshot. The worker lacks the DOM and external Google libraries. Several game methods are indirectly DOM-dependent (e.g. `getBuffCap` reads a DOM input), so worker parity needs *behavioral* tests rather than mere syntax checks. This is an identified risk, not a verified crash.

### 6. Rendering and localization

`views/main.view.js` defines a large monolithic `View` class with many update methods, while `Views.registerView` fragments render menus/controls. `uicomponents.js` contains low-level custom elements. UI components are plain JS rather than React/Vue. DOM ids, inline HTML handlers, localization keys and theme variables are implicit cross-file APIs. UI tests must cover action menu, advanced queue controls, stories, themes, keyboard and narrow screens.

`lang/en-EN/game.xml` is the canonical shipped language. French XML exists but is not enabled in `Localization.supportedLang`. XML well-formedness alone cannot prove correct lookup paths or rendered action text. The content editor's Relax NG schema is a separate system and must not be mistaken for runtime data definitions.

### 7. External integrations and deployment

`google.js` provides opt-in OAuth/GAPI cloud saves using Drive `appdata` scope. `index.html` also loads analytics. `GoogleCloud.init` waits for remote Google APIs and retries without an upper stop condition; offline and privacy-aware tests should not require cloud authorization. The existing Pages workflow on `dmchurch` deploys the static repository. The new validation workflow checks only repository integrity and model invariants; it does not alter Pages deployment.

## Design debt and modernization order

| Workstream | Evidence | Recommendation |
| --- | --- | --- |
| Save migration harness | Explicit legacy conditionals in `doLoad`, no committed historical fixture suite | Build synthetic historical/current save fixtures before changing persistence |
| Deterministic gameplay tests | Queue engine spans `driver.js` and `actions.js`; isolated model smoke exists | Incrementally add model-to-browser invariant tests for single, limited, multipart, travel and loop reset |
| Predictor parity | Multiple execution environments and `Data` snapshots | Compare predicted vs actual at each action boundary; include stress cases and worker mode |
| Action authoring | 157 JS definitions plus separate partial XML editor | Keep one runtime source of truth; establish a design/ADR before unifying |
| State boundary clarity | Scattered mutable globals and multiple reset modes | Write state-ownership tables and tests before modularizing |
| UI accessibility | Dynamic HTML, themes, keyboard and tooltip logic | Add keyboard and responsive browser smoke before large UI changes |
| Cloud and network | Optional OAuth and analytics, asynchronous load | Isolate cloud tests; bound or handle unavailability in a dedicated change |
| Licensing | No recognized license identified | Resolve permission before commercial/public redistribution beyond applicable GitHub terms |

## Confidence and limitations

The principal file roles, action registry, persistence shape, game-loop logic and documented formulas are directly supported by executable source. Recommendations about refactoring priority reflect risk tradeoffs rather than measured failure rates. This review does not prove every code path safe, complete a playthrough, or establish performance characteristics on mobile devices.
