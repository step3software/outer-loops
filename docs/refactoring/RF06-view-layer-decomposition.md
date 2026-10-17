# RF06 — Decompose the view layer

- **Status:** Planned — approved scope; implementation not authorized
- **Priority:** Last, after stable domain and action boundaries
- **Hard dependencies:** RF03 DOM-independent rule ownership and RF05 stable scripts/action registration; recommend RF04 stable challenge policy
- **Enables:** Smaller UI work, focused browser regression checks and future accessibility/performance improvements
- **Primary implementation handoff:** [RF06](handoffs/RF06.md)

## Objective

Split the ~2,000-line `views/main.view.js` and related rendering responsibilities into smaller units without changing gameplay, HTML/CSS appearance, localization, DOM IDs, keyboard interactions, update scheduling or the interface expected by existing game logic. This is **behavior-preserving view decomposition**; broader UI redesign is a later decision.

## Existing implementation contract

- `views/main.view.js` defines `class View`; `saving.js` creates the active `view`. Initialization is spelled **`view.initalize()`** in existing source: preserving this current public method until a separate migration prevents breakage.
- `views/views.js` owns `Views.registerView` and `Views.draw`, and `views/menu.view.js`, `views/timecontrols.view.js`, `views/buffs.view.js`, `views/talenttree.view.js` and `views/trackedresources.view.js` register fragments.
- Game actions, driver, stats, action log and predictor rely on `view.requestUpdate(...)` and several immediate `View` methods. Update batching/coalescing and ordering are part of current behavior.
- Dynamic markup includes inline event handlers, stable DOM IDs, CSS theme variables, story elements and queued-action visual state. Localization resolves XML text through `Localization.ready`, `_txt` and `_txtsObj`; the large English XML contains many action/story keys.
- `uicomponents.js` implements custom rendering and UI elements; `actionLog.js` and `statsgraph.js` add adjacent views. The editor has a distinct page and must still load.

## Proposed decomposition (internal ownership, not selected filenames)

| Responsibility | Candidate component/service | API to preserve |
| --- | --- | --- |
| Action queue and drag/drop | Queue view | Planned/current action lists, highlights, buttons, repeat counts, disabled/ordering |
| Town/action discovery | Town view | `createTownActions`, `updateLockedHidden`, `updateRegular`, `updateProgressAction`, tooltips |
| Stats, skills and buffs | Character view | `createStats`, `updateStats`, `updateSkill`, `updateBuff`, graph |
| Dungeons/trials/multipart | Progress view | `updateMultiPart`, `updateMultiPartSegments`, `updateTrials`, floor updates |
| Stories and notifications | Story view | `updateStories`, `updateStory`, action/global story indicators |
| Theme/viewport/tooltips | UI shell | `changeTheme`, `setScreenSize`, focus, mouseover, keyboard-related hooks |
| Render request orchestration | Thin `View` facade | `requestUpdate`, `handleUpdateRequests`, `update`, and legacy init method |

This layout describes boundaries, not a demand for React/Vue or a framework. Keep the public `view` facade stable until every caller and script is migrated with tests.

## In scope

1. Inventory public view methods, direct call sites, update request names/payloads, significant DOM IDs and initialization/teardown behavior.
2. Establish a single scheduler/dispatcher that preserves request ordering and deduplication semantics. Delegate cohesive rendering domains to internal objects/modules without changing how producers call `view.requestUpdate`.
3. Extract view-specific state from game state only where RF03 has already made it independent. Render caps/resources from authoritative state rather than accepting HTML as business logic.
4. Preserve localization lookup, exact user-visible semantics, current theme variables and keyboard/accessibility *behavior*; add tests before moving markup.
5. Update `index.html` scripts and any `View`-dependent predictor/editor integration safely, including compatibility with background-worker absence of DOM.
6. Update the code map, UI guide, diagrams/ADR and regression tests, keeping action/zone/economy code unchanged.

## Out of scope

Player-facing visual redesign; replacement with Vue, React or Svelte; rewriting the core action queue or state model; modifying challenge difficulty or save data; wholesale re-theming; performance claims without measurements. Separate accessibility fixes should be proposed when they affect behavior rather than smuggled into mechanical extraction.

## Acceptance criteria

- **A1:** All former public `View` methods and `view.requestUpdate` request types remain callable with equivalent arguments and timing. In particular ```initalize``` (legacy spelling), `updateNextActions`, `updateCurrentActionLoops`, `updateLockedHidden` and `updateMultiPart` remain compatible.
- **A2:** For matched fixture states the page shows the same action and zone ordering, progress/stats/resources, tooltip/story copy, button state, navigation and overlay controls as before, in at least two viewport sizes and contrasting themes.
- **A3:** Queue changes (add, repeat, disable, reorder, drag/drop), pause/resume, restart and save/reload update the DOM correctly; dynamic content is not duplicated or left stale.
- **A4:** Keyboard focus, shortcuts, localized labels, challenge menus, prestige controls and predictor overlays remain functional. No regressions in core browser accessibility characteristics.
- **A5:** Rendering errors or missing elements do not silently affect gameplay rules or mutate saved state; domain calculations work without the UI. There are no new DOM reads in worker-imported rule code.
- **A6:** Dynamic event listeners and redraw cycles do not multiply handlers. Use event/listener count checks or observable repeated-interaction tests, not an untested performance claim.
- **A7:** Existing tests and comprehensive RF01/RF03/RF05 regression scenarios pass across normal, challenge and prediction modes. The new view responsibilities have focused browser interaction/screenshot assertions.
- **A8:** Source compatibility and rollback are documented; no action mechanics, serialized keys or runtime dependencies are changed.

## Test plan

Use RF01 fresh/queue/challenge/predictor scenarios and RF06 F15. Establish a pre-refactor DOM-structure/behavior baseline in a disposable Chrome profile: screenshot/semantic assertions for town 0, later towns via synthetic fixtures, action queue/menu, multiparts, story overlays, and responsive navigation. Verify focus and keyboard inputs, tooltip show/hide, theme and action stats under dark/light contrast, and localization. Also test request batching and repeated `View` initialization to detect duplicate handlers.

## Suggested staged extraction

1. Build a map of method callers, render requests and DOM ids; add browser checks for the major panels.
2. Extract a minimal render dispatcher behind the existing `View` API; preserve `initalize`.
3. Extract one domain at a time (stats/buffs, town/action, queue, multipart/trials, story, shell), validating each extraction before proceeding.
4. Update script manifests, code map, docs and optionally an ADR for long-lived internal interfaces.
5. Review diff for incidental visual/styling changes. Performance changes require separate benchmarks and authorization.

If UI cannot be retained exactly, stop and elevate the deviation for review instead of treating a redesign as an unnoticed refactor. Implementation and merging require separate authorization.
