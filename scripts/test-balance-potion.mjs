#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ADMISSION_VERSION} from './balance/admission.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';
import {POTION_POLICY_ACTIONS,choosePotionPolicy} from './balance/potion-policy.mjs';
import {assertPotionPrefix,assertPotionReport,createPotionAcceleration,potionSourceIdentity,
  runPotionCampaign} from './balance/potion-runner.mjs';
import {createPotionRequirementEstimate,runInjectedPotionEndpoint} from './balance/potion-estimate.mjs';

const root=resolve(import.meta.dirname,'..');
const accessible=Object.fromEntries(POTION_POLICY_ACTIONS.map(name=>[name,
  {town:0,type:'normal',visible:true,unlocked:true,accessible:true}]));
function state(overrides={}){
  return {resources:{herbs:0,wizardCollege:false},townsUnlocked:[0],curTown:0,
    levels:{wander:0,met:0,secrets:0,forest:0,shortcut:0,hermit:0,flowers:0,city:0,
      mountain:0,runes:0,cavern:0,illusions:0,tour:0,canvassed:0,meander:0,jungle:0},
    skills:{Combat:0,Magic:0,Practical:0,Alchemy:0,Spatiomancy:0,Pyromancy:0,Restoration:0},
    limited:{goodPots:0,checkedPots:0,totalPots:0,goodLocks:0,checkedLocks:0,totalLocks:0,
      goodShort:0,checkedShort:0,totalShort:0,goodWild:0,checkedWild:0,totalWild:0,
      goodGamble:0,checkedGamble:0,totalGamble:0,goodHerbs:0,checkedHerbs:0,totalHerbs:0,
      goodGeysers:0,checkedGeysers:0,totalGeysers:0,goodArtifacts:0,checkedArtifacts:0,
      totalArtifacts:0,goodDonations:0,checkedDonations:0,totalDonations:0,
      goodWells:0,checkedWells:0,totalWells:0,
      goodLong:0,checkedLong:0,totalLong:0},storyFlags:{},totals:{time:0,loops:0},
    loopingPotion:false,wunderkind:0,action:accessible,persistent:{},...overrides};
}

assert.equal(choosePotionPolicy(state()).phase,'opening');
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1]})).phase,'forest');
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1,2]})).phase,'merchanton');
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1,2,3]})).phase,'olympus');
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4]})).phase,'valhalla');
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4,5]})).phase,'startington');
assert.equal(choosePotionPolicy(state({loopingPotion:true})).phase,'carry_potion');
assert.equal(choosePotionPolicy(state({loopingPotion:false,wunderkind:1})).phase,'complete');
const craft=choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4,5,6],
  levels:{...state().levels,meander:100,jungle:50},
  skills:{...state().skills,Alchemy:200,Spatiomancy:1,Pyromancy:200}}));
assert.equal(craft.phase,'craft_and_totem');
assert.equal(craft.queue.some(item=>item.name==='Open Portal'),false);
assert.ok(craft.queue.findIndex(item=>item.name==='Start Journey')<
  craft.queue.findIndex(item=>item.name==='Looping Potion'));
assert.ok(craft.queue.findIndex(item=>item.name==='Looping Potion')<
  craft.queue.findIndex(item=>item.name==='Face Judgement'));
assert.ok(craft.queue.findIndex(item=>item.name==='Face Judgement')<
  craft.queue.findIndex(item=>item.name==='Totem'));
const craftOnly=choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4,5,6],
  levels:{...state().levels,meander:100,jungle:50},
  skills:{...state().skills,Alchemy:200,Spatiomancy:1,Pyromancy:200}}),'potion-craft');
assert.equal(craftOnly.queue.some(item=>item.name==='Totem'),false);
assert.throws(()=>choosePotionPolicy(state(),'wrong-endpoint'),/Unknown potion endpoint/);

const policySource=readFileSync(resolve(root,'scripts/balance/potion-policy.mjs'),'utf8');
for(const forbidden of ['setLevel(','addResource(','unlockTown(','resources.herbs =',
  'townsUnlocked.push(','Math.random('])assert.equal(policySource.includes(forbidden),false,
  'policy must not contain direct-state mutation: '+forbidden);

