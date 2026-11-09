#!/usr/bin/env node
// RF02: pure preflight validation, compatible alias migration and rejection.
// Does not boot a browser, mutate storage or consume private saves.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {loadGameModel} from './load-game-model.mjs';
const require=createRequire(import.meta.url);
const SaveImport=require('../save-import.js');

const contract={
    actions:[{name:'Wander',varName:'Wander',type:'progress'},
        {name:'Train Dexterity',varName:'TrainDexterity',type:'normal'},
        {name:'Buy Mana Z1',varName:'BuyManaZ1',type:'normal'},
        {name:'Buy Mana Z3',varName:'BuyManaZ3',type:'normal'},
        {name:'Buy Pickaxe',varName:'BuyPickaxe',type:'normal'}],
    statNames:['Dex'],skillNames:['Combat'],buffNames:['PrestigeCombat'],
    storyFlags:['loopingPotionMade'],storyVars:[],optionTypes:{fractionalMana:'boolean'}
};
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
    actionLog:[['story',0],[[0,1]]],
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
    allowedActionVars:contract.actions.map(a=>a.varName),
    contract,
};
const baseline=structuredClone(example);
const current=SaveImport.prepare('ILSV01'+JSON.stringify(example),codecs);
assert.equal(current.encoding,'ILSV01');
assert.equal(current.data.expWander,400);
assert.equal(current.data.loadouts[0][0].name,'Train Dexterity');
assert.deepEqual(example,baseline,'pure migration may not mutate input');
assert.deepEqual(SaveImport.normalizeParsed(current.data,codecs.allowedActionVars,contract).data,current.data,
    'applying pure migration twice must be idempotent');
const legacy=SaveImport.prepare(JSON.stringify(old),codecs);
assert.equal(legacy.encoding,'legacy');
assert.equal(legacy.legacyChallengeMode,2);
assert.equal(legacy.data.challengeSave.challengeMode,2);
assert.equal(legacy.data.challenge,undefined);
assert.deepEqual(legacy.data.nextList.map(x=>x.name),['Buy Mana Z1','Buy Mana Z1']);
assert.equal(legacy.data.loadouts[0][0].name,'Buy Pickaxe');
assert.deepEqual(SaveImport.normalizeParsed(legacy.data,codecs.allowedActionVars,contract).data,legacy.data);
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
rejects('ILSV01{"stats":{},"expInventedFutureAction":123}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{},"goodWander":1}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{"FutureStat":{"exp":4}}}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{"Dex":{"futureLevel":4}}}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{},"buffs":{"PrestigeCombat":{"amt":"invalid"}}}','INVALID_NUMBER');
rejects('ILSV01{"stats":{},"prestigeValues":{"prestigeCurrentPoints":"9999"}}','INVALID_NUMBER');
rejects('ILSV01{"stats":{},"options":{"fractionalMana":"false"}}','INVALID_OPTION');
rejects('ILSV01{"stats":{},"storyReqs":{"unknownFutureFlag":true}}','UNSUPPORTED_FIELD');
rejects('ILSV01{"stats":{},"nextList":[{"name":"Unknown Future", "loops":1}]}','INVALID_QUEUE');
rejects('ILSV01{"stats":{},"actionLog":[["story"],[[99]]]}','INVALID_LOG');
assert.equal(SaveImport.prepareStoredJson('  { "stats": {}, "expWander": 20 }  ',codecs).data.expWander,20);

// Verify real LZString compatibility and early expansion-size enforcement.
const LZString=require('../lib/lz-string.min.js');
const boundedCodecs={...codecs,boundedDecompress:SaveImport.decompressBoundedBase64};
const realPacked=SaveImport.prepare('ILSV01'+LZString.compressToBase64(JSON.stringify(example)),boundedCodecs);
assert.equal(realPacked.data.expWander,400);
assert.throws(
    ()=>SaveImport.decompressBoundedBase64(LZString.compressToBase64('Z'.repeat(4096)),128),
    e=>e instanceof SaveImport.SaveImportError&&e.code==='TOO_LARGE'
);

