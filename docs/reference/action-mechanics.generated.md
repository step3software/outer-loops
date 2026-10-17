# Action mechanics — generated from initialized runtime

> **Generated reference.** Run `node scripts/generate-action-mechanics.mjs --write` after changing `actionList.js`. The CI checker uses `--check` to detect drift. Do not hand-edit this file.

This inventory reads **actual Action instances**, including Survey/Ruins/Haul factories and inherited assassin types. It is not read from the experimental XML editor. Costs and gates below are **source expressions**, not guaranteed prices/availability in every save. Action `goldCost()` can represent rewards or payments, depending on the caller; never infer the direction from the name alone. Callback effect labels identify only *direct textual calls* within the listed callbacks; other functions, indirect effects, and conditional branches must be reviewed in source.

Action identity, `varName`, town indexing, skills and stat weights are save/balance contracts. Classify proposed changes using [gameplay](../gameplay.md), [state](../state-and-saving.md) and [review](../audit/README.md).

## Summary

| Type | Count |
| --- | ---: |
| normal | 66 |
| progress | 41 |
| limited | 18 |
| multipart | 32 |
| **Total** | **157** |

## Zone 0 — Beginnersville (25 actions)

### AssassinZ0 — `Action.AssassinZ0`

- **Identity:** `multipart` / `AssassinAction` · `townNum=0` · `varName=AssassinZ0` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L761)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Buy Glasses — `Action.BuyGlasses`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=BuyGlasses` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L968)
- **Cost:** mana `50` · allowed `1` · extra cost callback
- **Gates:** visible `towns[0].getLevel("Wander") >= 3 && getExploreProgress() < 100 && !prestigeValues["completedAnyPrestige"]` · unlocked `towns[0].getLevel("Wander") >= 20` · canStart `resources.gold >= 10`
- **Growth:** stat weights `Cha:0.7, Spd:0.3`; skills `none`
- **Effects:** resource:gold, resource:glasses. **Story:** story checkpoints 1, 2.

### Buy Mana Z1 — `Action.BuyManaZ1`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=BuyManaZ1` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1037)
- **Cost:** mana `100` · goldCost() `Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige())`
- **Gates:** visible `towns[0].getLevel("Wander") >= 3` · unlocked `towns[0].getLevel("Wander") >= 20`
- **Growth:** stat weights `Cha:0.7, Int:0.2, Luck:0.1`; skills `none`
- **Effects:** mana budget. **Story:** story checkpoints 1.

### Buy Supplies — `Action.BuySupplies`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=BuySupplies` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1670)
- **Cost:** mana `200` · allowed `1` · extra cost callback
- **Gates:** visible `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15` · unlocked `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35` · canStart `resources.gold >= towns[0].suppliesCost && !resources.supplies`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:gold, resource:supplies. **Story:** story checkpoints 1, 2.

### Fight Monsters — `Action.FightMonsters`

- **Identity:** `multipart` / `MultipartAction` · `townNum=0` · `varName=Fight` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1508)
- **Cost:** mana `2000`
- **Gates:** visible `towns[0].getLevel("Secrets") >= 20` · unlocked `getSkillLevel("Combat") >= 10` · canStart `resources.reputation >= 2`
- **Growth:** stat weights `Str:0.3, Spd:0.3, Con:0.3, Luck:0.1`; skills `Combat:10`
- **Effects:** resource:gold, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Found Glasses — `Action.FoundGlasses`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=FoundGlasses` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1011)
- **Cost:** mana `0` · allowed `0`
- **Gates:** visible `getExploreProgress() >= 100 || prestigeValues["completedAnyPrestige"]` · unlocked `false` · canStart `false`
- **Growth:** stat weights `none`; skills `none`
- **Effects:** custom implementation (inspect callback). **Story:** None declared here. **Affected by:** `SurveyZ1`.

### Haggle — `Action.Haggle`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=Haggle` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1715)
- **Cost:** mana `100` · extra cost callback
- **Gates:** visible `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15` · unlocked `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35` · canStart `resources.reputation >= 1`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:reputation. **Story:** story checkpoints 1, 2, 3.

### Heal The Sick — `Action.HealTheSick`

- **Identity:** `multipart` / `MultipartAction` · `townNum=0` · `varName=Heal` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1442)
- **Cost:** mana `2500`
- **Gates:** visible `towns[0].getLevel("Secrets") >= 20` · unlocked `getSkillLevel("Magic") >= 12` · canStart `resources.reputation >= 1`
- **Growth:** stat weights `Per:0.2, Int:0.2, Cha:0.2, Soul:0.4`; skills `Magic:10`
- **Effects:** resource:reputation, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Hitch Ride — `Action.HitchRide`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=HitchRide` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1806)
- **Cost:** mana `1` · allowed `1`
- **Gates:** visible `getExploreProgress() > 1` · unlocked `getExploreProgress() >= 25` · canStart `true`
- **Growth:** stat weights `Cha:0.5, Per:0.5`; skills `none`
- **Effects:** zone unlock. **Story:** story checkpoints 1.

### Investigate — `Action.Investigate`

- **Identity:** `progress` / `Action` · `townNum=0` · `varName=Secrets` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1209)
- **Cost:** mana `1000`
- **Gates:** visible `towns[0].getLevel("Met") >= 5` · unlocked `towns[0].getLevel("Met") >= 25`
- **Growth:** stat weights `Per:0.3, Cha:0.4, Spd:0.2, Luck:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Long Quest — `Action.LongQuest`

- **Identity:** `limited` / `Action` · `townNum=0` · `varName=LQuests` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1254)
- **Cost:** mana `1500` · goldCost() `Math.floor(base * getSkillMod("Practical",200,400,1))`
- **Gates:** visible `towns[0].getLevel("Secrets") >= 1` · unlocked `towns[0].getLevel("Secrets") >= 10`
- **Growth:** stat weights `Str:0.2, Int:0.2, Con:0.4, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:gold, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

### Mage Lessons — `Action.MageLessons`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=MageLessons` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1392)
- **Cost:** mana `1000`
- **Gates:** visible `towns[0].getLevel("Secrets") >= 10` · unlocked `towns[0].getLevel("Secrets") >= 20` · canStart `resources.reputation >= 2`
- **Growth:** stat weights `Per:0.3, Int:0.5, Con:0.2`; skills `Magic:dynamic`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.

### Map — `Action.Map`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=Map` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L792)
- **Cost:** mana `200` · goldCost() `15`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `resources.gold >= 15`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:gold, resource:map. **Story:** story checkpoints 1.

### Meet People — `Action.MeetPeople`

- **Identity:** `progress` / `Action` · `townNum=0` · `varName=Met` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1073)
- **Cost:** mana `800`
- **Gates:** visible `towns[0].getLevel("Wander") >= 10` · unlocked `towns[0].getLevel("Wander") >= 22`
- **Growth:** stat weights `Int:0.1, Cha:0.8, Soul:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.

### Open Rift — `Action.OpenRift`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=OpenRift` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1841)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `towns[5].getLevel("Meander") >= 1` · unlocked `getSkillLevel("Dark") >= 300 && getSkillLevel("Spatiomancy") >= 100`
- **Growth:** stat weights `Int:0.2, Luck:0.1, Soul:0.7`; skills `Dark:1000`
- **Effects:** resource:supplies, skill XP, zone unlock. **Story:** story checkpoints 1.

### Pick Locks — `Action.PickLocks`

- **Identity:** `limited` / `Action` · `townNum=0` · `varName=Locks` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L922)
- **Cost:** mana `400` · goldCost() `Math.floor(base * getSkillMod("Practical",0,200,1) * getSkillBonus("Thievery"))`
- **Gates:** visible `towns[0].getLevel("Wander") >= 3` · unlocked `towns[0].getLevel("Wander") >= 20`
- **Growth:** stat weights `Dex:0.5, Per:0.3, Spd:0.1, Luck:0.1`; skills `none`
- **Effects:** resource:gold, limited-item discovery. **Story:** story checkpoints 1, 2, 3, 4.

### Short Quest — `Action.ShortQuest`

- **Identity:** `limited` / `Action` · `townNum=0` · `varName=SQuests` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1157)
- **Cost:** mana `600` · goldCost() `Math.floor(base * getSkillMod("Practical",100,300,1))`
- **Gates:** visible `towns[0].getLevel("Met") >= 1` · unlocked `towns[0].getLevel("Met") >= 5`
- **Growth:** stat weights `Str:0.2, Dex:0.1, Cha:0.3, Spd:0.2, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:gold, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

### Small Dungeon — `Action.SmallDungeon`

- **Identity:** `multipart` / `DungeonAction` · `townNum=0` · `varName=SDungeon` · `segments=7` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1579)
- **Cost:** mana `2000`
- **Gates:** visible `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15` · unlocked `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35` · canStart `resources.reputation >= 2 && curFloor < dungeons[this.dungeonNum].length`
- **Growth:** stat weights `Str:0.1, Dex:0.4, Con:0.3, Cha:0.1, Luck:0.1`; skills `Combat:5, Magic:5`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Smash Pots — `Action.SmashPots`

- **Identity:** `limited` / `Action` · `townNum=0` · `varName=Pots` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L881)
- **Cost:** mana `Math.ceil(50 * getSkillBonus("Practical"))` · goldCost() `Math.floor(100 * getSkillBonus("Dark"))`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Str:0.2, Per:0.2, Spd:0.6`; skills `none`
- **Effects:** mana budget, limited-item discovery. **Story:** story checkpoints 1, 2.

