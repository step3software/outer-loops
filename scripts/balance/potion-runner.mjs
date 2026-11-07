import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {BalanceEngine} from './engine.mjs';
import {GAME_MODEL_SCRIPTS} from '../load-game-model.mjs';
import {assertCalibration} from './report.mjs';
import {createCalibrationManifest} from './calibration.mjs';
import {SCHEDULER_VERSION} from './fast-scheduler.mjs';
import {fingerprint,readUiProfile} from './ui-inputs.mjs';
import {ADMISSION_VERSION} from './admission.mjs';
import {CLOCK_VERSION} from './clock.mjs';
import {POTION_POLICY_ACTIONS,POTION_POLICY_IDENTITY,POTION_POLICY_VERSION,
  choosePotionPolicy,readPotionPolicyState} from './potion-policy.mjs';

export const POTION_REPORT_SCHEMA = 'rw00-potion-campaign/v1';
export const POTION_PREFIX_SCHEMA = 'rw00-earned-prefix/v1';
export const POTION_CHECKPOINT_VERSION = 'rw00-potion-checkpoints/v1';
const POTION_EVENT_ACTIONS=Object.freeze(['Buy Mana Z1','Start Journey','Continue On','Start Trek',
  'Face Judgement','Wizard College','Spatiomancy','Fall From Grace','Journey Forth',
  'Open Portal','Looping Potion','Totem']);

function requireValue(condition,message){if(!condition)throw new Error('Invalid potion evidence: '+message);}

export function assertPotionPrefix(prefix){
  requireValue(prefix?.schema===POTION_PREFIX_SCHEMA,'prefix schema');
  requireValue(prefix.route==='R01'&&Number.isSafeInteger(prefix.seed),'prefix route or seed');
  requireValue(typeof prefix.sourceRevision==='string'&&prefix.sourceRevision.length===64,'source revision');
  requireValue(prefix.policyVersion===POTION_POLICY_VERSION&&
    prefix.policyIdentity===POTION_POLICY_IDENTITY,'policy identity');
  requireValue(Array.isArray(prefix.admissionLog)&&Array.isArray(prefix.semanticEvents)&&
    Array.isArray(prefix.replayRecipe),'prefix collections');
  requireValue(typeof prefix.canonicalStateDigest==='string'&&
    prefix.canonicalStateDigest.length===64,'canonical digest');
  return true;
}

