# Calculated original-campaign timing baseline

> **Generated reference.** Run `npm run write:balance:timing` after changing game balance or calculation assumptions. `npm run check:balance:timing` fails when this report drifts. Do not hand-edit calculated values.

**Status:** source-backed planning calculation, not an earned campaign simulation or an approved pacing target.  
**Source identity:** `fcf757cd3e5896b43088e343456ced99e8987fd1b1277f794ac8791b995569c3`  
**Calculation schema:** `rw00-calculated-campaign-estimate/v1`

## Result summary

| Portion | Calculated continuous real time |
| --- | ---: |
| Direct Looping Potion creation and Totem consumption | 29.23 days |
| Jungle completion, Commerceville and Valley key | 19.90 days |
| Four Survey/Ruins/stone/tower quarters | 352.30 days |
| Gods Trial floors 1–90 | 126.70 days |
| Gods Trial floors 91–100 | 1,623.62 days |
| Challenge Gods powers and Restore Time | 303.26 days |
| **Remaining campaign after the Totem** | **2,425.77 days** |
| **Full calculated campaign through Restore Time** | **2,455.00 days / 6.72 years** |

“Real time” here is production stat-adjusted action ticks divided by the production base mana rate of 50.00 mana per second. It represents continuous waiting time under the stated assumptions; it excludes human decision time.

## Direct potion and Totem route — 29.23 days

| Section | Coherent route interval | Days |
| --- | --- | ---: |
| S01 | Foundations, Forest access, and Hermit mastery | 1.84 |
| S02 | Alchemy 0–100 and its herbs | 2.93 |
| S03 | Alchemy 100–160 and its herbs | 4.54 |
| S04 | Alchemy 160–200 and Merchanton access | 4.28 |
| S05 | Mt. Olympus gates and Pyromancy 0–100 | 3.12 |
| S06 | Pyromancy 100–160 | 3.95 |
| S07 | Pyromancy 160–200 and first Valhalla entry | 3.65 |
| S08 | Wizard College, Startington, and Jungle path 0–35 | 2.72 |
| S09 | Totem unlock and direct potion carry | 2.20 |
|  | **Total** | **29.23** |

This route covers Alchemy 200, Pyromancy 200, the first Wizard College reduction, Spatiomancy 1, Meander 100, Jungle 50, Looping Potion creation and Totem consumption. It deliberately excludes the optional Open Portal route, Survey 75 and Restoration 1000.

The terminal action order exercised by the synthetic endpoint test is:

`Start Journey → Continue On → Start Trek → Looping Potion → Face Judgement → Fall From Grace → Purchase Supplies → Journey Forth → Totem`

## Remaining original campaign — 2,425.77 days

| Section | Coherent route interval | Days |
| --- | --- | ---: |
| C01 | Jungle 50–100 and Commerceville entry | 10.92 |
| C02 | Commerceville Explorer bootstrap | 0.05 |
| C03 | Commerceville Thieves route and Valley key | 8.92 |
| C04 | Survey/ruins origin 1 and tower to 25% | 79.45 |
| C05 | Survey/ruins origin 3 and tower to 50% | 83.88 |
| C06 | Survey/ruins origin 5 and tower to 75% | 95.98 |
| C07 | Survey/ruins origin 6 and tower to 100% | 92.99 |
| C08 | Gods Trial floors 1–80 | 9.19 |
| C09 | Gods Trial floors 81–90 | 117.50 |
| C10 | Gods Trial floors 91–96 | 485.63 |
| C11 | Gods Trial floors 97–98 | 422.78 |
| C12 | Gods Trial floor 99 | 311.05 |
| C13 | Gods Trial floor 100 | 404.16 |
| C14 | Challenge Gods powers and Restore Time | 303.26 |
|  | **Total after Totem** | **2,425.77** |

The four stone sections include the source-derived Survey and Ruins gates for origins 1, 3, 5 and 6, the matching known-good stone hauls and all production-derived tower contributions. The divine sections use the production trial floor counts and exponential loop costs. The final ten Gods Trial floors dominate the result even under the generous late-game combat assumptions below.

## Assumptions and exclusions

The direct potion calculation uses representative stat levels 100–850, Wizard College segment 3 and injected Imbuement 100 for Meander. The remaining calculation uses representative stat levels 900–1,900, Thieves Guild segment 18, late skills (Magic 10,000; Combat 50,000; Pyromancy and Restoration 10,000; Leadership 1,000), Feast 100, all three Imbuements at their stated late values, five team members, armor 100 and 25 enchantments.

Counts and thresholds are read or exercised from initialized production code: unlock predicates, runtime town-level curves, action costs and rewards, skill XP, stat multipliers, Survey scaling, key price, tower requirement and trial floor counts. Changing those production numbers changes the calculation.

The totals assume known-good maps, herbs, artifacts, stones and other limited resources. They exclude discovery failures, repeated-loop travel and mana-economy overhead, and the time required to acquire the injected late-game stats, skills, buffs, party and equipment. Accordingly, these are comparison-ready planning estimates, not technically exact completion times.

The low-reputation shadow route is recorded as **blocked**, not assigned a fabricated duration: Alchemy 200 unlocks Looping Potion, but without Valhalla's Spatiomancy the action remains invisible. Optional Adventure/Crafting, investment, shortcut and ritual comparisons are separate scenarios and are not added to this route.

## Calculation and test references

- [Potion-route calculator](../../../scripts/balance/potion-estimate.mjs) and [potion-route tests](../../../scripts/test-balance-potion.mjs)
- [Remaining/full-campaign calculator](../../../scripts/balance/campaign-estimate.mjs) and [campaign baseline tests](../../../scripts/test-balance-campaign-estimate.mjs)
- [Balance engine tests](../../../scripts/test-balance-contracts.mjs), [scheduler equivalence tests](../../../scripts/test-balance-equivalence.mjs) and [browser calibration](../../../scripts/test-balance-browser.mjs)
- [Verification matrix](../../development/validation.md) and [RW00 implementation plan](balance-tests-implementation-plan.md)

Run `npm run test:balance` for the combined contract, equivalence, supervisor, potion and full-campaign calculated baseline suite. Run `npm run test:balance:campaign` for only the remaining/full-campaign calculation assertions.
