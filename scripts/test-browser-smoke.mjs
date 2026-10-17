#!/usr/bin/env node
// Real-browser smoke test using Chrome DevTools Protocol (no npm dependencies).
// Uses a fresh temporary profile; no production saves/accounts are accessed.
import assert from 'node:assert/strict';
import {makeRf01Fixtures} from './rf01-fixtures.mjs';
import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, extname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pause = ms => new Promise(r => setTimeout(r, ms));
const mime = {
  '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.xml':'application/xml', '.json':'application/json',
  '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon'
};
const server = createServer((req, res) => {
  try {
    const uri = new URL(req.url, 'http://localhost/');
    const route = decodeURIComponent(uri.pathname);
    const path = resolve(root, '.' + (route === '/' ? '/index.html' : route));
    if(req.method !== 'GET' || !path.startsWith(root + sep) ||
      !existsSync(path) || !statSync(path).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.writeHead(200, {'Content-Type': mime[extname(path)] || 'application/octet-stream'});
    res.end(readFileSync(path));
  } catch (e) {
    console.error(e);
    res.writeHead(500).end();
  }
});
const browserBinary = () => {
  for(const candidate of [process.env.CHROME_BIN, 'google-chrome',
      'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean)) {
    if(spawnSync(candidate, ['--version'], {timeout:4000}).status === 0) return candidate;
  }
  throw Error('Google Chrome / Chromium not available; cannot run browser smoke test');
};
async function debugPort(profile, child) {
  const file = join(profile, 'DevToolsActivePort');
  for(let i=0;i<200;i++) {
    if(existsSync(file)) {
      const p = Number(readFileSync(file, 'utf8').split(/\r?\n/)[0]);
      if(p>0) return p;
    }
    if(child.exitCode!==null) throw Error('Chrome exited during startup: '+child.exitCode);
    await pause(100);
  }
  throw Error('Chrome debug port unavailable after 20s');
}
async function debuggerPage(port, prefix) {
  for(let i=0;i<80;i++){
    const pages=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
    const page=pages.find(p=>p.type==='page' && p.url.startsWith(prefix));
    if(page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    await pause(100);
  }
  throw Error('Chrome did not open game tab');
}
async function connect(url) {
  const ws=new WebSocket(url);
  await new Promise((resolve,reject)=>{
    ws.addEventListener('open', resolve, {once:true});
    ws.addEventListener('error', reject, {once:true});
  });
  let nextId=0;
  const pending=new Map();
  ws.addEventListener('message',event=>{
    let m;
    try { m=JSON.parse(event.data); } catch { return; }
    const p=pending.get(m.id);
    if(!p)return;
    clearTimeout(p.timer); pending.delete(m.id);
    if(m.error) p.reject(new Error(m.error.message));
    else p.resolve(m.result);
  });
  function send(method,params={}) {
    return new Promise((resolve,reject)=>{
      const id=++nextId;
      const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},15000);
      pending.set(id,{resolve,reject,timer});
      ws.send(JSON.stringify({id,method,params}));
    });
  }
  async function evaluate(expression) {
    const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description
       || response.exceptionDetails.text);
    return response.result.value;
  }
  return {send,evaluate,close:()=>ws.close()};
}

