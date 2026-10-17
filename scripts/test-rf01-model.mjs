#!/usr/bin/env node
// RF01 characterization against real engine source in isolated Node VMs.
// Values are synthetic; this neither modifies gameplay nor uses player saves.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadGameModel} from './load-game-model.mjs';

function scenario(source, {challenges=false}={}) {
    const {evaluate}=loadGameModel({withViewStubs:true,withChallenges:challenges});
    return JSON.parse(JSON.stringify(evaluate(source)));
}
const order=scenario(`(() => Object.entries(Action).filter(([,a])=>a instanceof Action)
    .map(([id,a])=>[id,a.name,a.varName,a.townNum,a.type,a.segments??0]))()`);
const fingerprint=createHash('sha256').update(JSON.stringify(order)).digest('hex');
assert.equal(fingerprint,'e2033a91c69c508845eea537903a2355dc4a902db5b66f6b99be67ef99b3a7c9',
    'RF01 original ordered action IDs/metadata may not change without reviewed migration');
assert.equal(order.length,157);
assert.equal(new Set(order.map(a=>a[0])).size,157);
assert.equal(new Set(order.map(a=>a[2]+'@'+a[3])).size,157);
assert.deepEqual([...new Set(order.map(a=>a[3]))].sort(),[0,1,2,3,4,5,6,7,8]);
console.log('RF01 original ordered-registry fingerprint: '+fingerprint);

const actionsRun=scenario(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Wander",1);
    actions.addAction("Buy Mana Z1",1);
    actions.restart();
    resources.gold=2;
    const before=timeNeeded;
    const wander=actions.tick(250);
    const progress=towns[0].expWander;
    let spent=0,i=0;
    while(actions.currentPos===1 && i++<200)spent+=actions.tick(100);
    return {wander,progress,spent,pos:actions.currentPos,
        completed:totals.actions,gold:resources.gold,manaAdded:timeNeeded-before};
})()`);
assert.equal(actionsRun.wander,250);
assert.equal(actionsRun.progress,200);
assert.ok(actionsRun.spent>0&&actionsRun.spent<=100);
assert.deepEqual([actionsRun.pos,actionsRun.completed,actionsRun.gold,actionsRun.manaAdded],[2,2,0,100]);

const skipped=scenario(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Buy Supplies",1);
    actions.addAction("Wander",1);
    actions.restart();
    const spent=actions.tick(250);
    return {spent,pos:actions.currentPos,progress:towns[0].expWander,
        error:actions.current[0].errorMessage};
})()`);
assert.equal(skipped.spent,250);
assert.equal(skipped.progress,200);
assert.equal(skipped.pos,2);
assert.match(skipped.error,/could not make the cost/i);

const limited=scenario(`(() => {
    const t=towns[0];
    t.totalPots=20;t.checkedPots=9;t.goodPots=1;t.goodTempPots=1;
    const before=timeNeeded;
    Action.SmashPots.finish();
    const known={checked:t.checkedPots,good:t.goodPots,temp:t.goodTempPots,
        loot:t.lootFromPots,mana:timeNeeded-before};
    Action.SmashPots.finish();
    return {known,unchecked:{checked:t.checkedPots,good:t.goodPots,
        temp:t.goodTempPots,loot:t.lootFromPots,mana:timeNeeded-before}};
})()`);
assert.deepEqual(limited.known,{checked:9,good:1,temp:0,loot:100,mana:100});
assert.deepEqual(limited.unchecked,{checked:10,good:2,temp:0,loot:200,mana:200});

const multipart=scenario(`(() => {
    options.repeatLastAction=false;
    skills.Combat.levelExp.setLevel(1000);
    actions.addAction("Fight Monsters",1);
    actions.restart();
    resources.reputation=2;
    let spent=0,attempts=0;
    while(resources.gold===0&&attempts++<250&&actions.currentPos===0){
        const used=actions.tick(2000);
        spent+=used;
        if(!used)break;
    }
    return {spent,attempts,gold:resources.gold,progress:towns[0].Fight,
        counter:towns[0].FightLoopCounter,total:towns[0].totalFight,
        selfCombat:getSelfCombat(),canStart:Action.FightMonsters.canStart(),
        canMakeProgress:Action.FightMonsters.canMakeProgress(0),
        currentPos:actions.currentPos,current:actions.current.map(a=>a.name),
        skill:getSkillLevel('Combat')};
})()`);
assert.ok(multipart.spent>0,'multipart spends mana '+JSON.stringify(multipart));
assert.ok(multipart.gold>=20,'first Fight Monsters segment grants gold');