### Start Journey — `Action.StartJourney`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=StartJourney` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1764)
- **Cost:** mana `1000` · allowed `1` · extra cost callback
- **Gates:** visible `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15` · unlocked `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35` · canStart `resources.supplies`
- **Growth:** stat weights `Con:0.4, Per:0.3, Spd:0.3`; skills `none`
- **Effects:** resource:supplies, zone unlock. **Story:** story checkpoints 1.

### SurveyZ0 — `Action.SurveyZ0`

- **Identity:** `progress` / `Action` · `townNum=0` · `varName=SurveyZ0` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L637)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Throw Party — `Action.ThrowParty`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=ThrowParty` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1305)
- **Cost:** mana `1600` · extra cost callback
- **Gates:** visible `towns[this.townNum].getLevel("Secrets") >= 20` · unlocked `towns[this.townNum].getLevel("Secrets") >= 30` · canStart `resources.reputation >= 2`
- **Growth:** stat weights `Cha:0.8, Soul:0.2`; skills `none`
- **Effects:** resource:reputation, progress. **Story:** story checkpoints 1, 2.

### Train Strength — `Action.TrainStrength`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=TrainStrength` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1119)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[0].getLevel("Met") >= 1` · unlocked `towns[0].getLevel("Met") >= 5`
- **Growth:** stat weights `Str:0.8, Con:0.2`; skills `none`
- **Effects:** custom implementation (inspect callback). **Story:** story checkpoints 1, 2, 3, 4, 5.

### Wander — `Action.Wander`

- **Identity:** `progress` / `Action` · `townNum=0` · `varName=Wander` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L830)
- **Cost:** mana `250`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Per:0.2, Con:0.2, Cha:0.2, Spd:0.3, Luck:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5. **Affected by:** `Buy Glasses`.

### Warrior Lessons — `Action.WarriorLessons`

- **Identity:** `normal` / `Action` · `townNum=0` · `varName=WarriorLessons` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1346)
- **Cost:** mana `1000`
- **Gates:** visible `towns[0].getLevel("Secrets") >= 10` · unlocked `towns[0].getLevel("Secrets") >= 20` · canStart `resources.reputation >= 2`
- **Growth:** stat weights `Str:0.5, Dex:0.3, Con:0.2`; skills `Combat:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.

## Zone 1 — Forest Path (23 actions)

### AssassinZ1 — `Action.AssassinZ1`

- **Identity:** `multipart` / `AssassinAction` · `townNum=1` · `varName=AssassinZ1` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L764)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Bird Watching — `Action.BirdWatching`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=BirdWatching` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2441)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[1].getLevel("Flowers") >= 30` · unlocked `towns[1].getLevel("Flowers") >= 80` · canStart `resources.glasses`
- **Growth:** stat weights `Per:0.8, Int:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5. **Affected by:** `Buy Glasses`.

### Brew Potions — `Action.BrewPotions`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=BrewPotions` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2276)
- **Cost:** mana `Math.ceil(4000)` · extra cost callback
- **Gates:** visible `getSkillLevel("Alchemy") >= 1` · unlocked `getSkillLevel("Alchemy") >= 10` · canStart `resources.herbs >= 10 && resources.reputation >= 5`
- **Growth:** stat weights `Dex:0.3, Int:0.6, Luck:0.1`; skills `Magic:50, Alchemy:25`
- **Effects:** resource:herbs, resource:potions, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### Clear Thicket — `Action.ClearThicket`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Thicket` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2480)
- **Cost:** mana `500`
- **Gates:** visible `towns[1].getLevel("Flowers") >= 10` · unlocked `towns[1].getLevel("Flowers") >= 20`
- **Growth:** stat weights `Dex:0.1, Str:0.2, Per:0.3, Con:0.2, Spd:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.

### Continue On — `Action.ContinueOn`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=ContinueOn` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2784)
- **Cost:** mana `Math.ceil(8000 - (60 * towns[1].getLevel("Shortcut")))` · allowed `(checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Con:0.4, Per:0.2, Spd:0.4`; skills `none`
- **Effects:** zone unlock. **Story:** story checkpoints 1.

### Dark Magic — `Action.DarkMagic`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=DarkMagic` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2572)
- **Cost:** mana `Math.ceil(6000 * (1 - towns[1].getLevel("Witch") * 0.005))` · extra cost callback
- **Gates:** visible `towns[1].getLevel("Witch") >= 10` · unlocked `towns[1].getLevel("Witch") >= 20 && getSkillLevel("Magic") >= 100` · canStart `resources.reputation <= 0`
- **Growth:** stat weights `Con:0.2, Int:0.5, Soul:0.3`; skills `Dark:dynamic`
- **Effects:** resource:reputation, skill XP. **Story:** story checkpoints 1, 2, 3, 4.

### Dark Ritual — `Action.DarkRitual`

- **Identity:** `multipart` / `MultipartAction` · `townNum=1` · `varName=DarkRitual` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2621)
- **Cost:** mana `Math.ceil(50000 * (1 - towns[1].getLevel("Witch") * 0.005))` · goldCost() `Math.ceil(50 * (getBuffLevel("Ritual") + 1) * getSkillBonus("Commune"))` · allowed `1`
- **Gates:** visible `towns[1].getLevel("Witch") >= 20` · unlocked `towns[1].getLevel("Witch") >= 50 && getSkillLevel("Dark") >= 50` · canStart `resources.reputation <= -5 && loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Ritual") < getBuffCap("Ritual")`
- **Growth:** stat weights `Spd:0.1, Int:0.1, Soul:0.8`; skills `none`; grants `Ritual`
- **Effects:** buff, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Explore Forest — `Action.ExploreForest`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Forest` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1882)
- **Cost:** mana `400`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Per:0.4, Con:0.2, Spd:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8. **Affected by:** `Buy Glasses`.

### Follow Flowers — `Action.FollowFlowers`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Flowers` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2397)
- **Cost:** mana `300`
- **Gates:** visible `towns[1].getLevel("Forest") >= 30` · unlocked `towns[1].getLevel("Forest") >= 50`
- **Growth:** stat weights `Per:0.7, Con:0.1, Spd:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Buy Glasses`.

### Gather Herbs — `Action.GatherHerbs`

- **Identity:** `limited` / `Action` · `townNum=1` · `varName=Herbs` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1985)
- **Cost:** mana `Math.ceil(200 * (1 - towns[1].getLevel("Hermit") * 0.005))`
- **Gates:** visible `towns[1].getLevel("Forest") >= 2` · unlocked `towns[1].getLevel("Forest") >= 10`
- **Growth:** stat weights `Str:0.4, Dex:0.3, Int:0.3`; skills `none`
- **Effects:** resource:herbs, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

### HaulZ1 — `Action.HaulZ1`

- **Identity:** `limited` / `Action` · `townNum=1` · `varName=StonesZ1` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L752)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("RuinsZ" + townNum ) > 0` · unlocked `towns[this.townNum].getLevel("RuinsZ" + townNum) > 0` · canStart `!resources.stone && stonesUsed[this.townNum] < 250`
- **Growth:** stat weights `Str:0.4, Con:0.6`; skills `none`
- **Effects:** resource:stone, limited-item discovery. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### Hunt — `Action.Hunt`

- **Identity:** `limited` / `Action` · `townNum=1` · `varName=Hunt` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2023)
- **Cost:** mana `800`
- **Gates:** visible `towns[1].getLevel("Forest") >= 10` · unlocked `towns[1].getLevel("Forest") >= 40`
- **Growth:** stat weights `Dex:0.2, Con:0.2, Per:0.2, Spd:0.4`; skills `none`
- **Effects:** resource:hide, limited-item discovery. **Story:** story checkpoints 1, 2, 3, 4.

### Learn Alchemy — `Action.LearnAlchemy`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=LearnAlchemy` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2229)
- **Cost:** mana `Math.ceil(5000 * (1 - towns[1].getLevel("Hermit") * 0.005))` · extra cost callback
- **Gates:** visible `towns[1].getLevel("Hermit") >= 10` · unlocked `towns[1].getLevel("Hermit") >= 40 && getSkillLevel("Magic") >= 60` · canStart `resources.herbs >= 10`
- **Growth:** stat weights `Con:0.3, Per:0.1, Int:0.6`; skills `Magic:50, Alchemy:50`
- **Effects:** resource:herbs, skill XP. **Story:** story checkpoints 1, 2, 3, 4.

