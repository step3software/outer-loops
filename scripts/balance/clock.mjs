// Deterministic, per-VM test dependencies. Never patch host globals.
export const PRNG_VERSION = 'xorshift32/v1';
export const CLOCK_VERSION = 'virtual-wall-batched/v2';

export function seededMath(seed) {
  if (!Number.isSafeInteger(seed) || seed <= 0 || seed > 0xffffffff) {
    throw new RangeError('xorshift32 requires a nonzero uint32 seed');
  }
  let state = seed >>> 0;
  let calls = 0;
  const math = Object.create(Math);
  math.random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    calls++;
    return state / 0x100000000;
  };
  return {math, snapshot: () => ({algorithm: PRNG_VERSION, seed, state, calls})};
}

export function virtualClock(epochMs = Date.UTC(2026, 0, 1)) {
  let elapsedMs = 0;
  let performanceCalls = 0;
  const RealDate = Date;
  const ClockDate = class extends RealDate {
    constructor(...args) {
      if (args.length) super(...args);
      else super(epochMs + elapsedMs);
    }
    static now() { return epochMs + elapsedMs; }
  };
  const marks = new Map();
  const performance = {
    // Engine deadline checks must advance even within a single virtual quantum.
    now: () => elapsedMs + (++performanceCalls) / 10000,
    // data.js uses User Timing for snapshot instrumentation during loadDefaults.
    mark(name) {
      const result = {name, entryType:'mark', startTime:this.now(),duration:0};
      marks.set(name,result);
      return result;
    },
    measure(name,startMark,endMark) {
      const start = marks.get(startMark)?.startTime ?? this.now();
      const end = marks.get(endMark)?.startTime ?? this.now();
      return {name,entryType:'measure',startTime:start,duration:Math.max(0,end-start)};
    }
  };
  return {
    Date: ClockDate, performance,
    advance(ms) {
      if (!Number.isFinite(ms) || ms <= 0) throw new RangeError('Clock advance must be finite and positive');
      elapsedMs += ms;
    },
    snapshot: () => ({epochMs, elapsedMs, performanceCalls}),
    get elapsedMs() { return elapsedMs; }
  };
}
