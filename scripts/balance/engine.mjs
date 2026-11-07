// Test-only virtual driver. Calls the production executeGameTicks/loopEnd/restart.
import {performance as hostPerformance} from 'node:perf_hooks';
import {loadGameModel} from '../load-game-model.mjs';
import {CLOCK_VERSION, virtualClock} from './clock.mjs';
import {admitQueueEdit, ADMISSION_VERSION} from './admission.mjs';
import {createDefaultUiProfile, installUiProfile, readUiProfile} from './ui-inputs.mjs';
import {FastScheduler, SCHEDULER_VERSION} from './fast-scheduler.mjs';
import {collectEvents, EVENT_VERSION} from './events.mjs';
import {BalanceProfiler} from './profiler.mjs';

export class BalanceRuntimeError extends Error {
  constructor(code, message, state) {
    super(message);
    this.name = 'BalanceRuntimeError';
    this.code = code;
    this.state = state;
  }
}

function read(model, expression) {
  return JSON.parse(JSON.stringify(model.evaluate(expression)));
}

export class BalanceEngine {
  constructor({seed = 42, quantumMs = 20, uiProfile, mode = 'reference', calibration,
    maxBatchMs = 10000, profiler = false, maxHostMs = 30*60*1000,
    maxSimulatedSeconds = 180*86400, policyBoundaries = false, eventActions = null} = {}) {
    if (!Number.isFinite(quantumMs) || quantumMs <= 0 || quantumMs > 20) {
      throw new RangeError('Uncalibrated quantum: use 0 < quantumMs <= 20');
    }
    if (!['reference','accelerated','diagnostic'].includes(mode)) {
      throw new RangeError('Unknown balance execution mode');
    }
    this.clock = virtualClock();
    this.model = loadGameModel({withViewStubs:true, clock:this.clock, rngSeed:seed});
    this.seed = seed;
    this.mode = mode;
    this.quantumMs = quantumMs;
    this.scheduler = mode === 'reference' ? null : new FastScheduler({
      calibration, quantumMs, maxBatchMs
    });
    this.profiler = (profiler === true || (mode === 'diagnostic' && profiler === false)) ?
      new BalanceProfiler({budgetMs:maxHostMs}) : profiler || null;
    this.maxHostMs = maxHostMs;
    this.maxSimulatedSeconds = maxSimulatedSeconds;
    this.policyBoundaries = policyBoundaries;
    this.filteredEvents = Array.isArray(eventActions);
    this.startHostMs = hostPerformance.now();
    this.uiInitial = installUiProfile(this.model, uiProfile ?? createDefaultUiProfile(this.model));
    this.edits = [];
    this.started = false;
    this.steps = 0;
    this.events = [];
    this.model.evaluate('globalThis.__balanceCounters={actionTicks:0,uiUpdates:0};' +
      'globalThis.__balanceActionEvents=[];globalThis.__balanceEventFilter=' +
      (Array.isArray(eventActions)?'new Set('+JSON.stringify(eventActions)+')':'null') + ';' +
      'const __balanceActionTick=actions.tick;actions.tick=function(...args){' +
      '__balanceCounters.actionTicks++;const before=totals.actions;' +
      'const speed=getSpeedMult(),speedAtTick=gameSpeed,bonusAtTick=bonusSpeed;' +
      'const spent=__balanceActionTick.apply(this,args);if(totals.actions>before&&' +
      '(!__balanceEventFilter||__balanceEventFilter.has(this.currentAction?.name))){' +
      'const wall=spent/speed/bonusAtTick/speedAtTick/baseManaPerSecond;' +
      'const effective=spent/speed/baseManaPerSecond;__balanceActionEvents.push({' +
      'type:"action_completed",action:this.currentAction?.name??null,loop:totals.loops,' +
      'seconds:totals.time+timeCounter+wall,' +
      'effectiveSeconds:totals.effectiveTime+effectiveTime+effective});}' +
      'return spent};' +
      'const __balanceViewUpdate=view.update;view.update=function(...args){' +
      '__balanceCounters.uiUpdates++;return __balanceViewUpdate.apply(this,args)};');
    this.model.evaluate('options.predictor=false;options.pauseBeforeRestart=' +
      (policyBoundaries ? 'true' : 'false') + ';' +
      'options.pauseOnFailedLoop=false;options.pauseOnComplete=false;' +
      'options.repeatLastAction=false;options.keepCurrentList=false;' +
      'options.fractionalMana=false;options.speedIncreaseBackground=2;');
    if (this.snapshot().offlineMs !== 0) {
      throw new BalanceRuntimeError('unsupported_runtime','Fresh baseline has offline credit');
    }
  }