### Old Shortcut — `Action.OldShortcut`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Shortcut` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2098)
- **Cost:** mana `800`
- **Gates:** visible `true` · unlocked `towns[1].getLevel("Forest") >= 20`
- **Growth:** stat weights `Per:0.3, Con:0.4, Spd:0.2, Luck:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.

### Practical Magic — `Action.PracticalMagic`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=PracticalMagic` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2189)
- **Cost:** mana `Math.ceil(4000 * (1 - towns[1].getLevel("Hermit") * 0.005))`
- **Gates:** visible `towns[1].getLevel("Hermit") >= 10` · unlocked `towns[1].getLevel("Hermit") >= 20 && getSkillLevel("Magic") >= 50`
- **Growth:** stat weights `Per:0.3, Con:0.2, Int:0.5`; skills `Practical:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3.

### RuinsZ1 — `Action.RuinsZ1`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=RuinsZ1` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L687)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### Sit By Waterfall — `Action.SitByWaterfall`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=SitByWaterfall` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2063)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[1].getLevel("Forest") >= 10` · unlocked `towns[1].getLevel("Forest") >= 70`
- **Growth:** stat weights `Con:0.2, Soul:0.8`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### SurveyZ1 — `Action.SurveyZ1`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=SurveyZ1` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L638)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Talk To Hermit — `Action.TalkToHermit`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Hermit` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2143)
- **Cost:** mana `1200`
- **Gates:** visible `true` · unlocked `towns[1].getLevel("Shortcut") >= 20 && getSkillLevel("Magic") >= 40`
- **Growth:** stat weights `Con:0.5, Cha:0.3, Soul:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.

### Talk To Witch — `Action.TalkToWitch`

- **Identity:** `progress` / `Action` · `townNum=1` · `varName=Witch` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2525)
- **Cost:** mana `1500`
- **Gates:** visible `towns[1].getLevel("Thicket") >= 20` · unlocked `towns[1].getLevel("Thicket") >= 60 && getSkillLevel("Magic") >= 80`
- **Growth:** stat weights `Cha:0.3, Int:0.2, Soul:0.5`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8.

### Train Dexterity — `Action.TrainDexterity`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=TrainDexterity` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2327)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[1].getLevel("Forest") >= 20` · unlocked `towns[1].getLevel("Forest") >= 60`
- **Growth:** stat weights `Dex:0.8, Con:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Train Speed — `Action.TrainSpeed`

- **Identity:** `normal` / `Action` · `townNum=1` · `varName=TrainSpeed` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2362)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[1].getLevel("Forest") >= 20` · unlocked `towns[1].getLevel("Forest") >= 80`
- **Growth:** stat weights `Spd:0.8, Con:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Wild Mana — `Action.WildMana`

- **Identity:** `limited` / `Action` · `townNum=1` · `varName=WildMana` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L1944)
- **Cost:** mana `Math.ceil(150 * getSkillBonus("Practical"))` · goldCost() `Math.floor(250 * getSkillBonus("Dark"))`
- **Gates:** visible `true` · unlocked `towns[1].getLevel("Forest") >= 2`
- **Growth:** stat weights `Con:0.2, Int:0.6, Soul:0.2`; skills `none`
- **Effects:** mana budget, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

## Zone 2 — Merchanton (20 actions)

### Adventure Guild — `Action.AdventureGuild`

- **Identity:** `multipart` / `MultipartAction` · `townNum=2` · `varName=AdvGuild` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3061)
- **Cost:** mana `3000` · allowed `1`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 5` · unlocked `towns[2].getLevel("Drunk") >= 20` · canStart `guild === ""`
- **Growth:** stat weights `Str:0.4, Dex:0.3, Con:0.3`; skills `none`
- **Effects:** mana budget, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Apprentice — `Action.Apprentice`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=Apprentice` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3427)
- **Cost:** mana `2000`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 20` · unlocked `towns[2].getLevel("Drunk") >= 40` · canStart `guild === "Crafting"`
- **Growth:** stat weights `Dex:0.2, Int:0.4, Cha:0.4`; skills `Crafting:dynamic`
- **Effects:** progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Crafting Guild`.

### Architect — `Action.Architect`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=Architect` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3533)
- **Cost:** mana `2000`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 60` · unlocked `towns[2].getLevel("Drunk") >= 80 && towns[2].getLevel("Mason") >= 100` · canStart `guild === "Crafting"`
- **Growth:** stat weights `Dex:0.2, Int:0.6, Cha:0.2`; skills `Crafting:dynamic`
- **Effects:** progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Crafting Guild`.

### AssassinZ2 — `Action.AssassinZ2`

- **Identity:** `multipart` / `AssassinAction` · `townNum=2` · `varName=AssassinZ2` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L767)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Buy Mana Z3 — `Action.BuyManaZ3`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=BuyManaZ3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2980)
- **Cost:** mana `100` · goldCost() `Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige())`
- **Gates:** visible `true` · unlocked `true` · canStart `!portalUsed`
- **Growth:** stat weights `Cha:0.7, Int:0.2, Luck:0.1`; skills `none`
- **Effects:** mana budget, story flag. **Story:** story checkpoints 1.

### Buy Pickaxe — `Action.BuyPickaxe`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=BuyPickaxe` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3625)
- **Cost:** mana `3000` · allowed `1` · extra cost callback
- **Gates:** visible `towns[2].getLevel("City") >= 60` · unlocked `towns[2].getLevel("City") >= 90` · canStart `resources.gold >= 200`
- **Growth:** stat weights `Cha:0.8, Int:0.1, Spd:0.1`; skills `none`
- **Effects:** resource:gold, resource:pickaxe, story flag. **Story:** story checkpoints 1.

### Craft Armor — `Action.CraftArmor`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=CraftArmor` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3380)
- **Cost:** mana `1000` · extra cost callback
- **Gates:** visible `towns[2].getLevel("Drunk") >= 15` · unlocked `towns[2].getLevel("Drunk") >= 30` · canStart `resources.hide >= 2`
- **Growth:** stat weights `Str:0.1, Dex:0.3, Con:0.3, Int:0.3`; skills `none`
- **Effects:** resource:hide, resource:armor, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### Crafting Guild — `Action.CraftingGuild`

- **Identity:** `multipart` / `MultipartAction` · `townNum=2` · `varName=CraftGuild` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3275)
- **Cost:** mana `3000` · allowed `1`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 5` · unlocked `towns[2].getLevel("Drunk") >= 30` · canStart `guild === ""`
- **Growth:** stat weights `Dex:0.3, Per:0.3, Int:0.4`; skills `Crafting:50`
- **Effects:** resource:gold, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Explore City — `Action.ExploreCity`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=City` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2823)
- **Cost:** mana `750`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Con:0.1, Per:0.3, Cha:0.2, Spd:0.3, Luck:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9. **Affected by:** `Buy Glasses`.

### Gamble — `Action.Gamble`

- **Identity:** `limited` / `Action` · `townNum=2` · `varName=Gamble` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2878)
- **Cost:** mana `1000` · extra cost callback
- **Gates:** visible `true` · unlocked `towns[2].getLevel("City") >= 10` · canStart `resources.gold >= 20 && resources.reputation >= -5`
- **Growth:** stat weights `Cha:0.2, Luck:0.8`; skills `none`
- **Effects:** resource:gold, resource:reputation, limited-item discovery. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.

### Gather Team — `Action.GatherTeam`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=GatherTeam` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3162)
- **Cost:** mana `2000` · allowed `5 + Math.floor(getSkillLevel("Leadership") / 100)` · extra cost callback
- **Gates:** visible `towns[2].getLevel("Drunk") >= 10` · unlocked `towns[2].getLevel("Drunk") >= 20` · canStart `guild === "Adventure" && resources.gold >= (resources.teamMembers + 1) * 100`
- **Growth:** stat weights `Per:0.2, Cha:0.5, Int:0.2, Luck:0.1`; skills `none`
- **Effects:** resource:gold, resource:teamMembers, story flag. **Story:** story checkpoints 1, 2, 3. **Affected by:** `Adventure Guild`.

### Get Drunk — `Action.GetDrunk`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=Drunk` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L2928)
- **Cost:** mana `1000` · extra cost callback
- **Gates:** visible `true` · unlocked `towns[2].getLevel("City") >= 20` · canStart `resources.reputation >= -3`
- **Growth:** stat weights `Str:0.1, Cha:0.5, Con:0.2, Soul:0.2`; skills `none`
- **Effects:** resource:reputation, progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8.

### Heroes Trial — `Action.HeroesTrial`

- **Identity:** `multipart` / `TrialAction` · `townNum=2` · `varName=HTrial` · `segments=9` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3665)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100` · canStart `this.currentFloor() < trialFloors[this.trialNum]`
- **Growth:** stat weights `Dex:0.11, Str:0.11, Con:0.11, Spd:0.11, Per:0.11, Cha:0.11, Int:0.11, Luck:0.11, Soul:0.11`; skills `Combat:500, Pyromancy:100, Restoration:100`; grants `Heroism`
- **Effects:** skill XP, buff, story flag. **Story:** story checkpoints 1, 2, 3, 4. **Affected by:** `Team`.
- **Extra hooks:** `loopCost`, `tickProgress`, `floorReward`; inspect segment/floor formulas in source.

### Large Dungeon — `Action.LargeDungeon`

- **Identity:** `multipart` / `DungeonAction` · `townNum=2` · `varName=LDungeon` · `segments=7` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3210)
- **Cost:** mana `6000`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 5` · unlocked `towns[2].getLevel("Drunk") >= 20` · canStart `resources.teamMembers >= 1 && curFloor < dungeons[this.dungeonNum].length`
- **Growth:** stat weights `Str:0.2, Dex:0.2, Con:0.2, Cha:0.3, Luck:0.1`; skills `Combat:15, Magic:15`
- **Effects:** skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5. **Affected by:** `Gather Team`.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Mason — `Action.Mason`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=Mason` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3480)
- **Cost:** mana `2000`
- **Gates:** visible `towns[2].getLevel("Drunk") >= 40` · unlocked `towns[2].getLevel("Drunk") >= 60 && towns[2].getLevel("Apprentice") >= 100` · canStart `guild === "Crafting"`
- **Growth:** stat weights `Dex:0.2, Int:0.5, Cha:0.3`; skills `Crafting:dynamic`
- **Effects:** progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Crafting Guild`.

