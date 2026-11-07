#!/usr/bin/env node
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {CAMPAIGN_ESTIMATE_SCHEMA,createFullCampaignEstimate,
  createRemainingCampaignEstimate} from './balance/campaign-estimate.mjs';

const root=resolve(import.meta.dirname,'..'),remaining=createRemainingCampaignEstimate({root}),
  full=createFullCampaignEstimate({root});
assert.equal(remaining.schema,CAMPAIGN_ESTIMATE_SCHEMA);
assert.equal(full.schema,CAMPAIGN_ESTIMATE_SCHEMA);
assert.equal(remaining.sections.length,14);
assert.equal(new Set(remaining.sections.map(item=>item.id)).size,remaining.sections.length);
assert.ok(remaining.sections.every(item=>Number.isFinite(item.realSeconds)&&item.realSeconds>0));
assert.ok(Math.abs(remaining.sections.reduce((sum,item)=>sum+item.adjustedTicks,0)-
  remaining.adjustedTicks)<1e-6);
assert.ok(Math.abs(remaining.sections.reduce((sum,item)=>sum+item.realSeconds,0)-
  remaining.realSeconds)<1e-6);
assert.ok(Math.abs(full.phases.potion.realSeconds+full.phases.remaining.realSeconds-
  full.realSeconds)<1e-6);
assert.equal(full.variants.shadow.status,'blocked');
assert.equal(full.variants.shadow.observed.potionVisible,false);
assert.equal(full.variants.shadow.observed.potionUnlocked,true,
  'Alchemy unlock alone must remain distinct from the Spatiomancy visibility gate');

const components=remaining.sections.flatMap(item=>item.components),byAction=action=>
  components.filter(component=>component.action===action),requirements=remaining.assumptions.requirements;
for(const action of ['Explore Jungle','Escape','Excursion','Explorers Guild','Thieves Guild',
  'Pick Pockets','Rob Warehouse','Insurance Fraud','Purchase Key','Leave City','Build Tower',
  'Gods Trial','Challenge Gods','Restore Time'])assert.ok(byAction(action).length>0,
    'missing campaign action '+action);
for(const town of [1,3,5,6]){
  assert.equal(byAction('SurveyZ'+town).length,1);
  assert.equal(byAction('RuinsZ'+town).length,1);
  assert.ok(byAction('HaulZ'+town).reduce((sum,item)=>sum+item.count,0)>0);
}
assert.equal(components.filter(item=>item.action.startsWith('HaulZ')).reduce((sum,item)=>sum+item.count,0),
  byAction('Build Tower').reduce((sum,item)=>sum+item.count,0));
assert.equal(byAction('Gods Trial').reduce((sum,item)=>sum+item.count,0),requirements.godsFloors);
assert.equal(byAction('Challenge Gods').reduce((sum,item)=>sum+item.count,0),requirements.challengeFloors);
assert.equal(byAction('Restore Time').reduce((sum,item)=>sum+item.count,0),1);
const gold=byAction('Insurance Fraud')[0];
assert.ok(gold.reward.perAction>0&&gold.count*gold.reward.perAction>=requirements.keyGold);
assert.ok(byAction('Gods Trial').every(item=>item.segments.length===item.count*9&&
  item.segments.every(segment=>Number.isFinite(segment.ticks)&&segment.ticks>0)));
assert.ok(components.filter(item=>item.adjustedTicks!==undefined).every(item=>
  item.adjustedTicks<=item.manaCost),'representative stats must reduce production action ticks');
assert.equal(components.some(item=>['Open Portal','Restoration'].includes(item.action)),false);
console.log('PASS calculated C08–C14 campaign baseline through Commerceville, Valley, and Restore Time.');
