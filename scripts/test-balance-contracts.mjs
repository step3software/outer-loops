#!/usr/bin/env node
// RW00 deterministic contracts. Synthetic gate fixtures are NOT earned routes.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';
import {BalanceEngine} from './balance/engine.mjs';
import {admitQueueEdit,queueSnapshot} from './balance/admission.mjs';
import {createDefaultUiProfile,installUiProfile,readUiProfile,changeUiInput,
  assertMatchingUiProfiles,fingerprint} from './balance/ui-inputs.mjs';
import {assertCalibration,assertCompleteReport,assertComparableBaseline,
  CHECKPOINTS,REPORT_SCHEMA,CALIBRATION_SCHEMA} from './balance/report.mjs';

const unpack = (model, expr) => JSON.parse(JSON.stringify(model.evaluate(expr)));
const fresh = () => loadGameModel({withViewStubs:true,rngSeed:42});

function invariant(model) {
  return {
    queue:queueSnapshot(model),
    game:unpack(model,'({resources,timer,timeCounter,effectiveTime,gameTicksLeft,' +
      'storyFlags,storyVars,totals,escapeStarted,curTown})'),
    random:model.rngSnapshot()
  };
}

// The low-level API accepts a player-inaccessible edit; policy admission must not.
{
  const model=fresh();
  let before=invariant(model);
  for (const change of [
    {op:'add',name:'Buy Mana Z1',loops:1},
    {op:'add',name:'Imaginary Action',loops:1},
    {op:'add',name:'Wander',loops:0},
    {op:'add',name:'Wander',loops:Infinity},
    {op:'add',name:'Wander',loops:1.5},
    {op:'add',name:'Wander',loops:'4'},
    {op:'replace',queue:[{name:'Wander',loops:1}]}
  ]) {
    const result=admitQueueEdit(model,change);
    assert.equal(result.status,'invalid_route',JSON.stringify(change));
    assert.deepEqual(invariant(model),before,'rejection has zero gameplay/queue/RNG side effects');
  }
  // Wander level 3 makes buying mana visible, but not yet unlocked at level 20.
  model.evaluate('towns[0].expWander=towns[0].expFromLevel(3)');
  before=invariant(model);
  assert.equal(admitQueueEdit(model,{op:'add',name:'Buy Mana Z1',loops:1}).reason,'locked_action');
  assert.deepEqual(invariant(model),before);
  // Start Journey is visibly listed at skill sum 15, unlocked at 35.
  model.evaluate('skills.Combat.levelExp.setLevel(20);resources.supplies=true');
  before=invariant(model);
  assert.equal(admitQueueEdit(model,{op:'add',name:'Start Journey',loops:1}).reason,'locked_action');
  assert.deepEqual(invariant(model),before);
  const adversarial=fresh();
  adversarial.evaluate('actions.addAction("Buy Mana Z1",1)');
  assert.equal(queueSnapshot(adversarial).length,1,'ungated low-level method is demonstrably permissive');
  console.log('PASS RW00 queue negatives: locked/invisible, unknown, invalid count, unsupported edit, no state/RNG mutation.');
}

{
  const model=fresh();
  const good=admitQueueEdit(model,{op:'add',name:'Wander',loops:1});
  assert.equal(good.status,'admitted',JSON.stringify(good));
  assert.equal(queueSnapshot(model)[0].name,'Wander');
  assert.notEqual(good.beforeQueueHash,good.afterQueueHash);
  assert.equal(admitQueueEdit(model,{op:'setCount',index:0,loops:3}).status,'admitted');
  assert.equal(queueSnapshot(model)[0].loops,3);
  assert.equal(admitQueueEdit(model,{op:'setEnabled',index:0,enabled:false}).status,'admitted');
  assert.equal(queueSnapshot(model)[0].disabled,true);
  assert.equal(admitQueueEdit(model,{op:'setEnabled',index:0,enabled:true}).status,'admitted');
  assert.equal(queueSnapshot(model)[0].disabled,false);
  assert.equal(admitQueueEdit(model,{op:'replay',queue:[{name:'Wander',loops:2}]}).status,'admitted');
  model.evaluate('restart()');
  assert.equal(unpack(model,'actions.current.map(a=>a.name)')[0],'Wander');
  assert.equal(queueSnapshot(model)[0].loops,2,'queued replay persists after real restart');

  // A travel entry is limited to one instance, even with otherwise earned gates.
  const travel=fresh();
  travel.evaluate('skills.Combat.levelExp.setLevel(35);resources.supplies=true');
  assert.equal(admitQueueEdit(travel,{op:'add',name:'Start Journey',loops:1}).status,'admitted');
  const before=invariant(travel);
  assert.equal(admitQueueEdit(travel,{op:'add',name:'Start Journey',loops:1}).status,'invalid_route');
  assert.deepEqual(invariant(travel),before);
  console.log('PASS RW00 admission positives: add/count/enable/replay, actual restart, excess travel rejection.');
}

