# Persistence, migrations and restart contract

This guide describes the **current saved shape and reset pathways** in `saving.js`, not a formally versioned public schema. It is intended to prevent AI-generated changes from silently deleting user progress. See [state architecture](../state-and-saving.md) and [risk register](findings.md).

## Save/load pipeline

`doSave()` selects saved fields, `save()` serializes JSON and writes under the active `saveName`. `load()` initializes defaults, parses the chosen slot and invokes `doLoad()` to migrate, restore and recalculate state. Serialization is **not** a generic dump of every global.

```text
doSave() → JSON.stringify → localStorage[idleLoops1 or idleLoopsChallenge]
             ↓ export
ILSV01 + LZString.compressToBase64(JSON)
             ↓ import
decompress → storeSaveJson → load/JSON.parse → resume
```

The storage-before-validation order is the **original** risk [R01](findings.md), reproduced by merged RF01. **Candidate [RF02 PR #6](https://github.com/step3software/outer-loops/pull/6)** adds pure preflight and a rollback journal, retaining `ILSV01` and legacy `decode()` support. Until merged, the default branch remains unchanged. See [implementation evidence](../refactoring/rf02-evidence.md).

## Proposed RF02 recovery keys (unmerged PR #6)

New localStorage keys: `idleLoopsImportPendingV1` (exact-byte pending journal), `idleLoopsImportBackupV1_normal` and `idleLoopsImportBackupV1_challenge` (last pre-import saved copy per mode). These remain separate from `prestigeBackup` and do **not** enter exported JSON. The Save menu adds **Restore Previous Imported-Over Save** for the current mode. On startup, the journal is rolled back before `load` if an import was interrupted. See [ADR 001](../decisions/ADR-001-recoverable-save-import.md) and [RF02 evidence](../refactoring/rf02-evidence.md).

## Field inventory

The table lists explicitly serialized `doSave()` fields and primary restoration owners. Per-action keys are dynamically constructed and are not a formal typed schema.

| Stored field / family | Meaning | Restoration |
| --- | --- | --- |
| `curLoadout` | Selected loadout index | `doLoad` / UI |
| `nextList` | Future action queue, repetitions, disabled state, `loopsType` | `Actions.addActionRecord`, legacy name mapping |
| `loadouts`, `loadoutnames` | Named queue presets | `doLoad` |
| `townsUnlocked`; older `maxTown` | Available zone indexes | `doLoad` |
| `completedActions` | Completed action identities | `doLoad` |
| `exp<varName>` | Progress-action XP | `Town` and `doLoad` |
| `total<varName>` | Multipart completions or limited-resource totals | `Town` and `doLoad` |
| `checked<varName>`, `good<varName>`, `goodTemp<varName>` | Limited discoveries and known-good counts | `Town` and `doLoad` |
| `searchToggler<varName>` | Limited-action targeting UI | `doLoad` and inputs |
| `hiddenVars` | Per-town hidden action/progress UI | `doLoad` |
| `stats`, `totalTalent` | Permanent talent, soulstones, total talent (current stat level not restored) | `Stat.load` / `doLoad` |
| `skills`, `buffs`, `buffCaps` | Experience, special earned buffs and caps | `Skill.load` / `doLoad` |
| `prestigeValues` | Prestige points, completions, flags | `doLoad` / `prestigeWithNewValues` |
| `goldInvested` | Durable investment | `doLoad` |
| `stonesUsed` | Tower source-zone consumption | `doLoad` |
| `dungeons`, `trials` | Floor records and completion history | `doLoad` |
| `storyReqs`, `storyVars` | Serialized story booleans/numerics | `storyFlags` / `storyInitializers` |
| `storyShowing`, `storyMax`, `unreadActionStories` | Narrative chapter and notification state | `doLoad` |
| `actionLog` | Action history | `ActionLog.load` |
| `options`, `extraOptions` | Legacy-standard plus additional settings | `doLoad` / `loadOption` |
| `totalOfflineMs` | Offline time pool | `doLoad` |
| `totals` | Time, loops, actions, borrowed time | `doLoad` |
| `date` | Saved time used to accrue bounded offline credit | `doLoad` |
| `challengeSave` | Challenge mode and progress | `load` / `doLoad` |
| `version75` | Old dungeon migration sentinel | `doLoad` |

## Dynamic action identity is schema

Registry key, display name and persistence `varName` may differ. Examples: `SmashPots` → `Pots`, `ShortQuest` → `SQuests`, `FightMonsters` → `Fight`, `WizardCollege` → `wizCollege`, `SmallDungeon` → `SDungeon`, `ChallengeGods` → `GFight`. Town keys use families such as `exp<varName>` and `total<varName>`. Renaming action names without migration can discard queue entries; renaming `varName` without migration can lose progress. All 157 are recorded in [runtime mechanics](../reference/action-mechanics.generated.md).

## Source-confirmed migration paths

- `maxTown` expands to `townsUnlocked` for old saves.
- Renamed queue entries include Sell Gold → Buy Mana → Buy Mana Z1, Buy Mana Challenge → Buy Mana Z1, Purchase Mana → Buy Mana Z3, Tournament → Buy Pickaxe, and Train Dex → Train Dexterity.
- `storyReqs` is retained as the serialized name while `storyFlags` holds values in memory; `storyInitializers` derives some newer story variables.
- Absent prestige, challenge, stone, dungeon/trial and optional fields receive defaults or reconstructed values.
- `version75` absence triggers conversion of historical Small Dungeon totals into floor completions.
- Earlier `challenge` fields are migrated to separate challenge saves, potentially causing a reload.
- `options` and `extraOptions` are merged; independent browser settings can override update rate.

These compatibility branches have **not** been run against a complete historical fixture collection. They are code-inspected, not validated end to end.

## Reset semantics

| Operation | Preserved | Reset / changed |
| --- | --- | --- |
| Normal `restart()` | Town progress, skills, talent, buffs, completed story and lifetime totals as defined | Run time, resources, base stat levels, transient multipart counters, location, execution queue |
| `Actions.restart()` | Planned next queue | Rebuilds current queue and its position/tick counters |
| `beginChallenge()` | Normal save slot upon transition | Switches to challenge slot; loads mode-specific overrides |
| `exitChallenge()` | Normal save slot | Restores and reloads normal mode |
| `prestigeWithNewValues()` | Selected prestige points/buffs, totals and offline time | Clears ordinary progression and applies a larger reset |
| Clearing origin browser storage | No game data from another origin | Local progress gone unless independently exported/cloud-saved |

`loadDefaults` / `Data.recordDefaults` are for initialization/snapshots and are not substitutes for ordinary loop restart.

## Required regression fixtures

Fresh profile; recent and old synthetic saves; optional field absent; corrupt encoded data; valid `ILSV01` export/import; queue and loadouts; hidden toggles; stories; normal loop; challenge switching; prestige; snapshot/predictor. Never use a real player's private data.
