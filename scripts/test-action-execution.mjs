#!/usr/bin/env node
// Tests a real action and planned queue using first-party code and a no-op
// view facade. This does NOT constitute a browser save/UI/predictor test.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';

const {evaluate} = loadGameModel({withViewStubs: true});
const r = evaluate(`(() => {
    const beforeProgress = towns[0].expWander;
    const beforeTotal = totals.actions;
    actions.addAction("Wander", 1);
    const plannedCount = actions.next.length;
    actions.restart();
    const executionCount = actions.current.length;
    const spent = actions.tick(250);
    const after = {
        beforeProgress, beforeTotal, plannedCount, executionCount, spent,
        progress: towns[0].expWander,
        level: towns[0].getLevel("Wander"),
        completedActions: totals.actions,
        currentPos: actions.currentPos,
        strengthXp: stats.Str.statLevelExp.totalExp,
        speedXp: stats.Spd.statLevelExp.totalExp,
    };
    actions.restart();
    after.progressAfterQueueRestart = towns[0].expWander;
    after.currentPosAfterQueueRestart = actions.currentPos;
    after.executionCountAfterQueueRestart = actions.current.length;
    return after;
})()`);
assert.equal(r.beforeProgress, 0);
assert.equal(r.beforeTotal, 0);
assert.equal(r.plannedCount, 1);
assert.equal(r.executionCount, 1);
assert.equal(r.spent, 250);
assert.equal(r.progress, 200);
assert.equal(r.level, 1);
assert.equal(r.completedActions, 1);
assert.equal(r.currentPos, 1);
assert.ok(r.speedXp > 0);
assert.equal(r.strengthXp, 0);
assert.equal(r.progressAfterQueueRestart, 200);
assert.equal(r.currentPosAfterQueueRestart, 0);
assert.equal(r.executionCountAfterQueueRestart, 1);
console.log('PASS queued Wander action: 250 mana, 200 progress XP, stat training and persisted town progress across queue restart.');