// source-backed fresh controls and genuine VM HTMLInputElements
{
  const model=fresh();
  const profile=createDefaultUiProfile(model);
  assert.equal(profile.inputs.searchTogglerPots.checked,false);
  assert.equal(profile.inputs.buffRitualCap.value,'666');
  const initial=installUiProfile(model,profile);
  assert.equal(unpack(model,'getBuffCap("Ritual")'),666);
  const event=changeUiInput(model,'searchTogglerPots',true);
  const checked=readUiProfile(model);
  assert.notEqual(initial.stateHash,checked.stateHash);
  assert.equal(checked.changes.length,1);
  assert.equal(event.beforeHash,initial.stateHash);
  changeUiInput(model,'buffRitualCap','5');
  assert.equal(unpack(model,'getBuffCap("Ritual")'),5);
  assert.equal(unpack(model,'buffCaps.Ritual'),5);
  assert.notEqual(readUiProfile(model).stateHash,checked.stateHash);

  const second=fresh();
  installUiProfile(second,createDefaultUiProfile(second));
  assert.throws(()=>assertMatchingUiProfiles(readUiProfile(model),readUiProfile(second)));
  const original=model.balanceUI.elements.get('buffRitualCap');
  original.value='not-a-number';
  assert.throws(()=>readUiProfile(model),/Invalid cap/);
  original.value='5';
  original.type='text';
  assert.throws(()=>readUiProfile(model),/wrong-type/);
  original.type='number';
  model.evaluate('buffCaps.Ritual=6');
  assert.throws(()=>readUiProfile(model),/mismatch/);
  model.evaluate('buffCaps.Ritual=5');
  const search=model.balanceUI.elements.get('searchTogglerPots');
  model.balanceUI.elements.delete('searchTogglerPots');
  assert.throws(()=>readUiProfile(model),/Missing or wrong-type/);
  model.balanceUI.elements.set('searchTogglerPots',search);
  assert.throws(()=>installUiProfile(fresh(),{...profile,inputs:{}}),/missing or unknown/i);
  console.log('PASS RW00 strict UI: defaults, cap synchronization, setting hashes and missing/wrong/invalid controls.');
}

// Synthetic limited-resource fixture: a missing checkbox is NOT the same as unchecked.
function potCase(checked, withProfile) {
  const model=fresh();
  if(withProfile) {
    installUiProfile(model,createDefaultUiProfile(model));
    if(checked) changeUiInput(model,'searchTogglerPots',true);
  }
  return unpack(model,'(() => {const t=towns[0];t.totalPots=20;t.checkedPots=9;' +
    't.goodPots=1;t.goodTempPots=1;Action.SmashPots.finish();' +
    'return {checked:t.checkedPots,good:t.goodPots,temp:t.goodTempPots,loot:t.lootFromPots};})()');
}
{
  const missing=potCase(false,false);
  const unchecked=potCase(false,true);
  const checked=potCase(true,true);
  assert.equal(missing.checked,9);
  assert.equal(checked.checked,9);
  assert.equal(unchecked.checked,10);
  assert.equal(unchecked.good,2);
  assert.equal(checked.temp,0);
  assert.equal(missing.temp,0);
  console.log('PASS RW00 real limited-action reward path: missing/unchecked/checked are distinguished.');
}

