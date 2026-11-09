#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ADMISSION_VERSION} from './balance/admission.mjs';
import {BalanceEngine} from './balance/engine.mjs';
import {CLOCK_VERSION} from './balance/clock.mjs';
import {CALIBRATION_SCHEMA} from './balance/report.mjs';
import {FastScheduler} from './balance/fast-scheduler.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';
import {POTION_POLICY_ACTIONS,assessPotionCarryResources,choosePotionPolicy} from './balance/potion-policy.mjs';
import {assertPotionPrefix,assertPotionReport,createPotionAcceleration,potionSourceIdentity,
  POTION_SOURCE_FILES,runPotionCampaign} from './balance/potion-runner.mjs';
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
assert.equal(choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4,5],
  buffs:{Imbuement:1}})).phase,'startington');
assert.equal(choosePotionPolicy(state({loopingPotion:false,wunderkind:1})).phase,'complete');
const potionReadyState=state({townsUnlocked:[0,1,2,3,4,5,6],
  levels:{...state().levels,meander:100,jungle:50},
  skills:{...state().skills,Alchemy:200,Spatiomancy:1,Pyromancy:200},
  limited:{...state().limited,goodHerbs:400,totalHerbs:4000,checkedHerbs:4000,
    goodLong:27,totalLong:135,checkedLong:135}});
const craft=choosePotionPolicy(potionReadyState);
assert.equal(craft.phase,'craft_and_totem');
assert.equal(craft.queue.some(item=>item.name==='Open Portal'),false);
assert.ok(craft.queue.findIndex(item=>item.name==='Start Journey')<
  craft.queue.findIndex(item=>item.name==='Looping Potion'));
assert.ok(craft.queue.findIndex(item=>item.name==='Looping Potion')<
  craft.queue.findIndex(item=>item.name==='Face Judgement'));
assert.ok(craft.queue.findIndex(item=>item.name==='Face Judgement')<
  craft.queue.findIndex(item=>item.name==='Totem'));
const craftOnly=choosePotionPolicy(potionReadyState,'potion-craft');
assert.equal(craftOnly.queue.some(item=>item.name==='Totem'),false);
const blocked=state({...potionReadyState,
  limited:{...potionReadyState.limited,goodHerbs:70,totalHerbs:700,checkedHerbs:700,
    goodLong:6,totalLong:30,checkedLong:30}});
const constrained=assessPotionCarryResources(blocked);
assert.deepEqual(constrained.capacityShortages,['herbs','gold']);
assert.equal(choosePotionPolicy(blocked).phase,'resource_capacity_growth');
assert.ok(choosePotionPolicy(blocked).queue.length>0,
  'an improvable capacity shortage must produce progression work, never a permanent block');
const discovering=state({...potionReadyState,
  limited:{...potionReadyState.limited,goodHerbs:20,checkedHerbs:200,
    goodLong:5,checkedLong:25}});
assert.equal(choosePotionPolicy(discovering).phase,'discover_potion_resources');
assert.ok(choosePotionPolicy(discovering).queue.some(item=>
  item.name==='Gather Herbs'&&item.loopsType==='unchecked'));
const recraft=choosePotionPolicy(state({...potionReadyState,loopingPotion:true}),'potion-totem');
assert.equal(recraft.phase,'recraft_potion_and_totem');
assert.equal(['Start Journey','Continue On','Start Trek','Looping Potion','Totem'].every(name=>
  recraft.queue.some(item=>item.name===name)),true);
// Source-backed synthetic state: maxed conventional exploration and only ten
// repeatable Long Quests can still pay for the final carry through other gold.
const alternateGold=state({...potionReadyState,
  limited:{...potionReadyState.limited,goodLong:10,totalLong:50,checkedLong:50,
    goodShort:20,totalShort:100,checkedShort:100,
    goodLocks:10,totalLocks:100,checkedLocks:100}});
assert.equal(assessPotionCarryResources(alternateGold).gold,800);
const otherCarry=choosePotionPolicy(alternateGold);
assert.equal(otherCarry.phase,'craft_and_totem');
assert.equal(otherCarry.queue.find(item=>item.name==='Heal The Sick').loops,14);
assert.ok(otherCarry.queue.some(item=>item.name==='Pick Locks'));
assert.ok(otherCarry.queue.some(item=>item.name==='Short Quest'));

