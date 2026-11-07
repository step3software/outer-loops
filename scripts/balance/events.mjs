// Read-only semantic event collection from accepted batch boundaries.
export const EVENT_VERSION = 'rw00-semantic-events/v1';

export function collectEvents(before, after, exactActionEvents = []) {
  const events = [...exactActionEvents];
  const at = after.time;
  const completed = after.completedActions - before.completedActions;
  if (completed < 0 || after.loops < before.loops) throw new Error('Semantic counters moved backward');
  if (completed !== exactActionEvents.length) {
    throw new Error('Exact action event count did not match semantic counter');
  }
  if (after.curTown !== before.curTown) {
    events.push({type:'town_changed', from:before.curTown, to:after.curTown, seconds:at});
  }
  if (after.loops > before.loops) {
    if (after.loops - before.loops !== 1) throw new Error('Batch crossed multiple loop resets');
    events.push({type:'loop_restarted', loop:after.loops, seconds:at});
  }
  return events;
}