### Read Books — `Action.ReadBooks`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=ReadBooks` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3586)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[2].getLevel("City") >= 5` · unlocked `towns[2].getLevel("City") >= 50` · canStart `resources.glasses`
- **Growth:** stat weights `Int:0.8, Soul:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5. **Affected by:** `Buy Glasses`.

### Sell Potions — `Action.SellPotions`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=SellPotions` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3017)
- **Cost:** mana `1000`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Cha:0.7, Int:0.2, Luck:0.1`; skills `none`
- **Effects:** resource:gold, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### Start Trek — `Action.StartTrek`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=StartTrek` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3732)
- **Cost:** mana `Math.ceil(12000)` · allowed `(checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1`
- **Gates:** visible `towns[2].getLevel("City") >= 30` · unlocked `towns[2].getLevel("City") >= 60`
- **Growth:** stat weights `Con:0.7, Per:0.2, Spd:0.1`; skills `none`
- **Effects:** zone unlock. **Story:** story checkpoints 1.

### SurveyZ2 — `Action.SurveyZ2`

- **Identity:** `progress` / `Action` · `townNum=2` · `varName=SurveyZ2` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L639)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Underworld — `Action.Underworld`

- **Identity:** `normal` / `Action` · `townNum=2` · `varName=Underworld` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3768)
- **Cost:** mana `50000` · goldCost() `500` · allowed `1` · extra cost callback
- **Gates:** visible `getExploreProgress() > 25` · unlocked `getExploreProgress() >= 50` · canStart `resources.gold >= 500`
- **Growth:** stat weights `Cha:0.5, Per:0.5`; skills `none`
- **Effects:** resource:gold, story flag, zone unlock. **Story:** story checkpoints 1.

## Zone 3 — Mt. Olympus (19 actions)

### AssassinZ3 — `Action.AssassinZ3`

- **Identity:** `multipart` / `AssassinAction` · `townNum=3` · `varName=AssassinZ3` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L770)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Check Walls — `Action.CheckWalls`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=Illusions` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4233)
- **Cost:** mana `3000`
- **Gates:** visible `towns[3].getLevel("Cavern") >= 40` · unlocked `towns[3].getLevel("Cavern") >= 80`
- **Growth:** stat weights `Spd:0.1, Dex:0.1, Per:0.4, Int:0.4`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8.

### Chronomancy — `Action.Chronomancy`

- **Identity:** `normal` / `Action` · `townNum=3` · `varName=Chronomancy` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3953)
- **Cost:** mana `Math.ceil(10000 * (1 - towns[3].getLevel("Runes") * 0.005))`
- **Gates:** visible `towns[3].getLevel("Runes") >= 8` · unlocked `towns[3].getLevel("Runes") >= 30 && getSkillLevel("Magic") >= 150`
- **Growth:** stat weights `Soul:0.1, Spd:0.3, Int:0.6`; skills `Chronomancy:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4.

### Climb Mountain — `Action.ClimbMountain`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=Mountain` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3813)
- **Cost:** mana `800`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Dex:0.1, Str:0.2, Con:0.4, Per:0.2, Spd:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Buy Pickaxe`.

### Decipher Runes — `Action.DecipherRunes`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=Runes` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3906)
- **Cost:** mana `1200`
- **Gates:** visible `towns[3].getLevel("Mountain") >= 2` · unlocked `towns[3].getLevel("Mountain") >= 20`
- **Growth:** stat weights `Per:0.3, Int:0.7`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8. **Affected by:** `Buy Glasses`.

### Explore Cavern — `Action.ExploreCavern`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=Cavern` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4077)
- **Cost:** mana `1500`
- **Gates:** visible `towns[3].getLevel("Mountain") >= 10` · unlocked `towns[3].getLevel("Mountain") >= 40`
- **Growth:** stat weights `Dex:0.1, Str:0.3, Con:0.2, Per:0.3, Spd:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8.

### Face Judgement — `Action.FaceJudgement`

- **Identity:** `normal` / `Action` · `townNum=3` · `varName=FaceJudgement` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4463)
- **Cost:** mana `30000` · allowed `1`
- **Gates:** visible `towns[3].getLevel("Mountain") >= 40` · unlocked `towns[3].getLevel("Mountain") >= 100`
- **Growth:** stat weights `Cha:0.3, Luck:0.2, Soul:0.5`; skills `none`
- **Effects:** story flag, zone unlock. **Story:** story checkpoints 1, 2, 3, 4.

### Guru — `Action.Guru`

- **Identity:** `normal` / `Action` · `townNum=3` · `varName=Guru` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4513)
- **Cost:** mana `100000` · allowed `1` · extra cost callback
- **Gates:** visible `getExploreProgress() > 75` · unlocked `getExploreProgress() >= 100` · canStart `resources.herbs >= 1000`
- **Growth:** stat weights `Cha:0.5, Soul:0.5`; skills `none`
- **Effects:** resource:herbs, story flag, zone unlock. **Story:** story checkpoints 1.

### HaulZ3 — `Action.HaulZ3`

- **Identity:** `limited` / `Action` · `townNum=3` · `varName=StonesZ3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L753)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("RuinsZ" + townNum ) > 0` · unlocked `towns[this.townNum].getLevel("RuinsZ" + townNum) > 0` · canStart `!resources.stone && stonesUsed[this.townNum] < 250`
- **Growth:** stat weights `Str:0.4, Con:0.6`; skills `none`
- **Effects:** resource:stone, limited-item discovery. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### Hunt Trolls — `Action.HuntTrolls`

- **Identity:** `multipart` / `MultipartAction` · `townNum=3` · `varName=HuntTrolls` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4176)
- **Cost:** mana `8000`
- **Gates:** visible `towns[3].getLevel("Cavern") >= 5` · unlocked `towns[3].getLevel("Cavern") >= 50`
- **Growth:** stat weights `Str:0.3, Dex:0.3, Con:0.2, Per:0.1, Int:0.1`; skills `Combat:1000`
- **Effects:** resource:blood, skill XP, story flag. **Story:** story checkpoints 1, 2, 3.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Imbue Body — `Action.ImbueBody`

- **Identity:** `multipart` / `MultipartAction` · `townNum=3` · `varName=ImbueBody` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4386)
- **Cost:** mana `500000` · goldCost() `getBuffLevel("Imbuement2") + 1` · allowed `1`
- **Gates:** visible callback (see source) · unlocked `getBuffLevel("Imbuement") >= 1` · canStart `loopCounter === 0 && (getBuffLevel("Imbuement") > getBuffLevel("Imbuement2")) && tempCanStart`
- **Growth:** stat weights `Dex:0.1, Str:0.1, Con:0.8`; skills `none`; grants `Imbuement2`
- **Effects:** buff. **Story:** story checkpoints 1, 2, 3, 4, 5.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Imbue Mind — `Action.ImbueMind`

- **Identity:** `multipart` / `MultipartAction` · `townNum=3` · `varName=ImbueMind` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4321)
- **Cost:** mana `500000` · goldCost() `20 * (getBuffLevel("Imbuement") + 1)` · allowed `1`
- **Gates:** visible `towns[3].getLevel("Illusions") >= 50` · unlocked `towns[3].getLevel("Illusions") >= 70 && getSkillLevel("Magic") >= 300` · canStart `loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Imbuement") < getBuffCap("Imbuement")`
- **Growth:** stat weights `Spd:0.1, Per:0.1, Int:0.8`; skills `none`; grants `Imbuement`
- **Effects:** buff, story flag. **Story:** story checkpoints 1, 2, 3, 4.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Looping Potion — `Action.LoopingPotion`

- **Identity:** `normal` / `Action` · `townNum=3` · `varName=LoopingPotion` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3992)
- **Cost:** mana `Math.ceil(30000)` · extra cost callback
- **Gates:** visible `getSkillLevel("Spatiomancy") >= 1` · unlocked `getSkillLevel("Alchemy") >= 200` · canStart `resources.herbs >= 400`
- **Growth:** stat weights `Dex:0.2, Int:0.7, Soul:0.1`; skills `Alchemy:100`
- **Effects:** resource:herbs, resource:loopingPotion, skill XP. **Story:** story checkpoints 1.

### Mana Geyser — `Action.ManaGeyser`

- **Identity:** `limited` / `Action` · `townNum=3` · `varName=Geysers` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L3859)
- **Cost:** mana `Math.ceil(2000 * getSkillBonus("Spatiomancy"))`
- **Gates:** visible `true` · unlocked `towns[3].getLevel("Mountain") >= 2` · canStart `resources.pickaxe`
- **Growth:** stat weights `Str:0.6, Per:0.3, Int:0.1`; skills `none`
- **Effects:** mana budget, limited-item discovery. **Story:** story checkpoints 1, 2, 3. **Affected by:** `Buy Pickaxe`.

### Mine Soulstones — `Action.MineSoulstones`

