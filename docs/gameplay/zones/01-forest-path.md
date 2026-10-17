# Zone 1 — Forest Path

**23 actions.** Forest harvesting introduces a production chain, skill specialization and rituals.

## Gameplay dependencies

- `Explore Forest` and `Clear Thicket` unlock and expand `Wild Mana`, `Gather Herbs` and `Hunt` opportunities.
- `Talk To Hermit` enables `Practical Magic` and `Learn Alchemy`. `Learn Alchemy` requires herbs and increases Magic/Alchemy skills. `Brew Potions` requires Alchemy ≥10, sufficient herbs and reputation, consumes herbs and produces potions used in later commerce.
- `Sit By Waterfall`, `Train Dexterity`, `Train Speed` and `Bird Watching` diversify training.
- `Talk To Witch`, `Dark Magic` and `Dark Ritual` open a high-cost path. Dark Ritual has three segments, requires negative reputation, Dark skill, a soulstone sacrifice and available buff capacity. Its cap check uses `getBuffCap()`, which reads the DOM (see [risk R04](../../audit/findings.md)).
- `RuinsZ1` and `HaulZ1` matter after global survey access: zone 1 is one of the tower's four finite stone sources.

## Travel and checks

`Continue On` advances **1→2**. Its cost is `ceil(8000 − 60 × ShortcutLevel)`, so `Old Shortcut` progression reduces repeated travel expense. Test potion production, ritual costs, limited item counters, shortcut economics, queue ordering and save reload.
