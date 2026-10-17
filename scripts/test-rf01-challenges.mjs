#!/usr/bin/env node
// RF01: characterization of all three *existing* challenge modes in separate
// disposable VM contexts. Source intentionally retains its monkey patches.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';

function run(code) {
    const {evaluate}=loadGameModel({withViewStubs:true,withChallenges:true});
    return JSON.parse(JSON.stringify(evaluate(code)));
}
const drought=run(`(() => {
    challengeSave.challengeMode=1;
    const before=Action.BuyManaZ1.finish;
    loadChallenge();
    resources.gold=12;
    const original=timeNeeded;
    Action.BuyManaZ1.finish();
    return {speed:gameSpeed,overridden:before!==Action.BuyManaZ1.finish,
        manaCost:Action.BuyManaZ1.manaCost(),rate:Action.BuyManaZ1.goldCost(),
        visibleZ3:Action.BuyManaZ3.visible(),visibleZ5:Action.BuyManaZ5.visible(),
        acquired:timeNeeded-original,remaining:totalMerchantMana,gold:resources.gold};
})()`);
assert.equal(drought.speed,2);
assert.equal(drought.overridden,true);
assert.equal(drought.manaCost,1);
assert.equal(drought.rate,30);
assert.equal(drought.visibleZ3,false);
assert.equal(drought.visibleZ5,false);
assert.deepEqual([drought.acquired,drought.remaining,drought.gold],[360,7140,0]);

const noodle=run(`(() => {
    skills.Combat.levelExp.setLevel(100);
    skills.Dark.levelExp.setLevel(70);
    skills.Restoration.levelExp.setLevel(40);
    resources.zombie=4;resources.team=3;
    const normalSelf=getSelfCombat(),normalTeam=getTeamCombat();
    const original=getSelfCombat;
    challengeSave.challengeMode=2;loadChallenge();
    return {changed:original!==getSelfCombat,
        self:getSelfCombat(),team:getTeamCombat(),
        expectedSelf:Math.max(getZombieStrength(),getTeamStrength())/2,
        expectedTeam:getZombieStrength()+getTeamStrength(),
        normalSelf,normalTeam};
})()`);
assert.equal(noodle.changed,true);
assert.equal(noodle.self,noodle.expectedSelf);
assert.equal(noodle.team,noodle.expectedTeam);
assert.ok(noodle.normalSelf!==noodle.self||noodle.normalTeam!==noodle.team);

const burn=run(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Wander",1);
    challengeSave.challengeMode=3;
    totals.effectiveTime=100;
    const original=restart;
    loadChallenge();
    const changed=original!==restart;
    restart();
    return {changed,timeNeeded,curTown,position:actions.currentPos,
        mana:resources.gold,actions:actions.current.length,
        challenge:challengeSave.challengeMode};
})()`);
assert.equal(burn.changed,true);
assert.equal(burn.timeNeeded,4320000-5000);
assert.equal(burn.curTown,0);
assert.equal(burn.position,0);
assert.equal(burn.actions,1);
assert.equal(burn.challenge,3);

// A fresh JS realm (as on challenge exit via page reload) restores original
// function identities and formulas; tests that don't isolate mode state lie.
const normal=run(`(() => ({
    mode:challengeSave.challengeMode,
    speed:gameSpeed,
    manaCost:Action.BuyManaZ1.manaCost(),
    rate:Action.BuyManaZ1.goldCost(),
    visibleZ3:typeof Action.BuyManaZ3.visible==='function',
    isNormalRestart:timeNeeded===timeNeededInitial
}))()`);
assert.equal(normal.mode,0);
assert.equal(normal.speed,1);
assert.equal(normal.manaCost,100);
assert.equal(normal.rate,50);
assert.equal(normal.isNormalRestart,true);
console.log('PASS RF01 challenge characterization: Mana Drought, Noodle Arms, Mana Burn and isolated normal-mode restoration.');