export function assertPotionReport(report){
  requireValue(report?.schema===POTION_REPORT_SCHEMA,'report schema');
  requireValue(['complete','incomplete'].includes(report.status),'report status');
  requireValue(['potion-craft','potion-totem'].includes(report.endpointRequested),'endpoint');
  requireValue(Number.isSafeInteger(report.seed)&&report.seed>0,'seed');
  requireValue(Array.isArray(report.sections)&&Number.isFinite(report.totalGameplaySeconds),'sections');
  const total=report.sections.reduce((sum,section)=>sum+section.gameplaySeconds,0);
  requireValue(Math.abs(total-report.totalGameplaySeconds)<=1e-6,'section reconciliation');
  assertPotionPrefix(report.prefix);
  if(report.status==='complete'){
    requireValue(report.endpointReached===report.endpointRequested,'completed endpoint');
    const terminal=report.endpointRequested==='potion-craft'?'looping_potion_crafted':
      'looping_potion_used_at_totem';
    requireValue(report.checkpoints.some(event=>event.id===terminal&&event.kind==='completed'),
      'terminal checkpoint');
    const exact=report.prefix.semanticEvents.filter(event=>event.type==='action_completed');
    const first=action=>exact.findIndex(event=>event.action===action);
    const direct=['Start Journey','Continue On','Start Trek','Looping Potion'];
    requireValue(direct.every((action,index)=>first(action)>=0&&
      (index===0||first(action)>first(direct[index-1])),
      'direct potion travel and craft action order');
    requireValue(first('Open Portal')<0,'direct route unexpectedly used Open Portal');
    if(report.endpointRequested==='potion-craft'){
      requireValue(report.resources.loopingPotion===true,'crafted potion not retained');
    }else{
      requireValue(first('Totem')>first('Looping Potion')&&
        !report.resources.loopingPotion&&report.skills.Wunderkind>=1,
        'potion-before-Totem action order and consumption');
    }
  }else requireValue(report.failure||report.missingMilestones.length>0,'incomplete diagnosis');
  return true;
}

// These bytes determine both the browser calibration identity and calculated
// campaign provenance. Include every loaded gameplay script and all harness,
// policy, benchmark and report implementations that can change interpretation.
export const POTION_SOURCE_FILES = Object.freeze([
  ...GAME_MODEL_SCRIPTS,
  'scripts/load-game-model.mjs','scripts/balance/admission.mjs',
  'scripts/balance/ui-inputs.mjs','scripts/balance/engine.mjs',
  'scripts/balance/clock.mjs','scripts/balance/fast-scheduler.mjs',
  'scripts/balance/calibration.mjs','scripts/balance/events.mjs',
  'scripts/balance/profiler.mjs','scripts/balance/report.mjs',
  'scripts/balance/supervisor.mjs','scripts/balance/measurement-worker.mjs',
  'scripts/balance/potion-policy.mjs','scripts/balance/potion-runner.mjs',
  'scripts/balance/potion-estimate.mjs','scripts/balance/campaign-estimate.mjs',
  'scripts/measure-balance.mjs','scripts/generate-balance-timing-report.mjs',
  'scripts/test-balance-browser.mjs','scripts/test-balance-equivalence.mjs'
]);

export function potionSourceIdentity(root) {
  const hash=createHash('sha256'),files={};
  for(const path of POTION_SOURCE_FILES){
    const bytes=readFileSync(join(root,path));
    files[path]=createHash('sha256').update(bytes).digest('hex');
    hash.update(path+'\0');hash.update(bytes);
  }
  return {identity:hash.digest('hex'),files};
}

// Only actions with an explicit reference/accelerated equivalence fixture may
// receive larger batches. The real-browser calibration additionally covers
// Wander. Every other campaign action must use 20 ms precision stepping.
export const POTION_VERIFIED_BATCH_ACTIONS = Object.freeze({
  Wander:{status:'passed',maxBatchMs:10000,scenario:'opening-and-loop-exhaustion'},
  'Train Strength':{status:'passed',maxBatchMs:10000,scenario:'normal-training'},
  'Smash Pots':{status:'passed',maxBatchMs:100,scenario:'limited-resource'}
});
export function createPotionAcceleration(sourceHash) {
  return createCalibrationManifest({sourceHash,schedulerVersion:SCHEDULER_VERSION,
    scenarios:['real-browser-driver','model-boundary-equivalence'],
    actions:POTION_VERIFIED_BATCH_ACTIONS});
}

const REQUIRED_BROWSER_SCENARIOS=Object.freeze([
  'locked-buy-mana','opening-wander','visible-locked-mana','unlocked-buy-mana',
  'first-travel','excess-travel','real-search-false','real-search-true',
  'real-cap-update','real-driver-opening','accelerated-driver-opening'
]);

const MILESTONES=Object.freeze([
  ['fresh_campaign',s=>s.totals.time===0&&s.totals.loops===0],
  ['opening_mana_economy',s=>s.levels.met>=1],
  ['forest_entry',s=>s.townsUnlocked.includes(1)],
  ['forest_alchemy_and_herbs',s=>s.skills.Alchemy>=1&&s.limited.checkedHerbs>=1],
  ['merchanton_entry',s=>s.townsUnlocked.includes(2)],
  ['merchanton_preparation',s=>s.levels.city>=60],
  ['mt_olympus_entry',s=>s.townsUnlocked.includes(3)],
  ['judgement',s=>!!s.storyFlags.acceptedIntoValhalla],
  ['valhalla_training',s=>s.levels.tour>=60&&!!s.resources.wizardCollege],
  ['spatiomancy_requirement_met',s=>s.skills.Spatiomancy>=1],
  ['jungle_entry',s=>s.townsUnlocked.includes(6)],
  ['jungle_totem_unlocked',s=>s.levels.jungle>=50],
  ['potion_requirements_complete',s=>s.skills.Spatiomancy>=1&&s.skills.Pyromancy>=200&&
    s.skills.Alchemy>=200&&s.levels.meander>=100&&s.levels.jungle>=50],
  ['looping_potion_crafted',s=>s.loopingPotion],
  ['looping_potion_used_at_totem',s=>s.wunderkind>=1&&!s.loopingPotion]
]);

const CHECKPOINTS=Object.freeze({fresh_campaign:'C00',opening_mana_economy:'C01',
  forest_entry:'C02',merchanton_entry:'C03',mt_olympus_entry:'C04',judgement:'C05',
  valhalla_training:'C06',jungle_entry:'C07'});

function sectionForPhase(phase,state){
  if(phase==='opening')return 'opening_mana_economy';
  if(phase==='forest')return 'forest_alchemy_and_herbs';
  if(phase==='merchanton')return 'merchanton_preparation';
  if(phase==='olympus')return 'judgement';
  if(phase==='valhalla')return state.skills.Spatiomancy>=1?'valhalla_training':'spatiomancy_requirement_met';
  if(phase==='startington')return state.townsUnlocked.includes(6)?'jungle_totem_unlocked':'jungle_entry';
  if(phase==='craft_and_totem'||phase==='carry_potion')return state.loopingPotion?
    'looping_potion_used_at_totem':'potion_requirements_complete';
  return 'fresh_campaign';
}

function canonicalDigest(engine,fallback){
  try{
    const state=engine.semanticState();
    delete state.clock;
    return fingerprint(state);
  }catch{return fingerprint(fallback);}
}

export function runPotionCampaign({root,seed=42,endpoint='potion-totem',mode='accelerated',
  maxHostSeconds=35,calibrationReport=null,onTransition=null}={}){
  const source=potionSourceIdentity(root);
  const acceleration=createPotionAcceleration(source.identity);
  let browserCalibrationHash=null;
  if(mode==='accelerated'){
    if(!calibrationReport)throw new Error('Missing browser calibration');
    try {
      browserCalibrationHash=assertCalibration(calibrationReport,{
        phase:'calibration',sourceHash:source.identity,clockVersion:CLOCK_VERSION,
        schedulerVersion:SCHEDULER_VERSION,admissionVersion:ADMISSION_VERSION,
        accelerationCalibrationIdentity:acceleration.identity,clockQuantumMs:20
      });
    }catch(error){throw new Error('Stale or invalid browser calibration: '+error.message);}
    const observed=new Set(calibrationReport.scenarios.map(item=>item.id));
    for(const scenario of REQUIRED_BROWSER_SCENARIOS){
      if(!observed.has(scenario))throw new Error('Missing required browser calibration scenario: '+scenario);
    }
  }
  const engine=new BalanceEngine({seed,mode,calibration:mode==='reference'?undefined:acceleration,
    maxBatchMs:60000,profiler:true,maxHostMs:maxHostSeconds*1000,
    maxSimulatedSeconds:3650*86400,policyBoundaries:true,eventActions:POTION_EVENT_ACTIONS});
  if(mode==='accelerated'&&calibrationReport.uiConfigurationHash!==engine.uiInitial.configurationHash){
    throw new Error('Stale browser calibration: uiConfigurationHash');
  }
  const startedAt=performance.now(),milestones=new Map(),attempts=new Map(),sectionTotals=new Map(),
    transitions=[],semanticEvents=[];
  let state=readPotionPolicyState(engine),decision=choosePotionPolicy(state,endpoint),lastAction=null,
    lastProgressDigest=null,unchangedLoops=0,lastObs=engine.lightweightObservation();
  const mark=(name,kind,s,obs)=>{
    const key=name+':'+kind;if(milestones.has(key))return;
    const value={id:name,kind,gameplaySeconds:obs.time,effectiveSeconds:obs.effectiveSeconds,
      loopCount:obs.loops,earnedState:{townsUnlocked:s.townsUnlocked,levels:s.levels,
        skills:{Alchemy:s.skills.Alchemy,Restoration:s.skills.Restoration,Spatiomancy:s.skills.Spatiomancy,
          Pyromancy:s.skills.Pyromancy,Wunderkind:s.wunderkind},
        herbs:s.resources.herbs,loopingPotion:s.loopingPotion}};
    milestones.set(key,value);semanticEvents.push({...value,type:'milestone_'+kind});
  };
  const observe=(s,obs)=>{
    for(const [name,predicate] of MILESTONES)if(predicate(s)){mark(name,'unlocked',s,obs);mark(name,'completed',s,obs);}
    if(obs.actionName&&obs.actionName!==lastAction){
      attempts.set(obs.actionName,{action:obs.actionName,gameplaySeconds:obs.time,
        effectiveSeconds:obs.effectiveSeconds,loopCount:obs.loops});
      semanticEvents.push({type:'action_started',...attempts.get(obs.actionName)});lastAction=obs.actionName;
    }
  };
  observe(state,engine.lightweightObservation());
  const install=()=>{
    if(!decision.queue.length)throw new Error('Policy produced an empty incomplete queue');
    const result=engine.edit({op:'replay',queue:decision.queue},{source:'R01 potion policy',
      policyVersion:POTION_POLICY_VERSION});
    if(result.status!=='admitted')throw new Error('Policy admission failed: '+JSON.stringify(result));
    transitions.push({loop:state.totals.loops,phase:decision.phase,reason:decision.reason,
      queueHash:result.afterQueueHash,queue:result.resultQueue});onTransition?.(transitions.at(-1));
  };
  install();engine.start();
  let status='incomplete',failure=null,lastCheckpoint='fresh_campaign';
  try{
    while(true){
      const beforeObs=engine.lightweightObservation(),hostBefore=performance.now(),section=sectionForPhase(decision.phase,state);
      engine.burstPolicyLoops(64,{stopOnActions:[endpoint==='potion-craft'?'Looping Potion':'Totem']});
      const hostDelta=(performance.now()-hostBefore)/1000,afterObs=engine.lightweightObservation();
      lastObs=afterObs;
      const gameDelta=afterObs.time-beforeObs.time,effectiveDelta=afterObs.effectiveSeconds-beforeObs.effectiveSeconds;
      const totals=sectionTotals.get(section)??{gameplaySeconds:0,effectiveSeconds:0,hostSeconds:0};
      totals.gameplaySeconds+=gameDelta;totals.effectiveSeconds+=effectiveDelta;totals.hostSeconds+=hostDelta;
      sectionTotals.set(section,totals);
      state=readPotionPolicyState(engine);observe(state,afterObs);
      for(const [name] of MILESTONES)if(milestones.has(name+':completed'))lastCheckpoint=name;
      const reached=endpoint==='potion-craft'?state.loopingPotion:state.wunderkind>=1&&!state.loopingPotion;
      if(reached){status='complete';break;}
      if(afterObs.stopped){
        const progress=fingerprint(state.persistent);
        unchangedLoops=progress===lastProgressDigest?unchangedLoops+1:0;lastProgressDigest=progress;
        if(unchangedLoops>=8)throw Object.assign(new Error('Nonproductive policy repetition'),{code:'stalled'});
        decision=choosePotionPolicy(state,endpoint);install();engine.resumePolicyLoop();
      }
    }
  }catch(error){failure={code:error.code??'error',message:error.message};}
  let finalObs=lastObs;
  try{finalObs=engine.lightweightObservation();}catch(error){failure??={code:error.code??'error',message:error.message};}
  const ui=readUiProfile(engine.model),hostSeconds=(performance.now()-startedAt)/1000;
  const sections=[...sectionTotals].map(([id,value])=>({id,...value}));
  const measuredTotal=sections.reduce((sum,x)=>sum+x.gameplaySeconds,0);
  const unmeasured=finalObs.time-measuredTotal;
  if(unmeasured>1e-6)sections.push({id:'startup_to_first_policy_interval',gameplaySeconds:unmeasured,
    effectiveSeconds:Math.max(0,finalObs.effectiveSeconds-sections.reduce((sum,x)=>sum+x.effectiveSeconds,0)),
    hostSeconds:0});
  else if(unmeasured < -1e-6){status='incomplete';failure??={code:'time_reconciliation',
    message:'Section intervals exceeded gameplay duration'};}
  const prefix={schema:POTION_PREFIX_SCHEMA,sourceRevision:source.identity,sourceFiles:source.files,
    route:'R01',policyVersion:POTION_POLICY_VERSION,policyIdentity:POTION_POLICY_IDENTITY,seed,
    rng:engine.model.rngSnapshot(),admissionLog:engine.edits,ui:{configuration:engine.uiInitial,
      current:ui},scheduler:{version:SCHEDULER_VERSION,calibration:acceleration.identity},
    semanticEvents:[...semanticEvents,...engine.events],checkpoints:[...milestones.values()],
    canonicalStateDigest:canonicalDigest(engine,state.persistent),
    replayRecipe:transitions};
  const report={schema:POTION_REPORT_SCHEMA,status,endpointRequested:endpoint,
    endpointReached:status==='complete'?endpoint:null,route:'R01',seed,source,
    identities:{policy:POTION_POLICY_IDENTITY,scheduler:SCHEDULER_VERSION,
      calibration:acceleration.identity,browserCalibration:browserCalibrationHash,
     admission:ADMISSION_VERSION,ui:ui.effectiveConfigurationHash,
      rng:engine.model.rngSnapshot()?.algorithm,clock:CLOCK_VERSION,replay:fingerprint(transitions)},
    sections,totalGameplaySeconds:finalObs.time,totalEffectiveSeconds:finalObs.effectiveSeconds,
    hostSeconds,loopCount:finalObs.loops,completedActionCount:finalObs.completedActions,
    checkpoints:[...milestones.values()],compatibleCheckpoints:[...milestones.values()]
      .filter(x=>CHECKPOINTS[x.id]).map(x=>({...x,id:CHECKPOINTS[x.id],semanticId:x.id})),
    firstAttempts:Object.fromEntries(attempts),resources:state.resources,suppliesCost:state.suppliesCost,
    levels:state.levels,
    limited:state.limited,
    skills:{Combat:state.skills.Combat,Magic:state.skills.Magic,Practical:state.skills.Practical,
      Alchemy:state.skills.Alchemy,Spatiomancy:state.skills.Spatiomancy,
      Restoration:state.skills.Restoration,Pyromancy:state.skills.Pyromancy,Wunderkind:state.wunderkind},
    performance:engine.profiler.report({simulatedSeconds:finalObs.time,
      completedActions:finalObs.completedActions,loops:finalObs.loops}),
    missingMilestones:MILESTONES.filter(([name])=>!milestones.has(name+':completed')).map(([name])=>name),
    lastSuccessfulCheckpoint:lastCheckpoint,pendingPolicyGoal:decision.reason,failure,
    prefix,coverageLimitations:['Model VM executes unchanged original engine; real-browser coverage is calibration only.',
      'R01 potion craft and existing Totem use only; no Real World drinking action exists in source.']};
  assertPotionReport(report);
  return report;
}
