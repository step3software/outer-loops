# Gameplay review: current design and development implications

## Scope and interpretation

This analysis describes the **implemented systems**, followed by explicit design judgments. It does not claim a full end-to-end playthrough, measured time-to-unlock or player retention. The [157-action runtime inventory](../reference/action-mechanics.generated.md) is the action-by-action source appendix.

## Core decision loop

The implemented cycle is:

1. **Read progress and available options.** Town survey/progress bars, action availability, stats, resources, story flags and hints determine feasible routes.
2. **Plan the next action list.** Queue actions with repeat counts/`loopsType`, optional limited-item modes, zone travel and loadouts. Queue constraints matter: actions executed out of their zone or without starting conditions are skipped; travel changes current town.
3. **Run against a time/mana budget.** Stat XP reduces effective action cost via effort multipliers, while resources and special costs determine access. Some actions generate additional mana, changing the length of a run.
4. **Convert the run to durable growth.** Experience increases talents and skills, town progress and limited discoveries persist, and story and completed-action flags open new routes. Gold and most immediate resources do not persist through an ordinary restart.
5. **Iterate.** Players reorder and rebalance actions, alter loadouts, collect better resources and eventually pursue meta progression through prestige.

The action predictor creates a second, planning-centric activity: comparing predicted outcomes of different orders without actually playing them. It also increases the technical burden of keeping formulas synchronized.

## Zone-by-zone gameplay

| Zone | Main activity clusters | Mechanic introduced/emphasized |
| --- | --- | --- |
| 0 Beginnersville (25 actions) | Wandering, pots, locks, people/quests, early combat/magic, small dungeon, supplies | Initial experience/economy, limited resources, training, first loop/travel |
| 1 Forest Path (23) | Forest/thicket, herbs/hunt, hermit, alchemy/potions, witch, dark ritual | Harvest → craft → spend, progression gates, rituals and skill branches |
| 2 Merchanton (20) | City exploration, potions → trade, adventure/crafting guilds, team and armor, large dungeon, heroes trial | Commerce, guild ranks, party combat and deeper dungeons |
| 3 Mt. Olympus (19) | Climbing, magic/cavern, soulstones/artifacts, imbue mind/body, judgment | Resource sacrifice, permanent buffs, route branching |
| 4 Valhalla (25) | Donations, favors, selling/gifting artifacts, wizard college, citizenship/housing, frost giants, feast | Reputation/social/resource networks and large cumulative buffs |
| 5 Startington (13) | Meander, mana wells/pylons, zombies, Dark Sacrifice, Spire, Dead Trial | Dark build specialization and undead combat |
| 6 Jungle Path (11) | Jungle survey, monster battles, rescuing survivors, buffet/totem, Escape/Portal | Timed escape branch, rank combat and route shortcuts |
| 7 Commerceville (15) | Explorer/Thieves guild, robbery/pockets, investment/interest, seminars, key, secret trial | Strategic wealth, surveys, global exploration and route to endgame |
| 8 Valley of Olympus (6) | Imbue Soul, stone tower, Gods/Challenge Gods trials, Restore Time | High-cost progression, completion and prestige currency |

See [progression map](progression.md) for actual travel constraints. The zone summaries are navigation aids, not a claim of one required optimal sequence.

## Sources of meaningful player decisions

**Action order matters.** Early income can become mana, unlocking longer training or expensive travel in the *same* loop. A potion, team, key or supplies action must generally precede the dependent action. The engine tests `canStart` during execution, not just when an entry is queued.

**Specialization matters.** Combat and Magic open the early route; alchemy/potions create a distinct production chain; Adventure and Crafting Guild rank bonuses affect later combat/crafting; Dark, Pyromancy, Restoration and other skills shift late-game effectiveness. Soulstone investment and ritual choices alter permanent multipliers.

**Limited actions have knowledge value.** `total` / `checked` / `good` / `goodTemp` fields mean exploration changes the reliability of later loops, not just immediate reward. The `knownGood` and `unchecked` queue types are strategically different from simple repetition.

**Routes matter.** Direct advancement is not always optimal: Hitch Ride, Underworld, Open Rift, Guru and Open Portal offer shortcuts or alternative progression, with resource/skill/reputation gates. The Explorer Guild becomes the entry point for the global survey system.

**Meta progression matters.** Prestige offers compound bonuses after the ending; Imbue Soul trades existing talents/soulstones/buffs for a persistent multiplier to training. The ending can be completed without all optional trials being fully maxed, depending on actual power-gain routes.

## Gameplay friction / design hypotheses (not measured bugs)

| Hypothesis | Why it matters | Evidence needed |
| --- | --- | --- |
| Early pacing may feel repetitive before the player learns queue optimization | Early progress uses small, repeated actions and expensive skill thresholds | Observe first-hour sessions, unlock times and amount of active queue editing |
| Important gate rules may be opaque | `visible`, `unlocked` and `canStart` differ, and requirements span skills, story and resources | Playtest discoverability of an action before/after its threshold |
| Midgame breadth may create competing obligations | Multiple guilds, item chains, town systems and large stat requirements coexist | Track blocked action plans and player comprehension |
| Late-game exponential multipliers may undermine transparency | Prestige bonuses, combat teams, soulless/talent scaling and trial floors compound | Build numerical baselines, expected hours/floors, check predicted-vs-real |
| Global survey entry is unusually late | Surveys require initial explore progress; `ExplorersGuild.finish` bootstraps the first point | Playtest whether players understand Map/Survey after reaching Commerceville |
| Challenge/predictor/high-speed settings increase cognitive and technical complexity | Same game has several queue interpretations and runtime variants | Focused accessibility and onboarding tests |

These are **priorities for gameplay research**, not a request to change balance without product decisions.

## Specific progression observations

- ```Buy Mana Z1```, `Buy Mana Z3` and `Buy Mana Z5` convert the currently held gold into additional mana and reset gold. Their `goldCost()` is a *conversion multiplier*, not gold paid. This is why effects cannot be inferred from helper names.
- `Invest` stores current gold in save-persistent `goldInvested` (capped at 999,999,999,999), and `Collect Interest` returns `floor(goldInvested * 0.001)` gold in subsequent runs. This creates a long-run economic loop.
- `Raise Zombie` consumes blood, adds a zombie and records a persistent maximum; `Dead Trial` uses zombie strength and grants more zombies on floors. This couples current-loop combat resources and persistent Dark skill progression.
- `Imbue Soul` requires 500 Imbuement and 500 Imbuement2 levels and resets existing soulstones/talent levels and those two buffs when a segment cycle completes. It grants Imbuement3, which increases training multipliers and can carry into prestige according to `prestige.js` rules.
- `Build Tower` advances linear progress by 505 experience per temporal stone. Each of 100 levels needs 5,050 experience, so its full bar requires 1,000 successful stone contributions; `stonesUsed` caps four specific origins at 250 each. `Restore Time` is unlocked at full tower and needs 8 power.
- `Restore Time` awards completion through `completedCurrentGame()`, providing 90 prestige points once per completion cycle. `getPrestigeCost` and `prestigeBonus` control subsequent purchases; see [formulas](balance-formulas.md).

## Overall assessment

The game's strongest implemented differentiation is **compositional planning**: an enormous network of actions becomes intelligible through queue optimization, reusable knowledge, skill specialization and travel planning. Its main liabilities for sustained development are rule discoverability, hidden coupling, and lack of gameplay regression evidence. Because those liabilities interact, the preferred strategy is to document source contracts, then add tests before rewriting mechanics. Preserve the current rules until evidence justifies changes.