{
  const a=new BalanceEngine({seed:42});
  const b=new BalanceEngine({seed:42});
  const c=new BalanceEngine({seed:1});
  assert.deepEqual(a.model.rngSnapshot(),b.model.rngSnapshot());
  assert.notDeepEqual(a.model.rngSnapshot(),c.model.rngSnapshot());
  a.model.evaluate('resources.gold=22');
  assert.equal(unpack(b.model,'resources.gold'),0,'fresh VMs isolate resources');
  assert.equal(a.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  assert.equal(b.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  a.start();b.start();
  const aRun=a.runSteps(260),bRun=b.runSteps(260);
  assert.deepEqual(aRun.last,bRun.last,'same seed, route, inputs and virtual clock reproduce state');
  assert.ok(aRun.last.progress>=200,'actual queued Wander completes');
  assert.ok(aRun.last.time>4.5,'real driver charged first action waiting time');
  assert.ok(aRun.last.loops>=1,'real driver advanced a loop boundary');
  assert.equal(aRun.last.offlineMs,0,'no lag or offline bonus is silently applied');
  assert.ok(Math.abs(aRun.last.time -
    aRun.last.closedLoopSeconds-aRun.last.activeLoopSeconds)<1e-7);
  assert.ok(aRun.last.effectiveSeconds>=aRun.last.time-1e-8);
  assert.equal(a.diagnostics().status,'incomplete','opening fixture is not a full-route baseline');
  console.log('PASS RW00 clock: real driver ticks, replayed seed, loop accounting, no offline credit.');
}

// Synthetic reporter fixture tests corruption sensitivity, not actual C14 completion.
function calibration() {
  return {schema:CALIBRATION_SCHEMA,status:'passed',browserVersion:'Chrome fixture only',
    sourceHash:'a'.repeat(64),admissionVersion:'a/v1',schedulerVersion:'s/v1',
    uiConfigurationHash:'ui-default',scenarios:[{status:'passed',browser:true,model:true}]};
}
function report(cal=calibration()) {
  return {schema:REPORT_SCHEMA,status:'complete',route:'R01',scenario:'baseline',
    sourceHash:cal.sourceHash,policyHash:'policy',optionsHash:'options',
    uiConfigurationHash:cal.uiConfigurationHash,uiChangePolicy:'recorded-ui-events/v1',
    admissionVersion:cal.admissionVersion,checkpointVersion:'c/v1',
    schedulerVersion:cal.schedulerVersion,calibrationHash:fingerprint(cal),
    seeds:[{seed:42,status:'complete',totalSeconds:14,effectiveSeconds:14,
      loopCount:1,hostSeconds:0.1,uiStateHash:'ui-state',
      checkpoints:CHECKPOINTS.map((id,i)=>({id,status:'complete',seconds:i,
        ...(id==='C14'?{successfulRestoreTime:true}:{})})),
      attribution:{intervals:[{id:'all',seconds:14}],locations:[{id:'all',seconds:14}]}}]};
}
{
  const cal=calibration(),baseline=report(cal);
  assert.ok(assertCalibration(cal,{sourceHash:cal.sourceHash}));
  assert.equal(assertCompleteReport(baseline,cal),true);
  const corrupt=fn=>{const r=structuredClone(baseline);fn(r);assert.throws(()=>assertCompleteReport(r,cal));};
  corrupt(r=>{r.sourceHash='';});
  corrupt(r=>{r.seeds[0].status='stalled';});
  corrupt(r=>{r.seeds[0].checkpoints.pop();});
  corrupt(r=>{r.seeds[0].checkpoints[12].seconds=NaN;});
  corrupt(r=>{r.seeds[0].attribution.intervals[0].seconds=28;});
  corrupt(r=>{r.seeds[0].checkpoints[14].successfulRestoreTime=false;});
  corrupt(r=>{r.uiConfigurationHash='changed';});
  corrupt(r=>{r.calibrationHash='stale';});
  const candidate=structuredClone(baseline);
  candidate.sourceHash='b'.repeat(64);
  assertComparableBaseline(baseline,candidate);
  candidate.uiConfigurationHash='different';
  assert.throws(()=>assertComparableBaseline(baseline,candidate),/Incomparable/);
  assert.throws(()=>assertCalibration({...cal,status:'failed'}),/not passed/);
  console.log('PASS RW00 report: calibration gate, false completion, accounting and incompatible runs rejected.');
}
console.log('PASS RW00 contract suite (synthetic fixtures explicitly excluded from earned campaign evidence).');
