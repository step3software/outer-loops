#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {browserBinary,browserProfile,cleanupBrowser,stopBrowser,removeBrowserProfile} from './browser-test-utils.mjs';

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const profile=browserProfile('outerloops-cleanup-regression-');
const child=spawn(browserBinary(),[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions','--remote-allow-origins=*',
  '--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'
],{stdio:'ignore',windowsHide:true});
let client;
try {
  const portFile=join(profile,'DevToolsActivePort');
  for(let i=0;i<200&&!existsSync(portFile);i++){
    assert.equal(child.exitCode,null,'test browser must stay open until shutdown');
    await pause(100);
  }
  const port=Number(readFileSync(portFile,'utf8').split(/\r?\n/)[0]);
  const pages=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  const ws=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});
  });
  const pending=new Map();let id=0,closeRequests=0;
  const close=()=>{
    for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error('Connection closed'));}
    pending.clear();ws.close();
  };
  ws.addEventListener('close',close,{once:true});
  ws.addEventListener('message',event=>{
    const message=JSON.parse(event.data),item=pending.get(message.id);if(!item)return;
    clearTimeout(item.timer);pending.delete(message.id);
    if(message.error)item.reject(Error(message.error.message));else item.resolve(message.result);
  });
  client={close,send(method){
    if(method==='Browser.close')closeRequests++;
    return new Promise((resolve,reject)=>{
      const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout'));},5000);
      pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method}));
    });
  }};
  await client.send('Browser.getVersion');
  assert.equal(await stopBrowser(child,client),'graceful');
  assert.equal(closeRequests,1,'shutdown must request Chrome to release its own subprocesses');
  assert.equal(child.exitCode,0,'graceful browser shutdown must be confirmed before deletion');
  await removeBrowserProfile(profile);
  assert.equal(existsSync(profile),false,'the entire real Chrome profile must be removed');
  await cleanupBrowser({child,client,profile});
  assert.equal(existsSync(profile),false,'repeated cleanup must be harmless');
} finally {
  await cleanupBrowser({child,client,profile});
}

// Exercise the bounded no-CDP fallback on an owned process that keeps a file in
// its disposable profile. This does not create an unrelated Chrome session.
const forcedProfile=browserProfile('outerloops-cleanup-fallback-');
writeFileSync(join(forcedProfile,'fixture'),'owned test data');
const forced=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore',windowsHide:true});
try {
  assert.equal(await stopBrowser(forced),'forced');
  assert.ok(forced.exitCode!==null||forced.signalCode!==null,'forced exit must be observed');
  await removeBrowserProfile(forcedProfile);
  assert.equal(existsSync(forcedProfile),false);
} finally {await cleanupBrowser({child:forced,profile:forcedProfile});}

await assert.rejects(removeBrowserProfile(tmpdir()),/not owned/,
  'cleanup must refuse an unregistered directory before any recursive removal');
assert.ok(existsSync(tmpdir()));
const empty=browserProfile('outerloops-cleanup-no-process-');
await cleanupBrowser({profile:empty});
assert.equal(existsSync(empty),false,'startup failure must still remove an owned empty profile');
console.log('PASS browser cleanup: graceful Chrome exit, complete profile removal, idempotency, forced fallback, startup cleanup and unowned-path denial.');