// Real game doSave() is the authoritative current schema, not a hand-authored
// sample. Test it in the same worker-like model used by the RF01 suite.
const {evaluate}=loadGameModel({withViewStubs:true});
const fromGame=evaluate(`(() => ({
    saveJson:JSON.stringify(doSave()),
    allowedActionVars:totalActionList.map(action=>action.varName).filter(Boolean),
    contract:getImportContract()
}))()`);
const gameSave=SaveImport.prepare('ILSV01'+LZString.compressToBase64(fromGame.saveJson),{
    ...boundedCodecs,allowedActionVars:fromGame.allowedActionVars,contract:fromGame.contract
});
assert.deepEqual(gameSave.data,JSON.parse(fromGame.saveJson),
    'current game serializer must round-trip without losing recognized fields');
assert.equal(fromGame.allowedActionVars.length,157);
const unexpected={...JSON.parse(fromGame.saveJson),expUnsupportedFutureAction:77};
assert.throws(()=>SaveImport.prepare(
    'ILSV01'+LZString.compressToBase64(JSON.stringify(unexpected)),{
        ...boundedCodecs,allowedActionVars:fromGame.allowedActionVars,contract:fromGame.contract
    }),e=>e instanceof SaveImport.SaveImportError&&e.code==='UNSUPPORTED_FIELD');

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

const legacyEnv={self:{}};
vm.createContext(legacyEnv);
vm.runInContext(readFileSync(new URL('../helpers.js',import.meta.url),'utf8')+
    '\nthis.legacyCodec={encode,decode,Base64}',legacyEnv);
const legacyCodec=legacyEnv.legacyCodec;
const olderPacked=legacyCodec.encode(JSON.stringify(example));
const boundedLegacyDecode=text=>SaveImport.decompressBoundedLegacy(
    text,legacyCodec.Base64.decode.bind(legacyCodec.Base64));
assert.deepEqual(SaveImport.prepare(olderPacked,{...codecs,boundedLegacyDecode}).data,current.data);
assert.throws(()=>SaveImport.decompressBoundedLegacy(
    legacyCodec.encode('A'.repeat(4000)),legacyCodec.Base64.decode.bind(legacyCodec.Base64),128),
    e=>e instanceof SaveImport.SaveImportError&&e.code==='TOO_LARGE');
assert.throws(()=>SaveImport.decompressBoundedLegacy('@!',
    legacyCodec.Base64.decode.bind(legacyCodec.Base64)),
    e=>e instanceof SaveImport.SaveImportError&&e.code==='DECODE');

// A reload may restore updateRate from string-valued localStorage. The import
// schema must stay numeric and accept the known old numeric-text representation,
// regardless of the type currently held by the active game.
const beforeOptionDrift=evaluate(`JSON.stringify(doSave())`);
const driftedContract=evaluate(`(() => {
    options.updateRate='200';
    return getImportContract();
})()`);
assert.equal(driftedContract.optionTypes.updateRate,'number',
    'live localStorage option types may not redefine the saved-data contract');
const driftCodecs={...boundedCodecs,allowedActionVars:fromGame.allowedActionVars,
    contract:driftedContract};
assert.equal(SaveImport.prepareStoredJson(beforeOptionDrift,driftCodecs).data.options.updateRate,50);
for(const rate of [50,'50','200.5']) {
    const data=JSON.parse(beforeOptionDrift);
    data.options.updateRate=rate;
    const raw=' \n'+JSON.stringify(data,null,2)+' \n';
    const restored=SaveImport.prepareStoredJson(raw,driftCodecs);
    assert.equal(restored.data.options.updateRate,Number(rate),
        'validation normalizes a clone; the transaction restores the original raw bytes');
    const imported=SaveImport.prepare('ILSV01'+LZString.compressToBase64(raw),driftCodecs);
    assert.equal(imported.data.options.updateRate,Number(rate));
    assert.equal(SaveImport.normalizeParsed(imported.data,driftCodecs.allowedActionVars,
        driftedContract).data.options.updateRate,Number(rate),'option migration must be idempotent');
}
for(const rate of ['', ' ', 'NaN', 'Infinity', '50fps', true, {}, []]) {
    const data=JSON.parse(beforeOptionDrift);data.options.updateRate=rate;
    assert.throws(()=>SaveImport.prepareStoredJson(JSON.stringify(data),driftCodecs),
        e=>e instanceof SaveImport.SaveImportError&&e.code==='INVALID_OPTION',
        'legacy option compatibility cannot admit malformed or wrong-type values');
}
console.log('PASS RF02 pure preflight: current and old envelope, side-effect-free/idempotent aliases, challenge conversion, corrupt/root/schema/size/unknown-field rejection and stable option types across reload.');
