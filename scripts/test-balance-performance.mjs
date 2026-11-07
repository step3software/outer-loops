#!/usr/bin/env node
import assert from 'node:assert/strict';
import {BalanceEngine} from './balance/engine.mjs';
import {BalanceProfiler} from './balance/profiler.mjs';
import {assertEquivalentState,createCalibrationManifest} from './balance/calibration.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';

const targetMs=120000;
const calibration=createCalibrationManifest({sourceHash:'performance-fixture',
  schedulerVersion:SCHEDULER_VERSION,scenarios:['long-wander'],actions:{
    Wander:{status:'passed',maxBatchMs:10000,scenario:'long-wander'}
  }});

function run(mode) {
  const profiler=new BalanceProfiler({budgetMs:60000});
  const engine=new BalanceEngine({mode,seed:42,profiler,calibration:mode==='reference'?undefined:calibration,
    maxHostMs:60000,maxSimulatedSeconds:targetMs/1000});
  assert.equal(engine.edit({op:'add',name:'Wander',loops:100000},
    {source:'performance-fixture',policyVersion:'v1'}).status,'admitted');
  engine.start();
  while(engine.clock.elapsedMs<targetMs)engine.step({full:false});
  return {engine,state:engine.semanticState(),report:engine.diagnostics().performance};
}

const reference=run('reference');
const accelerated=run('accelerated');
const normalized=value=>{const copy=structuredClone(value);delete copy.clock.performanceCalls;return copy;};
assert.equal(assertEquivalentState(normalized(accelerated.state),normalized(reference.state)),true,
  'performance run must remain semantically equivalent');
const callReduction=reference.report.outerSchedulingCalls/accelerated.report.outerSchedulingCalls;
assert.ok(callReduction>=100,'expected at least 100x fewer outer calls, observed '+callReduction.toFixed(1)+'x');
assert.equal(accelerated.state.rng.calls,reference.state.rng.calls);
assert.equal(accelerated.report.precisionFallbacks>=0,true);
console.log('PASS scheduler performance: '+callReduction.toFixed(1)+'x fewer outer calls ('+
  reference.report.outerSchedulingCalls+' -> '+accelerated.report.outerSchedulingCalls+').');
console.log(JSON.stringify({reference:reference.report,accelerated:accelerated.report},null,2));
