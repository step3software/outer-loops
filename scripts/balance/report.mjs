// Fail-closed calibration and baseline validation; reports are evidence, not targets.
import {fingerprint} from './ui-inputs.mjs';
export const REPORT_SCHEMA = 'rw00-campaign-balance/v2';
export const CALIBRATION_SCHEMA = 'rw00-browser-calibration/v2';
export const CHECKPOINTS = Object.freeze(Array.from({length:15},(_,i)=>'C'+String(i).padStart(2,'0')));
const COMPARABLE = [
  'route','scenario','policyHash','admissionVersion','checkpointVersion',
  'schedulerVersion','optionsHash','uiConfigurationHash','uiChangePolicy'
];

export class BalanceReportError extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'BalanceReportError';
    this.code = 'invalid_report';
  }
}

function ensure(ok, reason) {
  if (!ok) throw new BalanceReportError(reason);
}

function finiteNonnegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function assertCalibration(report, expected) {
  ensure(report && report.schema === CALIBRATION_SCHEMA, 'Missing calibration schema');
  ensure(report.status === 'passed', 'Calibration not passed');
  ensure(typeof report.browserVersion === 'string' && /Chrome|Chromium/i.test(report.browserVersion),
    'Calibration lacks real browser identity');
  ensure(typeof report.sourceHash === 'string' && report.sourceHash.length === 64,
    'Calibration lacks source fingerprint');
  ensure(typeof report.clockVersion === 'string' && report.clockVersion.length > 0,
    'Calibration lacks clock identity');
  ensure(typeof report.accelerationCalibrationIdentity === 'string' &&
    report.accelerationCalibrationIdentity.length === 64,
    'Calibration lacks acceleration identity');
  ensure(Array.isArray(report.scenarios) && report.scenarios.length >= 1 &&
    report.scenarios.every(x=>x.status === 'passed' && x.browser && x.model),
    'Missing real-browser scenario proof');
  for (const [key, value] of Object.entries(expected ?? {})) {
    ensure(report[key] === value, 'Stale/mismatched calibration field: ' + key);
  }
  return fingerprint(report);
}