  evaluate(source) {
    this.profiler?.count('vmEvaluationCalls');
    return this.model.evaluate(source);
  }

  edit(change, provenance) {
    if (this.started && this.snapshot().stopped === false) {
      throw new BalanceRuntimeError('invalid_route','Queue policy edits require a stable paused boundary',this.snapshot());
    }
    const admission = admitQueueEdit(this.model, change, provenance);
    if (admission.status === 'admitted') {
      admission.uiStateHash = readUiProfile(this.model).stateHash;
      this.edits.push(admission);
    }
    return admission;
  }

  start() {
    if (this.started) throw new BalanceRuntimeError('invalid_route','Engine already started');
    if (!read(this.model, 'actions.next.some(a=>!a.disabled&&a.loops>0)')) {
      throw new BalanceRuntimeError('invalid_route','Cannot measure an empty route');
    }
    this.model.evaluate('restart()');
    this.started = true;
    return this.snapshot();
  }

  resumePolicyLoop() {
    if (!this.policyBoundaries || !this.started || !read(this.model, 'gameIsStopped')) {
      throw new BalanceRuntimeError('invalid_route','Policy resume requires a paused loop boundary',
        this.snapshot());
    }
    this.model.evaluate('pauseGame(false)');
    return this.snapshot();
  }

  burstPolicyLoops(count = 16, {stopOnActions = []} = {}) {
    if (!this.policyBoundaries || !this.started || !Number.isSafeInteger(count) || count < 1 ||
        !Array.isArray(stopOnActions) || stopOnActions.some(name=>typeof name!=='string')) {
      throw new BalanceRuntimeError('invalid_route','Policy burst requires a started boundary engine');
    }
    const terminalActions = new Set(stopOnActions);
    let observedEventCount = this.events.length;
    let observation = this.lightweightObservation();
    if (observation.stopped) {
      throw new BalanceRuntimeError('stalled','Resume before a policy burst',observation);
    }
    const target = observation.loops + count;
    // Reuse the same calibrated/precision scheduler as step(): a 60-second
    // unrestricted executeGameTicks call is NOT an action-level calibration.
    // In particular, an action change must cause a fresh eligibility check.
    while (observation.loops < target) {
      if (observation.stopped) {
        this.resumePolicyLoop();
      }
      observation = this.step({full:false});
      if (terminalActions.size && this.events.slice(observedEventCount).some(event=>
        event.type==='action_completed' && terminalActions.has(event.action))) break;
      observedEventCount = this.events.length;
    }
    return observation;
  }

  snapshot() {
    const operation = () => JSON.parse(JSON.stringify(this.evaluate('(() => ({' +
      'time:totals.time+((gameIsStopped&&(shouldRestart||timer>=timeNeeded))?0:timeCounter),' +
      'effectiveSeconds:totals.effectiveTime+((gameIsStopped&&(shouldRestart||timer>=timeNeeded))?0:effectiveTime),' +
      'closedLoopSeconds:totals.time,activeLoopSeconds:(gameIsStopped&&(shouldRestart||timer>=timeNeeded))?0:timeCounter,' +
      'loops:totals.loops,manaSpent:timer,completedActions:totals.actions,' +
      'progress:towns[0].expWander,queuePosition:actions.currentPos,' +
      'currentQueueCount:actions.current.length,stopped:gameIsStopped,' +
      'ticksLeftMs:gameTicksLeft,offlineMs:totalOfflineMs,lagSpeed,' +
      'bonusSpeed,gameSpeed,shouldRestart,curTown,' +
      'actionName:actions.current[actions.currentPos]?.name??null' +
      ' }))()')));
    return this.profiler ? this.profiler.time('snapshotSerialization', operation) : operation();
  }

