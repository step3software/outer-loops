# Retire / adapt inherited prestige and challenge systems

**Product direction is firm:** the released Real World must **replace** the separate dmchurch **Prestige Perks** and **Challenges** menus. **The fate of individual upgrades/challenge conditions and migration of existing player balances remains open.** This document maps the risks so "scrap it" does not accidentally mean "delete a veteran player's save."

## Existing implementation — verified in source

At the current `dmchurch` baseline:

- `Action.RestoreTime.finish` calls `completedCurrentGame()` in `prestige.js`. This grants **90 prestige points once per old prestige cycle**, increments `prestigeTotalCompletions` and marks `completedCurrentPrestige` / `completedAnyPrestige`.
- The seven old `Prestige...` buffs (Physical, Mental, Combat, Spatiomancy, Chronomancy, Bartering, Experience Overflow) are displayed in `views/menu.view.js`. `prestigeUpgrade` spends points and triggers `prestigeWithNewValues`, which reloads/resets progress and carries selected benefits. `Imbuement3` also has a special carryover rule.
- The old menu exposes `resetAllPrestiges()`; `prestigeConfirmation` writes `prestigeBackup` and clears the default save after confirmation.
- `saving.js` serializes `prestigeValues` and `buffs` into the current save and uses legacy `storyReqs` key for flags. Various game functions still call `prestigeBonus(...)`, and `Action.BuyGlasses` / resource reset behavior depends on `prestigeValues.completedAnyPrestige`.
- `views/menu.view.js` exposes **Mana Drought, Noodle Arms and Mana Burn** with "no rewards" copy. `challenges.js` overwrites game functions; `saving.js` uses a separate `idleLoopsChallenge` slot and flags such as `challengeSave.challengeMode` / `inChallenge`. The UI is a standalone menu, not a connected metagame.

**Why this is difficult:** removing the old menus is easy; safely removing their runtime methods/fields without breaking formulas, old saves, challenge imports or earned benefits is **not**. RF01/RF02 compatibility work remains relevant.

## Product alternatives for legacy prestige — pick before implementation

| Strategy | What is reused | Advantages | Drawbacks |
| --- | --- | --- | --- |
| **A. Full adaptation** | Most old buffs, broadly their numbers, relocated to nexus upgrades | More of existing balance work preserved; older players keep recognizable investment | New metagame still feels like old multiplier shop; substantial stacking with free ×10 |
| **B. Full retirement** | Retire old effects, points and interfaces | Clean design, easy to explain to new players | Potential loss of veteran investment, new numerical balance work, migration fairness and save risk |
| **C. Selective adoption** **(recommended)** | Keep only effects that fit new choices; redesign the rest; create a documented veteran entitlement/refund path | One coherent nexus economy without discarding useful mechanics; avoids dead weight | Requires explicit conversion rules and versioned migration/tests |

Under *all* strategies, the old **standalone Prestige Perks menu goes away**. Option C is the starting recommendation, **not an approved migration algorithm**.

## Provisional effect-by-effect disposition

| Existing upgrade | Possible nexus interpretation | Current recommendation / risk |
| --- | --- | --- |
| `PrestigePhysical` / `PrestigeMental` | Better XP or selective retained mastery | May be repackaged, but pure +% XP is less distinctive than knowledge/automation; preserve old entitlements fairly |
| `PrestigeCombat` | A veteran-combat specialization or a self's team preparation | Could fit a specialist; avoid multiplicative balance explosions |
| `PrestigeSpatiomancy` | Access to known findables/route familiarity | Strong thematic fit for "knowledge carried across timelines"; ensure survey bootstrap and finite pools still work |
| `PrestigeChronomancy` | Temporal control / advanced timeline execution | **High stacking risk** with the new unconditional ~10× baseline; do not blindly apply both as a hidden multiplier |
| `PrestigeBartering` | Economic preparation or standing trading arrangements | Might become an automation/strategy ability rather than a percentage multiplier |
| `PrestigeExpOverflow` | Broad training/knowledge sharing across stats | Could fit a cross-self teaching perk, but confirm impact on skill progression |
| `Imbuement3` | Existing endgame investment and replay carryover | Not automatically erased: appears in game-level training/loop mechanics and has old prestige carryover expectations |