- **Identity:** `limited` / `Action` · `townNum=3` · `varName=MineSoulstones` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4124)
- **Cost:** mana `5000`
- **Gates:** visible `towns[3].getLevel("Cavern") >= 2` · unlocked `towns[3].getLevel("Cavern") >= 20` · canStart `resources.pickaxe`
- **Growth:** stat weights `Str:0.6, Dex:0.1, Con:0.3`; skills `none`
- **Effects:** limited-item discovery. **Story:** story checkpoints 1, 2, 3, 4. **Affected by:** `Buy Pickaxe`.

### Pyromancy — `Action.Pyromancy`

- **Identity:** `normal` / `Action` · `townNum=3` · `varName=Pyromancy` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4036)
- **Cost:** mana `Math.ceil(14000 * (1 - towns[3].getLevel("Runes") * 0.005))`
- **Gates:** visible `towns[3].getLevel("Runes") >= 16` · unlocked `towns[3].getLevel("Runes") >= 60 && getSkillLevel("Magic") >= 200`
- **Growth:** stat weights `Per:0.2, Int:0.7, Soul:0.1`; skills `Pyromancy:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5.

### RuinsZ3 — `Action.RuinsZ3`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=RuinsZ3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L688)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### SurveyZ3 — `Action.SurveyZ3`

- **Identity:** `progress` / `Action` · `townNum=3` · `varName=SurveyZ3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L640)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Take Artifacts — `Action.TakeArtifacts`

- **Identity:** `limited` / `Action` · `townNum=3` · `varName=Artifacts` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4279)
- **Cost:** mana `1500`
- **Gates:** visible `towns[3].getLevel("Illusions") >= 1` · unlocked `towns[3].getLevel("Illusions") >= 5`
- **Growth:** stat weights `Spd:0.2, Per:0.6, Int:0.2`; skills `none`
- **Effects:** resource:artifacts, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

## Zone 4 — Valhalla (25 actions)

### Accept Donations — `Action.AcceptDonations`

- **Identity:** `limited` / `Action` · `townNum=4` · `varName=Donations` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4688)
- **Cost:** mana `2000` · extra cost callback
- **Gates:** visible `true` · unlocked `towns[4].getLevel("Canvassed") >= 5` · canStart `resources.reputation > 0`
- **Growth:** stat weights `Con:0.1, Cha:0.2, Spd:0.3, Luck:0.4`; skills `none`
- **Effects:** resource:reputation, resource:gold, limited-item discovery, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### AssassinZ4 — `Action.AssassinZ4`

- **Identity:** `multipart` / `AssassinAction` · `townNum=4` · `varName=AssassinZ4` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L773)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Build Housing — `Action.BuildHousing`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=BuildHousing` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5293)
- **Cost:** mana `2000`
- **Gates:** visible `towns[4].getLevel("Citizen") >= 80` · unlocked `towns[4].getLevel("Citizen") >= 100` · canStart `guild === "Crafting" && towns[4].getLevel("Citizen") >= 100 && resources.houses < maxHouses`
- **Growth:** stat weights `Str:0.4, Con:0.3, Dex:0.2, Spd:0.1`; skills `Crafting:100`
- **Effects:** resource:houses, skill XP, story flag. **Story:** story checkpoints 1, 2, 3. **Affected by:** `Crafting Guild`.

### Buy Mana Z5 — `Action.BuyManaZ5`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=BuyManaZ5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4789)
- **Cost:** mana `100` · goldCost() `Math.floor(50 * getSkillBonus("Mercantilism") * adjustGoldCostFromPrestige())`
- **Gates:** visible `true` · unlocked `true` · canStart `!portalUsed`
- **Growth:** stat weights `Cha:0.7, Int:0.2, Luck:0.1`; skills `none`
- **Effects:** mana budget, story flag. **Story:** story checkpoints 1.

### Canvass — `Action.Canvass`

- **Identity:** `progress` / `Action` · `townNum=4` · `varName=Canvassed` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4610)
- **Cost:** mana `4000`
- **Gates:** visible `true` · unlocked `towns[4].getLevel("Tour") >= 10`
- **Growth:** stat weights `Con:0.1, Cha:0.5, Spd:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.

### Charm School — `Action.CharmSchool`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=CharmSchool` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4942)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[4].getLevel("Tour") >= 20` · unlocked `towns[4].getLevel("Tour") >= 30`
- **Growth:** stat weights `Cha:0.8, Int:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Collect Taxes — `Action.CollectTaxes`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=CollectTaxes` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5339)
- **Cost:** mana `10000` · allowed `1`
- **Gates:** visible `towns[4].getLevel("Citizen") >= 60` · unlocked `towns[4].getLevel("Citizen") >= 100 && getSkillLevel("Mercantilism") > 0` · canStart `resources.houses > 0`
- **Growth:** stat weights `Cha:0.4, Spd:0.2, Per:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:gold, story flag. **Story:** story checkpoints 1, 2. **Affected by:** `Build Housing`.

### Donate — `Action.Donate`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Donate` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4652)
- **Cost:** mana `2000`
- **Gates:** visible `true` · unlocked `towns[4].getLevel("Canvassed") >= 5` · canStart `resources.gold >= 20`
- **Growth:** stat weights `Per:0.2, Cha:0.2, Spd:0.2, Int:0.4`; skills `none`
- **Effects:** resource:gold, resource:reputation, story flag. **Story:** story checkpoints 1.

### Enchant Armor — `Action.EnchantArmor`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=EnchantArmor` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5010)
- **Cost:** mana `1000` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 30` · unlocked `towns[4].getLevel("Tour") >= 40` · canStart `resources.favors >= 1 && resources.armor >= 1`
- **Growth:** stat weights `Cha:0.6, Int:0.2, Luck:0.2`; skills `Crafting:50`
- **Effects:** resource:favors, resource:armor, resource:enchantments, skill XP, story flag. **Story:** story checkpoints 1, 2, 3.

### Fall From Grace — `Action.FallFromGrace`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=FallFromGrace` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5642)
- **Cost:** mana `30000` · allowed `1`
- **Gates:** visible `true` · unlocked `getSkillLevel("Pyromancy") >= 200`
- **Growth:** stat weights `Dex:0.4, Luck:0.3, Spd:0.2, Int:0.1`; skills `none`
- **Effects:** story flag, zone unlock. **Story:** story checkpoints 1.

### Fight Frost Giants — `Action.FightFrostGiants`

- **Identity:** `multipart` / `MultipartAction` · `townNum=4` · `varName=FightFrostGiants` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5426)
- **Cost:** mana `20000` · allowed `1`
- **Gates:** visible `towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus` · unlocked `towns[4].getLevel("Citizen") >= 100` · canStart `resources.pegasus`
- **Growth:** stat weights `Str:0.5, Con:0.3, Per:0.2`; skills `Combat:1500`
- **Effects:** skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11. **Affected by:** `Pegasus`.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Gift Artifact — `Action.GiftArtifact`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=GiftArtifact` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4861)
- **Cost:** mana `500` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 10` · unlocked `towns[4].getLevel("Tour") >= 20` · canStart `resources.artifacts >= 1`
- **Growth:** stat weights `Cha:0.6, Luck:0.3, Soul:0.1`; skills `none`
- **Effects:** resource:artifacts, resource:favors, story flag. **Story:** story checkpoints 1, 2, 3.

### Great Feast — `Action.GreatFeast`

- **Identity:** `multipart` / `MultipartAction` · `townNum=4` · `varName=GreatFeast` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5586)
- **Cost:** mana `5000000` · goldCost() `Math.ceil(5000 * (getBuffLevel("Feast") + 1) * getSkillBonus("Gluttony"))` · allowed `1`
- **Gates:** visible `towns[4].getLevel("Tour") >= 80` · unlocked `towns[4].getLevel("Tour") >= 100` · canStart `resources.reputation >= 100 && loopCounter === 0 && checkSoulstoneSac(this.goldCost()) && getBuffLevel("Feast") < getBuffCap("Feast")`
- **Growth:** stat weights `Spd:0.1, Int:0.1, Soul:0.8`; skills `none`; grants `Feast`
- **Effects:** buff, story flag. **Story:** story checkpoints 1, 2.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Guided Tour — `Action.GuidedTour`

- **Identity:** `progress` / `Action` · `townNum=4` · `varName=Tour` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4554)
- **Cost:** mana `2500` · extra cost callback
- **Gates:** visible `true` · unlocked `true` · canStart `resources.gold >= 10`
- **Growth:** stat weights `Per:0.3, Con:0.2, Cha:0.3, Int:0.1, Luck:0.1`; skills `none`
- **Effects:** resource:gold, progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9. **Affected by:** `Buy Glasses`.

### Mercantilism — `Action.Mercantilism`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Mercantilism` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4900)
- **Cost:** mana `10000` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 20` · unlocked `towns[4].getLevel("Tour") >= 30` · canStart `resources.reputation > 0`
- **Growth:** stat weights `Per:0.2, Int:0.7, Soul:0.1`; skills `Mercantilism:100`
- **Effects:** resource:reputation, skill XP. **Story:** story checkpoints 1, 2, 3, 4.

### Oracle — `Action.Oracle`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Oracle` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4976)
- **Cost:** mana `2000` · allowed `trainingLimits`
- **Gates:** visible `towns[4].getLevel("Tour") >= 30` · unlocked `towns[4].getLevel("Tour") >= 40`
- **Growth:** stat weights `Luck:0.8, Soul:0.2`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Pegasus — `Action.Pegasus`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Pegasus` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5383)
- **Cost:** mana `3000` · allowed `1` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 70` · unlocked `towns[4].getLevel("Tour") >= 90` · canStart `resources.gold >= 200 && resources.favors >= 20`
- **Growth:** stat weights `Soul:0.3, Cha:0.2, Luck:0.2, Int:0.3`; skills `none`
- **Effects:** resource:favors, resource:gold, resource:pegasus, story flag. **Story:** story checkpoints 1, 2.