  lightweightObservation() {
    const operation = () => JSON.parse(JSON.stringify(this.evaluate('(() => {' +
      'const action=actions.current[actions.currentPos]??null;' +
      // An unstarted queue cursor is not execution proof. Never call mutating
      // getNextValidAction() or canStart() just for a scheduler observation.
      'const actionReady=!!(action&&actions.currentAction===action&&' +
      'action.townNum===curTown&&action.loopsLeft>0&&!action.canStart);' +
      'const actionTicks=action?Math.max(0,action.adjustedTicks-action.ticks):0;' +
      'const talentTicks=action?Math.max(0,getMaxTicksForAction(action,true)):0;' +
      'const loopTicks=Math.max(0,timeNeeded-timer);' +
      'const boundaryTicks=action?Math.min(actionTicks,talentTicks,loopTicks):0;' +
      'const ticksPerMs=baseManaPerSecond*gameSpeed*bonusSpeed*getSpeedMult()/1000;' +
      'let boundaryKind="unknown";' +
      'if(boundaryTicks===actionTicks)boundaryKind="action";' +
      'else if(boundaryTicks===talentTicks)boundaryKind="talent";' +
      'else if(boundaryTicks===loopTicks)boundaryKind="loop";' +
      'const folded=gameIsStopped&&(shouldRestart||timer>=timeNeeded);' +
      'return {time:totals.time+(folded?0:timeCounter),' +
      'effectiveSeconds:totals.effectiveTime+(folded?0:effectiveTime),' +
      'closedLoopSeconds:totals.time,activeLoopSeconds:folded?0:timeCounter,loops:totals.loops,' +
      'manaSpent:timer,completedActions:totals.actions,progress:towns[0].expWander,' +
      'queuePosition:actions.currentPos,currentQueueCount:actions.current.length,' +
      'stopped:gameIsStopped,ticksLeftMs:gameTicksLeft,offlineMs:totalOfflineMs,lagSpeed,' +
      'bonusSpeed,gameSpeed,shouldRestart,curTown,actionName:action?.name??null,actionReady,' +
      'actionType:action?.type??null,singleActionName:actions.current.length===1?actions.current[0].name:null,' +
       'actionTicks,actionLoopsLeft:action?.loopsLeft??0,' +
      'boundaryTicks,boundaryKind,boundaryWallMs:ticksPerMs>0?boundaryTicks/ticksPerMs:0,' +
      'loopBoundaryWallMs:ticksPerMs>0?loopTicks/ticksPerMs:0,' +
      'internalActionTicks:__balanceCounters.actionTicks,uiUpdates:__balanceCounters.uiUpdates,' +
      'actionEventCount:__balanceActionEvents.length};' +
      '})()')));
    return this.profiler ? this.profiler.time('lightweightObservation', operation) : operation();
  }

  semanticState() {
    const operation = () => JSON.parse(JSON.stringify(this.evaluate('(() => ({' +
      'resources,stats:Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,{' +
      'level:v.levelExp?.level,exp:v.levelExp?.exp,talent:v.talentLevelExp?.level,' +
      'talentExp:v.talentLevelExp?.exp,soulstone:v.soulstone}])),skills:Object.fromEntries(' +
      'Object.entries(skills).map(([k,v])=>[k,{level:v.levelExp?.level,exp:v.levelExp?.exp}])),' +
      'buffs:Object.fromEntries(Object.entries(buffs).map(([k,v])=>[k,v.amt])),' +
      'towns:towns.map(t=>Object.fromEntries(Object.entries(t).filter(([,v])=>' +
      'typeof v==="number"||typeof v==="boolean"||typeof v==="string"))),' +
      'storyFlags,storyVars,completedActions,totals,curTown,guild,escapeStarted,portalUsed,stoneLoc,' +
      'timer,timeCounter,effectiveTime,timeNeeded,gameTicksLeft,shouldRestart,gameIsStopped,' +
      'actions:{position:actions.currentPos,completedTicks:actions.completedTicks,' +
      'next:actions.next.map(a=>({name:a.name,loops:a.loops,disabled:!!a.disabled,loopsType:a.loopsType})),' +
      'current:actions.current.map(a=>({name:a.name,loops:a.loops,loopsLeft:a.loopsLeft,' +
      'ticks:a.ticks,extraLoops:a.extraLoops,manaUsed:a.manaUsed}))},options' +
      '}))()')));
    const state = this.profiler ? this.profiler.time('fullStateObservation', operation) : operation();
    return {...state,rng:this.model.rngSnapshot(),clock:this.clock.snapshot()};
  }

