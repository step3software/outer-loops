import {performance} from 'node:perf_hooks';

export const PROFILER_VERSION = 'rw00-balance-profiler/v1';

export class BalanceProfiler {
  constructor() {
    this.startedAt = performance.now();
    this.timings = Object.create(null);
    this.counts = Object.create(null);
    this.batchCounts = Object.create(null);
    this.peakHeapBytes = process.memoryUsage().heapUsed;
  }

  time(name, operation) {
    const start = performance.now();
    try { return operation(); }
    finally {
      this.timings[name] = (this.timings[name] ?? 0) + performance.now() - start;
      this.counts[name] = (this.counts[name] ?? 0) + 1;
      this.peakHeapBytes = Math.max(this.peakHeapBytes, process.memoryUsage().heapUsed);
      // Telemetry must remain readable after the engine's budget expires and
      // must never replace an operation's original error from this finally.
      // BalanceEngine.step and the independent process supervisor own ceilings.
    }
  }

  count(name, amount = 1) { this.counts[name] = (this.counts[name] ?? 0) + amount; }
  batch(level) { this.batchCounts[level] = (this.batchCounts[level] ?? 0) + 1; }

  report({simulatedSeconds = 0, completedActions = 0, loops = 0} = {}) {
    const hostMs = performance.now() - this.startedAt;
    return {
      schema: PROFILER_VERSION,
      hostMs,
      simulatedSeconds,
      simulatedSecondsPerHostSecond: hostMs > 0 ? simulatedSeconds / (hostMs / 1000) : 0,
      completedActions,
      loops,
      outerSchedulingCalls:this.counts.outerSchedulingCalls ?? 0,
      internalActionTicks:this.counts.internalActionTicks ?? 0,
      vmEvaluationCalls:this.counts.vmEvaluationCalls ?? 0,
      rngCalls:this.counts.rngCalls ?? 0,
      timingsMs:{...this.timings},
      batchCounts:{...this.batchCounts},
      precisionFallbacks:this.counts.precisionFallbacks ?? 0,
      peakHeapBytes:this.peakHeapBytes
    };
  }
}
