#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createFullCampaignEstimate} from './balance/campaign-estimate.mjs';

const root=resolve(import.meta.dirname,'..'),output=resolve(root,
  'docs/design/outer-loop/calculated-timing-baseline.md'),mode=process.argv[2]??'--check';
const estimate=createFullCampaignEstimate({root}),potion=estimate.phases.potion,
  remaining=estimate.phases.remaining,fmt=value=>value.toLocaleString('en-US',
    {minimumFractionDigits:2,maximumFractionDigits:2}),
  row=section=>`| ${section.id} | ${section.label} | ${fmt(section.realDays)} |`,
  sum=sections=>sections.reduce((total,section)=>total+section.realDays,0),
  commerce=remaining.sections.slice(0,3),stones=remaining.sections.slice(3,7),
  godsTo90=remaining.sections.slice(7,9),gods91To100=remaining.sections.slice(9,13),
  challenge=remaining.sections.slice(13);
const markdown=`# Calculated original-campaign timing baseline

> **Generated reference.** Run \`npm run write:balance:timing\` after changing game balance or calculation assumptions. \`npm run check:balance:timing\` fails when this report drifts. Do not hand-edit calculated values.

**Status:** source-backed planning calculation, not an earned campaign simulation or an approved pacing target.  
**Source identity:** \`${estimate.sourceRevision}\`<br>
**Calculation schema:** \`${estimate.schema}\`

## Result summary

| Portion | Calculated continuous real time |
| --- | ---: |
| Direct Looping Potion creation and Totem consumption | ${fmt(potion.realDays)} days |
| Jungle completion, Commerceville and Valley key | ${fmt(sum(commerce))} days |
| Four Survey/Ruins/stone/tower quarters | ${fmt(sum(stones))} days |
| Gods Trial floors 1–90 | ${fmt(sum(godsTo90))} days |
| Gods Trial floors 91–100 | ${fmt(sum(gods91To100))} days |
| Challenge Gods powers and Restore Time | ${fmt(sum(challenge))} days |
| **Remaining campaign after the Totem** | **${fmt(remaining.realDays)} days** |
| **Full calculated campaign through Restore Time** | **${fmt(estimate.realDays)} days / ${fmt(estimate.realYears)} years** |

“Real time” here is production stat-adjusted action ticks divided by the production base mana rate of ${fmt(estimate.baseManaPerSecond)} mana per second. It represents continuous waiting time under the stated assumptions; it excludes human decision time.

## Direct potion and Totem route — ${fmt(potion.realDays)} days

| Section | Coherent route interval | Days |
| --- | --- | ---: |
${potion.sections.map(row).join('\n')}
|  | **Total** | **${fmt(potion.realDays)}** |

This route covers Alchemy 200, Pyromancy 200, the first Wizard College reduction, Spatiomancy 1, Meander 100, Jungle 50, Looping Potion creation and Totem consumption. It deliberately excludes the optional Open Portal route, Survey 75 and Restoration 1000.

The terminal action order exercised by the synthetic endpoint test is:

\`Start Journey → Continue On → Start Trek → Looping Potion → Face Judgement → Fall From Grace → Purchase Supplies → Journey Forth → Totem\`

## Remaining original campaign — ${fmt(remaining.realDays)} days

| Section | Coherent route interval | Days |
| --- | --- | ---: |
${remaining.sections.map(row).join('\n')}
|  | **Total after Totem** | **${fmt(remaining.realDays)}** |

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

Run \`npm run test:balance\` for the combined contract, equivalence, supervisor, potion and full-campaign calculated baseline suite. Run \`npm run test:balance:campaign\` for only the remaining/full-campaign calculation assertions.
`;

if(mode==='--write'){
  writeFileSync(output,markdown,'utf8');
  console.log('WROTE '+output);
}else if(mode==='--check'){
  let existing='';try{existing=readFileSync(output,'utf8').replace(/\r\n/g,'\n');}catch{}
  if(existing!==markdown){console.error('Calculated timing report is stale. Run npm run write:balance:timing.');
    process.exitCode=1;}else console.log('PASS calculated timing report is current.');
}else throw new RangeError('Use --write or --check');