### Restoration — `Action.Restoration`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Restoration` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5164)
- **Cost:** mana `15000 / getWizCollegeRank().bonus`
- **Gates:** visible `towns[4].getLevel("Tour") >= 40` · unlocked `towns[4].getLevel("Tour") >= 60` · canStart `resources.wizardCollege`
- **Growth:** stat weights `Int:0.5, Soul:0.3, Con:0.2`; skills `Restoration:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4. **Affected by:** `Wizard College`.

### Seek Blessing — `Action.SeekBlessing`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=SeekBlessing` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5543)
- **Cost:** mana `1000000` · allowed `1`
- **Gates:** visible `towns[4].getLevel("Citizen") >= 80 || storyFlags.acquiredPegasus` · unlocked `towns[4].getLevel("Citizen") >= 100` · canStart `resources.pegasus`
- **Growth:** stat weights `Cha:0.5, Luck:0.5`; skills `Divine:50`
- **Effects:** skill XP, story flag. **Story:** story checkpoints 1, 2, 3. **Affected by:** `Pegasus`.

### Seek Citizenship — `Action.SeekCitizenship`

- **Identity:** `progress` / `Action` · `townNum=4` · `varName=Citizen` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5254)
- **Cost:** mana `1500`
- **Gates:** visible `towns[4].getLevel("Tour") >= 60` · unlocked `towns[4].getLevel("Tour") >= 80`
- **Growth:** stat weights `Cha:0.5, Int:0.2, Luck:0.2, Per:0.1`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7.

### Sell Artifact — `Action.SellArtifact`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=SellArtifact` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4825)
- **Cost:** mana `500` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 10` · unlocked `towns[4].getLevel("Tour") >= 20` · canStart `resources.artifacts >= 1`
- **Growth:** stat weights `Cha:0.4, Per:0.3, Luck:0.2, Soul:0.1`; skills `none`
- **Effects:** resource:artifacts, resource:gold, story flag. **Story:** story checkpoints 1.

### Spatiomancy — `Action.Spatiomancy`

- **Identity:** `normal` / `Action` · `townNum=4` · `varName=Spatiomancy` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5202)
- **Cost:** mana `20000 / getWizCollegeRank().bonus`
- **Gates:** visible `towns[4].getLevel("Tour") >= 40` · unlocked `towns[4].getLevel("Tour") >= 60` · canStart `resources.wizardCollege`
- **Growth:** stat weights `Int:0.6, Con:0.2, Per:0.1, Spd:0.1`; skills `Spatiomancy:100`
- **Effects:** skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6. **Affected by:** `Wizard College`.

### SurveyZ4 — `Action.SurveyZ4`

- **Identity:** `progress` / `Action` · `townNum=4` · `varName=SurveyZ4` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L641)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Tidy Up — `Action.TidyUp`

- **Identity:** `multipart` / `MultipartAction` · `townNum=4` · `varName=Tidy` · `segments=4` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L4738)
- **Cost:** mana `10000`
- **Gates:** visible `towns[4].getLevel("Canvassed") >= 10` · unlocked `towns[4].getLevel("Canvassed") >= 30`
- **Growth:** stat weights `Spd:0.3, Dex:0.3, Str:0.2, Con:0.2`; skills `none`
- **Effects:** resource:reputation, resource:gold, story flag. **Story:** story checkpoints 1, 5, 6, 7.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### Wizard College — `Action.WizardCollege`

- **Identity:** `multipart` / `MultipartAction` · `townNum=4` · `varName=wizCollege` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5054)
- **Cost:** mana `10000` · allowed `1` · extra cost callback
- **Gates:** visible `towns[4].getLevel("Tour") >= 40` · unlocked `towns[4].getLevel("Tour") >= 60` · canStart `resources.gold >= 500 && resources.favors >= 10`
- **Growth:** stat weights `Int:0.5, Soul:0.3, Cha:0.2`; skills `none`
- **Effects:** resource:gold, resource:favors, story variable. **Story:** story checkpoints 1, 12, 2, 3, 4, 6, 8, 10, 13.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

## Zone 5 — Startington (13 actions)

### AssassinZ5 — `Action.AssassinZ5`

- **Identity:** `multipart` / `AssassinAction` · `townNum=5` · `varName=AssassinZ5` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L776)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Dark Sacrifice — `Action.DarkSacrifice`

- **Identity:** `normal` / `Action` · `townNum=5` · `varName=DarkSacrifice` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5857)
- **Cost:** mana `20000` · extra cost callback
- **Gates:** visible `towns[5].getLevel("Meander") >= 25` · unlocked `getBuffLevel("Ritual") >= 60` · canStart `resources.blood >= 1`
- **Growth:** stat weights `Int:0.2, Soul:0.8`; skills `Commune:100`
- **Effects:** resource:blood, skill XP. **Story:** story checkpoints 1, 2, 3.

### Dead Trial — `Action.DeadTrial`

- **Identity:** `multipart` / `TrialAction` · `townNum=5` · `varName=DeadTrial` · `segments=4` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6001)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100` · canStart `this.currentFloor() < trialFloors[this.trialNum]`
- **Growth:** stat weights `Cha:0.25, Int:0.25, Luck:0.25, Soul:0.25`; skills `none`
- **Effects:** resource:zombie, story flag. **Story:** story checkpoints 1, 2, 3. **Affected by:** `RaiseZombie`.
- **Extra hooks:** `loopCost`, `tickProgress`, `floorReward`; inspect segment/floor formulas in source.

### Destroy Pylons — `Action.DestroyPylons`

- **Identity:** `limited` / `Action` · `townNum=5` · `varName=Pylons` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5780)
- **Cost:** mana `10000`
- **Gates:** visible `towns[5].getLevel("Meander") >= 1` · unlocked `towns[5].getLevel("Meander") >= 5`
- **Growth:** stat weights `Str:0.4, Dex:0.3, Int:0.3`; skills `none`
- **Effects:** resource:pylons, limited-item discovery. **Story:** story checkpoints 1, 2, 3.

### HaulZ5 — `Action.HaulZ5`

- **Identity:** `limited` / `Action` · `townNum=5` · `varName=StonesZ5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L754)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("RuinsZ" + townNum ) > 0` · unlocked `towns[this.townNum].getLevel("RuinsZ" + townNum) > 0` · canStart `!resources.stone && stonesUsed[this.townNum] < 250`
- **Growth:** stat weights `Str:0.4, Con:0.6`; skills `none`
- **Effects:** resource:stone, limited-item discovery. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### Journey Forth — `Action.JourneyForth`

- **Identity:** `normal` / `Action` · `townNum=5` · `varName=JourneyForth` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6050)
- **Cost:** mana `20000` · allowed `(checkActiveList ? getNumOnCurList : getNumOnList)("Open Portal") > 0 ? 2 : 1` · extra cost callback
- **Gates:** visible `towns[5].getLevel("Meander") >= 75` · unlocked `towns[5].getLevel("Meander") >= 100` · canStart `resources.supplies`
- **Growth:** stat weights `Con:0.4, Per:0.3, Spd:0.3`; skills `none`
- **Effects:** resource:supplies, zone unlock. **Story:** story checkpoints 1.

### Mana Well — `Action.ManaWell`

- **Identity:** `limited` / `Action` · `townNum=5` · `varName=Wells` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5727)
- **Cost:** mana `Math.ceil(2500 * getSkillBonus("Spatiomancy"))` · goldCost() `Math.max(5000 - Math.floor(10 * effectiveTime), 0)`
- **Gates:** visible `true` · unlocked `towns[5].getLevel("Meander") >= 2` · canStart `true`
- **Growth:** stat weights `Str:0.6, Per:0.3, Int:0.1`; skills `none`
- **Effects:** mana budget, limited-item discovery, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### Meander — `Action.Meander`

- **Identity:** `progress` / `Action` · `townNum=5` · `varName=Meander` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5682)
- **Cost:** mana `2500`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Per:0.2, Con:0.2, Cha:0.2, Spd:0.3, Luck:0.1`; skills `none`
- **Effects:** progress, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9. **Affected by:** `Imbue Mind`.

### Purchase Supplies — `Action.PurchaseSupplies`

- **Identity:** `normal` / `Action` · `townNum=5` · `varName=PurchaseSupplies` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5963)
- **Cost:** mana `2000` · allowed `1` · extra cost callback
- **Gates:** visible `towns[5].getLevel("Meander") >= 50` · unlocked `towns[5].getLevel("Meander") >= 75` · canStart `resources.gold >= 500 && !resources.supplies`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:gold, resource:supplies, story flag. **Story:** story checkpoints 1.

### Raise Zombie — `Action.RaiseZombie`

- **Identity:** `normal` / `Action` · `townNum=5` · `varName=RaiseZombie` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5815)
- **Cost:** mana `10000` · extra cost callback
- **Gates:** visible `towns[5].getLevel("Meander") >= 15` · unlocked `getSkillLevel("Dark") >= 1000` · canStart `resources.blood >= 1`
- **Growth:** stat weights `Con:0.4, Int:0.3, Soul:0.3`; skills `Dark:100`
- **Effects:** resource:blood, resource:zombie, skill XP, story flag, story variable. **Story:** story checkpoints 1, 3, 4.

### RuinsZ5 — `Action.RuinsZ5`

- **Identity:** `progress` / `Action` · `townNum=5` · `varName=RuinsZ5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L689)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### SurveyZ5 — `Action.SurveyZ5`

