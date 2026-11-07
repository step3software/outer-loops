// Boundary-limited scheduling adapter. It selects wall-clock batches only; the
// original game engine remains responsible for every action tick and reward.
import {actionCalibration, assertCalibrationManifest} from './calibration.mjs';

export const SCHEDULER_VERSION = 'rw00-adaptive-boundary/v1';
export const BATCH_LEVELS = Object.freeze([
  {id:'precision', ms:20},
  {id:'small', ms:100},
  {id:'medium', ms:1000},
  {id:'large', ms:10000},
  {id:'extended', ms:60000}
]);

function quantizeDown(ms, quantumMs) {
  return Math.floor(ms / quantumMs) * quantumMs;
}

export class FastScheduler {
  constructor({calibration, quantumMs = 20, maxBatchMs = 10000} = {}) {
    if (quantumMs !== 20) throw new RangeError('Accelerated scheduler is calibrated at 20 ms quanta');
    if (!Number.isSafeInteger(maxBatchMs) || maxBatchMs < quantumMs || maxBatchMs % quantumMs) {
      throw new RangeError('maxBatchMs must be a positive multiple of 20');
    }
    assertCalibrationManifest(calibration, {schedulerVersion:SCHEDULER_VERSION});
    this.calibration = calibration;
    this.quantumMs = quantumMs;
    this.maxBatchMs = maxBatchMs;
  }

  select(observation, remainingSimulationMs = Infinity) {
    const fallback = reason => ({batchMs:this.quantumMs, level:'precision', reason});
    if (!observation || observation.stopped) return fallback('stopped_or_missing');
    if (observation.offlineMs !== 0 || observation.bonusSpeed !== 1 || observation.lagSpeed !== 0) {
      return fallback('runtime_contamination');
    }
    if (!observation.actionName) return fallback('no_observed_action');
    const eligible = actionCalibration(this.calibration, observation.actionName);
    if (!eligible) return fallback('uncalibrated_action');
    // Only batch inside the CURRENT calibrated action/talent boundary. Using
    // loopBoundaryWallMs alone can run uncalibrated later actions in one batch.
    // A queue consisting of only the same calibrated action may safely use
    // the separately tested repeated-action loop boundary. Mixed queues must
    // stop before an unverified next action or talent change.
    const singleVerifiedAction=observation.singleActionName===observation.actionName;
    const safeWallMs = singleVerifiedAction?observation.loopBoundaryWallMs:
      Math.min(observation.boundaryWallMs, observation.loopBoundaryWallMs);
    if (!Number.isFinite(safeWallMs) || safeWallMs <= this.quantumMs) {
      return fallback('near_or_unknown_boundary');
    }
    const offered = Math.min(
      eligible.maxBatchMs,
      this.maxBatchMs,
      Math.max(0, safeWallMs - this.quantumMs),
      remainingSimulationMs
    );
    const batchMs = quantizeDown(offered, this.quantumMs);
    if (batchMs < 100) return fallback('quantized_boundary');
    const level = [...BATCH_LEVELS].reverse().find(item => batchMs >= item.ms)?.id ?? 'precision';
    return {batchMs, level, reason:'calibrated_boundary', boundary:singleVerifiedAction?'loop':observation.boundaryKind};
  }
}