const herbGrowth=state({...potionReadyState,
  levels:{...potionReadyState.levels,wander:100,met:100,secrets:100,
    forest:100,shortcut:100,flowers:100},
  limited:{...potionReadyState.limited,goodHerbs:200,totalHerbs:2000,checkedHerbs:2000}});
assert.equal(choosePotionPolicy(herbGrowth).phase,'resource_capacity_growth');
assert.ok(choosePotionPolicy(herbGrowth).queue.some(item=>item.name==='Spatiomancy'),
  'continued source-backed Spatiomancy training increases herb-search capacity');
const unimbued=state({townsUnlocked:[0,1,2,3,4,5],
  levels:{...state().levels,illusions:70},
  skills:{...state().skills,Magic:300},buffs:{Imbuement:0},totalSoulstones:20});
const imbuePolicy=choosePotionPolicy(unimbued);
assert.equal(imbuePolicy.phase,'imbuement_preparation');
assert.ok(imbuePolicy.queue.some(item=>item.name==='Imbue Mind'));
assert.equal(imbuePolicy.queue.some(item=>item.name==='Meander'),false,
  'a zero-buff Meander action must never be used as earned progression');
const preparatory=choosePotionPolicy(state({...unimbued,levels:{...unimbued.levels,illusions:10}}));
assert.equal(preparatory.phase,'imbuement_preparation');
assert.ok(preparatory.queue.some(item=>item.name==='Check Walls'),
  'earn Illusions unlock before queueing Imbue Mind');

const repReady=state({...potionReadyState,townsUnlocked:[0,1,2,3,4],
  skills:{...potionReadyState.skills,Spatiomancy:0}});
const judgementPlan=choosePotionPolicy(repReady).queue;
assert.equal(judgementPlan.some(item=>item.name==='Haggle'),false,
  'resource preparation must not consume the reputation needed for positive Judgement');
assert.equal(judgementPlan.find(item=>item.name==='Heal The Sick').loops,8,
  '27 known-good Long Quests plus eight heals attain 51 reputation');
const olympus=choosePotionPolicy(state({townsUnlocked:[0,1,2,3,4]})).queue;
const at=name=>olympus.findIndex(item=>item.name===name);
assert.ok(at('Buy Supplies')>=0&&at('Start Journey')>at('Buy Supplies')&&
  at('Continue On')>at('Start Journey')&&at('Start Trek')>at('Continue On')&&
  at('Face Judgement')>at('Start Trek'),
  'an Olympus policy must traverse every intermediate town from a new loop');
assert.throws(()=>choosePotionPolicy(state(),'wrong-endpoint'),/Unknown potion endpoint/);

const policySource=readFileSync(resolve(root,'scripts/balance/potion-policy.mjs'),'utf8');
for(const forbidden of ['setLevel(','addResource(','unlockTown(','resources.herbs =',
  'townsUnlocked.push(','Math.random('])assert.equal(policySource.includes(forbidden),false,
  'policy must not contain direct-state mutation: '+forbidden);

const source=potionSourceIdentity(root),acceleration=createPotionAcceleration(source.identity);
for(const path of ['data.js','localization.js','prestige.js','scripts/balance/report.mjs',
  'scripts/balance/campaign-estimate.mjs','scripts/balance/measurement-worker.mjs',
  'index.html','views/main.view.js','views/views.js','hotkeys.js']){
  assert.ok(POTION_SOURCE_FILES.includes(path),'source identity omits '+path);
}
assert.deepEqual(Object.keys(acceleration.actions).sort(),['Smash Pots','Train Strength','Wander']);
assert.equal(acceleration.actions['Looping Potion'],undefined,
  'untested campaign actions must not receive fast batches');
const scheduler=new FastScheduler({calibration:acceleration,maxBatchMs:60000});
const observation={actionName:'Wander',stopped:false,offlineMs:0,
  bonusSpeed:1,lagSpeed:0,actionReady:true,boundaryWallMs:60,loopBoundaryWallMs:60000};
assert.equal(scheduler.select(observation,60000).level,'precision',
  'a calibrated action may not batch across an imminent action boundary');
