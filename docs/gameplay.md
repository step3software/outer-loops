# Gameplay, actions, zones and progression

## Loop model

A run repeatedly executes a player-defined action queue under a time/mana budget. Actions train the nine stats, increase skills, discover and consume resources, unlock progression, advance stories and move between zones. Some quantities reset each loop; long-term progress remains. For precise reset/save boundaries see [state and saving](state-and-saving.md).

## Zones

`actionList.js` defines `townNames` in zero-indexed order; `initializeTowns()` constructs `Town(0)` through `Town(8)`.

| Index | Zone |
| ---: | --- |
| 0 | Beginnersville |
| 1 | Forest Path |
| 2 | Merchanton |
| 3 | Mt. Olympus |
| 4 | Valhalla |
| 5 | Startington |
| 6 | Jungle Path |
| 7 | Commerceville |
| 8 | Valley of Olympus |

Travel rules are handled by functions such as `getTravelNum()` / `getPossibleTravel()` and action-specific unlock conditions. Adding a zone affects far more than its visible action list: initialization, town arrays, survey resources, XML, assets, menus, save, predictor and travel assumptions.

## Action classes and types

The *behavioral action type* and the *constructor class* are different concepts. Executable definitions are registered as `Action.SomeId = new Action("Display Name", extras)`, or as `MultipartAction`, `DungeonAction`, `TrialAction` and `AssassinAction` instances.

| `type` | State and display behavior | Typical example |
| --- | --- | --- |
| `normal` | A single action; often trains a stat/skill, spends or grants a resource | Raise Zombie |
| `progress` | Permanently advances a town progress meter | Wander, Explore Forest |
| `limited` | Discovers/consumes from a finite pool with known-good and checked counts | Smash Pots |
| `multipart` | Several segments, per-segment stat work and progression/counters | Dungeons, trials |

The game's registry currently defines **157 `Action.*` entries** across the nine zones. Use the [action catalog](reference/action-catalog.md) to navigate them. It inventories executable definitions rather than XML editor prototypes.

### Definition contract

Important fields and callbacks include:

- `name`: display/reference identity; `varName`: persisted and town variable identity (often, but not always, name without spaces).
- `type` and `townNum`: determine town placement and progression bookkeeping.
- `stats`, `expMult`, optional `skills`: determine training and reward scaling.
- `manaCost()`, optional `goldCost()` and `cost()`: describe/consume cost; avoid negative resource balances and rounding regressions.
- `visible()`, `unlocked()`, `canStart()`, optional `allowed()`: distinct discovery, unlock, start and availability constraints.
- `finish()`: reward, flags and progress effects; multipart types add `loopStats`, `loopCost()`, `tickProgress()`, `loopsFinished()` or `floorReward()`.
- `storyReqs(storyNum)` and story effects: unlock story entries; text comes from localization XML.
- `affectedBy` and auxiliary formulas: change tooltip, predictor or visible dependencies.

Prefer matching a nearby action of the same type and zone. `Action.Wander` is a progress example, `Action.SmashPots` is limited, `Action.RaiseZombie` is normal and `Action.DeadTrial` demonstrates `TrialAction`. Use the complete [change recipe](development/recipes.md), not an isolated pasted definition.

## Town progression

`Town` in `town.js` manages three main variable families:

- Progress: `exp<varName>`; `finishProgress()` increments up to **505,000**, normally mapping to level 100. The default level curve is quadratic; some actions use `progressScaling: "linear"`.
- Limited: `total<varName>`, `checked<varName>`, `good<varName>`, `goodTemp<varName>` and `lootFrom<varName>`. `finishRegular()` handles discovery versus reusing known-good items. Survey and related bonuses may alter totals.
- Multipart: progress stored under `<varName>`, plus `<varName>LoopCounter` and long-term completion totals. Segment progress has separate cost/progression behavior.

`adjustAll()` and related `adjust*` functions recalculate available limited resources as progress/bonuses change. Changing only the action tooltip does not change the actual supply or cost.

## Attributes and growth

The nine base stats are `Dex`, `Str`, `Con`, `Spd`, `Per`, `Cha`, `Int`, `Luck` and `Soul`. Skills listed in `saving.js` are `Combat`, `Magic`, `Practical`, `Alchemy`, `Crafting`, `Dark`, `Chronomancy`, `Pyromancy`, `Restoration`, `Spatiomancy`, `Mercantilism`, `Divine`, `Commune`, `Wunderkind`, `Gluttony`, `Thievery`, `Leadership` and `Assassin`.

`stats.js` implements formulas for level, talent, skill and buff scaling (`getLevelFromExp`, `getSkillBonus`, `getSkillMod`, `getTotalBonusXP`, etc.). Do **not** replace formulas with a simplified constant when making a balance change; rewards may be affected by skills, buffs, soulstones, prestige, progress and resource availability simultaneously.

`saving.js` defines dungeon floor counts `[6, 9, 20]` and trial floor counts `[50, 100, 7, 1000, 25]`. These arrays, trial numbers and UI assumptions must stay aligned if expanded.

## Story and late game

Story progression uses boolean `storyFlags`, numeric `storyVars`, action `storyReqs`, and UI functions `setStoryFlag` / `increaseStoryVarTo`. The narrative text is stored in `lang/en-EN/game.xml`. Raise Zombie, Dead Trial, Jungle Path and Valhalla all exist in this fork; they should not be reimplemented as new mechanics.

`challenges.js` may replace live action functions or restart behavior while a challenge is active; `prestige.js` adds a larger progression reset with purchased bonuses. See [state and saving](state-and-saving.md) and [predictor](predictor.md).

## Balance acceptance checklist

For any changed action, explicitly verify prerequisites, visibility, usable cost, scarce-resource counts, queue execution, training, completion, stories, prestige/challenges, the predictor and reload. Test under low/high relevant skill and late-game states where the modification can produce non-finite numbers. Preserve the current economy unless rebalancing is the explicit task.
