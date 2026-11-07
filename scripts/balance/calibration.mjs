// Versioned acceleration eligibility. Unknown actions always use reference stepping.
import {fingerprint} from './ui-inputs.mjs';

export const CALIBRATION_MANIFEST_SCHEMA = 'rw00-acceleration-calibration/v1';
export const SEMANTIC_TOLERANCES = Object.freeze([
  {path:/^stats\.[^.]+\.(exp|talentExp)$/,epsilon:1e-9},
  {path:/^skills\.[^.]+\.exp$/,epsilon:1e-9},
  {path:/^totals\.(time|effectiveTime|borrowedTime)$/,epsilon:1e-9},
  {path:/^(timer|timeCounter|effectiveTime|timeNeeded|gameTicksLeft)$/,epsilon:1e-9},
  {path:/^actions\.current\.\d+\.(ticks|manaUsed)$/,epsilon:1e-9}
]);

export function createCalibrationManifest({
  sourceHash = 'test-only',
  schedulerVersion,
  scenarios = [],
  actions = {}
} = {}) {
  const manifest = {
    schema: CALIBRATION_MANIFEST_SCHEMA,
    sourceHash,
    schedulerVersion,
    scenarios: structuredClone(scenarios),
    actions: structuredClone(actions)
  };
  manifest.identity = fingerprint(manifest);
  return Object.freeze(manifest);
}

export function assertCalibrationManifest(manifest, {schedulerVersion, sourceHash} = {}) {
  if (!manifest || manifest.schema !== CALIBRATION_MANIFEST_SCHEMA) {
    throw new TypeError('Accelerated mode requires a calibration manifest');
  }
  const unsigned = {...manifest};
  delete unsigned.identity;
  if (manifest.identity !== fingerprint(unsigned)) throw new Error('Stale calibration identity');
  if (schedulerVersion && manifest.schedulerVersion !== schedulerVersion) {
    throw new Error('Calibration scheduler version mismatch');
  }
  if (sourceHash && manifest.sourceHash !== sourceHash) {
    throw new Error('Calibration source mismatch');
  }
  if (!manifest.actions || typeof manifest.actions !== 'object' || Array.isArray(manifest.actions)) {
    throw new TypeError('Calibration actions must be an object');
  }
  for (const [name, entry] of Object.entries(manifest.actions)) {
    if (!name || !entry || entry.status !== 'passed' ||
        !Number.isSafeInteger(entry.maxBatchMs) || entry.maxBatchMs < 20 ||
        entry.maxBatchMs % 20 !== 0 || typeof entry.scenario !== 'string') {
      throw new TypeError('Invalid acceleration calibration for ' + name);
    }
  }
  return manifest.identity;
}

export function actionCalibration(manifest, actionName) {
  const entry = manifest?.actions?.[actionName];
  return entry?.status === 'passed' ? entry : null;
}

export function assertEquivalentState(actual, expected, path = '') {
  if (typeof actual === 'number' || typeof expected === 'number') {
    if (typeof actual !== 'number' || typeof expected !== 'number' ||
        !Number.isFinite(actual) || !Number.isFinite(expected)) {
      throw new Error('Nonfinite or mismatched numeric state at ' + path);
    }
    const rule = SEMANTIC_TOLERANCES.find(entry=>entry.path.test(path));
    if (rule ? Math.abs(actual-expected) > rule.epsilon : !Object.is(actual,expected)) {
      throw new Error('State mismatch at '+path+': '+actual+' vs '+expected+
        (rule?' (tolerance '+rule.epsilon+')':''));
    }
    return true;
  }
  if (actual === null || expected === null || typeof actual !== 'object' || typeof expected !== 'object') {
    if (!Object.is(actual,expected)) throw new Error('State mismatch at '+path);
    return true;
  }
  const actualKeys=Object.keys(actual).sort(),expectedKeys=Object.keys(expected).sort();
  if (JSON.stringify(actualKeys)!==JSON.stringify(expectedKeys)) {
    throw new Error('State keys mismatch at '+path);
  }
  for (const key of actualKeys) {
    assertEquivalentState(actual[key],expected[key],path?path+'.'+key:key);
  }
  return true;
}
