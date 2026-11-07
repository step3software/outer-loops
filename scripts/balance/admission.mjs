// Player-equivalent edit admission around the real driver.js queue entry point.
// All measured policies must use this module, never Actions.addAction directly.
import {fingerprint} from './ui-inputs.mjs';

export const ADMISSION_VERSION = 'rw00-ui-admission/v1';
const LIMIT = 1e12;

function json(model, source) {
  return JSON.parse(JSON.stringify(model.evaluate(source)));
}

export function queueSnapshot(model) {
  return json(model, 'actions.next.map(a=>({name:a.name,loops:a.loops,disabled:!!a.disabled,loopsType:a.loopsType??"actions"}))');
}

function detail(model, name) {
  const source = '(() => { const a=towns.flatMap(t=>t.totalActionList).find(a=>a.name===' +
    JSON.stringify(name) + '); if(!a) return null; return {name:a.name,town:a.townNum,' +
    'townAccessible:a.townNum===0||townsUnlocked.includes(a.townNum),' +
    'visible:!!a.visible(),unlocked:!!a.unlocked(),type:a.type,' +
    'allowed:a.allowed?a.allowed():null,' +
    'count:getNumOnList(a.name),travel:getPossibleTravel(a.name).length>0}; })()';
  return json(model, source);
}

function reject(reason, edit, before, details) {
  return {
    status: 'invalid_route', reason, edit: structuredClone(edit),
    beforeQueueHash: fingerprint(before), afterQueueHash: fingerprint(before),
    ...(details ? {unlockEvidence: details} : {})
  };
}

function validLoops(loops) {
  return Number.isSafeInteger(loops) && loops >= 1 && loops <= LIMIT;
}

function guardAdd(model, edit, priorCount = 0, existing = null) {
  if (typeof edit.name !== 'string' || !edit.name) return {reason: 'unknown_action'};
  if (!validLoops(edit.loops)) return {reason: 'invalid_count'};
  if (edit.loopsType !== undefined && edit.loopsType !== 'actions' &&
      edit.loopsType !== 'maxEffort' && edit.loopsType !== 'knownGood' &&
      edit.loopsType !== 'unchecked') return {reason: 'unsupported_loop_type'};
  if (edit.disabled !== undefined && typeof edit.disabled !== 'boolean') {
    return {reason: 'invalid_disabled'};
  }
  const action = detail(model, edit.name);
  if (!action) return {reason: 'unknown_action'};
  if (['knownGood','unchecked'].includes(edit.loopsType) && action.type !== 'limited') {
    return {reason: 'invalid_loop_type', details: action};
  }
  if (edit.loopsType === 'maxEffort' && action.type !== 'multipart') {
    return {reason: 'invalid_loop_type', details: action};
  }
  if (!action.townAccessible) return {reason: 'locked_town', details: action};
  if (!action.visible) return {reason: 'invisible_action', details: action};
  if (!action.unlocked) return {reason: 'locked_action', details: action};
  if (action.travel && (edit.loops !== 1 || (edit.loopsType && edit.loopsType !== 'actions'))) return {reason: 'travel_count', details: action};
  if (action.allowed !== null &&
      (!Number.isFinite(action.allowed) || priorCount + edit.loops > action.allowed)) {
    return {reason: 'allowed_limit', details: action};
  }
  if (existing?.some(a => a.name === edit.name && a.disabled !== true) &&
      action.allowed !== null && priorCount + edit.loops > action.allowed) {
    return {reason: 'duplicate_travel', details: action};
  }
  return {details: action};
}

