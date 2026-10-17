# Common change recipes

Use the smallest relevant recipe, consult the actual source and add tests or smoke evidence. These steps describe the current implementation, not an API promised for future versions.

## Add or modify an action

1. Find the matching `Action.*` in `actionList.js` and inspect an existing definition of the same `type`. Confirm the zero-indexed `townNum` in [gameplay](../gameplay.md).
2. Keep stable action identifiers and `varName` for existing save data. For a new action, choose a unique registry key and icon convention (`img/<camelized name>.svg`); consider whether `getXMLName` or `Action.xmlNameFor` needs special handling.
3. Set `type`, `townNum`, `stats`, `expMult`, `manaCost()` and appropriate `visible()`, `unlocked()`, `canStart()`, `cost()` and `finish()` functions. Review `skills` and `affectedBy` if relevant.
4. For `progress`, coordinate `Town.createProgressVars` / `finishProgress`, caps and any `adjust*` supply formulas. For `limited`, set the correct `varName`, computed `total...` supply and `finishRegular` handling. For `multipart`, review `loopStats`, segment scaling, rewards and floor indices.
5. Add English localization to `lang/en-EN/game.xml` (label, tooltips, any stories and segment names). Add or reuse the correct `img/` action icon. Do not treat `data/actionList.xml` as executable.
6. If the action has special persistent state, update `saving.js` init/save/load/migrations and `Data` snapshot registration as applicable. Check story flags/variables and prestige/challenge conditions.
7. Validate queue behavior, costs, training, visibility/unlock, story updates, saves, predictor (including worker) and responsive display. Update [action catalog](../reference/action-catalog.md) and this guide if the contract changes.

## Introduce a skill, stat or buff

- Look at `statList`, `skillList`, `buffList`, `buffHardCaps` and `buffCaps` in `saving.js`; these are explicit registries.
- Read `stats.js` constructors and growth/bonus functions. Check every `getSkillBonus` / `getSkillMod` formula, buff-derived multiplier and call site. Add explicit defaults and safe missing-field handling in save migration.
- Update the UI (`View.createStats`, `updateSkill`, `updateBuff` etc.), relevant menus, XML text, and any predictor baseline. Do not add an item to a registry without testing initialization, save/reload, reset, display and training.

## Introduce a resource or story

- Resources: update the `resources` template in `saving.js`, loop reset path, `addResource` / `resetResources` behavior and tracked-resource UI/localization. Specify whether numeric, boolean, per-loop or persistent.
- Stories: add the `storyFlags` key or `storyVars` field, modify action `storyReqs` and call `setStoryFlag` / `increaseStoryVarTo` at the correct completion point; add text in English XML and define save migration if preexisting users might need it.

## Alter timing, queue or repeat behavior

Start in `driver.js` and `actions.js`. Trace `tick` → `executeGameTicks` → `Actions.tick`, `getNextValidAction`, loop type semantics (`actions.js`'s `ActionLoopType` typedef), restart and pause. Test fractional mana, disabled entries, multipart unfinished segments, empty queues, known-good vs unchecked limited actions, repeated loops and offline speed.

## Change save data

Follow [state and saving](../state-and-saving.md). Specify per-loop / persistent / prestige / challenge semantics. Update `loadDefaults`, `doSave`, `doLoad` and the appropriate reset path; include any `Data.registerAll` update for snapshot-able roots. Verify current and older saves, export/import, restart, challenge and predictor.

## Change UI or localization

Inspect `index.html` script/DOM contracts, `views/main.view.js`, the relevant `Views.registerView` fragment, `themes.css` and English XML. Route updates through `view.requestUpdate`. Test keyboard, screen width, theme, tooltip, localization readiness and worker absence of DOM.

## Change predictor or editor

- Predictor: compare behavior in `predictor.js` and `predictor-worker.js` and registered state in `data.js`. Test enabled/disabled plus background worker and real execution parity.
- Editor: edit `editor.js`, `schema.js` and `data/*` together, validate XML and open `editor.html`. These XML definitions are **not** live game definitions.

## Add an entirely new zone

This is a cross-system milestone, not a small action edit. Produce an ADR first. Inspect `townNames`; `TownList<9>` and `initializeTowns()` in `saving.js`; `SurveyZ0..8`; all zone-number conditionals; `trials` and dungeons; `views/main.view.js` zone panels; `index.html` DOM; icons; localization; save migrations; worker; travel and action catalog. Plan an explicit compatibility strategy rather than appending only a town name.