- **Identity:** `progress` / `Action` · `townNum=5` · `varName=SurveyZ5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L642)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### The Spire — `Action.TheSpire`

- **Identity:** `multipart` / `DungeonAction` · `townNum=5` · `varName=TheSpire` · `segments=9` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L5896)
- **Cost:** mana `100000`
- **Gates:** visible `towns[5].getLevel("Meander") >= 5` · unlocked `(getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35` · canStart `curFloor < dungeons[this.dungeonNum].length`
- **Growth:** stat weights `Str:0.1, Dex:0.1, Spd:0.1, Con:0.1, Per:0.2, Int:0.2, Soul:0.2`; skills `Combat:100`; grants `Aspirant`
- **Effects:** skill XP, buff, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6. **Affected by:** `Team`.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

## Zone 6 — Jungle Path (11 actions)

### AssassinZ6 — `Action.AssassinZ6`

- **Identity:** `multipart` / `AssassinAction` · `townNum=6` · `varName=AssassinZ6` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L779)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Escape — `Action.Escape`

- **Identity:** `normal` / `Action` · `townNum=6` · `varName=Escape` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6392)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `towns[6].getLevel("ExploreJungle") >= 75` · unlocked `towns[6].getLevel("ExploreJungle") >= 100` · canStart conditional / 3 return paths (see source)
- **Growth:** stat weights `Dex:0.2, Spd:0.8`; skills `none`
- **Effects:** zone unlock. **Story:** story checkpoints 1.

### Explore Jungle — `Action.ExploreJungle`

- **Identity:** `progress` / `Action` · `townNum=6` · `varName=ExploreJungle` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6093)
- **Cost:** mana `25000`
- **Gates:** visible `true` · unlocked `true`
- **Growth:** stat weights `Per:0.2, Con:0.2, Cha:0.2, Spd:0.3, Luck:0.1`; skills `none`
- **Effects:** resource:herbs, progress. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8. **Affected by:** `Fight Jungle Monsters`.

### Fight Jungle Monsters — `Action.FightJungleMonsters`

- **Identity:** `multipart` / `MultipartAction` · `townNum=6` · `varName=FightJungleMonsters` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6133)
- **Cost:** mana `30000`
- **Gates:** visible `true` · unlocked `true` · canStart `true`
- **Growth:** stat weights `Str:0.3, Dex:0.3, Per:0.4`; skills `Combat:2000`
- **Effects:** resource:blood, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

### HaulZ6 — `Action.HaulZ6`

- **Identity:** `limited` / `Action` · `townNum=6` · `varName=StonesZ6` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L755)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("RuinsZ" + townNum ) > 0` · unlocked `towns[this.townNum].getLevel("RuinsZ" + townNum) > 0` · canStart `!resources.stone && stonesUsed[this.townNum] < 250`
- **Growth:** stat weights `Str:0.4, Con:0.6`; skills `none`
- **Effects:** resource:stone, limited-item discovery. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### Open Portal — `Action.OpenPortal`

- **Identity:** `normal` / `Action` · `townNum=6` · `varName=OpenPortal` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6435)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getExploreProgress() > 50` · unlocked `getExploreProgress() >= 75 && getSkillLevel("Restoration") >= 1000` · canStart `getSkillLevel("Restoration") >= 1000`
- **Growth:** stat weights `Int:0.2, Luck:0.1, Soul:0.7`; skills `Restoration:2500`
- **Effects:** skill XP, story flag, zone unlock. **Story:** story checkpoints 1.

### Prepare Buffet — `Action.PrepareBuffet`

- **Identity:** `normal` / `Action` · `townNum=6` · `varName=PrepareBuffet` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6304)
- **Cost:** mana `30000` · extra cost callback
- **Gates:** visible `towns[6].getLevel("ExploreJungle") >= 15` · unlocked `towns[6].getLevel("ExploreJungle") >= 20` · canStart `resources.herbs >= 10 && resources.blood > 0`
- **Growth:** stat weights `Con:0.3, Per:0.1, Int:0.6`; skills `Alchemy:25, Gluttony:5`
- **Effects:** resource:herbs, resource:blood, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Rescue Survivors — `Action.RescueSurvivors`

- **Identity:** `multipart` / `MultipartAction` · `townNum=6` · `varName=Rescue` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6250)
- **Cost:** mana `25000`
- **Gates:** visible `towns[6].getLevel("ExploreJungle") >= 10` · unlocked `towns[6].getLevel("ExploreJungle") >= 20` · canStart `true`
- **Growth:** stat weights `Per:0.4, Dex:0.2, Cha:0.2, Spd:0.2`; skills `Restoration:25`
- **Effects:** resource:reputation, skill XP, story flag. **Story:** story checkpoints 1, 2, 3.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### RuinsZ6 — `Action.RuinsZ6`

- **Identity:** `progress` / `Action` · `townNum=6` · `varName=RuinsZ6` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L690)
- **Cost:** mana `100000`
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** progress. **Story:** story checkpoints 1, 2, 3. **Affected by:** `SurveyZ1`.

### SurveyZ6 — `Action.SurveyZ6`

- **Identity:** `progress` / `Action` · `townNum=6` · `varName=SurveyZ6` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L643)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Totem — `Action.Totem`

- **Identity:** `normal` / `Action` · `townNum=6` · `varName=Totem` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6352)
- **Cost:** mana `30000` · extra cost callback
- **Gates:** visible `towns[6].getLevel("ExploreJungle") >= 25` · unlocked `towns[6].getLevel("ExploreJungle") >= 50` · canStart `resources.loopingPotion`
- **Growth:** stat weights `Con:0.3, Per:0.2, Soul:0.5`; skills `Wunderkind:100`
- **Effects:** resource:loopingPotion, skill XP. **Story:** story checkpoints 1, 2, 3, 4.

## Zone 7 — Commerceville (15 actions)

### AssassinZ7 — `Action.AssassinZ7`

- **Identity:** `multipart` / `AssassinAction` · `townNum=7` · `varName=AssassinZ7` · `segments=5` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L782)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `getSkillLevel("Assassin") > 0` · unlocked `getSkillLevel("Assassin") > 0` · canStart `loopCounter === 0`
- **Growth:** stat weights `Per:0.2, Int:0.1, Dex:0.3, Luck:0.2, Spd:0.2`; skills `none`
- **Effects:** resource:reputation, resource:heart. **Story:** story checkpoints 1.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Collect Interest — `Action.CollectInterest`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=CollectInterest` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7087)
- **Cost:** mana `1` · allowed `1`
- **Gates:** visible `true` · unlocked `true` · canStart `true`
- **Growth:** stat weights `Con:0.4, Per:0.3, Spd:0.3`; skills `Mercantilism:50`
- **Effects:** resource:gold, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### Excursion — `Action.Excursion`

- **Identity:** `progress` / `Action` · `townNum=7` · `varName=Excursion` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6478)
- **Cost:** mana `25000` · goldCost() `(guild === "Thieves" || guild === "Explorer") ? 2 : 10`
- **Gates:** visible `true` · unlocked `true` · canStart `resources.gold >= this.goldCost()`
- **Growth:** stat weights `Per:0.2, Con:0.2, Cha:0.2, Spd:0.3, Luck:0.1`; skills `none`
- **Effects:** resource:gold, progress, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8. **Affected by:** `Buy Glasses`.

### Explorers Guild — `Action.ExplorersGuild`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=ExplorersGuild` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6542)
- **Cost:** mana `65000` · allowed `1`
- **Gates:** visible `towns[7].getLevel("Excursion") >= 5` · unlocked `towns[7].getLevel("Excursion") >= 10` · canStart `guild === ""`
- **Growth:** stat weights `Per:0.3, Cha:0.3, Int:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, progress, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Guild Assassin — `Action.GuildAssassin`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=GuildAssassin` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6968)
- **Cost:** mana `100000` · allowed `1`
- **Gates:** visible `towns[this.townNum].getLevel("InsuranceFraud") >= 75` · unlocked `towns[this.townNum].getLevel("InsuranceFraud") >= 100` · canStart `guild === ""`
- **Growth:** stat weights `Per:0.1, Cha:0.3, Dex:0.4, Luck:0.2`; skills `Assassin:100`
- **Effects:** skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6.

### Insurance Fraud — `Action.InsuranceFraud`

- **Identity:** `progress` / `Action` · `townNum=7` · `varName=InsuranceFraud` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6913)
- **Cost:** mana `100000` · goldCost() `Math.floor(200 * getSkillBonus("Thievery"))` · allowed `towns[7].totalInsurance`
- **Gates:** visible `towns[7].getLevel("RobWarehouse") >= 50` · unlocked `towns[7].getLevel("RobWarehouse") >= 100` · canStart `guild === "Thieves"`
- **Growth:** stat weights `Dex:0.2, Spd:0.2, Int:0.3, Luck:0.3`; skills `Thievery:dynamic`
- **Effects:** resource:gold, progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Thieves Guild`.

### Invest — `Action.Invest`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=Invest` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7030)
- **Cost:** mana `50000` · allowed `1`
- **Gates:** visible `true` · unlocked `true` · canStart `resources.gold > 0`
- **Growth:** stat weights `Con:0.4, Per:0.3, Spd:0.3`; skills `Mercantilism:100`
- **Effects:** skill XP, story flag, direct economic/counter mutation. **Story:** story checkpoints 1, 2, 3, 4, 5.

