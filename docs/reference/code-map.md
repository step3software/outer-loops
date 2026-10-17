# First-party code map

Navigation map for the repository's existing classic-script JavaScript. **Executable source is authoritative;** references below are the locations to confirm behavior, not a substitute for reading definitions.

## Entry points and assets

| Path | Purpose |
| --- | --- |
| `index.html` | Game document, bootstrap, script order and base DOM |
| `editor.html` | Separate, experimental XML authoring page |
| `stylesheet.css`, `themes.css`, `predictor.css`, `statsgraph.css` | Layout, color/theme and overlays |
| `img/` | Action SVGs, logos and UI assets |
| `lib/` | Vendored browser libraries; avoid changes without a specific reason |
| `manifest.webmanifest` | Browser manifest |
| `.github/workflows/static.yml` | Existing Pages deployment (push to `dmchurch` / manual trigger) |

## Runtime systems

| Path | Responsibility / anchors |
| --- | --- |
| `actionList.js` | `Action` classes, all registered `Action.*` definitions, `townNames`, `getActionPrototype`, cost and travel formulas |
| `actions.js` | `Actions` queue, `tick`, action `loopsType` and multipart execution |
| `driver.js` | `tick`, `executeGameTicks`, `recalcInterval`, `loopEnd`, `restart`, add/reset resources |
| `town.js` | `Town`, progress, limited and multipart variables |
| `stats.js` | `Stat` / `Skill` / `Buff`, experience, scaling and bonuses |
| `saving.js` | Global registries, `loadDefaults`, `load`, `doSave` / `doLoad`, `save`, `processSave`, story keys, options |
| `prestige.js` | Persistent prestige points/buffs, reset and balance multipliers |
| `challenges.js` | Challenge-specific runtime overrides |
| `talents.js` | Talent-related calculations |
| `helpers.js`, `interval.js`, `polyfills.js` | Shared utilities and compatibility helpers |
| `hotkeys.js` | Keyboard shortcuts |
| `actionLog.js` | Recorded action feedback/log |
| `google.js` | Opt-in Drive appdata sync |

## Presentation

| Path | Responsibility |
| --- | --- |
| `views/main.view.js` | Central `View`, render/update methods, story flags and labels |
| `views/views.js` | `Views.registerView` and `Views.draw` |
| `views/menu.view.js` | Menus, help, options, save, challenges and prestige |
| `views/timecontrols.view.js` | Time controls |
| `views/trackedresources.view.js` | Resource-tracking panel |
| `views/buffs.view.js` | Buff presentation |
| `views/talenttree.view.js` | Talent tree rendering |
| `uicomponents.js` | DOM template helpers and custom elements |
| `localization.js` | `Localization.ready`, `_txt`, XML lookup |
| `lang/en-EN/game.xml` | Canonical English menu/action/story text |
| `lang/fr-FR/game.xml` | Existing but not currently enabled translation |

## Prediction and editing

| Path | Responsibility |
| --- | --- |
| `predictor.js`, `predictor-worker.js` | Forecast algorithm and background worker |
| `data.js` | Registered global state, snapshots and deltas for simulation |
| `statsgraph.js` | Stat progress graphing |
| `editor.js`, `schema.js` | Experimental authoring UI and Relax NG model |
| `data/actionList.xml`, `data/refs.xml`, `data/schema/actionList.rng` | Editor XML, references and schema — not live action code |

## Developer automation

| Path | Responsibility |
| --- | --- |
| `AGENTS.md` and nested `AGENTS.md` | Agent rules and local boundaries |
| `docs/` | Architecture, mechanics, persistence, workflows and review guidance |
| `scripts/check-repo.mjs` | Syntax, docs/internal-link and entry-point consistency check |
| `scripts/check-xml.py` | XML parsing smoke check |
| `scripts/load-game-model.mjs`, `scripts/test-game-model.mjs`, `scripts/test-action-execution.mjs` | Worker-like game model and basic queue regression assertions |
| `scripts/generate-action-mechanics.mjs` | Runtime-generated 157-action mechanics reference and drift check |
| `.github/workflows/validate.yml` | PR/push static validation |
| `package.json` | Type definitions and convenience check script; no application bundling |

For exact changes to an action use [action catalog](action-catalog.md) and [change recipes](../development/recipes.md).
