# Numeric mechanics and economy formulas

This is a reference of *as-coded equations*, not a balance endorsement. Inputs can vary by action, challenge and prestige, and many bonuses compound. For exact action formulas use the [runtime mechanics reference](../reference/action-mechanics.generated.md).

## Stat level and talent curves

`LevelExp` in `stats.js` uses:

- Additional XP for level `L`: `100 × L`.
- Cumulative XP to level `L`: `50 × L × (L + 1)`.
- Level from total XP `X`: `floor((sqrt(8X/100 + 1) - 1)/2)`, clamped to zero by the class.
- For level 100 the cumulative threshold is **505,000 XP**. Town progress actions use the same quadratic curve unless declared `progressScaling: "linear"`.

Each stat has multiple layers: per-loop `statLevelExp`, permanent `talentLevelExp`, `soullessLevelExp` and `soulstone`. An action's stat weight and `expMult` distribute experience. `addExp` adds to both stat experience and talent experience, with the talent amount determined by `getTalentMultiplier`.

- Effort multiplier for current stat level `L`: `1 + L / 100`; its reciprocal is the per-stat mana multiplier.
- Soulstone experience multiplier: `1 + soulstones^0.8 / 30`.
- Talent experience multiplier: `1 + talentLevel^0.4 / 3`.
- Total XP bonus for a stat: **soulstone × talent × matching Physical/Mental prestige multiplier**.
- Talent gain per stat XP: `(getSkillBonus("Wunderkind") + 0.01 × Aspirant buff level) / 100`.
- On loop restart `restartStats` initializes stat levels from Imbuement2 (doubled if the Wunderkind skill level is positive); permanent talent levels persist.

## Skills and buff curves

`Skill.getBonus` and `setSkillBonusType` distinguish:

| Curve category | Skills | Formula for level L |
| --- | --- | --- |
| Increase | Dark, Chronomancy, Mercantilism, Divine, Wunderkind, Thievery, Leadership | `(1 + L / 60)^0.25` |
| Decrease | Practical, Spatiomancy, Commune, Gluttony | `1 / (1 + L / 100)` |
| Custom | Assassin | `1 / (1 + L / 2000)` |
| No standard curve | Combat, Magic, Alchemy, Crafting, Pyromancy, Restoration and others | `getSkillBonus` returns 0 if no curve is assigned; effects are via explicit action formulas |

`getSkillMod(name, min, max, percentChange)` returns 1 below `min` and then adds a capped linear modifier. `getSurveyBonus(town)` is `SurveyLevel × 0.005`. Buffs such as Dark Ritual, Great Feast, Imbue Mind and Imbue Body affect speed, combat, training and resources through separate call sites.

Careful: "decrease" means the numeric bonus decreases with level because it is often **multiplying a cost**. It is not evidence that leveling the skill makes gameplay worse.

## Combat model

`stats.js` defines:

- Armor level = `1 + (armor + 3 × enchantments) × CraftGuildRankBonus / 5`.
- Self strength = `(CombatSkill + 5 × PyromancySkill) × ArmorLevel × (1 + 0.05 × Feast) × PrestigeCombat`.
- Zombie strength = `DarkSkill × zombies / 2 × max(Ritual / 100, 1) × (1 + 0.05 × Feast) × PrestigeCombat`.
- Team strength = `(CombatSkill + 4 × RestorationSkill) × teamMembers/2 × AdvGuildRankBonus × LeadershipSkillBonus × (1 + 0.05 × Feast) × PrestigeCombat`.
- Total team combat = self + zombie + team. **Challenge mode 2 changes these functions** (see `challenges.js`).

Specific dungeon/trial scaling is different: `DungeonAction` progress formulas consult floor completions and active combat/team composition, whereas `TrialAction` has exponential floor cost and custom `baseProgress()`. Do not conflate `getTeamCombat()` with every challenge's input.

## Guild rank scaling

Adventure, Crafting and Thieves guild ranking helpers use, until their named rank range ends:

`bonus = precision3(1 + segment/20 + segment²/300)`.

Wizard College uses `precision3(1 + 0.02 × segment^1.05)`, while Jungle Monster ranking uses `precision3(1 + 0.05 × segment^1.05)`. Their named rank arrays and fallback caps differ; source functions in `actionList.js` remain authoritative.

## Mana budget, speed and gold

- The base engine has **50 mana ticks per second**, but effective expenditure also depends on `gameSpeed`, offline `bonusSpeed`, ritual effects, fractional mana and stat-cost multipliers. Its runtime budget is not equivalent to a fixed number of actions per wall-clock second.
- `Smash Pots` uses the Practical cost-reduction bonus for mana and a Dark-dependent `goldCost()` for its reward. The helper's name does **not** mean every caller spends gold.
- `Buy Mana Z1/Z3/Z5` spend **all current gold** for `gold × floor(50 × MercantilismBonus × PrestigeBarteringBonus)` additional mana; then reset gold. Read the action `finish`, not just its `goldCost`.
- `Invest` transfers available gold into `goldInvested`, clamped at 999,999,999,999; `CollectInterest` generates `floor(goldInvested × 0.001)` gold per completion. Because `goldInvested` is serialized, investing creates durable wealth between loops.
- `getExploreProgress` averages the nine survey levels with a minimum of 1 once nonzero; `getExploreSkill` uses the floored square root of that value. Surveys also increase available limited-item pools through `getSurveyBonus`.

## Prestige and meta progression

`completedCurrentGame()` awards **90 points once per completion cycle**. `prestigeUpgrade` spends points and invokes a larger reset. For purchased buff level `n`, the next upgrade costs:

`cost(n) = 30 + 10n + 5 × n(n−1)/2`.

The static multiplier bases in `prestige.js` are:

| Prestige bonus | Base per level |
| --- | ---: |
| Physical, Mental, Combat | 1.20 |
| Bartering, Spatiomancy | 1.10 |
| Chronomancy | 1.05 |
| Experience Overflow | 1.00222 |

The effective bonus is `base^level`, cached by buff level. The specific usage is distributed through stat, time, mana, economy and action formulas. A cap/purchase boundary should be tested separately (finding R11).

## Tower and endgame arithmetic

`BuildTower` is `linear` progress; each completion adds 505 progress XP. Because one linear town level is 5,050 XP, 10 stones raise one tower level, and 100 levels require **1,000** stones. Four source-zone use counters can reach 250 each. The power route and Restore Time are documented in [progression](progression.md).

## Numerical invariants to test before rebalancing

Non-negative and finite numeric resources; sane integer/boolean separation; monotonic quadratic progress; capped level/progress/buffs; gold conversion and interest arithmetic; effective tick budgeting; no duplicate floor rewards; correct story threshold at boundaries; no action ID/`varName` migrations without explicit strategy; and predictor results matching source mechanics.