const profile=mkdtempSync(join(tmpdir(),'outerloops-smoke-'));
let chrome,client;
try {
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const url='http://127.0.0.1:'+server.address().port+'/';
  chrome=spawn(browserBinary(),[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--disable-extensions','--remote-allow-origins=*',
    '--remote-debugging-port=0','--user-data-dir='+profile,url
  ],{stdio:'ignore'});
  const port=await debugPort(profile,chrome);
  client=await connect(await debuggerPage(port,url));
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  const state="(() => ({ready:typeof Localization!=='undefined' && Localization.isReady"
    +" && typeof actions!=='undefined' && typeof view!=='undefined'"
    +" && towns.length===9 && document.readyState==='complete',"
    +" count:typeof totalActionList==='undefined'?-1:totalActionList.length,"
    +" lang:typeof Localization==='undefined'?null:Localization.currentLang}))()";
  async function waitForBoot(){
    let last;
    for(let i=0;i<120;i++){
      try {last=await client.evaluate(state); if(last?.ready) return last;}
      catch {/* navigating */}
      await pause(125);
    }
    throw Error('Game failed to initialize: '+JSON.stringify(last));
  }
  const boot=await waitForBoot();
  assert.equal(boot.count,157);
  assert.equal(boot.lang,'en-EN');
  const executed=await client.evaluate("(() => {"
    +"if(!gameIsStopped) pauseGame();"
    +"actions.clearActions();actions.addAction('Wander',1);restart();view.update();"
    +"const spent=actions.tick(250);view.update();"
    +"const saved=JSON.parse(save());"
    +"return {spent,progress:towns[0].expWander,stored:saved.expWander,"
    +"queued:saved.nextList[0].name,level:towns[0].getLevel('Wander')};"
    +"})()");
  assert.equal(executed.spent,250);
  assert.equal(executed.progress,200);
  assert.equal(executed.stored,200);
  assert.equal(executed.queued,'Wander');
  assert.equal(executed.level,1);
  await client.send('Page.reload',{ignoreCache:true});
  await waitForBoot();
  const loaded=await client.evaluate("(() => ({"
    +"progress:towns[0].expWander,"
    +"queued:actions.next.some(a=>a.name==='Wander'),"
    +"saved:!!localStorage['idleLoops1']}))()");
  assert.equal(loaded.progress,200);
  assert.equal(loaded.queued,true);
  assert.equal(loaded.saved,true);

  // RF01: disposable synthetic saves, NOT historical player exports.
  // processSave is exercised on this random local port/browser profile only.
  const originalSave=await client.evaluate('save()');
  const fixtures=makeRf01Fixtures(JSON.parse(originalSave));
  async function importSynthetic(fixture) {
    const json=JSON.stringify(fixture.value);
    return client.evaluate("(() => { const text="+JSON.stringify(json)
      +"; try {processSave('ILSV01'+LZString.compressToBase64(text));"
      +"return {loaded:true, progress:towns[0].expWander,"
      +" names:actions.next.map(x=>x.name),"
      +" loadout:loadouts[0].map(x=>x.name),"
      +" unlocked:townsUnlocked.slice(),"
      +" crafted:storyFlags.loopingPotionMade,"
      +" invested:goldInvested, olderDungeon:dungeons[0][0].completed,"
      +" saved:localStorage['idleLoops1']};"
      +"} catch(e) {return {loaded:false,error:String(e),stack:e.stack};} })()");
  }
  const currentFixture=await importSynthetic(fixtures.current);
  assert.equal(currentFixture.loaded,true,JSON.stringify(currentFixture));
  assert.equal(currentFixture.progress,400);
  assert.equal(currentFixture.names[0],'Wander');
  assert.deepEqual(currentFixture.unlocked,[0,1]);
  assert.equal(JSON.parse(currentFixture.saved).expWander,400);

  const pre75=await importSynthetic(fixtures.pre75);
  assert.equal(pre75.loaded,true,JSON.stringify(pre75));
  assert.equal(pre75.progress,600);
  assert.deepEqual(pre75.unlocked,[0,1,2,3]);
  assert.deepEqual(pre75.names,['Train Dexterity','Buy Mana Z1']);
  assert.deepEqual(pre75.loadout,['Train Dexterity']);
  assert.equal(pre75.crafted,true);
  assert.ok(pre75.olderDungeon>=0);

  const aliases=await importSynthetic(fixtures.earlyAliases);
  assert.equal(aliases.loaded,true,JSON.stringify(aliases));
  assert.equal(aliases.progress,800);
  assert.deepEqual(aliases.unlocked,[0,1,2]);
  assert.deepEqual(aliases.names,['Buy Pickaxe','Buy Mana Z3']);
  assert.deepEqual(aliases.loadout,['Buy Mana Z3']);
  assert.equal(aliases.invested,4000);

  // RF02: the former R01 reproduction must now assert safety, not preserve a bug.
  const invalid=await client.evaluate("(() => {"
    +"const messages=[];window.alert=message=>messages.push(String(message));"
    +"const prior=localStorage['idleLoops1'];"
    +"const other=localStorage.getItem('idleLoopsChallenge');"
    +"const backup=localStorage.getItem('idleLoopsImportBackupV1_normal');"
    +"const payload='ILSV01'+LZString.compressToBase64('{broken-json');"
    +"const accepted=processSave(payload);"
    +"const wrongShape=processSave('ILSV01'+LZString.compressToBase64('{\"stats\":[],\"buffs\":null}'));"
    +"const malformed=processSave('ILSV01this-is-not-valid-compression');"
    +"return {accepted,wrongShape,malformed,unchanged:localStorage['idleLoops1']===prior,"
    +" challengeUnchanged:localStorage.getItem('idleLoopsChallenge')===other,"
    +" backupUnchanged:localStorage.getItem('idleLoopsImportBackupV1_normal')===backup,"
    +" journal:localStorage.getItem('idleLoopsImportPendingV1'),messageCount:messages.length};"
    +"})()");
  assert.equal(invalid.accepted,false);
  assert.equal(invalid.wrongShape,false);
  assert.equal(invalid.malformed,false);
  assert.equal(invalid.unchanged,true,'RF02 must not overwrite the prior active save');
  assert.equal(invalid.challengeUnchanged,true,'RF02 must not change challenge slot on rejection');
  assert.equal(invalid.backupUnchanged,true,'RF02 must not overwrite an existing recovery copy');
  assert.equal(invalid.journal,null,'rejected input does not start a transaction');
  assert.ok(invalid.messageCount>=3);
  console.log('PASS RF02 Chrome malformed JSON/compression/shape imports rejected without changing either save or recovery.');

  const actualRecovery=await client.evaluate("(() => {"
    +"const backup=JSON.parse(localStorage['idleLoopsImportBackupV1_normal']);"
    +"const current=localStorage['idleLoops1'];"
    +"window.confirm=()=>true;"
    +"const restored=restorePreviousImport();"
    +"return {restored,progress:towns[0].expWander,"
    +" backedUp:backup.prior!==null,"
    +" backupChanged:JSON.parse(localStorage['idleLoopsImportBackupV1_normal']).prior===current,"
    +" journal:localStorage.getItem('idleLoopsImportPendingV1')};"
    +"})()");
  assert.equal(actualRecovery.restored,true,'prior import backup must be restorable');
  assert.equal(actualRecovery.backedUp,true);
  assert.equal(actualRecovery.backupChanged,true);
  assert.equal(actualRecovery.journal,null);
  console.log('PASS RF02 Chrome previous-save restore control and bidirectional backup rotation.');

  // Failure injection at both quota-sensitive boundaries. A rejected import
  // must have EXACT prior bytes and preserve both previous backup copies.
  const quota=await client.evaluate("(() => {"
    +"const tracked=['idleLoops1','idleLoopsChallenge','prestigeBackup',"
    +"'idleLoopsImportBackupV1_normal','idleLoopsImportBackupV1_challenge'];"
    +"const snapshot=()=>Object.fromEntries(tracked.map(k=>[k,localStorage.getItem(k)]));"
    +"const candidate='ILSV01'+LZString.compressToBase64(JSON.stringify(doSave()));"
    +"const orig=Storage.prototype.setItem;"
    +"const cases=[];"
    +"for(const target of ['idleLoopsImportPendingV1','idleLoops1']) {"
    +" const before=snapshot();"
    +" Storage.prototype.setItem=function(key,value){"
    +"  if(key===target){throw new DOMException('synthetic quota','QuotaExceededError');}"
    +"  return orig.call(this,key,value);};"
    +" let result;try{result=processSave(candidate);}finally{Storage.prototype.setItem=orig;}"
    +" cases.push({target,result,unchanged:JSON.stringify(snapshot())===JSON.stringify(before),"
    +" journal:localStorage.getItem('idleLoopsImportPendingV1')});"
    +"}"
    +"return cases;"
    +"})()");
  assert.equal(quota.length,2);
  for(const test of quota) {
    assert.equal(test.result,false,JSON.stringify(test));
    assert.equal(test.unchanged,true,'quota failure must preserve exact previous bytes: '+test.target);
    assert.equal(test.journal,null,'quota failure must not leave unresolved journal: '+test.target);
  }
  console.log('PASS RF02 Chrome quota failure injection: journal/write failures preserve exact original bytes.');
  // Restore the original beginning-game fixture and verify reload still works.
  await client.evaluate("localStorage['idleLoops1']="+JSON.stringify(originalSave));
  await client.send('Page.reload',{ignoreCache:true});
  await waitForBoot();
  assert.equal(await client.evaluate('towns[0].expWander'),200);
  console.log('PASS RF01/RF02 Chrome save fixtures: current ILSV01, two synthetic legacy forms, aliases, safe validation and recovery.');


  // Actual, foreground and real Worker predictor should receive exactly the
  // same synthetic start/queue. Test real .update(), not a duplicate formula.
  const prediction=await client.evaluate("(async () => {"
    +"try {"
    +"if(!gameIsStopped) pauseGame();"
    +"options.predictor=false;options.repeatLastAction=false;"
    +"options.predictorSlowMode=false;options.predictorRepeatPrediction=false;"
    +"const plan=[{name:'Wander',loops:1,disabled:false,loopsType:'actions'}];"
    +"const initialProgress=towns[0].expWander,initialGold=resources.gold;"
    +"const instance=Koviko.instance;"
    +"const result=r=>({total:r.total,mana:r.state.resources.mana,"
    +"speedXP:r.state.stats.Spd,valid:r.isValid});"
    +"options.predictorBackgroundThread=false;"
    +"const foreground=result(await instance.update(plan));"
    +"options.predictorBackgroundThread=true;"
    +"const background=result(await Promise.race([instance.update(plan),"
    +"new Promise((_,reject)=>setTimeout(()=>reject(Error('worker predictor timed out')),12000))]));"
    +"const unchanged=initialProgress===towns[0].expWander&&initialGold===resources.gold;"
    +"instance.terminateWorker();options.predictorBackgroundThread=false;"
    +"actions.clearActions();actions.addAction('Wander',1);restart();"
    +"const beforeXP=stats.Spd.statLevelExp.totalExp;"
    +"const spent=actions.tick(250);"
    +"const actual={spent,speedXP:stats.Spd.statLevelExp.totalExp-beforeXP,"
    +"progress:towns[0].expWander-initialProgress};"
    +"const gods=instance.predictions['Gods Trial'].loop.effect.loop;"
    +"const resource={godFloor:98,power:0};gods(resource);"
    +"const power99=resource.power;gods(resource);"
    +"return {ok:true,foreground,background,actual,unchanged,"
    +"knownGodsTrial:{at99:power99,at100:resource.power}};"
    +"}catch(e){return {ok:false,error:String(e),stack:String(e.stack)};}"
    +"})()");
  assert.equal(prediction.ok,true,JSON.stringify(prediction));
  assert.equal(prediction.unchanged,true,'forecast must not mutate real world');
  assert.equal(prediction.foreground.total,250);
  assert.equal(prediction.background.total,250);
  assert.equal(prediction.actual.spent,250);
  assert.equal(prediction.actual.progress,200);
  assert.equal(prediction.foreground.mana,prediction.background.mana);
  assert.equal(prediction.foreground.speedXP,prediction.background.speedXP);
  assert.ok(Math.abs(prediction.foreground.speedXP-prediction.actual.speedXP)<=1,
    'foreground predictor should match actual stat XP within one point');
  if (prediction.knownGodsTrial.at99===1)
    console.warn('KNOWN R15: predictor grants Gods Trial power at floor 99; runtime grants at floor 100.');
  console.log('PASS RF01 predictor: actual Wander vs foreground and Worker, field parity for mana/stat XP, read-only forecast; Gods Trial R15 characterized.');


  // RF01: exercise the real challenge save-slot lifecycle and exit via reload.
  // All confirmation dialogs are accepted on this disposable test origin.
  for(const mode of [1,2,3]){
    const prior=await client.evaluate('towns[0].expWander');
    const entered=await client.evaluate("(() => {"
      +"window.confirm=()=>true;beginChallenge("+mode+");"
      +"const normal=JSON.parse(localStorage['idleLoops1']);"
      +"const challenge=JSON.parse(localStorage['idleLoopsChallenge']);"
      +"return {mode:challengeSave.challengeMode,inChallenge:challengeSave.inChallenge,"
      +" persistedMode:challenge.challengeSave.challengeMode,"
      +" normalProgress:normal.expWander,normalSlot:!!localStorage['idleLoops1'],"
      +" challengeSlot:!!localStorage['idleLoopsChallenge'],"
      +" speed:gameSpeed,timeLimit:timeNeeded};"
      +"})()");
    assert.equal(entered.mode,mode,JSON.stringify(entered));
    assert.equal(entered.persistedMode,mode);
    assert.equal(entered.inChallenge,true);
    assert.equal(entered.normalProgress,prior,'normal slot must not be replaced');
    assert.equal(entered.normalSlot,true);
    assert.equal(entered.challengeSlot,true);
    if(mode===1)assert.equal(entered.speed,2);
    if(mode===3)assert.ok(entered.timeLimit>1000000);
    // exitChallenge calls location.reload: execution context may disappear as
    // a normal consequence of the real page navigation.
    try {await client.evaluate('exitChallenge()');} catch {/* reload transition */}
    await pause(500);
    await waitForBoot();
    const restored=await client.evaluate("(() => ({"
      +"mode:challengeSave.challengeMode,progress:towns[0].expWander,"
      +" normalMode:JSON.parse(localStorage['idleLoops1']).challengeSave.challengeMode,"
      +" challengeStored:!!localStorage['idleLoopsChallenge']}))()");
    assert.equal(restored.mode,0,JSON.stringify(restored));
    assert.equal(restored.progress,prior);
    assert.equal(restored.normalMode,0);
    assert.equal(restored.challengeStored,true);
  }
  console.log('PASS RF01 Chrome challenge entry/exit: modes 1–3, isolated slots and normal-game restoration after reload.');

  // RF01: original destructive prestige reset, only in the disposable profile.
  const oldPrestige=await client.evaluate("(() => {"
    +"window.confirm=()=>true;const originalProgress=towns[0].expWander;"
    +"completedCurrentGame();"
    +"const awarded=prestigeValues.prestigeCurrentPoints;"
    +"prestigeUpgrade('PrestigeCombat');"
    +"return {awarded,originalProgress,"
    +" currentPoints:prestigeValues.prestigeCurrentPoints,"
    +" completions:prestigeValues.prestigeTotalCompletions,"
    +" ever:prestigeValues.completedAnyPrestige,"
    +" combat:getBuffLevel('PrestigeCombat'),"
    +" progress:towns[0].expWander,"
    +" backup:!!localStorage['prestigeBackup']};"
    +"})()");
  assert.equal(oldPrestige.awarded,90);
  assert.equal(oldPrestige.completions,1);
  assert.equal(oldPrestige.ever,true);
  assert.equal(oldPrestige.combat,1);
  assert.equal(oldPrestige.currentPoints,60);
  assert.equal(oldPrestige.progress,0);
  assert.equal(oldPrestige.backup,true);
  console.log('PASS RF01 Chrome inherited prestige reset: 90 points once, 30-point perk, 60 remaining, retained upgrade and backup.');

  console.log('PASS Chrome: game boot, XML localization, 157 actions, Wander execution and save/reload.');
} finally {
  client?.close();
  if(chrome && chrome.exitCode===null)chrome.kill('SIGKILL');
  if(server.listening) {
    server.closeAllConnections?.();
    await new Promise(resolve=>server.close(resolve));
  }
  // Chromium has child processes that may still flush cache after parent SIGKILL.
  // Retrying cleanup is safe in this ephemeral dedicated profile.
  await pause(300);
  try {rmSync(profile,{recursive:true,force:true,maxRetries:15,retryDelay:100});}
  catch(error) {console.warn('Chrome profile cleanup incomplete: '+error.message);}
}