const source=potionSourceIdentity(root),acceleration=createPotionAcceleration(source.identity);
const calibration={status:'passed',sourceHash:source.identity,schedulerVersion:SCHEDULER_VERSION,
  admissionVersion:ADMISSION_VERSION,accelerationCalibrationIdentity:acceleration.identity};
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1}),/Missing browser calibration/);
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1,calibrationReport:{...calibration,
  sourceHash:'0'.repeat(64)}}),/Stale browser calibration: sourceHash/);
const incomplete=runPotionCampaign({root,seed:42,maxHostSeconds:.1,calibrationReport:calibration});
assert.equal(incomplete.status,'incomplete');
assert.equal(assertPotionReport(incomplete),true);
assert.equal(assertPotionPrefix(incomplete.prefix),true);
assert.throws(()=>assertPotionReport({...incomplete,sections:[]}),/section reconciliation/);
assert.throws(()=>assertPotionPrefix({...incomplete.prefix,canonicalStateDigest:'bad'}),/canonical digest/);
assert.equal(incomplete.endpointReached,null);
assert.ok(incomplete.failure&&incomplete.missingMilestones.length>0);
const estimate=createPotionRequirementEstimate({root});
assert.ok(estimate.sections.length>=5&&estimate.sections.length<=10);
assert.equal(new Set(estimate.sections.map(section=>section.id)).size,estimate.sections.length);
assert.ok(estimate.sections.every(section=>Number.isFinite(section.realSeconds)&&section.realSeconds>0));
assert.ok(estimate.balance.maxToMin<=3,'coherent sections should remain approximately equal in real time');
assert.ok(estimate.balance.minToMedian>=.35&&estimate.balance.maxToMedian<=1.5);
assert.ok(Math.abs(estimate.sections.reduce((sum,section)=>sum+section.realSeconds,0)-
  estimate.realSeconds)<1e-6);
const calculated=estimate.sections.flatMap(section=>section.components);
assert.equal(calculated.some(component=>['Restoration','Survey','Open Portal'].includes(component.action)),false,
  'direct route must exclude optional portal requirements');
const requiredActions=['Wander','Explore Forest','Learn Alchemy','Explore City','Climb Mountain',
  'Pyromancy','Heal The Sick','Face Judgement','Wizard College','Spatiomancy','Meander',
  'Explore Jungle','Looping Potion','Fall From Grace','Journey Forth','Totem'];
for(const action of requiredActions)assert.ok(calculated.some(component=>component.action===action),
  'missing direct-route action '+action);
const spatiomancy=calculated.find(component=>component.action==='Spatiomancy');
assert.ok(spatiomancy.collegeBonus>1&&spatiomancy.manaCost<spatiomancy.unreducedManaCost,
  'Wizard College reduction must come from game code');
assert.ok(calculated.filter(component=>component.adjustedTicks!==undefined).every(component=>
  component.adjustedTicks<=component.manaCost),'representative stats must reduce production action ticks');
assert.ok(calculated.filter(component=>component.kind==='multipart').every(component=>
  component.count>0&&component.segments.every(segment=>segment.ticks>0)));
for(const endpoint of ['potion-craft','potion-totem']){
  const injected=runInjectedPotionEndpoint({root,endpoint});
  assert.equal(injected.terminal,true);
  assert.equal(injected.state.portalOpened,false);
  const names=injected.events.map(event=>event.action);
  const prefix=['Start Journey','Continue On','Start Trek','Looping Potion'];
  assert.deepEqual(names,endpoint==='potion-craft'?prefix:
    [...prefix,'Face Judgement','Fall From Grace','Purchase Supplies','Journey Forth','Totem']);
  if(endpoint==='potion-craft')assert.equal(injected.state.loopingPotion,true);
  else{
    assert.equal(injected.state.loopingPotion,false);
    assert.equal(injected.state.wunderkind,1);
  }
}
console.log('PASS direct potion policy, calculated route sections, injected craft/Totem endpoints, and evidence guards.');
