# Architecture and execution model

## What this application is

Outer Loops is a **client-only, classic-script browser game**. `index.html` references local JavaScript, HTML, XML, CSS, image assets and a few external browser APIs. There is no production Node backend, build output directory, ES-module dependency graph, or runtime package installer. `package.json` contains developer type packages; `jsconfig.json` and JSDoc annotate a dynamically shared global codebase.

Local HTTP serving is required because localization is loaded through AJAX and the optional predictor uses a Web Worker. Launch instructions: [setup](development/setup.md).

## Startup and script dependency order

The ordered script list near the end of `index.html` is critical. After vendored jQuery, LZString, D3, Mousetrap, polyfills, and external analytics/Google scripts, the first-party sequence is:

1. `data.js` — snapshot / data-object infrastructure
2. `localization.js`, `helpers.js`, `uicomponents.js`, `google.js`
3. `actionList.js`, `actionLog.js`, `interval.js`
4. `driver.js`, `stats.js`, `statsgraph.js`, `actions.js`, `views/main.view.js`
5. `town.js`, `talents.js`, `prestige.js`, `saving.js`
6. `challenges.js`, `hotkeys.js`, `predictor.js`
7. `views/views.js` and registered view scripts in `views/`

An inline script then invokes `loadDefaults()` and waits for `Localization.ready`; after that it calls `Views.draw()`, localizes the page, and starts the game via `startGame()`. `startGame()` invokes `load()`, which sets up the ticking machinery.

All of these files execute in the same page-global lexical environment, not as imported modules. A later file may refer to a class or variable created by an earlier file. Moving scripts to `type="module"`, adding `defer` indiscriminately, or rearranging loading order is a behavioral change. `editor.html` has a **different** script subset and bootstrap: `startEditor()`.

## Runtime loop

`driver.js` owns the real-time clock. The key path is:

`animationTick()` / `tick()` → `executeGameTicks()` → `actions.tick(availableMana)` (in `actions.js`) → action callbacks → `view.requestUpdate(...)` / `view.update()`.

- `baseManaPerSecond` is 50. `gameTicksLeft` holds accumulated **milliseconds**, despite its name; `executeGameTicks()` converts time to mana/ticks while respecting `gameSpeed`, bonus speed, skill effects, effective time and the frame deadline.
- `recalcInterval()` uses `requestAnimationFrame` where supported, with an interval fallback and a periodic tick. Autosaving also occurs in `tick()` while paused.
- `Actions.current` is the execution copy of the queue, `Actions.next` is the proposed next-loop queue, and `currentPos` identifies progress within the executing list.
- `actions.tick()` enforces mana cost, stat experience, multipart segment progression, resources and action completion. Do not duplicate its rules in the UI.
- A loop ends when time is exhausted or the queue signals restart. `loopEnd()` accounts for totals/stories; `prepareRestart()` may pause; `restart()` resets loop-scoped state and constructs the next execution list.
- Both `options.fractionalMana` and options affecting repeat/pause behavior modify the engine's assumptions. A naïve fixed-one-tick simulation is not equivalent to the current engine.

## Runtime ownership map

| Responsibility | Primary source |
| --- | --- |
| Action definitions, unlocks, costs and rewards | `actionList.js` |
| Queue bookkeeping and action execution | `actions.js` |
| Tick scheduling, game speed, pauses, loops | `driver.js` |
| Per-zone progress, limited-item counts | `town.js` |
| Stats, experience, skills, buffs | `stats.js`; registries in `saving.js` |
| Global resources, story, saves, options, initialization | `saving.js` |
| Challenge overrides | `challenges.js` |
| Prestige reset and permanent bonuses | `prestige.js` |
| HTML generation, updates and menus | `views/*` and `uicomponents.js` |
| Localization and story text | `localization.js` and `lang/en-EN/game.xml` |
| Prediction and threaded model | `predictor.js`, `predictor-worker.js`, `data.js` |
| Browser persistence and cloud save | `saving.js` and `google.js` |

## Data flow and update discipline

There is no centralized immutable store. Many modules share mutable globals such as `actions`, `towns`, `resources`, `stats`, `skills`, `buffs`, `storyFlags`, `storyVars`, `options` and `prestigeValues`. The `Data` class can snapshot selected roots and restore state for predictor simulations; this is **not** the on-disk save format. State mutations frequently enqueue UI work with `view.requestUpdate`. Running global logic in a worker requires compatibility with worker-specific initialization and absent DOM.

## Practical architecture rules

- Trace the full pathway from action definition through `Actions.tick`, town/stat updates, save, render and predictor before changing mechanics.
- Keep unique names, keys and numeric zone/trial indices stable.
- Never assume hidden UI equals disabled gameplay; `visible()`, `unlocked()` and `canStart()` are distinct checks.
- Avoid DOM access in code imported by `predictor-worker.js` unless guarded for worker context.
- Respect `Data.registerAll` and `Data.recordDefaults` when adding new persistent mutable state; a new arbitrary global may not be snapshotted for predictions.
- For code-level entry points and exact file names see the [code map](reference/code-map.md).