### Leave City — `Action.LeaveCity`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=LeaveCity` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7286)
- **Cost:** mana `100000` · allowed `1` · extra cost callback
- **Gates:** visible `true` · unlocked `true` · canStart `resources.key`
- **Growth:** stat weights `Con:0.4, Per:0.3, Spd:0.3`; skills `none`
- **Effects:** resource:key, zone unlock. **Story:** story checkpoints 1.

### Pick Pockets — `Action.PickPockets`

- **Identity:** `progress` / `Action` · `townNum=7` · `varName=PickPockets` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6804)
- **Cost:** mana `20000` · goldCost() `Math.floor(2 * getSkillBonus("Thievery"))` · allowed `towns[7].totalPockets`
- **Gates:** visible `getSkillLevel("Thievery") > 0` · unlocked `getSkillLevel("Thievery") > 0` · canStart `guild === "Thieves"`
- **Growth:** stat weights `Dex:0.4, Spd:0.4, Luck:0.2`; skills `Thievery:dynamic`
- **Effects:** resource:gold, progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Thieves Guild`.

### Purchase Key — `Action.PurchaseKey`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=PurchaseKey` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7185)
- **Cost:** mana `20000` · goldCost() `1000000` · allowed `1` · extra cost callback
- **Gates:** visible `true` · unlocked `true` · canStart `resources.gold >= 1000000 && !resources.key`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `none`
- **Effects:** resource:gold, resource:key, story flag. **Story:** story checkpoints 1.

### Rob Warehouse — `Action.RobWarehouse`

- **Identity:** `progress` / `Action` · `townNum=7` · `varName=RobWarehouse` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6858)
- **Cost:** mana `50000` · goldCost() `Math.floor(20 * getSkillBonus("Thievery"))` · allowed `towns[7].totalWarehouses`
- **Gates:** visible `towns[7].getLevel("PickPockets") >= 25` · unlocked `towns[7].getLevel("PickPockets") >= 100` · canStart `guild === "Thieves"`
- **Growth:** stat weights `Dex:0.4, Spd:0.2, Int:0.2, Luck:0.2`; skills `Thievery:dynamic`
- **Effects:** resource:gold, progress, skill XP. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Thieves Guild`.

### Secret Trial — `Action.SecretTrial`

- **Identity:** `multipart` / `TrialAction` · `townNum=7` · `varName=STrial` · `segments=9` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7226)
- **Cost:** mana `100000`
- **Gates:** visible `storyMax >= 12 && getBuffLevel("Imbuement3") >= 7` · unlocked `storyMax >= 12 && getBuffLevel("Imbuement3") >= 7` · canStart `this.currentFloor() < trialFloors[this.trialNum]`
- **Growth:** stat weights `Dex:0.11, Str:0.11, Con:0.11, Spd:0.11, Per:0.11, Cha:0.11, Int:0.11, Luck:0.11, Soul:0.11`; skills `none`
- **Effects:** story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6. **Affected by:** `Team`.
- **Extra hooks:** `loopCost`, `tickProgress`, `floorReward`; inspect segment/floor formulas in source.

### Seminar — `Action.Seminar`

- **Identity:** `normal` / `Action` · `townNum=7` · `varName=Seminar` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7137)
- **Cost:** mana `20000` · goldCost() `1000` · extra cost callback
- **Gates:** visible `towns[this.townNum].getLevel("Survey") >= 100` · unlocked `towns[this.townNum].getLevel("Survey") >= 100` · canStart `resources.gold >= 1000`
- **Growth:** stat weights `Cha:0.8, Luck:0.1, Soul:0.1`; skills `Leadership:200`
- **Effects:** resource:gold, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4.

### SurveyZ7 — `Action.SurveyZ7`

- **Identity:** `progress` / `Action` · `townNum=7` · `varName=SurveyZ7` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L644)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

### Thieves Guild — `Action.ThievesGuild`

- **Identity:** `multipart` / `MultipartAction` · `townNum=7` · `varName=ThievesGuild` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L6706)
- **Cost:** mana `75000` · allowed `1`
- **Gates:** visible `towns[7].getLevel("Excursion") >= 20` · unlocked `towns[7].getLevel("Excursion") >= 25` · canStart `guild === "" && resources.reputation < 0`
- **Growth:** stat weights `Dex:0.4, Per:0.3, Spd:0.3`; skills `Thievery:50, Practical:50`
- **Effects:** resource:gold, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9.
- **Extra hooks:** `loopCost`, `tickProgress`, `segmentFinished`; inspect segment/floor formulas in source.

## Zone 8 — Valley of Olympus (6 actions)

### Build Tower — `Action.BuildTower`

- **Identity:** `progress` / `Action` · `townNum=8` · `varName=BuildTower` · `progressScaling=linear` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7407)
- **Cost:** mana `250000`
- **Gates:** visible `true` · unlocked `true` · canStart `resources.stone`
- **Growth:** stat weights `Dex:0.1, Str:0.3, Con:0.3, Per:0.2, Spd:0.1`; skills `none`
- **Effects:** resource:stone, progress, direct economic/counter mutation. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7. **Affected by:** `Temporal Stone`.

### Challenge Gods — `Action.ChallengeGods`

- **Identity:** `multipart` / `TrialAction` · `townNum=8` · `varName=GFight` · `segments=9` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7532)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("BuildTower") >= 100` · unlocked `towns[this.townNum].getLevel("BuildTower") >= 100` · canStart `this.currentFloor() < trialFloors[this.trialNum] && resources.power > 0 && resources.power < 8`
- **Growth:** stat weights `Dex:0.11, Str:0.11, Con:0.11, Spd:0.11, Per:0.11, Cha:0.11, Int:0.11, Luck:0.11, Soul:0.11`; skills `Combat:500`
- **Effects:** resource:power, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18.
- **Extra hooks:** `loopCost`, `tickProgress`, `floorReward`, `segmentFinished`; inspect segment/floor formulas in source.

### Gods Trial — `Action.GodsTrial`

- **Identity:** `multipart` / `TrialAction` · `townNum=8` · `varName=GTrial` · `segments=9` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7453)
- **Cost:** mana `50000`
- **Gates:** visible `towns[this.townNum].getLevel("BuildTower") >= 100` · unlocked `towns[this.townNum].getLevel("BuildTower") >= 100` · canStart `this.currentFloor() < trialFloors[this.trialNum] && resources.power < 7`
- **Growth:** stat weights `Dex:0.11, Str:0.11, Con:0.11, Spd:0.11, Per:0.11, Cha:0.11, Int:0.11, Luck:0.11, Soul:0.11`; skills `Combat:250, Pyromancy:50, Restoration:50`
- **Effects:** resource:power, skill XP, story flag. **Story:** story checkpoints 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11. **Affected by:** `Team`.
- **Extra hooks:** `loopCost`, `tickProgress`, `floorReward`; inspect segment/floor formulas in source.

### Imbue Soul — `Action.ImbueSoul`

- **Identity:** `multipart` / `MultipartAction` · `townNum=8` · `varName=ImbueSoul` · `segments=3` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7329)
- **Cost:** mana `5000000` · allowed `1`
- **Gates:** visible `true` · unlocked `getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499` · canStart `loopCounter === 0 && getBuffLevel("Imbuement") > 499 && getBuffLevel("Imbuement2") > 499 && getBuffLevel("Imbuement3") < 7`
- **Growth:** stat weights `Soul:1`; skills `none`; grants `Imbuement3`
- **Effects:** buff, story flag. **Story:** story checkpoints 1, 2, 3, 4.
- **Extra hooks:** `loopCost`, `tickProgress`; inspect segment/floor formulas in source.

### Restore Time — `Action.RestoreTime`

- **Identity:** `normal` / `Action` · `townNum=8` · `varName=RestoreTime` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L7661)
- **Cost:** mana `7777777` · allowed `1`
- **Gates:** visible `towns[this.townNum].getLevel("BuildTower") >= 100` · unlocked `towns[this.townNum].getLevel("BuildTower") >= 100` · canStart `resources.power >= 8`
- **Growth:** stat weights `Luck:0.5, Soul:0.5`; skills `none`
- **Effects:** resource:reputation, prestige completion. **Story:** story checkpoints 1.

### SurveyZ8 — `Action.SurveyZ8`

- **Identity:** `progress` / `Action` · `townNum=8` · `varName=SurveyZ8` · [source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L645)
- **Cost:** mana `10000 * (this.townNum + 1)`
- **Gates:** visible `getExploreProgress() > 0` · unlocked `getExploreProgress() > 0` · canStart `(resources.map > 0) || towns[this.townNum].getLevel("Survey") == 100`
- **Growth:** stat weights `Per:0.4, Spd:0.2, Con:0.2, Luck:0.2`; skills `none`
- **Effects:** resource:map, resource:completedMap, progress. **Story:** None declared here.

