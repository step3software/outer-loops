#!/usr/bin/env node
// RF03 synthetic worker-like gameplay-rule and resource characterization.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';

function scenario(code, withViewStubs=true) {
    const game=loadGameModel({withViewStubs});
    return JSON.parse(JSON.stringify(game.evaluate(code)));
}

const cap=scenario(`(() => {
    const initial=getBuffCap("Ritual"),registered=Data.rootObjects.buffCaps===buffCaps;
    setBuffCap("Ritual",37);
    const changed=Data.recordSnapshot("rf03-cap");
    const after=getBuffCap("Ritual");
    Data.resetToDefaults();
    const reset=getBuffCap("Ritual");
    changed.applyState();
    const restored=getBuffCap("Ritual");
    let rejects=0;
    for (const value of [-1,667,1.5,NaN,Infinity,"5",undefined]) {
        try {setBuffCap("Ritual",value);}catch(e){if(e instanceof RangeError)rejects++;}
    }
    try {setBuffCap("Unknown",1);}catch(e){if(e instanceof RangeError)rejects++;}
    return {initial,registered,after,reset,restored,rejects,
        ritual:getBuffCap("Ritual"),imbue:getBuffCap("Imbuement")};
})()`,false);
assert.deepEqual(cap,{initial:666,registered:true,after:37,reset:666,
    restored:37,rejects:8,ritual:37,imbue:500});

const eligibility=scenario(`(() => {
    escapeStarted=false;effectiveTime=59.99;
    const initial=JSON.stringify({resources,storyFlags,storyVars,escapeStarted,totals,townsUnlocked});
    const checks=Array.from({length:10},()=>Action.Escape.canStart());
    const unchanged=initial===JSON.stringify({resources,storyFlags,storyVars,escapeStarted,totals,townsUnlocked});
    effectiveTime=60;
    const at60=Action.Escape.canStart();
    effectiveTime=60.01;
    return {checks,unchanged,at60,after:Action.Escape.canStart(),flag:escapeStarted};
})()`);
assert.deepEqual(eligibility,{checks:Array(10).fill(true),unchanged:true,
    at60:false,after:false,flag:false});

const started=scenario(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Escape",1);actions.restart();
    curTown=6;effectiveTime=59.99;
    const zero=actions.tick(0),probeFlag=escapeStarted;
    const spent=actions.tick(1),active=escapeStarted;
    effectiveTime=60.01;
    const sticky=Action.Escape.canStart(),later=actions.tick(1);
    restart();effectiveTime=60;
    return {zero,probeFlag,spent,active,sticky,later,reset:escapeStarted,at60:Action.Escape.canStart()};
})()`);
assert.deepEqual(started,{zero:0,probeFlag:false,spent:1,active:true,
    sticky:true,later:1,reset:false,at60:false});

const skipped=scenario(`(() => {
    options.repeatLastAction=false;
    actions.addAction("Escape",1);actions.restart();
    curTown=6;effectiveTime=59.99;
    actions.tick(0);effectiveTime=60;
    const spent=actions.tick(1);
    return {spent,flag:escapeStarted,restart:shouldRestart};
})()`);
assert.deepEqual(skipped,{spent:0,flag:false,restart:true});

const resource=scenario(`(() => {
    const numeric=Object.keys(resourcesTemplate).filter(k=>typeof resourcesTemplate[k]==="number");
    const flags=Object.keys(resourcesTemplate).filter(k=>typeof resourcesTemplate[k]==="boolean");
    for(const k of numeric){
        addResource(k,2.25);addResource(k,-3.25);
        if(resources[k]!==-1)throw Error(k+" arithmetic failed");
    }
    for(const k of flags){
        addResource(k,true);if(resources[k]!==true)throw Error(k+" true failed");
        addResource(k,false);if(resources[k]!==false)throw Error(k+" false failed");
    }
    const before=resources;
    resetResources();
    return {numeric,flags,reset:numeric.every(k=>resources[k]===0) &&
        flags.every(k=>resources[k]===false),
        stable:resources===before && Data.rootObjects.resources===resources};
})()`);
assert.deepEqual(resource.numeric,["gold","reputation","herbs","hide","potions",
    "teamMembers","armor","blood","artifacts","favors","enchantments","houses",
    "pylons","zombie","map","completedMap","heart","power"]);
assert.deepEqual(resource.flags,["glasses","supplies","pickaxe","loopingPotion",
    "citizenship","pegasus","key","stone","wizardCollege"]);
assert.equal(resource.reset,true);
assert.equal(resource.stable,true);

const rejected=scenario(`(() => {
    const updates=[];view.requestUpdate=(...args)=>updates.push(args);
    const bad=[["gold",NaN],["gold",Infinity],["gold",-Infinity],
        ["gold",undefined],["gold",null],["gold","1"],["gold",true],
        ["supplies",1],["supplies","true"],["supplies",null],["missing",1]];
    let errors=0;
    for(const [key,value] of bad){
        const before=JSON.stringify(resources),count=updates.length;
        try{addResource(key,value);}
        catch(e){if(e instanceof TypeError)errors++;}
        if(JSON.stringify(resources)!==before||updates.length!==count)
            throw Error("Rejected operation caused mutation");
    }
    setResourceValue("gold",Number.MAX_VALUE);
    const count=updates.length;
    let overflow=false;
    try{addResource("gold",Number.MAX_VALUE);}
    catch(e){overflow=e instanceof TypeError;}
    const safe=resources.gold===Number.MAX_VALUE&&count===updates.length;
    resources.gold=NaN;
    let poisoned=false;
    try{addResource("gold",1);}catch(e){poisoned=e instanceof TypeError;}
    resetResource("gold");
    let badFlag=false,badNumeric=false;
    try{setResourceFlag("gold",true);}catch(e){badFlag=e instanceof TypeError;}
    try{addNumericResource("supplies",1);}catch(e){badNumeric=e instanceof TypeError;}
    return {errors,overflow,safe,poisoned,badFlag,badNumeric,repaired:resources.gold};
})()`);
assert.deepEqual(rejected,{errors:11,overflow:true,safe:true,poisoned:true,
    badFlag:true,badNumeric:true,repaired:0});

console.log("PASS RF03 model: DOM-free caps and snapshots; pure predicates; Escape first positive-spend; typed resources, reset identity and invalid-value rejection.");
