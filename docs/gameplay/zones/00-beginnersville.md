# Zone 0 — Beginnersville

**25 actions.** This is the opening loop where players discover repeatable resources, turn gold into time, train skills and unlock the first travel paths.

## Gameplay dependencies

- `Wander` is immediately accessible, costs 250 base mana and increases permanent town progress. Its level increases the available Pots/Locks pool via `adjustPots` and `adjustLocks`.
- `Smash Pots`, `Pick Locks`, `Short Quest` and `Long Quest` have limited-resource counters. Checking new locations versus revisiting known-good locations produces different long-term information. `SmashPots.goldCost()` controls a gold **reward**, not a spending price.
- `Buy Glasses` appears at Wander ≥3, unlocks at ≥20 and requires gold. `Buy Mana Z1` also unlocks at Wander ≥20, converting the entire carried gold balance to mana (Mercantilism/PrestigeBartering multiplier) then resetting gold.
- `Meet People` opens quest and `Investigate` progression; `Warrior Lessons` and `Mage Lessons` unlock combat/magic specialization. `Fight Monsters` is multipart; `Small Dungeon` has six floors and Combat/Magic rewards.
- `Buy Supplies` and `Haggle` help fund `Start Journey`. The first route advances **0→1**, visible when Combat+Magic ≥15 and unlocked at ≥35, with supplies required.
- `Hitch Ride` advances **0→2**, gated by global Explore ≥25; `Open Rift` advances **0→5** via later Dark, Spatiomancy and Startington progress.

## Regression boundary

Keep existing `Pots`, `SQuests`, `Fight`, `SDungeon` and other persistence identifiers stable. Test early money→mana conversion, Discover/KnownGood item pools, dungeon segments, supplies, first journey and normal restart.