  step({full = this.mode !== 'accelerated'} = {}) {
    if (!this.started) throw new BalanceRuntimeError('invalid_route','Call start before stepping');
    const before = this.lightweightObservation();
    if (this.clock.elapsedMs / 1000 >= this.maxSimulatedSeconds ||
      hostPerformance.now() - this.startHostMs >= this.maxHostMs) {
      throw new BalanceRuntimeError('budget_exceeded','Declared measurement ceiling reached',this.snapshot());
    }
    if (before.stopped) throw new BalanceRuntimeError('stalled','Original game is paused',before);
    const remainingSimulationMs = this.maxSimulatedSeconds * 1000 - this.clock.elapsedMs;
    const decision = this.scheduler?.select(before, remainingSimulationMs) ?? {
      batchMs:this.quantumMs, level:'precision', reason:'reference_mode'
    };
    if (decision.batchMs > remainingSimulationMs + 1e-9) {
      throw new BalanceRuntimeError('budget_exceeded','Declared simulation ceiling reached',this.snapshot());
    }
    this.clock.advance(decision.batchMs);
    const rngBefore = this.model.rngSnapshot()?.calls ?? 0;
    const execute = () => this.evaluate('gameTicksLeft+=' + decision.batchMs +
      ';executeGameTicks(performance.now()+' + decision.batchMs + ')');
    if (this.profiler) {
      this.profiler.time('gameEngine', execute);
      this.profiler.count('outerSchedulingCalls');
      this.profiler.batch(decision.level);
      if (decision.level === 'precision' && this.mode !== 'reference') {
        this.profiler.count('precisionFallbacks');
      }
    } else execute();
    this.steps++;
    const after = this.lightweightObservation();
    if (this.profiler) {
      this.profiler.count('internalActionTicks', after.internalActionTicks-before.internalActionTicks);
      this.profiler.count('uiUpdates', after.uiUpdates-before.uiUpdates);
      this.profiler.count('rngCalls',(this.model.rngSnapshot()?.calls ?? rngBefore)-rngBefore);
    }
    for (const key of ['time','effectiveSeconds','manaSpent','offlineMs','ticksLeftMs']) {
      if (!Number.isFinite(after[key])) throw new BalanceRuntimeError('error','Nonfinite engine value: '+key,after);
    }
    if (after.time + 1e-9 < before.time ||
        after.effectiveSeconds + 1e-9 < before.effectiveSeconds ||
        after.loops < before.loops) {
      throw new BalanceRuntimeError('error','Clock or loop total moved backward',after);
    }
    if (after.offlineMs !== 0 || after.bonusSpeed !== 1) {
      throw new BalanceRuntimeError('unsupported_runtime','Offline/lag credit contaminated ordinary baseline',this.snapshot());
    }
    // A closed loop has already folded its counters into totals; read only at
    // the stable post-executeGameTicks boundary to prevent double accounting.
    if (Math.abs(after.time - after.closedLoopSeconds - after.activeLoopSeconds) > 1e-7) {
      throw new BalanceRuntimeError('error','Loop accounting did not reconcile',after);
    }
    try {
      const exactActionEvents=read(this.model,'__balanceActionEvents.slice('+before.actionEventCount+')');
      const events = collectEvents(before,after,exactActionEvents,!this.filteredEvents);
      const firstSequence=this.events.length;
      this.events.push(...events.map((event,index)=>({...event,sequence:firstSequence+index})));
    } catch (error) {
      throw new BalanceRuntimeError('event_boundary',error.message,this.snapshot());
    }
    after.batch = decision;
    return full ? {...this.snapshot(),batch:decision} : after;
  }

  runSteps(limit) {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Positive step ceiling required');
    const states = [];
    for (let i = 0; i < limit; i++) {
      if (this.snapshot().stopped) break;
      states.push(this.step());
    }
    return {states, last:this.snapshot(), steps:states.length};
  }

  diagnostics() {
    const state = this.snapshot(), ui = readUiProfile(this.model);
    return {
      version: 'rw00-engine-diagnostics/v1', status: 'incomplete',
      seed: this.seed, rng:this.model.rngSnapshot(),
      clock: {version:CLOCK_VERSION, quantumMs:this.quantumMs,
        elapsedMs:this.clock.elapsedMs, steps:this.steps, mode:this.mode,
        schedulerVersion:this.scheduler ? SCHEDULER_VERSION : 'reference-20ms/v1'},
      admission: {version:ADMISSION_VERSION, edits:this.edits},
      uiInput: {initial:this.uiInitial.configurationHash,current:ui.stateHash,
        effective:ui.effectiveConfigurationHash,changeHistory:ui.changeHistoryHash,
        changePolicy:'recorded-ui-events/v1',changes:ui.changes}, state,
      hostExecutionSeconds:(hostPerformance.now()-this.startHostMs)/1000,
      limits:{maxHostMs:this.maxHostMs,maxSimulatedSeconds:this.maxSimulatedSeconds},
      semanticEvents:{version:EVENT_VERSION,count:this.events.length,events:this.events},
      performance:this.profiler?.report({simulatedSeconds:state.time,
        completedActions:state.completedActions,loops:state.loops}) ?? null,
      coverage:'Model-only diagnostic; not a C14 campaign measurement or browser calibration'
    };
  }
}
