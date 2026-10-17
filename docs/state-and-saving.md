# State, loops and save compatibility

## Layers of state

The application is built from mutable page-global objects and scalars, not a central reducer. Their reset semantics differ:

| Layer | Representative values | Notes |
| --- | --- | --- |
| Current run | `resources`, `timer`, `curTown`, `Actions.current`, multipart run counters | Reset/rebuilt on `restart()` / `Actions.restart()` |
| Long-term progression | `towns` progress/completion totals, `stats` talents, `skills`, `buffs`, `completedActions`, `storyFlags` / `storyVars` | Carried across normal loops as governed by reset functions |
| Persistent meta | `prestigeValues`, relevant prestige buffs, `totals`, loadouts, options | Special handling on save/load and prestige |
| Challenge context | `challengeSave` and alternate save slot | Challenge overrides can alter functions globally |
| UI / browser preferences | `options`, `latestTheme`, `actionListHeight` | Some values are separately stored in `localStorage` |

These are *categories*, not a schema guarantee for every field. Always inspect the actual `restart()`, `restartStats()`, `Town.restart()`, `Actions.restart()`, `doSave()` and `doLoad()` pathways for fields you edit.

## Initialization and saving

`saving.js` declares core registries and creates `view`, `actions`, `towns`, resource defaults and many globals. `loadDefaults()` initializes stats, skills, buffs, action registry and towns, then calls `Data.recordDefaults()`. `load()` starts from defaults, reads persisted data, migrates older fields and triggers the runtime clock.

Primary browser save keys:

- `idleLoops1` — ordinary save (`defaultSaveName`).
- `idleLoopsChallenge` — challenge save (`challengeSaveName`).
- Other UI settings (for example `latestTheme` and `actionListHeight`) are kept separately.

`save()` calls `doSave()`, serializes JSON and uses `storeSaveJson()` to write `localStorage`. The default `autosaveRate` is 30 seconds; `tick()` performs autosave even when paused. `doSave()` explicitly selects save fields, town progress and queue/loadout data; not every global is automatically included.

### Export and import

User-visible exported game saves use the prefix `ILSV01`, followed by LZString-compressed Base64 JSON. `exportSave()` / `exportSaveFile()` and `importSave()` / `importSaveFile()` / `processSave()` handle the paths. `doLoad()` includes backward-compatibility transformations, including older story data and absent optional fields.

Do not write a save migration based solely on an example save. Preserve imports from at least one older fixture when available, default missing fields safely and make repeated load/save idempotent.

## Loop restart is not prestige

`driver.js` runs `loopEnd()` → `prepareRestart()` → `restart()` when a loop finishes. Restart resets temporary resources, action/segment counters and per-run stats while retaining intended long-term gains.

`prestige.js` provides a **separate** larger reset via `prestigeUpgrade()` / `prestigeWithNewValues()`, carrying selected prestige bonuses and meta progress. Modifying normal restart logic can break prestige and vice versa; test both.

`challenges.js` uses `loadChallenge()` to change action methods and other functions according to `challengeSave.challengeMode`. Challenge execution may not obey the normal mode's assumptions. Inspect `beginChallenge()`, `exitChallenge()` and `resumeChallenge()`.

## Snapshot system is distinct

`Data` in `data.js` maintains registered object roots and snapshots. `Data.registerAll(...)` in `saving.js` registers core state such as `actions`, `towns`, `stats`, `resources`, `skills`, `buffs`, `prestigeValues`, `storyFlags`, `storyVars` and `totals`. Defaults/base snapshots are used in the predictor simulation pipeline; their semantics are **not** equivalent to browser save JSON.

Any new mutable root may need registration. A field omitted from both save serialization and snapshots can behave correctly during ordinary play but disappear on reload or produce incorrect predictions.

## Safe migration procedure

1. Export and secure a throwaway test save before code changes.
2. Define what should persist within a loop, between loops, through prestige, between browser sessions, and during challenge modes.
3. Update initializer, normal reset, save, load/migration, UI and snapshot coverage together.
4. Test fresh start, existing save, save/reload, export/import, long progression, normal restart, challenge and prestige.
5. Never overwrite a real save during development or add production player data to version control.

## Cloud save

`google.js` exposes `GoogleCloud` for optional Google Drive `drive.appdata`-scoped saves. `index.html` loads Google identity/API scripts. Cloud authorization is an external dependency and is **not** necessary for offline/local game development. Do not commit tokens or use real accounts as test fixtures; validate opt-in cloud behavior only in a controlled test account.