export function assertCompleteReport(report, calibration) {
  ensure(report && report.schema === REPORT_SCHEMA, 'Missing report schema');
  ensure(report.status === 'complete', 'Incomplete report may not be a baseline');
  ensure(typeof report.sourceHash === 'string' && report.sourceHash.length === 64,
    'Missing source identity');
  ensure(typeof report.route === 'string' && ['R01','R02'].includes(report.route),
    'Unknown route');
  for (const field of ['policyHash','optionsHash','uiConfigurationHash','schedulerVersion',
    'checkpointVersion','admissionVersion','uiChangePolicy']) {
    ensure(typeof report[field] === 'string' && report[field].length > 0,
      'Missing ' + field);
  }
  const calHash = assertCalibration(calibration, {
    sourceHash:report.sourceHash,
    admissionVersion:report.admissionVersion,
    uiConfigurationHash:report.uiConfigurationHash,
    schedulerVersion:report.schedulerVersion
  });
  ensure(report.calibrationHash === calHash, 'Calibration fingerprint mismatch');
  ensure(report.schedulerCalibrationIdentity === calibration.accelerationCalibrationIdentity,
    'Scheduler calibration identity mismatch');
  ensure(Array.isArray(report.seeds) && report.seeds.length >= 1, 'No seed evidence');
  ensure(new Set(report.seeds.map(s=>s.seed)).size === report.seeds.length,'Duplicate seed');
  for (const run of report.seeds) {
    ensure(Number.isSafeInteger(run.seed) && run.seed > 0 && run.seed <= 0xffffffff,
      'Bad seed');
    ensure(run.status === 'complete', 'Failed or partial seed');
    ensure(finiteNonnegative(run.totalSeconds), 'Invalid total seconds');
    ensure(finiteNonnegative(run.effectiveSeconds), 'Invalid effective seconds');
    ensure(finiteNonnegative(run.loopCount), 'Invalid loop count');
    ensure(finiteNonnegative(run.hostSeconds), 'Invalid host seconds');
    ensure(run.rng?.algorithm === 'xorshift32/v1' && run.rng.seed === run.seed &&
      Number.isSafeInteger(run.rng.state) && Number.isSafeInteger(run.rng.calls) && run.rng.calls >= 0,
      'Invalid RNG evidence');
    const performance=run.performance;
    ensure(performance && finiteNonnegative(performance.hostSeconds) &&
      performance.hostSeconds === run.hostSeconds,
      'Missing or ambiguous host performance duration');
    for(const field of ['outerSchedulingCalls','internalActionTicks','precisionFallbacks','peakHeapBytes']) {
      ensure(Number.isSafeInteger(performance[field]) && performance[field] >= 0,
        'Invalid performance field: '+field);
    }
    ensure(finiteNonnegative(performance.simulatedSecondsPerHostSecond) &&
      performance.batchCounts && typeof performance.batchCounts === 'object',
      'Missing scheduler performance evidence');
    for (const name of ['uiStateHash','uiChangeHistoryHash','effectiveUiConfigurationHash']) {
      ensure(typeof run[name] === 'string' && run[name].length > 0,
        'Missing run UI identity: ' + name);
    }
    ensure(Array.isArray(run.checkpoints), 'Missing checkpoint events');
    let lastTime = 0;
    const firstHits = new Map();
    for (const event of run.checkpoints) {
      ensure(CHECKPOINTS.includes(event.id), 'Unknown checkpoint');
      ensure(event.status === 'complete' || (report.route === 'R02' &&
        event.id === 'C06' && event.status === 'not_applicable'), 'Invalid checkpoint event');
      if (event.status === 'not_applicable') {
        ensure(event.seconds === null,'N/A time may not be zero or a measured duration');
        continue;
      }
      ensure(finiteNonnegative(event.seconds) && event.seconds+1e-9>=lastTime,
        'Nonfinite or out-of-order checkpoint');
      lastTime = event.seconds;
      if (!firstHits.has(event.id)) firstHits.set(event.id,event);
    }
    for (const id of CHECKPOINTS) ensure(firstHits.has(id) ||
      (report.route === 'R02' && id === 'C06' &&
        run.checkpoints.some(e=>e.id===id&&e.status==='not_applicable')),
      'Missing checkpoint: ' + id);
    const terminal = firstHits.get('C14');
    ensure(terminal && terminal.successfulRestoreTime === true &&
      Math.abs(terminal.seconds-run.totalSeconds)<1e-6, 'No observed successful C14');
    ensure(firstHits.get('C00')?.seconds === 0,'Fresh campaign does not start at zero');
    for (const kind of ['intervals','locations']) {
      ensure(Array.isArray(run.attribution?.[kind]) && run.attribution[kind].length > 0,
        'Missing '+kind+' attribution');
      const total = run.attribution[kind].reduce((sum,e)=>{
        ensure(typeof e.id==='string' && finiteNonnegative(e.seconds),
          'Invalid '+kind+' attribution');
        return sum+e.seconds;
      },0);
      ensure(Math.abs(total-run.totalSeconds)<1e-6, 'Double-counted or missing '+kind+' time');
    }
    ensure(finiteNonnegative(run.totalSeconds) && lastTime<=run.totalSeconds+1e-6,
      'Checkpoint exceeds campaign duration');
  }
  return true;
}

export function createIncompleteReport({route=null,reason,lastCheckpoint=null,pendingGoal=null,
  diagnostics=null} = {}) {
  return {schema:REPORT_SCHEMA,status:'incomplete',route,reason,lastCheckpoint,pendingGoal,
    diagnostics,certifiedBaseline:false};
}

export function assertComparableBaseline(a,b) {
  for (const key of COMPARABLE) {
    ensure(a?.[key] !== undefined && a[key] === b?.[key],
      'Incomparable configuration: ' + key);
  }
  ensure(a.calibrationHash && b.calibrationHash, 'Missing calibration evidence');
  ensure(Array.isArray(a?.seeds) && Array.isArray(b?.seeds) &&
    JSON.stringify(a.seeds.map(s=>s.seed))===JSON.stringify(b.seeds.map(s=>s.seed)),
    'Incomparable seed selection');
  for (let index=0; index<a.seeds.length; index++) {
    for (const field of ['uiStateHash','uiChangeHistoryHash','effectiveUiConfigurationHash']) {
      ensure(typeof a.seeds[index][field] === 'string' &&
        a.seeds[index][field].length > 0 &&
        a.seeds[index][field] === b.seeds[index]?.[field],
        'Incomparable per-seed UI configuration: ' + field);
    }
  }
  // Different source hashes are intentionally allowed for a baseline/candidate.
  return true;
}