assert.equal(scheduler.select({...observation,singleActionName:'Wander'},60000).batchMs,10000,
  'a repeated single verified action retains its tested fast batch');
assert.equal(scheduler.select({...observation,actionName:'Looping Potion'},60000).reason,
  'uncalibrated_action');
assert.equal(scheduler.select({...observation,actionReady:false},60000).reason,
  'unverified_active_action');
const earlyStop=new BalanceEngine({mode:'accelerated',calibration:acceleration,
  policyBoundaries:true,maxHostMs:5000});
assert.equal(earlyStop.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
earlyStop.start();
const terminalObservation=earlyStop.burstPolicyLoops(64,{stopOnActions:['Wander']});
assert.ok(terminalObservation.loops<64,'terminal event stops before the requested 64-loop burst');
assert.ok(earlyStop.events.some(event=>event.type==='action_completed'&&event.action==='Wander'));


const browserCases=['locked-buy-mana','opening-wander','visible-locked-mana',
  'unlocked-buy-mana','first-travel','excess-travel','real-search-false',
  'real-search-true','real-cap-update','real-driver-opening','accelerated-driver-opening'];
// Synthetic evidence SHAPE to test rejection; never counted as a real browser run.
const calibration={schema:CALIBRATION_SCHEMA,status:'passed',phase:'calibration',
  browserVersion:'Chromium structural-test-fixture',clockVersion:CLOCK_VERSION,
  clockQuantumMs:20,uiConfigurationHash:new BalanceEngine().uiInitial.configurationHash,
  sourceHash:source.identity,schedulerVersion:SCHEDULER_VERSION,
  admissionVersion:ADMISSION_VERSION,accelerationCalibrationIdentity:acceleration.identity,
  scenarios:browserCases.map(id=>({id,status:'passed',browser:{fixture:true},model:{fixture:true}}))};
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1}),/Missing browser calibration/);
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1,calibrationReport:{...calibration,
  sourceHash:'0'.repeat(64)}}),/browser calibration.*sourceHash/);
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1,calibrationReport:{...calibration,
  scenarios:[]}}),/Missing real-browser scenario proof/);
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1,calibrationReport:{...calibration,
  scenarios:calibration.scenarios.slice(1)}}),/Missing required browser calibration scenario/);
assert.throws(()=>runPotionCampaign({root,maxHostSeconds:1,calibrationReport:{...calibration,
  uiConfigurationHash:'different'}}),/uiConfigurationHash/);
const incomplete=runPotionCampaign({root,seed:42,maxHostSeconds:.1,calibrationReport:calibration});
assert.equal(incomplete.status,'incomplete');
assert.equal(assertPotionReport(incomplete),true);
assert.equal(assertPotionPrefix(incomplete.prefix),true);
assert.throws(()=>assertPotionReport({...incomplete,sections:[],totalGameplaySeconds:1}),
  /section reconciliation/,'a zero-progress timeout still needs a genuinely inconsistent negative-control report');
assert.throws(()=>assertPotionPrefix({...incomplete.prefix,canonicalStateDigest:'bad'}),/canonical digest/);
assert.equal(incomplete.endpointReached,null);
assert.ok(incomplete.failure&&incomplete.missingMilestones.length>0);

