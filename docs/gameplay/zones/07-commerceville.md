# Zone 7 — Commerceville

**15 actions.** Guild choices, repeatable wealth, player knowledge from maps and the endgame key form an unusual secondary progression layer.

## Gameplay dependencies

- `Excursion` opens `Explorers Guild`. **Explorer Guild seeds survey progression** when `getExploreSkill()` is zero: it adds 100 `SurveyZ7` XP, makes global Explore positive, and provides 30 maps if none are held. This is critical because `Action.Map` and `SurveyAction` are gated on global Explore >0.
- Completed maps are turned in through `exchangeMap()` to spread survey XP among unfinished zones. Global Explore is derived from all nine survey levels and enables travel shortcuts and other optional actions.
- `Thieves Guild` is a multipart rank path; `Pick Pockets`, `Rob Warehouse` and `Insurance Fraud` connect limited discoveries, reputation/illicit income and skill mechanics. `Guild Assassin` introduces a further specialization.
- `Invest` stores current gold into durable `goldInvested`, capped at 999,999,999,999. `Collect Interest` pays `floor(goldInvested × 0.001)` gold and trains Mercantilism.
- `Seminar`, `Purchase Key` and `Secret Trial` add additional late-game goals.

## Travel and checks

`Leave City` goes **7→8** when a key is held; its `cost` consumes the key. Validate map bootstrap, survey rewards, late shortcut gates, investment/interest on reload, theft limited counters, key consumption, and zone transition.
