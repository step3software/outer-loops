#!/usr/bin/env node
// Deterministic reference-versus-accelerated calibration scenarios. Synthetic
// setup is labelled and may never be reported as an earned campaign prefix.
import assert from 'node:assert/strict';
import {BalanceEngine} from './balance/engine.mjs';
import {assertEquivalentState,createCalibrationManifest} from './balance/calibration.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';

const calibration = createCalibrationManifest({
  sourceHash:'contract-fixtures', schedulerVersion:SCHEDULER_VERSION,
  scenarios:['opening','normal-training','limited-resource','loop-exhaustion','fractional-mana'],
  actions:{
    Wander:{status:'passed',maxBatchMs:10000,scenario:'opening-and-loop-exhaustion'},
    'Train Strength':{status:'passed',maxBatchMs:10000,scenario:'normal-training'},
    'Smash Pots':{status:'passed',maxBatchMs:100,scenario:'limited-resource'}
  }
});

function normalize(state) {
  state = structuredClone(state);
  delete state.clock.performanceCalls;
  return state;
}

function runTo(engine, targetMs) {
  while (engine.clock.elapsedMs < targetMs) engine.step({full:false});
  assert.equal(engine.clock.elapsedMs,targetMs,'scheduler must stop on declared virtual boundary');
  return normalize(engine.semanticState());
}

function compareScenario({id,targetMs,queue,setup,configure}) {
  const reference=new BalanceEngine({seed:42,mode:'reference',maxSimulatedSeconds:targetMs/1000});
  const accelerated=new BalanceEngine({seed:42,mode:'accelerated',calibration,
    maxSimulatedSeconds:targetMs/1000});
  for(const engine of [reference,accelerated]) {
    setup?.(engine);
    for(const edit of queue) assert.equal(engine.edit(edit,{source:id,policyVersion:'fixture/v1'}).status,'admitted');
    engine.start();
    configure?.(engine);
  }
  const expected=runTo(reference,targetMs);
  const actual=runTo(accelerated,targetMs);
  assert.equal(assertEquivalentState(actual,expected),true,id+' semantic state');
  assert.deepEqual(accelerated.model.rngSnapshot(),reference.model.rngSnapshot(),id+' RNG');
  assert.ok(accelerated.steps<=reference.steps,id+' may not use more outer calls');
  assert.deepEqual(accelerated.events.map(event=>event.sequence),
    accelerated.events.map((_,index)=>index),id+' event sequence');
  console.log('PASS equivalence '+id+': '+reference.steps+' reference calls, '+accelerated.steps+' accelerated calls.');
}

compareScenario({id:'opening',targetMs:60000,queue:[{op:'add',name:'Wander',loops:1000}]});
compareScenario({id:'normal-training',targetMs:40000,
  setup:engine=>engine.model.evaluate('towns[0].expMet=towns[0].expFromLevel(5)'),
  queue:[{op:'add',name:'Train Strength',loops:10}]});
compareScenario({id:'limited-resource',targetMs:10000,
  setup:engine=>engine.model.evaluate('towns[0].totalPots=1000;towns[0].goodPots=1000;towns[0].goodTempPots=1000'),
  queue:[{op:'add',name:'Smash Pots',loops:100,loopsType:'knownGood'}]});
compareScenario({id:'loop-exhaustion',targetMs:120000,
  queue:[{op:'add',name:'Wander',loops:1}]});
compareScenario({id:'fractional-mana',targetMs:20000,
  queue:[{op:'add',name:'Wander',loops:1000}],
  configure:engine=>engine.model.evaluate('options.fractionalMana=true;actions.adjustTicksNeeded()')});

function persistentBoundaryState(engine) {
  return JSON.parse(JSON.stringify(engine.evaluate(`({
    resources,totals,progress:towns[0].expWander,
    stats:Object.fromEntries(Object.entries(stats).filter(([,v])=>v.levelExp).map(([k,v])=>
      [k,[v.levelExp.totalExp,v.talentLevelExp.totalExp]]))
  })`)));
}
const boundaryReference=new BalanceEngine({seed:42,mode:'accelerated',calibration,
  policyBoundaries:true,maxHostMs:120000});
const boundaryBurst=new BalanceEngine({seed:42,mode:'accelerated',calibration,
  policyBoundaries:true,maxHostMs:120000});
for(const engine of [boundaryReference,boundaryBurst]){
  assert.equal(engine.edit({op:'add',name:'Wander',loops:1},
    {source:'policy-burst-equivalence',policyVersion:'fixture/v1'}).status,'admitted');
  engine.start();
}
while(boundaryReference.snapshot().loops<64){
  boundaryReference.step({full:false});
  if(boundaryReference.snapshot().stopped&&boundaryReference.snapshot().loops<64){
    boundaryReference.resumePolicyLoop();
  }
}
boundaryBurst.burstPolicyLoops(64);
assert.deepEqual(persistentBoundaryState(boundaryBurst),persistentBoundaryState(boundaryReference));
assert.deepEqual(boundaryBurst.model.rngSnapshot(),boundaryReference.model.rngSnapshot());
assert.equal(boundaryBurst.snapshot().stopped,true);
console.log('PASS policy-burst equivalence: 64 production restart boundaries in one outer call.');

assert.throws(()=>new BalanceEngine({mode:'accelerated'}),/calibration manifest/);
assert.throws(()=>new BalanceEngine({mode:'accelerated',calibration:{...calibration,identity:'stale'}}),
  /Stale calibration/);
const drift=normalize(new BalanceEngine().semanticState());
const changed=structuredClone(drift);changed.resources.gold=1;
assert.throws(()=>assertEquivalentState(changed,drift),/resources.gold/,
  'deliberate state divergence must fail calibration');

const wanderOnly=createCalibrationManifest({sourceHash:'precision-fallback',
  schedulerVersion:SCHEDULER_VERSION,scenarios:['wander-only'],actions:{
    Wander:{status:'passed',maxBatchMs:10000,scenario:'wander-only'}
  }});
const fallback=new BalanceEngine({mode:'accelerated',calibration:wanderOnly});
assert.equal(fallback.edit({op:'add',name:'Smash Pots',loops:1}).status,'admitted');
fallback.start();
assert.deepEqual(fallback.step({full:false}).batch,
  {batchMs:20,level:'precision',reason:'uncalibrated_action'},
  'unknown actions must use reference stepping');

const diagnostic=new BalanceEngine({mode:'diagnostic',calibration:wanderOnly});
assert.equal(diagnostic.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
diagnostic.start();diagnostic.step();
assert.ok(diagnostic.diagnostics().performance,'diagnostic mode enables aggregate profiling');
console.log('PASS accelerated execution remains fail-closed without current calibration.');