const dungeon=scenario(`(() => {
    Math.random=()=>0;
    dungeons[0]=Array.from({length:6},()=>({ssChance:1,completed:0,lastStat:"NA"}));
    const before=stats.Dex.soulstone;
    const result=Action.SmallDungeon.finishDungeon(0);
    return {result,completed:dungeons[0][0].completed,
        chance:dungeons[0][0].ssChance,lastStat:dungeons[0][0].lastStat,
        soulstoneDelta:stats.Dex.soulstone-before};
})()`);
assert.deepEqual(dungeon,{result:true,completed:1,chance:0.98,lastStat:'Dex',soulstoneDelta:1});

const trial=scenario(`(() => {
    trials[1]=Array.from({length:100},()=>({completed:0}));
    trials[1].highestFloor=0;
    const a=Action.GodsTrial,n=a.segments;
    towns[8].GTrialLoopCounter=99*n;
    a.loopsFinished(99*n);
    const before={power:resources.power,lastFloor:trials[1][98].completed};
    towns[8].GTrialLoopCounter=100*n;
    a.loopsFinished(100*n);
    return {before,power:resources.power,finalFloor:trials[1][99].completed,
        flag:storyFlags.trailGodsAllDone,highest:trials[1].highestFloor};
})()`);
assert.equal(trial.before.power,0);
assert.equal(trial.before.lastFloor,1);
assert.equal(trial.power,1);
assert.equal(trial.finalFloor,1);
assert.equal(trial.flag,true);
assert.equal(trial.highest,99);

const routes=scenario(`(() => {
    const deltas=[49,50,51].map(rep=>{
        resources.reputation=rep;
        return getTravelNum("Face Judgement");
    });
    escapeStarted=false;effectiveTime=59.99;
    const first=Action.Escape.canStart(),sticky=escapeStarted;
    effectiveTime=60;const subsequent=Action.Escape.canStart();
    escapeStarted=false;
    return {deltas,first,sticky,subsequent,at60:Action.Escape.canStart()};
})()`);
assert.deepEqual(routes.deltas,[2,2,1]);
assert.deepEqual([routes.first,routes.sticky,routes.subsequent,routes.at60],[true,true,true,false]);

const restarted=scenario(`(() => {
    options.repeatLastAction=false;
    towns[0].expWander=400;
    skills.Combat.levelExp.setLevel(3);
    stats.Spd.talentLevelExp.setLevel(5);
    actions.addAction("Wander",2);
    actions.restart();
    resources.gold=999;resources.supplies=true;
    restart();
    return {gold:resources.gold,supplies:resources.supplies,progress:towns[0].expWander,
        skill:getSkillLevel("Combat"),talent:stats.Spd.talentLevelExp.level,
        next:actions.next.length,current:actions.current.length,
        planned:actions.next[0].loops,pos:actions.currentPos,time:effectiveTime};
})()`);
assert.equal(restarted.gold,0);
assert.equal(restarted.supplies,false);
assert.equal(restarted.progress,400);
assert.equal(restarted.skill,3);
assert.equal(restarted.talent,5);
assert.equal(restarted.next,1);
assert.equal(restarted.current,1);
assert.equal(restarted.planned,2);
assert.equal(restarted.pos,0);
assert.equal(restarted.time,0);

