# Zone 5 — Startington

**13 actions.** This zone adds a distinct dark/undead combat build and several high-rank progression challenges.

## Gameplay dependencies

- `Meander` opens local progress; `Mana Well` and `Destroy Pylons` affect the area's replenishment and encounter dynamics.
- `Raise Zombie` becomes visible at Meander ≥15 and unlocks at Dark ≥1,000. It requires and consumes one blood resource, adds one zombie, trains Dark, and records the highest zombie count in persistent `storyVars.maxZombiesRaised`.
- `Dark Sacrifice` consumes blood for Commune progression; `The Spire` is a three-digit-cost dungeon with combat and pylons. Its `Aspirant` buff affects talent gain.
- `Dead Trial` is Trial #4 with 25 floors; its progress is based on `getZombieStrength()`, while `floorReward()` grants an additional zombie. Zombie count therefore increases the run's future undead strength.
- `Purchase Supplies` and `Journey Forth` support continued travel; `RuinsZ5` / `HaulZ5` supply another tower stone origin.

## Travel and checks

`Journey Forth` advances **5→6** after Meander ≥100 and requires supplies. Test blood balance, Dark skill, zombie story maximum vs current-loop count, multipart floor rewards, Spire pylons, normal restart, supplies and predictor accuracy.
