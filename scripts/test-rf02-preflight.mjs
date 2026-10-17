#!/usr/bin/env node
// RF02: pure preflight validation, compatible alias migration and rejection.
// Does not boot a browser, mutate storage or consume private saves.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const SaveImport=require('../save-import.js');

const example={
    date:'2026-10-17T14:00:00.000Z',
    stats:{Dex:{statLevelExp:{exp:0},talentLevelExp:{exp:0}}},
    skills:{Combat:{exp:0}},
    buffs:{PrestigeCombat:{amt:0}},
    nextList:[{name:'Wander',loops:2,disabled:false}],
    loadouts:[[{name:'Train Dex',loops:1,disabled:false}]],
    challengeSave:{challengeMode:0,inChallenge:false},
    expWander:400,storyReqs:{loopingPotionMade:false},
    dungeons:[[]],trials:[[]],townsUnlocked:[0,1],
    options:{fractionalMana:true},extraOptions:{},
    prestigeValues:{prestigeCurrentPoints:0},
};
const old={
    stats:{},skills:{},buffs:{},maxTown:3,
    nextList:[{name:'Sell Gold',loops:1,disabled:false},
        {name:'Buy Mana Challenge',loops:1,disabled:false}],
    loadouts:[[{name:'Tournament',loops:1,disabled:false}]],
    challenge:2,storyReqs:{loopingPotionMade:true},
};
const codecs={
    decompress:text=>text,
    legacyDecode:text=>text,
};
const baseline=structuredClone(example);
const current=SaveImport.prepare('ILSV01'+JSON.stringify(example),codecs);
assert.equal(current.encoding,'ILSV01');
assert.equal(current.data.expWander,400);
assert.equal(current.data.loadouts[0][0].name,'Train Dexterity');
assert.deepEqual(example,baseline,'pure migration may not mutate input');
assert.deepEqual(SaveImport.normalizeParsed(current.data).data,current.data,
    'applying pure migration twice must be idempotent');
const legacy=SaveImport.prepare(JSON.stringify(old),codecs);
assert.equal(legacy.encoding,'legacy');
assert.equal(legacy.legacyChallengeMode,2);
assert.equal(legacy.data.challengeSave.challengeMode,2);
assert.equal(legacy.data.challenge,undefined);
assert.deepEqual(legacy.data.nextList.map(x=>x.name),['Buy Mana Z1','Buy Mana Z1']);
assert.equal(legacy.data.loadouts[0][0].name,'Buy Pickaxe');
assert.deepEqual(SaveImport.normalizeParsed(legacy.data).data,legacy.data);
function rejects(data,code){
    assert.throws(()=>SaveImport.prepare(data,codecs), e=>e instanceof SaveImport.SaveImportError&&e.code===code,
        'expected '+code);
}
rejects('', 'EMPTY');
rejects('ILSV01', 'DECODE');
rejects('ILSV02{}', 'UNSUPPORTED_VERSION');
rejects('ILSV01{"nextList":', 'INVALID_JSON');
rejects('ILSV01null','INVALID_ROOT');
rejects('ILSV01[]','INVALID_ROOT');
rejects('ILSV01{"anything":true}','NO_SAVE_DATA');
rejects('ILSV01{"stats":[]}','INVALID_OBJECT');
rejects('ILSV01{"stats":{},"buffs":null}','INVALID_OBJECT');
rejects('ILSV01{"stats":{},"unknownFutureField":{"valuable":1}}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{},"nextList":"not a queue"}','INVALID_QUEUE');
rejects('ILSV01{"stats":{},"nextList":[{"name":"Wander","loops":-4}]}','INVALID_QUEUE');
rejects('ILSV01{"stats":{},"townsUnlocked":[0,11]}','INVALID_TOWN');
rejects('ILSV01{"stats":{},"challengeSave":{"challengeMode":17}}','INVALID_CHALLENGE');
rejects('ILSV01{"stats":{},"date":"not-a-date"}','INVALID_DATE');
rejects('ILSV01{"stats":{},"storyReqs":{"someFlag":123}}','INVALID_STORY');
rejects('ILSV01'+('0'.repeat(SaveImport.MAX_ENCODED_CHARS+1)),'TOO_LARGE');
assert.throws(
    ()=>SaveImport.prepare('ILSV01x',{decompress:()=>{throw Error('bad compression')},legacyDecode:x=>x}),
    e=>e instanceof SaveImport.SaveImportError&&e.code==='DECODE'
);
assert.throws(
    ()=>SaveImport.prepare('ILSV01x',{decompress:()=>('x'.repeat(SaveImport.MAX_DECODED_CHARS+1)),legacyDecode:x=>x}),
    e=>e instanceof SaveImport.SaveImportError&&e.code==='TOO_LARGE'
);
console.log('PASS RF02 pure preflight: current and old envelope, side-effect-free/idempotent aliases, challenge conversion, corrupt/root/schema/size/unknown-field rejection.');
