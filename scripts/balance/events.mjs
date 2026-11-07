// Read-only semantic event collection from accepted batch boundaries.
export const EVENT_VERSION = 'rw00-semantic-events/v1';

export function collectEvents(before, after, exactActionEvents = [], completeActionCoverage = true,
  allowLoopBurst = false) {
  const events = [...exactActionEvents];
  const at = after.time;
  const completed = after.completedActions - before.completedActions;
  if (completed < 0 || after.loops < before.loops) throw new Error('Semantic counters moved backward');
  if (completeActionCoverage && completed !== exactActionEvents.length) {
    throw new Error('Exact action event count did not match semantic counter');
  }
  if (!completeActionCoverage && exactActionEvents.length > completed) {
    throw new Error('Filtered action event count exceeded semantic counter');
  }
  if (after.curTown !== before.curTown) {
    events.push({type:'town_changed', from:before.curTown, to:after.curTown, seconds:at});
  }
  if (after.loops > before.loops) {
    if (after.loops - before.loops !== 1 && !allowLoopBurst) {
      throw new Error('Batch crossed multiple loop resets');
    }
    events.push(after.loops-before.loops===1?{type:'loop_restarted',loop:after.loops,seconds:at}:
      {type:'loop_batch',fromLoop:before.loops,toLoop:after.loops,seconds:at});
  }
  return events;
}