function completedReportFixture(endpoint){
  const result=structuredClone(incomplete),terminal=endpoint==='potion-craft'?
    'looping_potion_crafted':'looping_potion_used_at_totem';
  result.status='complete';result.endpointRequested=endpoint;result.endpointReached=endpoint;
  result.failure=null;
  result.resources.loopingPotion=endpoint==='potion-craft';
  result.skills.Wunderkind=endpoint==='potion-totem'?1:0;
  result.prefix.semanticEvents=['Start Journey','Continue On','Start Trek','Looping Potion',
    ...(endpoint==='potion-totem'?['Totem']:[])].map((action,index)=>
      ({type:'action_completed',action,sequence:index,loop:0,seconds:index}));
  const checkpointFor=(id,action)=>{
    const event=result.prefix.semanticEvents.find(item=>item.action===action);
    return {id,kind:'completed',gameplaySeconds:event.seconds,
      origin:{type:'action_completed',action,sequence:event.sequence,loop:event.loop}};
  };
  result.checkpoints.push(checkpointFor('looping_potion_crafted','Looping Potion'));
  if(endpoint==='potion-totem')result.checkpoints.push(checkpointFor(terminal,'Totem'));
  return result;
}
for(const endpoint of ['potion-craft','potion-totem']){
  const complete=completedReportFixture(endpoint);
  assert.equal(assertPotionReport(complete),true,'direct endpoint accepts its successful result');
  const portal=structuredClone(complete);
  portal.prefix.semanticEvents.splice(3,0,{type:'action_completed',action:'Open Portal'});
  assert.throws(()=>assertPotionReport(portal),/unexpectedly used Open Portal/);
  const misordered=structuredClone(complete);
  [misordered.prefix.semanticEvents[0],misordered.prefix.semanticEvents[1]]=
    [misordered.prefix.semanticEvents[1],misordered.prefix.semanticEvents[0]];
  assert.throws(()=>assertPotionReport(misordered),/direct potion travel/);
  const missingCraft=structuredClone(complete);
  missingCraft.checkpoints=missingCraft.checkpoints.filter(item=>item.id!=='looping_potion_crafted');
  assert.throws(()=>assertPotionReport(missingCraft),/checkpoint/);
  const forgedCraft=structuredClone(complete);
  forgedCraft.checkpoints.find(item=>item.id==='looping_potion_crafted').origin.sequence=9999;
  assert.throws(()=>assertPotionReport(forgedCraft),/action-backed checkpoint/);
  if(endpoint==='potion-totem'){
    const unconsumed=structuredClone(complete);unconsumed.resources.loopingPotion=true;
    assert.throws(()=>assertPotionReport(unconsumed),/consumption/);
    const crossLoop=structuredClone(complete);
    crossLoop.prefix.semanticEvents.find(item=>item.action==='Totem').loop=1;
    crossLoop.checkpoints.find(item=>item.id==='looping_potion_used_at_totem').origin.loop=1;
    assert.throws(()=>assertPotionReport(crossLoop),/same-loop/);
  }
}
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
  assert.ok(injected.events.every(event=>Number.isFinite(event.seconds)&&
    Number.isFinite(event.effectiveSeconds)&&event.seconds<=event.effectiveSeconds),
    'action events must use finite gameplay and effective clocks');
  assert.ok(Math.abs(injected.events.at(-1).seconds-injected.simulatedGameplaySeconds)<0.021,
    'a 5000× action timestamp must reconcile with production wall-clock accounting');
  const prefix=['Start Journey','Continue On','Start Trek','Looping Potion'];
  assert.deepEqual(names,endpoint==='potion-craft'?prefix:
    [...prefix,'Face Judgement','Fall From Grace','Purchase Supplies','Journey Forth','Totem']);
  if(endpoint==='potion-craft')assert.equal(injected.state.loopingPotion,true);
  else{
    assert.equal(injected.state.loopingPotion,false);
    assert.equal(injected.state.wunderkind,1);
  }
}
const repeats=new BalanceEngine({seed:42,mode:'reference',policyBoundaries:true,
  eventActions:['Wander'],maxHostMs:30000});
assert.equal(repeats.edit({op:'add',name:'Wander',loops:2}).status,'admitted');
// Explicitly synthetic timing fixture: a fresh ordinary loop has only 250
// mana, so it cannot finish both 250-mana Wanders. Give this event test enough
// persistent stat discounts and synthetic wall throughput without changing action
// callbacks or the production loop-mana budget.
repeats.model.evaluate('buffs.Imbuement2.amt=500;gameSpeed=100');
repeats.start();repeats.burstPolicyLoops(2);
const repeatedActions=repeats.events.filter(event=>event.type==='action_completed');
assert.deepEqual(repeatedActions.map(event=>event.action),Array(4).fill('Wander'));
assert.deepEqual(repeatedActions.map(event=>event.loop),[0,0,1,1],
  'each repeated completion must be recorded within and across loops');
assert.ok(repeatedActions.every((event,index)=>
  index===0||event.seconds>=repeatedActions[index-1].seconds));

console.log('PASS direct potion policy, repeated events, calculated sections and synthetic checkpoints.');
