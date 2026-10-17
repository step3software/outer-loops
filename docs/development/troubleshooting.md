# Troubleshooting and diagnostics

Use a throwaway browser profile and Developer Tools (Console, Network and Sources). First verify the local HTTP root and that `index.html` loads the expected branch. Record the exact failing action, mode and save provenance; do not alter real player data during debugging.

| Symptom | Likely investigation |
| --- | --- |
| Blank screen or early JS ReferenceError | `index.html` script order, missing first-party source, `loadDefaults()` and `Localization.ready` |
| Literal text key or missing action description | `lang/en-EN/game.xml`, `getXMLName`, `Localization.txt` fallback and AJAX errors |
| Missing action despite a displayed story | Separate `visible()`, `unlocked()` and `canStart()`; also town survey and resource requirements |
| Different predicted and actual rewards | `predictor.js`, worker-imported globals, `Data` snapshots, formula rounding and queue loops types |
| Worker error after an otherwise good gameplay change | `predictor-worker.js` `importScripts` list and DOM-dependent code in shared functions |
| Action runs but story never unlocks | `storyReqs`, `setStoryFlag` / `increaseStoryVarTo`, `actionStory` and XML text |
| Actions stop, restart early or skip repeats | `driver.js` time budget, `Actions.tick`, `getNextValidAction`, queue `loopsType`, `shouldRestart` and pause settings |
| Limited reward or count wrong | `Town.finishRegular`, `total/checked/goodTemp/lootFrom` fields and `adjustAll`/`adjust*` supply |
| Multipart bar stalls or awards twice | Segment counters in `Actions.tick`, `TrialAction` / `DungeonAction` callbacks and `Town` counters |
| Progress disappears on reload | `saving.js` `doSave`/`doLoad`, missing-field defaults, save slot or reset semantics |
| Broken challenge only | `challenges.js` runtime overrides and challenge save slot (`idleLoopsChallenge`) |
| Prestige loses/keeps wrong things | `prestigeWithNewValues`, `prestigeValues`, persistent buffs and `loadDefaults` |
| Editor loads but game does not change | `data/actionList.xml` is editor data, not the runtime `Action.*` registry |
| Theme or narrow-screen regression | `themes.css`, `stylesheet.css`, `View.changeTheme` and navigation DOM contracts |
| Google save fails | External OAuth/GAPI availability, `GoogleCloud` auth, opted-in account; do not embed a client secret |

## Debugging procedure

1. Reproduce in an isolated profile and export any disposable fixture before investigation.
2. Open Network: confirm `lang/en-EN/game.xml` and relevant JS/CSS/worker requests return successfully.
3. Open Console: preserve the first exception and its stack, not just the final visible symptom.
4. Trace definitions to call sites and updates; for an action change, inspect `Action.*` → `Actions.tick` → `Town`/`stats` → `view.requestUpdate` → `save()` → predictor.
5. Reproduce with predictor disabled and then enabled in background mode to isolate worker-only errors.
6. Confirm fix against the [smoke matrix](validation.md) and document the exact tested paths.

## Common false assumptions

- A green `npm run check` does not prove the page loaded or saves migrated.
- The content editor XML is not the executable action registry.
- An action's displayed name is not necessarily its persistent `varName`.
- A normal loop restart is not a prestige or a hard reset.
- A paused game can still autosave.
- Public GitHub access does not supply a software license.