export function admitQueueEdit(model, edit, {source = 'test-policy', policyVersion = 'unfrozen'} = {}) {
  const before = queueSnapshot(model);
  if (!edit || typeof edit !== 'object') return reject('invalid_edit', edit, before);
  const op = edit.op;
  let result;
  if (op === 'add') {
    result = guardAdd(model, edit, before.filter(a=>a.name===edit.name&&!a.disabled)
      .reduce((sum,a)=>sum+a.loops,0), before);
  } else if (op === 'setCount' || op === 'setEnabled') {
    const index = edit.index;
    if (!Number.isSafeInteger(index) || index < 0 || index >= before.length) {
      return reject('invalid_index', edit, before);
    }
    const previous = before[index];
    if (op === 'setCount') {
      if (!validLoops(edit.loops)) return reject('invalid_count', edit, before);
      if (edit.loops > previous.loops) {
        result = guardAdd(model, {name: previous.name, loops: edit.loops - previous.loops},
          before.filter((a,i)=>i!==index&&a.name===previous.name&&!a.disabled)
            .reduce((sum,a)=>sum+a.loops,previous.disabled?0:previous.loops));
      } else result = {details: {name: previous.name, existingEdit: true}};
    } else {
      if (typeof edit.enabled !== 'boolean') return reject('invalid_enabled', edit, before);
      if (edit.enabled && previous.disabled) {
        result = guardAdd(model, {name: previous.name, loops: previous.loops},
          before.filter((a,i)=>i!==index&&a.name===previous.name&&!a.disabled)
            .reduce((sum,a)=>sum+a.loops,0));
      } else result = {details: {name: previous.name, existingEdit: true}};
    }
  } else if (op === 'replay') {
    if (!Array.isArray(edit.queue) || edit.queue.length > 2000) return reject('invalid_queue', edit, before);
    const counts = new Map();
    for (const item of edit.queue) {
      const used = counts.get(item.name) || 0;
      result = guardAdd(model, item, used, edit.queue);
      if (result.reason) return reject(result.reason, edit, before, result.details);
      if (!item.disabled) counts.set(item.name, used + item.loops);
    }
  } else {
    return reject('unsupported_mutation', edit, before);
  }
  if (result?.reason) return reject(result.reason, edit, before, result.details);

  // Only after all checks are complete may the real queue mutators be reached.
  const update = sourceCode => model.evaluate(sourceCode);
  const lastAddedIndex = () => model.evaluate(
    'actions.findIndexOfActionWithId(actions.getMaxActionId())');
  if (op === 'add') {
    const originalAmount = json(model, 'actions.addAmount');
    try {
      update('actions.addAmount=' + edit.loops);
      // The actual UI entry path handles travel insertion and closest zone span.
      update('addActionToList(' + JSON.stringify(edit.name) + ',' + result.details.town +
        ',' + (result.details.travel ? 'true':'false') + ',-1)');
      if (edit.loopsType && edit.loopsType !== 'actions') {
        update('actions.updateAction(' + lastAddedIndex() +
          ',{loopsType:' + JSON.stringify(edit.loopsType) + '})');
      }
    } finally {
      update('actions.addAmount=' + originalAmount);
    }
  } else if (op === 'setCount') {
    update('actions.updateAction(' + edit.index + ',{loops:' + edit.loops + '})');
  } else if (op === 'setEnabled') {
    update('actions.updateAction(' + edit.index + ',{disabled:' + (!edit.enabled) + '})');
  } else if (op === 'replay') {
    update('actions.clearActions()');
    for (const item of edit.queue) {
      const d = detail(model, item.name);
      const originalAmount = json(model, 'actions.addAmount');
      try {
        update('actions.addAmount=' + item.loops);
        update('addActionToList(' + JSON.stringify(item.name) + ',' + d.town +
          ',' + (d.travel?'true':'false') + ',-1)');
        const index = lastAddedIndex();
        if (item.loopsType && item.loopsType !== 'actions') {
          update('actions.updateAction(' + index + ',{loopsType:' +
            JSON.stringify(item.loopsType) + '})');
        }
        if (item.disabled) update('actions.updateAction(' + index + ',{disabled:true})');
      } finally { update('actions.addAmount=' + originalAmount); }
    }
  }
  const after = queueSnapshot(model);
  return {
    status: 'admitted', admissionVersion: ADMISSION_VERSION, source, policyVersion,
    edit: structuredClone(edit), unlockEvidence: result.details ?? null,
    beforeQueueHash: fingerprint(before), afterQueueHash: fingerprint(after),
    resultQueue: after
  };
}
