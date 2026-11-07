import {performance} from 'node:perf_hooks';

export const PROFILER_VERSION = 'rw00-balance-profiler/v1';

export class BalanceProfiler {
  constructor({budgetMs = 60000} = {}) {
    this.startedAt = performance.now();
    this.budgetMs = budgetMs;
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
      if (performance.now() - this.startedAt > this.budgetMs) {
        const error = new Error('Profiling runtime budget exceeded');
        error.code = 'budget_exceeded';
        throw error;
      }
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