const queue=scenario(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Wander",2);
    actions.addAction("Smash Pots",3);
    actions.addAction("Pick Locks",4,-1,true);
    actions.restart();
    const initial=actions.current.map(a=>[a.name,a.loops,a.loopsType]);
    actions.clearActions();
    actions.restart();
    return {initial,emptyNext:actions.next.length,emptyCurrent:actions.current.length};
})()`);
assert.deepEqual(queue.initial,[['Wander',2,'actions'],['Smash Pots',3,'actions']]);
assert.equal(queue.emptyNext,0);
assert.equal(queue.emptyCurrent,0);

const economy=scenario(`(() => {
    resources.gold=2000;Action.Invest.finish();
    const invested=goldInvested;
    Action.CollectInterest.finish();
    return {invested,gold:resources.gold,flag:storyFlags.interestCollected};
})()`);
assert.deepEqual(economy,{invested:2000,gold:2,flag:true});

const dungeonQueue=scenario(`(() => {
    Math.random=()=>0;
    options.repeatLastAction=false;
    dungeons[0]=Array.from({length:6},()=>({ssChance:1,completed:0,lastStat:"NA"}));
    skills.Combat.levelExp.setLevel(100000);
    skills.Magic.levelExp.setLevel(1000);
    actions.addAction("Small Dungeon",1);
    actions.restart();
    resources.reputation=2;
    let attempts=0,spent=0;
    while(!dungeons[0][0].completed && attempts++<300 && actions.currentPos===0){
        const used=actions.tick(2000);spent+=used;if(!used)break;
    }
    return {spent,attempts,floor:dungeons[0][0].completed,
        dungeonTotal:towns[0].totalSDungeon,
        soulstones:statList.reduce((sum,name)=>sum+stats[name].soulstone,0)};
})()`);
assert.ok(dungeonQueue.spent>0,'real DungeonAction tick consumes mana '+JSON.stringify(dungeonQueue));
assert.equal(dungeonQueue.floor,1,'queue must complete a dungeon floor '+JSON.stringify(dungeonQueue));
assert.ok(dungeonQueue.soulstones>0,'seeded dungeon must award a soulstone');

const undead=scenario(`(() => {
    skills.Dark.levelExp.setLevel(1000);resources.blood=2;
    Action.RaiseZombie.cost();Action.RaiseZombie.finish();
    const before={blood:resources.blood,zombie:resources.zombie,
        max:storyVars.maxZombiesRaised};
    trials[4]=Array.from({length:25},()=>({completed:0}));
    trials[4].highestFloor=0;
    towns[5].DTrialLoopCounter=Action.DeadTrial.segments;
    Action.DeadTrial.loopsFinished(Action.DeadTrial.segments);
    return {before,after:{zombie:resources.zombie,
        completed:trials[4][0].completed,highest:trials[4].highestFloor}};
})()`);
assert.deepEqual(undead.before,{blood:1,zombie:1,max:1});
assert.deepEqual(undead.after,{zombie:2,completed:1,highest:0});

const potion=scenario(`(() => {
    resources.herbs=400;buffs.Imbuement2.amt=5;
    Action.LoopingPotion.cost();Action.LoopingPotion.finish();
    Action.LoopingPotion.story(true);
    const brewed={herbs:resources.herbs,potion:resources.loopingPotion,
        flag:storyFlags.loopingPotionMade};
    Action.Totem.cost();Action.Totem.finish();
    restartStats();
    return {brewed,consumed:resources.loopingPotion,
        wunderkind:getSkillLevel("Wunderkind"),
        exp:skills.Wunderkind.exp,initialSpd:stats.Spd.statLevelExp.level};
})()`);
assert.deepEqual(potion.brewed,{herbs:0,potion:true,flag:true});
assert.equal(potion.consumed,false);
assert.equal(potion.exp,100);
assert.equal(potion.wunderkind,1);
assert.equal(potion.initialSpd,10);

const modes=scenario(`(() => {
    actions.addAction("Smash Pots",2,-1,false,"knownGood");
    actions.addAction("Pick Locks",3,-1,false,"unchecked");
    actions.restart();
    const entries=actions.current.map(a=>[a.name,a.loops,a.loopsType]);
    options.fractionalMana=true;
    const fractions=[Mana.floor(.5),Mana.ceil(.5)];
    return {entries,fractions};
})()`);
assert.deepEqual(modes.entries,[['Smash Pots',2,'knownGood'],['Pick Locks',3,'unchecked']]);
assert.deepEqual(modes.fractions,[0.5,0.5]);

const domless=loadGameModel().evaluate(`(() => {
    try {getBuffCap("Imbuement");return "DOM-INDEPENDENT";}
    catch(e){return String(e);}
})()`);
if(String(domless).includes('document'))
    console.warn('KNOWN R04: DOM-less getBuffCap cannot evaluate without document; RF03 owns the pure-rule correction.');
console.log('PASS RF01 extra: queued dungeon floor, undead trial, potion/Totem, typed limited loops and fractional mana controls.');

console.log('PASS RF01 model: ordered registry, normal/progress/cost skip, limited known-good/unchecked, multipart, seeded dungeon, terminal Gods Trial, travel/Escape, restart, queue and interest.');
