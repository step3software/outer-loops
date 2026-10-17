#!/usr/bin/env node
// Regression *model* smoke checks against real source in a worker-like VM.
// Does not exercise browser DOM, saves, external services or a full game loop.
import assert from 'node:assert/strict';
import { loadGameModel } from './load-game-model.mjs';

const {evaluate} = loadGameModel();
const result = evaluate(`(() => {
    const entries = Object.entries(Action).filter(([, a]) => a instanceof Action);
    const typeCounts = Object.fromEntries(["normal", "progress", "limited", "multipart"]
        .map(t => [t, entries.filter(([, a]) => a.type === t).length]));
    const byZone = Array.from({length: 9}, (_, index) =>
        entries.filter(([, a]) => a.townNum === index).length);
    const ids = entries.map(([id]) => id);
    const names = entries.map(([, a]) => a.name);
    const statTest = new LevelExp();
    statTest.addExp(100);
    const firstLevel = statTest.level;
    statTest.addExp(200);
    const secondLevel = statTest.level;
    return {
        actionCount: entries.length, typeCounts, byZone,
        uniqueIds: new Set(ids).size, uniqueNames: new Set(names).size,
        townNames, townCount: towns.length, statCount: statList.length,
        skillCount: skillList.length, buffCount: buffList.length,
        firstLevel, secondLevel, totalLevelExp: statTest.totalExp,
        costWander: Action.Wander.manaCost(),
        level100Exp: LevelExp.totalExpForLevel(100),
        townLevel0: towns[0].getLevel("Wander"),
        prestigeBase: prestigeBonus("PrestigeCombat"),
        firstPrestigeCost: getPrestigeCost("PrestigeCombat"),
        requiredActions: ["Wander", "SmashPots", "RaiseZombie",
            "DeadTrial", "SurveyZ8", "HeroesTrial"].map(id => Boolean(Action[id])),
    };
})()`);
assert.equal(result.actionCount, 157);
assert.deepEqual({...result.typeCounts}, {normal: 66, progress: 41, limited: 18, multipart: 32});
assert.equal(result.townCount, 9);
assert.equal(result.statCount, 9);
assert.equal(result.skillCount, 18);
assert.equal(result.buffCount, 14);
assert.equal(result.uniqueIds, 157);
assert.equal(result.uniqueNames, 157);
assert.equal(result.byZone.reduce((a, b) => a + b, 0), 157);
assert.ok(result.byZone.every(n => n > 0));
assert.equal(result.firstLevel, 1);
assert.equal(result.secondLevel, 2);
assert.equal(result.totalLevelExp, 300);
assert.equal(result.costWander, 250);
assert.equal(result.level100Exp, 505000);
assert.equal(result.townLevel0, 0);
assert.equal(result.prestigeBase, 1);
assert.equal(result.firstPrestigeCost, 30);
assert.ok(result.requiredActions.every(Boolean), 'representative late-game actions must exist');
console.log('PASS worker-like model: 157 actions, 9 towns, 9 stats, 18 skills, 14 buffs, level curve and prestige defaults.');
