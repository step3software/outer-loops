#!/usr/bin/env node
// RF02 transaction fault-injection tests. Reads and exercises shipping
// saving.js transaction functions in a disposable VM with fake localStorage.
// No player data, remote services or actual browser profile are accessed.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const SaveImport=require('../save-import.js');
const saving=readFileSync(join(root,'saving.js'),'utf8');
const first=saving.indexOf('const importPendingKey =');
const last=saving.indexOf('let overquotaWarned = false;');
assert.ok(first>=0&&last>first,'production import transaction boundaries must remain identifiable');
const code=saving.slice(first,last);

const original={
    stats:{},skills:{},buffs:{},expWander:100,
    challengeSave:{challengeMode:0,inChallenge:false},
};
const candidate={
    stats:{},skills:{},buffs:{},expWander:700,
    challengeSave:{challengeMode:0,inChallenge:false},
};
const packed=data=>'ILSV01'+JSON.stringify(data);
const backupNormal='idleLoopsImportBackupV1_normal';
const backupChallenge='idleLoopsImportBackupV1_challenge';
const pending='idleLoopsImportPendingV1';
function fixture({failWrite=null,throwInLoad=false,active='idleLoops1'}={}) {
    const entries=new Map([
        ['idleLoops1',JSON.stringify(original)],
        ['idleLoopsChallenge',JSON.stringify({...original,expWander:800,challengeSave:{challengeMode:2,inChallenge:true}})],
        ['prestigeBackup','ORIGINAL_PRESTIGE_BACKUP'],
        ['updateRate','200'],
    ]);
    let injectFail=failWrite,loadStarted=false,reloads=0,alertMessages=[];
    const storage={
        getItem:key=>entries.has(key)?entries.get(key):null,
        setItem:(key,value)=>{
            if(key===injectFail)throw new Error('Synthetic quota failure: '+key);
            entries.set(key,String(value));
        },
        removeItem:key=>entries.delete(key),
    };
    const world={
        SaveImport,window:{localStorage:storage},
        saveName:active,defaultSaveName:'idleLoops1',challengeSaveName:'idleLoopsChallenge',
        challengeSave:{challengeMode:0,inChallenge:false},
        doSave:()=>structuredClone(original),
        load:(_isChallenge,json)=>{
            loadStarted=true;
            JSON.parse(json);
            if(throwInLoad)throw Error('Synthetic doLoad failure');
        },
        pauseGame:()=>{},restart:()=>{},alert:message=>alertMessages.push(message),
        confirm:()=>true,clearSave:()=>{
            entries.set('idleLoops1','');entries.set('idleLoopsChallenge','');
        },
        LZString:{compressToBase64:x=>x,decompressFromBase64:x=>x},
        decode:x=>x,location:{reload:()=>{reloads++;}},
    };
    vm.createContext(world);
    vm.runInContext(code+`
        this.testTransaction={
            processSave,restoreInterruptedImport,restorePreviousImport,
            snapshotBeforeImport,importBackupKey
        };`,world,{filename:'rf02-original-transaction.js'});
    const state=()=>Object.fromEntries([
        'idleLoops1','idleLoopsChallenge','prestigeBackup','updateRate',
        backupNormal,backupChallenge
    ].map(key=>[key,storage.getItem(key)]));
    return {storage,world,state,entries,tx:world.testTransaction,
        alerts:()=>alertMessages,reloads:()=>reloads,started:()=>loadStarted,
        fail:key=>{injectFail=key;}};
}
const good=fixture();
const firstState=good.state();
assert.equal(good.tx.processSave(packed(candidate)),true);
assert.equal(JSON.parse(good.storage.getItem('idleLoops1')).expWander,700);
assert.equal(JSON.parse(good.storage.getItem(backupNormal)).prior,firstState.idleLoops1);
assert.equal(good.storage.getItem(pending),null);
assert.equal(good.storage.getItem('prestigeBackup'),'ORIGINAL_PRESTIGE_BACKUP');
assert.equal(good.tx.restorePreviousImport(),true);
assert.equal(JSON.parse(good.storage.getItem('idleLoops1')).expWander,100);
assert.equal(JSON.parse(good.storage.getItem(backupNormal)).prior,JSON.stringify(candidate));

for(const bad of [
    'ILSV01{"stats":', 'ILSV01{"stats":[]}', 'ILSV01null',
    'ILSV01{"stats":{},"unknownFuture":{"valuable":1}}',
    'ILSV02anything'
]){
    const f=fixture();
    const before=f.state();
    assert.equal(f.tx.processSave(bad),false);
    assert.deepEqual(f.state(),before,'bad input may not change any storage key');
    assert.equal(f.storage.getItem(pending),null);
    assert.equal(f.started(),false);
}

for(const key of [pending,'idleLoops1',backupNormal]){
    const f=fixture({failWrite:key});
    const before=f.state();
    assert.equal(f.tx.processSave(packed(candidate)),false,key);
    assert.deepEqual(f.state(),before,'failure should restore byte-exact prior storage: '+key);
    assert.equal(f.storage.getItem(pending),null);
    if(key===backupNormal)assert.equal(f.reloads(),1,'partially applied state requires browser reload');
}
const applyFailed=fixture({throwInLoad:true});
const beforeFail=applyFailed.state();
assert.equal(applyFailed.tx.processSave(packed(candidate)),false);
assert.deepEqual(applyFailed.state(),beforeFail);
assert.equal(applyFailed.reloads(),1,'failed load must force state recovery');

const interrupted=fixture();
const savedSnapshot=interrupted.tx.snapshotBeforeImport();
interrupted.storage.setItem(pending,JSON.stringify({version:1,before:savedSnapshot}));
interrupted.storage.setItem('idleLoops1',JSON.stringify(candidate));
assert.equal(interrupted.tx.restoreInterruptedImport(),true);
assert.deepEqual(interrupted.state(),savedSnapshot);
assert.equal(interrupted.storage.getItem(pending),null);

const challenge=fixture();
assert.equal(challenge.tx.processSave(packed({
    ...candidate,challenge:2,challengeSave:undefined
})),true);
assert.equal(JSON.parse(challenge.storage.getItem('idleLoopsChallenge')).expWander,700);
assert.equal(JSON.parse(challenge.storage.getItem('idleLoops1')).expWander,100);
assert.equal(JSON.parse(challenge.storage.getItem('idleLoops1')).challengeSave.inChallenge,true);
assert.equal(challenge.storage.getItem('prestigeBackup'),'ORIGINAL_PRESTIGE_BACKUP');
assert.equal(challenge.storage.getItem(pending),null);

const mismatch=fixture({active:'idleLoopsChallenge'});
const oldBytes=mismatch.state();
assert.equal(mismatch.tx.processSave(packed(candidate)),false);
assert.deepEqual(mismatch.state(),oldBytes,'normal import cannot silently overwrite challenge');
console.log('PASS RF02 transaction: exact rollback on parse/quota/apply failure, interrupted journal recovery, previous-save restore, legacy challenge isolation and prestige backup retention.');
