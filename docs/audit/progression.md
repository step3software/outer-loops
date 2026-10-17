# Zone travel and unlock dependency review

The map below describes the default branch's **actual travel arithmetic**. `getTravelNum(name)` in `actionList.js` returns the integer delta added to `Action.townNum` by travel actions; `unlockTown(townNum)` in `driver.js` records the destination in `townsUnlocked` and makes it current. Preconditions still depend on individual `visible()`, `unlocked()` and `canStart()`. See [per-action gates](../reference/action-mechanics.generated.md) for the full set.

## Normal forward route

```text
0 Beginnersville
  └─ Start Journey (+1, supplies, Combat + Magic >= 35) → 1 Forest Path
       └─ Continue On (+1) → 2 Merchanton
            └─ Start Trek (+1, City progress >= 60) → 3 Mt. Olympus
                 ├─ Face Judgement (+1, reputation > 50) → 4 Valhalla
                 │    └─ Fall From Grace (+1, Pyromancy >= 200) → 5 Startington
                 └─ Face Judgement (+2, reputation <= 50) → 5 Startington
                       └─ Journey Forth (+1, supplies, Meander >= 100) → 6 Jungle Path
                            └─ Escape (+1, Explore Jungle >= 100) → 7 Commerceville
                                 └─ Leave City (+1, key) → 8 Valley of Olympus
```

Note that the branch threshold at exactly 50 reputation goes to **Startington**: `getTravelNum` checks `<= 50` first, then `>= 50`. `FaceJudgement` must also be visible/unlocked, requiring mountain progress. This is not an assertion that every displayed path is automatically affordable.

## Shortcuts and backtracks

| Source action | Town → town | Additional gate |
| --- | --- | --- |
| Hitch Ride | 0 → 2 | Global Explore progress ≥ 25 |
| Open Rift | 0 → 5 | Dark ≥ 300, Spatiomancy ≥ 100, Startington Meander visible |
| Underworld | 2 → 7 | 500 gold, global Explore progress ≥ 50 |
| Guru | 3 → 4 | 1,000 herbs, global Explore progress ≥ 100 |
| Open Portal | 6 → 1 | Restoration ≥ 1,000 and Explore progress ≥ 75 |
| Fall From Grace | 4 → 5 | Pyromancy ≥ 200 |
| Open Portal permits a backward route | 6 → 1 | Relevant queue travel action limits may change with an Open Portal entry |

The source encodes these routes as deltas, not a graph with named destinations. Planned queue positions and `zoneSpans` can therefore invalidate apparently plausible schedules if a travel action is disabled, removed or conditional. `getPossibleTravel("Face Judgement")` deliberately admits both possible deltas before actual reputation is known.

## Global Explore / Survey system

The global survey system is **not initially available** simply because `SurveyZ0` exists in the registry:

- `getTotalExploreProgress` sums levels of `SurveyZ0` through `SurveyZ8`; `getExploreProgress` is the floor of that total divided by 9, with minimum 1 after any nonzero survey level.
- `getExploreSkill` is `floor(sqrt(getExploreProgress()))`. Survey actions need a map while unfinished, and completing one turns the map into `completedMap` and adds survey progress.
- `Action.Map` and `SurveyAction` require positive global Explore progress to become visible; `Action.ExplorersGuild.finish` seeds the first 100 survey XP in Commerceville when exploration skill is zero, and supplies 30 maps when the player's maps are exhausted.
- Turning in completed maps through the Explorer Guild uses `exchangeMap()` to distribute bonus survey XP randomly among unfinished zones. This is the principal bootstrap route in the current code.

Because this subsystem is late and self-referential, a new AI agent should not delete the Explorer Guild's initial survey XP award as "unnecessary" — it establishes access to the broader map/survey mechanic.

## Endgame progression and challenge topology

1. The endgame Valley (zone 8) follows obtaining a key in Commerceville, then executing Leave City.
2. `BuildTower` needs a carried stone, consumes it and increases `expBuildTower` by 505. Four stone sources in zones 1, 3, 5 and 6 each track at most 250 uses, giving the intended 1,000 contributions for 100 linear levels.
3. Once the tower reaches level 100, `GodsTrial` and `ChallengeGods` can award power. `GodsTrial` reaches 100 floors and has a special completion reward of +1 power. `ChallengeGods` has seven floors granting power per floor; its `canStart` requires power between 1 and 7.
4. `RestoreTime` requires 8 power and the completed tower; `finish` calls `completedCurrentGame`, which awards prestige points once for the current completion.
5. Multiple earlier quests, guilds and combat training systems affect the feasibility, speed and rewards of this route. The table is dependency navigation, **not** an asserted optimal solution.

## Narrative gate cautions

`storyFlags` / `storyVars` are not the same as visible buttons. `Action.storyReqs` can refer to level/progress thresholds, temporary resources, prestige and completed flags; the story text lives in `lang/en-EN/game.xml`. In `Action.Escape.story` there is a source comment acknowledging that unlocking a later global story may incorrectly imply completion of an earlier Looping Potion story. Review both actual gates and the story order for any narrative change.

## Acceptance for route changes

Verify initial zone, cumulative travel delta, changed inventory/skill, visible/unlocked/canStart, planned queue `zoneSpans`, normal execution, failed travel, pause/restart, save/reload, challenge mode, predictor and page text. Changing a single `getTravelNum` branch without the queue planner and UI is incomplete.
