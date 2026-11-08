#!/usr/bin/env node
// RF04 deterministic challenge-policy characterization against loaded game source.
// Each scenario uses a fresh synthetic VM; never use real browser/player saves.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';

function run(code) {
    const {evaluate}=loadGameModel({withViewStubs:true,withChallenges:true});
    return JSON.parse(JSON.stringify(evaluate(code)));
}

const identities=run(`(() => {
    const original=[restart,getSelfCombat,getTeamCombat,
        Action.BuyManaZ1.canStart,Action.BuyManaZ1.manaCost,
        Action.BuyManaZ1.goldCost,Action.BuyManaZ1.finish,
        Action.BuyManaZ3.visible,Action.BuyManaZ5.visible];
    const states=[];
    for(const mode of [0,1,0,2,0,3,0]) {
        challengeSave.challengeMode=mode;
        loadChallenge();
        const current=[restart,getSelfCombat,getTeamCombat,
            Action.BuyManaZ1.canStart,Action.BuyManaZ1.manaCost,
            Action.BuyManaZ1.goldCost,Action.BuyManaZ1.finish,
            Action.BuyManaZ3.visible,Action.BuyManaZ5.visible];
        states.push({mode,speed:gameSpeed,stable:original.every((f,i)=>f===current[i]),
            z1Cost:Action.BuyManaZ1.manaCost(),
            z1Rate:Action.BuyManaZ1.goldCost(),
            z3:Action.BuyManaZ3.visible(),z5:Action.BuyManaZ5.visible(),
            z3CanStart:Action.BuyManaZ3.canStart()});
    }
    challengeSave.challengeMode=99;
    loadChallenge();
    return {states,invalidMode:getActiveChallengeMode(),invalidSpeed:gameSpeed,
        defaultPolicy:getChallengePolicy(99)===getChallengePolicy(0)};
})()`);
assert.deepEqual(identities.states.map(s=>s.mode),[0,1,0,2,0,3,0]);
assert.ok(identities.states.every(s=>s.stable),'Challenge mode must not change callable identities');
assert.deepEqual(identities.states.map(s=>s.speed),[1,2,1,1,1,1,1]);
assert.deepEqual(identities.states.map(s=>s.z1Cost),[100,1,100,100,100,100,100]);
assert.deepEqual(identities.states.map(s=>[s.z3,s.z5]),
    [[true,true],[false,false],[true,true],[true,true],[true,true],[true,true],[true,true]]);
assert.equal(identities.states[1].z3CanStart,true,
    'Mode 1 only hides Z3/Z5; it does not block an already queued action');
assert.equal(identities.invalidMode,0);
assert.equal(identities.invalidSpeed,1);
assert.equal(identities.defaultPolicy,true);

function purchase(mode,gold,merchant) {
    return run(`(() => {
        challengeSave.challengeMode=${mode};
        loadChallenge();
        resources.gold=${gold};
        totalMerchantMana=${merchant};
        const before=timeNeeded;
        const starts=Action.BuyManaZ1.canStart();
        Action.BuyManaZ1.finish();
        return {starts,gold:resources.gold,merchant:totalMerchantMana,
            manaGain:timeNeeded-before,rate:Action.BuyManaZ1.goldCost(),
            manaCost:Action.BuyManaZ1.manaCost()};
    })()`);
}
assert.deepEqual(purchase(1,12,7500),
    {starts:true,gold:0,merchant:7140,manaGain:360,rate:30,manaCost:1});
assert.deepEqual(purchase(1,400,7500),
    {starts:true,gold:100,merchant:0,manaGain:7500,rate:30,manaCost:1});
assert.deepEqual(purchase(1,400,2),
    {starts:true,gold:100,merchant:0,manaGain:2,rate:30,manaCost:1});
assert.deepEqual(purchase(1,0,7500),
    {starts:true,gold:0,merchant:7500,manaGain:0,rate:30,manaCost:1});
assert.deepEqual(purchase(1,12,0),
    {starts:false,gold:0,merchant:0,manaGain:0,rate:30,manaCost:1});
const ordinary=purchase(0,12,7500);
assert.deepEqual(ordinary,
    {starts:true,gold:0,merchant:7500,manaGain:600,rate:50,manaCost:100});

const combat=run(`(() => {
    skills.Combat.levelExp.setLevel(100);
    skills.Dark.levelExp.setLevel(70);
    skills.Restoration.levelExp.setLevel(40);
    resources.zombie=4;
    resources.teamMembers=3;
    const get=()=>({self:getSelfCombat(),team:getTeamCombat(),
        zombie:getZombieStrength(),strength:getTeamStrength()});
    const original=get();
    challengeSave.challengeMode=2;
    loadChallenge();
    const changed=get();
    const expected={self:Math.max(changed.zombie,changed.strength)/2,
        team:changed.zombie+changed.strength};
    challengeSave.challengeMode=0;
    loadChallenge();
    return {original,changed,expected,restored:get()};
})()`);
assert.equal(combat.changed.self,combat.expected.self);
assert.equal(combat.changed.team,combat.expected.team);
assert.notEqual(combat.changed.team,combat.original.team);
assert.deepEqual(combat.restored,combat.original);

for(const seconds of [0,100,86399,86400,86401]) {
    const outcome=run(`(() => {
        options.repeatLastAction=false;
        challengeSave.challengeMode=3;
        loadChallenge();
        totals.effectiveTime=${seconds};
        currentLoop=777;
        actions.addAction("Wander",1);
        restart();
        return {timeNeeded,currentLoop,mode:getActiveChallengeMode(),
            town:curTown,actionCount:actions.current.length,position:actions.currentPos};
    })()`);
    assert.equal(outcome.timeNeeded,4320000-seconds*50);
    assert.equal(outcome.currentLoop,777,'Original mode 3 did not update currentLoop');
    assert.equal(outcome.mode,3);
    assert.equal(outcome.town,0);
    assert.equal(outcome.actionCount,1);
    assert.equal(outcome.position,0);
}
const normalRestart=run(`(() => {
    challengeSave.challengeMode=0;
    loadChallenge();
    totals.loops=8;
    currentLoop=777;
    restart();
    return {currentLoop,timeNeeded,timeNeededInitial};
})()`);
assert.equal(normalRestart.currentLoop,9);
assert.equal(normalRestart.timeNeeded,normalRestart.timeNeededInitial);

const snapshot=run(`(() => {
    const identity=Data.rootObjects.globals;
    challengeSave.challengeMode=1;
    totalMerchantMana=13;
    const saved=Data.recordSnapshot("rf04-merchant");
    totalMerchantMana=3;
    saved.applyState();
    return {sameIdentity:Data.rootObjects.globals===identity,
        amount:totalMerchantMana,mode:getActiveChallengeMode()};
})()`);
assert.equal(snapshot.sameIdentity,true);
assert.equal(snapshot.amount,13);
assert.equal(snapshot.mode,1);

console.log('PASS RF04 stable challenge policies: modes 0-3, identical callback identities, exact Mana Drought, Noodle Arms, Mana Burn boundary and snapshot budget.');
