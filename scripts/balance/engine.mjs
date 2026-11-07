// Test-only virtual driver. Calls the production executeGameTicks/loopEnd/restart.
import {performance as hostPerformance} from 'node:perf_hooks';
import {loadGameModel} from '../load-game-model.mjs';
import {CLOCK_VERSION, virtualClock} from './clock.mjs';
import {admitQueueEdit, ADMISSION_VERSION} from './admission.mjs';
import {createDefaultUiProfile, installUiProfile, readUiProfile} from './ui-inputs.mjs';

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
  constructor({seed = 42, quantumMs = 20, uiProfile, maxHostMs = 30*60*1000,
    maxSimulatedSeconds = 180*86400} = {}) {
    if (!Number.isFinite(quantumMs) || quantumMs <= 0 || quantumMs > 20) {
      throw new RangeError('Uncalibrated quantum: use 0 < quantumMs <= 20');
    }
    this.clock = virtualClock();
    this.model = loadGameModel({withViewStubs:true, clock:this.clock, rngSeed:seed});
    this.seed = seed;
    this.quantumMs = quantumMs;
    this.maxHostMs = maxHostMs;
    this.maxSimulatedSeconds = maxSimulatedSeconds;
    this.startHostMs = hostPerformance.now();
    this.uiInitial = installUiProfile(this.model, uiProfile ?? createDefaultUiProfile(this.model));
    this.edits = [];
    this.started = false;
    this.steps = 0;
    this.model.evaluate('options.predictor=false;options.pauseBeforeRestart=false;' +
      'options.pauseOnFailedLoop=false;options.pauseOnComplete=false;' +
      'options.repeatLastAction=false;options.keepCurrentList=false;' +
      'options.fractionalMana=false;options.speedIncreaseBackground=2;');
    if (this.snapshot().offlineMs !== 0) {
      throw new BalanceRuntimeError('unsupported_runtime','Fresh baseline has offline credit');
    }
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

  snapshot() {
    return read(this.model, '(() => ({' +
      'time:totals.time+timeCounter,effectiveSeconds:totals.effectiveTime+effectiveTime,' +
      'closedLoopSeconds:totals.time,activeLoopSeconds:timeCounter,' +
      'loops:totals.loops,manaSpent:timer,completedActions:totals.actions,' +
      'progress:towns[0].expWander,queuePosition:actions.currentPos,' +
      'currentQueueCount:actions.current.length,stopped:gameIsStopped,' +
      'ticksLeftMs:gameTicksLeft,offlineMs:totalOfflineMs,' +
      'bonusSpeed,gameSpeed,shouldRestart,curTown' +
      ' }))()');
  }

  step() {
    if (!this.started) throw new BalanceRuntimeError('invalid_route','Call start before stepping');
    const before = this.snapshot();
    if (this.clock.elapsedMs / 1000 >= this.maxSimulatedSeconds ||
      hostPerformance.now() - this.startHostMs >= this.maxHostMs) {
      throw new BalanceRuntimeError('budget_exceeded','Declared measurement ceiling reached',before);
    }
    if (before.stopped) throw new BalanceRuntimeError('stalled','Original game is paused',before);
    // Match an isolated frame's virtual wall time, not an analytical mana proxy.
    this.clock.advance(this.quantumMs);
    this.model.evaluate('gameTicksLeft+=' + this.quantumMs +
      ';executeGameTicks(performance.now()+' + this.quantumMs + ')');
    this.steps++;
    const after = this.snapshot();
    for (const key of ['time','effectiveSeconds','manaSpent','offlineMs','ticksLeftMs']) {
      if (!Number.isFinite(after[key])) throw new BalanceRuntimeError('error','Nonfinite engine value: '+key,after);
    }
    if (after.time + 1e-9 < before.time ||
        after.effectiveSeconds + 1e-9 < before.effectiveSeconds ||
        after.loops < before.loops) {
      throw new BalanceRuntimeError('error','Clock or loop total moved backward',after);
    }
    if (after.offlineMs !== 0 || after.bonusSpeed !== 1) {
      throw new BalanceRuntimeError('unsupported_runtime','Offline/lag credit contaminated ordinary baseline',after);
    }
    // A closed loop has already folded its counters into totals; read only at
    // the stable post-executeGameTicks boundary to prevent double accounting.
    if (Math.abs(after.time - after.closedLoopSeconds - after.activeLoopSeconds) > 1e-7) {
      throw new BalanceRuntimeError('error','Loop accounting did not reconcile',after);
    }
    return after;
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
        elapsedMs:this.clock.elapsedMs, steps:this.steps},
      admission: {version:ADMISSION_VERSION, edits:this.edits},
      uiInput: {initial:this.uiInitial.configurationHash,current:ui.stateHash,
        changes:ui.changes}, state,
      hostExecutionSeconds:(hostPerformance.now()-this.startHostMs)/1000,
      limits:{maxHostMs:this.maxHostMs,maxSimulatedSeconds:this.maxSimulatedSeconds},
      coverage:'Model-only diagnostic; not a C14 campaign measurement or browser calibration'
    };
  }
}