The source is authoritative for exact as-coded numeric effects. This table is *product interpretation*, not a claim of implementation.

## Challenge disposition

| Legacy mode | Existing mechanism | Possible Real World future | Current status |
| --- | --- | --- | --- |
| **Mana Drought** | Limited merchant mana, altered speed/conversion, restricted merchant actions | Resource-scarcity / market-restriction timeline | Concept candidate, **not automatically ported** |
| **Noodle Arms** | Alternative self/team/zombie combat calculations | Challenge a combat-oriented self or rely on different team composition | Concept candidate, **not automatically ported** |
| **Mana Burn** | Different restart/time budget behavior | Escalating temporal instability timeline | Concept candidate, **not automatically ported** |

There are two viable outcomes: selected variants are **rebuilt as nexus-launched challenges with actual rewards/identities**, or discarded. In either case, **remove the old standalone menu** in the new experience. Do not rely on runtime function monkey-patching as the foundation for new challenge timelines. [RF04](integration-with-refactoring.md) will need scope review if the old modes are to be retired rather than mechanically preserved.

## Veteran save and achievement migration — mandatory scenarios

| Starting save | Requirement, independently of chosen conversion strategy |
| --- | --- |
| First-ever player, no restoration | Original nine-zone story and first completion remain available; no free premature Real World unlock |
| Existing player just completed `RestoreTime` | Nexus unlock recognized once; no duplicate 90-point old reward and no double first-meeting |
| Existing player with `prestigeTotalCompletions`, `completedAnyPrestige` and bought `Prestige...` buffs | Eligibility for Real World restored; original entitlements/history preserved in migration record and mapped explicitly to the new model |
| Existing player with unspent `prestigeCurrentPoints` | Balance not silently discarded or spent at an invented exchange rate; preserve/refund based on approved policy |
| Existing player with old `Imbuement3` carryover | Training/loop power remains coherent and explicit; do not incidentally revert important progress |
| Existing normal `idleLoops1` + `idleLoopsChallenge` save | Both slots recoverable, no overwriting one with the other; old challenge progress preserved or deliberately archived |
| Old player currently **inside** a challenge | Do not auto-reset, trap them, force lost progress or corrupt the default save; specify a safe exit/transition |
| Exported `ILSV01` save or older encoded saves | Recognized and validated; imported outer state gains safe defaults if absent |
| Multiple resets/completions and page refreshes | Idempotent migration and single entitlement per unique completion/timeline ID; recovery from failed writes |

**No automatic point conversion rate is selected.** Never assume "90 existing prestige points = 90 new nexus tokens" is correct. Save the old values intact through a recoverable compatibility bridge until a conversion decision is made. Never penalize a veteran with a silent loss just because a buff is not kept in the newly designed tree.

## Technical transition shape (proposal)

1. **Characterize** current completion, old purchase/refund, challenge entry/exit and saved-data behavior using RF01 synthetic fixtures.
2. **Define** what new permanent abilities exist and only then select a conversion/entitlement policy. Record an explicit one-way migration schema and rollback/recovery plan (RF02).
3. **Separate** nexus meta state from active timeline state, with a legacy block that can be inspected/recovered. The old game loader should not discard unknown outer metadata.
4. **Adapt** required formulas to new, explicit upgrade rules and provide safe compatibility adapters for old saves; remove old menu UI only when new nexus purchase/transition UX is functional.
5. **Remove** old challenge entry UI when a safe old-challenge exit/archive path exists; add nexus-launched variants only when individually designed and tested.
6. **Test** fresh, pre-completion, newly completed, veteran purchased, unspent, challenge-active and invalid imports in Chrome and predictor modes before releasing.
7. **Retire** obsolete code only after full call-site audit; do not delete `prestige.js`/`challenges.js` solely because their interfaces are removed.

## Product rule and unresolved decisions

There is to be **one metagame**, not both a hidden old prestige progression and an unrelated visible nexus economy. Long-lived bonuses inherited from old saves should be *resolved* into the final model rather than silently double-applied. The timing/contents of that resolution are tracked in [RW-Q01–Q03](decisions.md). Until resolved, this is design work only—not authorization for deletion or save migration.
