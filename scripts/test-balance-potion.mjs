#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ADMISSION_VERSION} from './balance/admission.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';
import {POTION_POLICY_ACTIONS,choosePotionPolicy} from './balance/potion-policy.mjs';
import {assertPotionPrefix,assertPotionReport,createPotionAcceleration,potionSourceIdentity,
  runPotionCampaign} from './balance/potion-runner.mjs';

const root=resolve(import.meta.dirname,'..');
const accessible=Object.fromEntries(POTION_POLICY_ACTIONS.map(name=>[name,
  {town:0,type:'normal',visible:true,unlocked:true,accessible:true}]));
function state(overrides={}){
  return {resources:{herbs:0,wizardCollege:false},townsUnlocked:[0],curTown:0,
    levels:{wander:0,met:0,secrets:0,forest:0,shortcut:0,hermit:0,flowers:0,city:0,
      mountain:0,runes:0,tour:0,canvassed:0,meander:0,jungle:0},
    skills:{Combat:0,Magic:0,Practical:0,Alchemy:0,Spatiomancy:0,Pyromancy:0},
    limited:{goodPots:0,checkedPots:0,totalPots:0,goodLocks:0,checkedLocks:0,totalLocks:0,
      goodShort:0,checkedShort:0,totalShort:0,goodWild:0,checkedWild:0,totalWild:0,
      goodGamble:0,checkedGamble:0,totalGamble:0,goodHerbs:0,checkedHerbs:0,totalHerbs:0,
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
console.log('PASS potion policy phases, mutation guard, calibration failures and incomplete evidence validation.');
