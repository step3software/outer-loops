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
      const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},method==='Runtime.evaluate'?45000:15000);
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
  // RF03: cap UI edits, rejection and real DOM-less worker imports.
  const capEdit=await client.evaluate("(() => {"
    +"const input=document.getElementById('buffRitualCap');"
    +"const original=getBuffCap('Ritual');"
    +"input.value='17';input.dispatchEvent(new Event('change',{bubbles:true}));"
    +"const edited=getBuffCap('Ritual');"
    +"input.value='';input.dispatchEvent(new Event('change',{bubbles:true}));"
    +"return {original,edited,invalid:getBuffCap('Ritual'),"
    +"shown:input.value,saved:JSON.parse(save()).buffCaps.Ritual};"
    +"})()");
  assert.deepEqual(capEdit,{original:666,edited:17,invalid:17,shown:'17',saved:17});
  // Cap state is verified below through the production predictor-worker.js,
  // not an independent Blob worker that only imports the default rules.
  const imbueEdit=await client.evaluate("(() => {"
    +"const input=document.getElementById('buffImbuementCap');"
    +"input.value='5';input.dispatchEvent(new Event('change',{bubbles:true}));"
    +"return {cap:getBuffCap('Imbuement'),shown:input.value,saved:JSON.parse(save()).buffCaps.Imbuement};"
    +"})()");
  assert.deepEqual(imbueEdit,{cap:5,shown:'5',saved:5});

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
  const reloadedCap=await client.evaluate("(() => ({"
    +"ritual:getBuffCap('Ritual'),ritualInput:document.getElementById('buffRitualCap').value,"
    +"imbue:getBuffCap('Imbuement'),imbueInput:document.getElementById('buffImbuementCap').value}))()");
  assert.deepEqual(reloadedCap,{ritual:17,ritualInput:'17',imbue:5,imbueInput:'5'});
  const beforeRf03Synthetic=await client.evaluate('save()');

  // Invoke the actual foreground predictor and the actual predictor-worker.js
  // using the same deterministic run state. The worker imports the live Data
  // snapshot, including both edited caps and buff levels restored after reload.
  const capParity=await client.evaluate([
    "(async()=>{",
    "const instance=Koviko.instance;",
    "const saved={ritual:buffs.Ritual.amt,imbue:buffs.Imbuement.amt,",
    " rep:resources.reputation,soul:stats.Soul.soulstone,",
    " darkCounter:towns[1].DarkRitualLoopCounter,mindCounter:towns[3].ImbueMindLoopCounter,",
    " background:options.predictorBackgroundThread,",
    " slow:options.predictorSlowMode,repeat:options.predictorRepeatPrediction,",
    " predictor:options.predictor};",
    "try{",
    " options.predictorBackgroundThread=false;",
    " options.predictorSlowMode=false;options.predictorRepeatPrediction=false;",
    " options.predictor=false;",
    " resources.reputation=-5;stats.Soul.soulstone=10000;",
    " towns[1].DarkRitualLoopCounter=0;towns[3].ImbueMindLoopCounter=0;",
    " buffs.Ritual.amt=17;buffs.Imbuement.amt=5;",
    " const blocked={ritual:Action.DarkRitual.canStart(),imbue:Action.ImbueMind.canStart()};",
    " setBuffCap('Ritual',18);setBuffCap('Imbuement',6);",
    " const allowed={ritual:Action.DarkRitual.canStart(),imbue:Action.ImbueMind.canStart()};",
    " setBuffCap('Ritual',17);setBuffCap('Imbuement',5);",
    " const plan=[{name:'Wander',loops:1,disabled:false,loopsType:'actions'}];",
    " const seed=await instance.update(plan);",
    " const cached=JSON.stringify(instance.cache.cache[0].data[2]);",
    " setBuffCap('Ritual',18);await instance.update(plan);",
    " const changedCache=JSON.stringify(instance.cache.cache[0].data[2]);",
    " setBuffCap('Ritual',17);await instance.update(plan);",
    " const restoredCache=JSON.stringify(instance.cache.cache[0].data[2]);",
    " const cacheInvalidated=cached!==changedCache&&cached===restoredCache;",
    " const make=(name,town,id,totalTicks=0)=>{",
    "  const data={...seed,id,actions:[{name,loops:1,disabled:false,loopsType:'maxEffort'}],",
    "   state:structuredClone(seed.state),affected:instance.predictions[name].affected.slice(),",
    "   total:0,loop:0,isValid:false,cacheIsValid:false,finalIndex:0};",
    "  Object.assign(data.state.resources,{town,mana:100000000,rep:-5,",
    "   totalTicks,ritual:0,mind:0,soul:10000,nonDungeonSS:10000});",
    "  return data;",
    " };",
    " const run=async(name,town,id,totalTicks=0)=>{",
    "  const fg=make(name,town,id,totalTicks);",
    "  for await(const _ of instance.doUpdate(fg)){}",
    "  const bg=make(name,town,id+1,totalTicks);",
    "  options.predictorBackgroundThread=true;",
    "  await Promise.race([",
    "   (async()=>{for await(const _ of instance.doBackgroundUpdate(bg)){} })(),",
    "   new Promise((_,reject)=>setTimeout(()=>reject(Error('RF03 real predictor worker timeout: '+name)),8000))",
    "  ]);",
    "  options.predictorBackgroundThread=false;",
    "  const summary=r=>({total:r.total,valid:r.isValid,town:r.state.resources.town});",
    "  return {foreground:summary(fg),background:summary(bg)};",
    " };",
    " const ritual=await run('Dark Ritual',1,9100);",
    " const imbue=await run('Imbue Mind',3,9102);",
    " const early=await run('Escape',6,9104,2999.99);",
    " const at60=await run('Escape',6,9106,3000);",
    " return {ok:true,blocked,allowed,ritual,imbue,early,at60,cacheInvalidated,",
    "  caps:{ritual:getBuffCap('Ritual'),imbue:getBuffCap('Imbuement')}};",
    "}catch(error){return {ok:false,error:String(error),stack:String(error.stack)};}",
    "finally{",
    " instance.terminateWorker();",
    " buffs.Ritual.amt=saved.ritual;buffs.Imbuement.amt=saved.imbue;",
    " resources.reputation=saved.rep;stats.Soul.soulstone=saved.soul;",
    " towns[1].DarkRitualLoopCounter=saved.darkCounter;",
    " towns[3].ImbueMindLoopCounter=saved.mindCounter;",
    " options.predictorBackgroundThread=saved.background;",
    " options.predictorSlowMode=saved.slow;options.predictorRepeatPrediction=saved.repeat;",
    " options.predictor=saved.predictor;",
    "}",
    "})()"
  ].join("\n"));
  assert.equal(capParity.ok,true,JSON.stringify(capParity));
  assert.deepEqual(capParity.blocked,{ritual:false,imbue:false});
  assert.deepEqual(capParity.allowed,{ritual:true,imbue:true});
  assert.deepEqual(capParity.caps,{ritual:17,imbue:5});
  assert.equal(capParity.cacheInvalidated,true,'cap change must invalidate predictor cache');
  for(const name of ['ritual','imbue']) {
    const parity=capParity[name];
    assert.deepEqual(parity.foreground,parity.background,name+' real worker parity');
    assert.equal(parity.foreground.valid,false,name+' should be blocked at edited cap');
    assert.equal(parity.foreground.total,0,name+' must not spend past edited cap');
  }
  assert.deepEqual(capParity.early.foreground,capParity.early.background,
    'Escape real worker parity immediately before 60 seconds');
  assert.deepEqual(capParity.at60.foreground,capParity.at60.background,
    'Escape real worker parity at exactly 60 seconds');
  assert.ok(capParity.early.foreground.total>0,'Escape forecast spends before 60');
  assert.equal(capParity.early.foreground.town,7);
  assert.equal(capParity.at60.foreground.total,0);
  assert.equal(capParity.at60.foreground.town,6);
  console.log('PASS RF03 Chrome: real predictor-worker snapshots of saved caps and Escape 59.99/60 parity.');

  // Run the production scheduler, not merely Actions.tick or canStart.
  // A queued Escape must not start while paused, after a zero-spend probe,
  // or if the time boundary elapses before its first positive expenditure.
  const escapeScheduler=await client.evaluate([
    "(()=>{",
    "if(!gameIsStopped)pauseGame();",
    "options.repeatLastAction=false;options.keepCurrentList=false;",
    "options.fractionalMana=false;",
    "const setup=time=>{",
    " actions.clearActions();actions.addAction('Escape',1);actions.restart();",
    " curTown=6;effectiveTime=time;timer=0;timeNeeded=250;",
    " gameSpeed=1;bonusSpeed=1;gameTicksLeft=20;shouldRestart=false;",
    "};",
    "setup(59.99);",
    "const eligible=Action.Escape.canStart(),pure=!escapeStarted;",
    "gameIsStopped=true;executeGameTicks(performance.now()+1000);",
    "const paused={flag:escapeStarted,used:actions.current[0].manaUsed};",
    "const zero=actions.tick(0),afterZero=escapeStarted;",
    "effectiveTime=60;gameIsStopped=false;",
    "executeGameTicks(performance.now()+1000);",
    "const aborted={flag:escapeStarted,used:actions.current[0]?.manaUsed||0};",
    "setup(59.99);gameIsStopped=false;",
    "executeGameTicks(performance.now()+1000);",
    "const started={flag:escapeStarted,used:actions.current[0].manaUsed,time:effectiveTime};",
    "effectiveTime=60.01;gameTicksLeft=20;",
    "executeGameTicks(performance.now()+1000);",
    "const sticky={flag:escapeStarted,eligible:Action.Escape.canStart(),",
    " used:actions.current[0].manaUsed};",
    "restart();",
    "return {eligible,pure,paused,zero,afterZero,aborted,started,sticky,",
    " reset:escapeStarted,at60:(effectiveTime=60,Action.Escape.canStart())};",
    "})()"
  ].join("\n"));
  assert.equal(escapeScheduler.eligible,true);
  assert.equal(escapeScheduler.pure,true);
  assert.deepEqual(escapeScheduler.paused,{flag:false,used:0});
  assert.equal(escapeScheduler.zero,0);
  assert.equal(escapeScheduler.afterZero,false);
  assert.deepEqual(escapeScheduler.aborted,{flag:false,used:0});
  assert.equal(escapeScheduler.started.flag,true);
  assert.ok(escapeScheduler.started.used>0);
  assert.ok(escapeScheduler.started.time>60);
  assert.equal(escapeScheduler.sticky.flag,true);
  assert.equal(escapeScheduler.sticky.eligible,true);
  assert.ok(escapeScheduler.sticky.used>escapeScheduler.started.used);
  assert.equal(escapeScheduler.reset,false);
  assert.equal(escapeScheduler.at60,false);
  // Restore the byte-identical pre-scenario save before inherited RF01/RF02 cases.
  await client.evaluate("localStorage['idleLoops1']="+JSON.stringify(beforeRf03Synthetic));
  await client.send('Page.reload',{ignoreCache:true});
  await waitForBoot();
  await client.evaluate("(() => {"
    +"const ritual=document.getElementById('buffRitualCap');"
    +"ritual.value='666';ritual.dispatchEvent(new Event('change',{bubbles:true}));"
    +"const imbue=document.getElementById('buffImbuementCap');"
    +"imbue.value='500';imbue.dispatchEvent(new Event('change',{bubbles:true}));"
    +"save();"
    +"})()");
  await client.send('Page.reload',{ignoreCache:true});
  await waitForBoot();
  console.log('PASS RF03 Chrome: edited cap save/reload, real worker and scheduler Escape boundaries.');

  // RF01: disposable synthetic saves, NOT historical player exports.
  // processSave is exercised on this random local port/browser profile only.
  await client.evaluate("window.__rf02Alerts=[];window.alert=message=>window.__rf02Alerts.push(String(message));window.confirm=()=>true");
  const originalSave=await client.evaluate('save()');
  const fixtures=makeRf01Fixtures(JSON.parse(originalSave));
  async function importSynthetic(fixture) {
    const json=JSON.stringify(fixture.value);
    return client.evaluate("(() => { const text="+JSON.stringify(json)
      +"; try {const applied=processSave('ILSV01'+LZString.compressToBase64(text));"
      +"return {loaded:applied, progress:towns[0].expWander,"
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

  const oldFormat=await client.evaluate("(() => {"
    +"const saved=JSON.parse(save());"
    +"saved.expWander=300;"
    +"const applied=processSave(encode(JSON.stringify(saved)));"
    +"return {applied,progress:towns[0].expWander,"
    +" queue:actions.next.map(x=>x.name),backup:!!localStorage['idleLoopsImportBackupV1_normal']};"
    +"})()");
  assert.equal(oldFormat.applied,true,JSON.stringify(oldFormat));
  assert.equal(oldFormat.progress,300);
  assert.equal(oldFormat.backup,true);
  console.log('PASS RF02 Chrome legacy Base64/LZW encoding accepted without changing the export envelope.');

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
    +"const wrongNested=processSave('ILSV01'+LZString.compressToBase64('{\"stats\":{},\"buffs\":{\"PrestigeCombat\":{\"amt\":\"bad\"}}}'));"
    +"const unknownNested=processSave('ILSV01'+LZString.compressToBase64('{\"stats\":{\"FutureStat\":{\"exp\":1}}}'));"
    +"return {accepted,wrongShape,malformed,wrongNested,unknownNested,unchanged:localStorage['idleLoops1']===prior,"
    +" challengeUnchanged:localStorage.getItem('idleLoopsChallenge')===other,"
    +" backupUnchanged:localStorage.getItem('idleLoopsImportBackupV1_normal')===backup,"
    +" journal:localStorage.getItem('idleLoopsImportPendingV1'),messageCount:messages.length};"
    +"})()");
  assert.equal(invalid.accepted,false);
  assert.equal(invalid.wrongShape,false);
  assert.equal(invalid.malformed,false);
  assert.equal(invalid.wrongNested,false);
  assert.equal(invalid.unknownNested,false);
  assert.equal(invalid.unchanged,true,'RF02 must not overwrite the prior active save');
  assert.equal(invalid.challengeUnchanged,true,'RF02 must not change challenge slot on rejection');
  assert.equal(invalid.backupUnchanged,true,'RF02 must not overwrite an existing recovery copy');
  assert.equal(invalid.journal,null,'rejected input does not start a transaction');
  assert.ok(invalid.messageCount>=3);
  console.log('PASS RF02 Chrome malformed JSON/compression/shape imports rejected without changing either save or recovery.');

  // Active-slot restoration now commits the byte-identical backup before
  // triggering a clean reload. Read expected bytes before navigation.
  const recoveryBefore=await client.evaluate("(() => ({"
    +"prior:JSON.parse(localStorage.getItem('idleLoopsImportBackupV1_normal')).prior,"
    +"current:localStorage.getItem('idleLoops1')}))()");
  try { await client.evaluate("window.confirm=()=>true;restorePreviousImport(defaultSaveName)"); }
  catch {/* expected navigation may invalidate the CDP evaluation */}
  await pause(400);
  await waitForBoot();
  const actualRecovery=await client.evaluate("(() => ({"
    +"restored:localStorage.getItem('idleLoops1'),"
    +"rotated:JSON.parse(localStorage.getItem('idleLoopsImportBackupV1_normal')).prior,"
    +"journal:localStorage.getItem('idleLoopsImportPendingV1')}))()");
  assert.equal(actualRecovery.restored,recoveryBefore.prior,
    'restore must use byte-identical previously persisted data');
  assert.equal(actualRecovery.rotated,recoveryBefore.current,
    'previous current save becomes the one recovery copy');
  assert.equal(actualRecovery.journal,null);
  console.log('PASS RF02 Chrome exact-byte normal save recovery and bidirectional backup rotation.');

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
  // An imported old challenge save is installed in the separate challenge
  // slot; the normal save keeps its original progress and gains only a
  // resume-challenge marker. No overwritten normal progress or unexpected
  // legacy doLoad save/reload during preflight.
  const importedChallenge=await client.evaluate("(() => {"
    +"const candidate=JSON.parse(save());candidate.challenge=2;"
    +"delete candidate.challengeSave;candidate.expWander=100;"
    +"const previousProgress=towns[0].expWander;"
    +"const accepted=processSave('ILSV01'+LZString.compressToBase64(JSON.stringify(candidate)));"
    +"return {accepted,mode:challengeSave.challengeMode,slot:saveName,"
    +" challengeProgress:JSON.parse(localStorage['idleLoopsChallenge']).expWander,"
    +" normalProgress:JSON.parse(localStorage['idleLoops1']).expWander,"
    +" normalMarker:JSON.parse(localStorage['idleLoops1']).challengeSave.inChallenge,"
    +" previousProgress};"
    +"})()");
  assert.equal(importedChallenge.accepted,true,JSON.stringify(importedChallenge));
  assert.equal(importedChallenge.mode,2);
  assert.equal(importedChallenge.challengeProgress,100);
  assert.equal(importedChallenge.normalProgress,importedChallenge.previousProgress);
  assert.equal(importedChallenge.normalMarker,true);
  try {await client.evaluate('exitChallenge()');} catch {/* expected reload */}
  await pause(400);
  await waitForBoot();
  assert.equal(await client.evaluate('challengeSave.challengeMode'),0);
  console.log('PASS RF02 Chrome legacy inline challenge migration: separate slots, retained normal progress and safe exit.');

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

  // RF04: stable policy references and real foreground/Worker challenge parity.
  // All state changes occur in this disposable profile and are restored below.
  const rf04Browser=await client.evaluate([
    "(async()=>{",
    "const instance=Koviko.instance;",
    "const previous={mode:challengeSave.challengeMode,merchant:totalMerchantMana,",
    " gold:resources.gold,timing:totals.effectiveTime,",
    " background:options.predictorBackgroundThread,slow:options.predictorSlowMode,",
    " predictor:options.predictor,repeat:options.predictorRepeatPrediction};",
    "try{",
    " if(!gameIsStopped)pauseGame();",
    " options.predictor=false;options.predictorBackgroundThread=false;",
    " options.predictorSlowMode=false;options.predictorRepeatPrediction=false;",
    " const originals=[restart,getSelfCombat,getTeamCombat,",
    "  Action.BuyManaZ1.canStart,Action.BuyManaZ1.manaCost,",
    "  Action.BuyManaZ1.goldCost,Action.BuyManaZ1.finish,",
    "  Action.BuyManaZ3.visible,Action.BuyManaZ5.visible];",
    " const transitions=[];",
    " for(const mode of [0,1,0,2,0,3,0]){",
    "  challengeSave.challengeMode=mode;loadChallenge();",
    "  const funcs=[restart,getSelfCombat,getTeamCombat,",
    "   Action.BuyManaZ1.canStart,Action.BuyManaZ1.manaCost,",
    "   Action.BuyManaZ1.goldCost,Action.BuyManaZ1.finish,",
    "   Action.BuyManaZ3.visible,Action.BuyManaZ5.visible];",
    "  transitions.push({mode,speed:gameSpeed,stable:originals.every((f,i)=>f===funcs[i]),",
    "   z3:Action.BuyManaZ3.visible(),z5:Action.BuyManaZ5.visible()});",
    " }",
    " challengeSave.challengeMode=1;loadChallenge();",
    " totalMerchantMana=360;resources.gold=12;",
    " const before=timeNeeded;Action.BuyManaZ1.finish();",
    " const purchase={gain:timeNeeded-before,gold:resources.gold,merchant:totalMerchantMana};",
    " const seed=await instance.update([{name:'Wander',loops:1,disabled:false,loopsType:'actions'}]);",
    " const make=(name,town,mode,gold,merchant,id)=>{",
    "  const data={...seed,id,actions:[{name,loops:1,disabled:false,loopsType:'maxEffort'}],",
    "   state:structuredClone(seed.state),affected:instance.predictions[name].affected.slice(),",
    "   total:0,loop:0,isValid:false,cacheIsValid:false,finalIndex:0};",
    "  Object.assign(data.state.resources,{town,challengeMode:mode,gold,manaBought:merchant,",
    "   mana:10000000,rep:3,zombie:4,team:3,adventures:1});",
    "  Object.assign(data.state.skills,{combat:1000000000,dark:1000000000,",
    "   restoration:1000000000,magic:1000000000});",
    "  return data;",
    " };",
    " const forecast=async(name,town,mode,gold,merchant,id)=>{",
    "  challengeSave.challengeMode=mode;loadChallenge();totalMerchantMana=merchant;",
    "  const fg=make(name,town,mode,gold,merchant,id);",
    "  for await(const _ of instance.doUpdate(fg)){}",
    "  const bg=make(name,town,mode,gold,merchant,id+1);",
    "  options.predictorBackgroundThread=true;",
    "  await Promise.race([",
    "   (async()=>{for await(const _ of instance.doBackgroundUpdate(bg)){} })(),",
    "   new Promise((_,reject)=>setTimeout(()=>reject(Error('RF04 Worker timeout: '+name)),12000))",
    "  ]);",
    "  options.predictorBackgroundThread=false;",
    "  const summary=d=>({total:d.total,valid:d.isValid,",
    "   mana:d.state.resources.mana,gold:d.state.resources.gold,",
    "   merchant:d.state.resources.manaBought,town:d.state.resources.town});",
    "  return {foreground:summary(fg),background:summary(bg)};",
    " };",
    " const normal=await forecast('Buy Mana Z1',0,0,12,360,9200);",
    " const drought=await forecast('Buy Mana Z1',0,1,12,360,9202);",
    " const noodle=await forecast('Fight Monsters',1,2,0,7500,9204);",
    " const burn=await forecast('Wander',0,3,0,7500,9206);",
    " challengeSave.challengeMode=3;loadChallenge();",
    " totals.effectiveTime=86400;currentLoop=321;restart();",
    " const boundary={timeNeeded,currentLoop};",
    " return {ok:true,transitions,purchase,normal,drought,noodle,burn,boundary};",
    "}catch(e){return {ok:false,error:String(e),stack:String(e.stack)};}",
    "finally{",
    " instance.terminateWorker();",
    " challengeSave.challengeMode=previous.mode;loadChallenge();",
    " totalMerchantMana=previous.merchant;resources.gold=previous.gold;",
    " totals.effectiveTime=previous.timing;",
    " options.predictorBackgroundThread=previous.background;",
    " options.predictorSlowMode=previous.slow;",
    " options.predictor=previous.predictor;",
    " options.predictorRepeatPrediction=previous.repeat;",
    "}",
    "})()"
  ].join("\n"));
  assert.equal(rf04Browser.ok,true,JSON.stringify(rf04Browser));
  assert.deepEqual(rf04Browser.transitions.map(s=>s.speed),[1,2,1,1,1,1,1]);
  assert.ok(rf04Browser.transitions.every(s=>s.stable),
    'RF04 global and Action method references must remain unchanged');
  assert.deepEqual(rf04Browser.transitions.map(s=>[s.z3,s.z5]),
    [[true,true],[false,false],[true,true],[true,true],[true,true],[true,true],[true,true]]);
  assert.deepEqual(rf04Browser.purchase,{gain:360,gold:0,merchant:0});
  for(const mode of ['normal','drought','noodle','burn']) {
    assert.deepEqual(rf04Browser[mode].foreground,rf04Browser[mode].background,
      mode+' real foreground/Worker challenge-policy parity');
  }
  assert.equal(rf04Browser.drought.foreground.gold,0);
  assert.equal(rf04Browser.drought.foreground.merchant,0);
  assert.equal(rf04Browser.drought.foreground.mana-rf04Browser.normal.foreground.mana,
    360-600+99,'Mana Drought and normal purchase differ in rate and base mana cost');
  assert.deepEqual(rf04Browser.boundary,{timeNeeded:0,currentLoop:321});
  // Restore the saved pre-scenario browser game before RF01 prestige coverage.
  await client.evaluate("localStorage['idleLoops1']="+JSON.stringify(originalSave));
  await client.send('Page.reload',{ignoreCache:true});
  await waitForBoot();
  console.log('PASS RF04 Chrome: stable identities, Mana Drought, Noodle Arms and Mana Burn, real Worker snapshots.');

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

  // P19/P21: both previous copies are accessible after the user explicitly
  // clears the two slots in this disposable browser test profile.
  const preClear=await client.evaluate("(() => ({"
    +"normal:localStorage.getItem('idleLoops1'),"
    +"challenge:localStorage.getItem('idleLoopsChallenge'),"
    +"prestige:localStorage.getItem('prestigeBackup')}))()");
  assert.ok(preClear.normal && preClear.challenge);
  try {await client.evaluate("window.confirm=()=>true;processSave('')");}
  catch {/* confirmed deletion reloads the disposable game profile */}
  await pause(400);
  await waitForBoot();
  const empty=await client.evaluate("(() => ({"
    +"normal:localStorage.getItem('idleLoops1'),"
    +"challenge:localStorage.getItem('idleLoopsChallenge'),"
    +"normalBackup:JSON.parse(localStorage.getItem('idleLoopsImportBackupV1_normal')).prior,"
    +"challengeBackup:JSON.parse(localStorage.getItem('idleLoopsImportBackupV1_challenge')).prior,"
    +"prestige:localStorage.getItem('prestigeBackup')}))()");
  assert.equal(empty.normal,'');
  assert.equal(empty.challenge,'');
  assert.equal(empty.normalBackup,preClear.normal);
  assert.equal(empty.challengeBackup,preClear.challenge);
  assert.equal(empty.prestige,preClear.prestige);
  const inactiveRestore=await client.evaluate("window.confirm=()=>true;restorePreviousImport(challengeSaveName)");
  assert.equal(inactiveRestore,true);
  const inactiveState=await client.evaluate("(() => ({"
    +"normal:localStorage.getItem('idleLoops1'),"
    +"challenge:localStorage.getItem('idleLoopsChallenge'),"
    +"mode:challengeSave.challengeMode}))()");
  assert.equal(inactiveState.normal,'','inactive challenge recovery must not modify normal progress');
  assert.equal(inactiveState.challenge,preClear.challenge);
  assert.equal(inactiveState.mode,0,'inactive restore must not switch active gameplay mode');
  try {await client.evaluate("window.confirm=()=>true;restorePreviousImport(defaultSaveName)");}
  catch {/* normal restore triggers a reload */}
  await pause(400);
  await waitForBoot();
  const recovered=await client.evaluate("(() => ({"
    +"normal:localStorage.getItem('idleLoops1'),"
    +"challenge:localStorage.getItem('idleLoopsChallenge'),"
    +"prestige:localStorage.getItem('prestigeBackup'),"
    +"journal:localStorage.getItem('idleLoopsImportPendingV1')}))()");
  assert.equal(recovered.normal,preClear.normal);
  assert.equal(recovered.challenge,preClear.challenge);
  assert.equal(recovered.prestige,preClear.prestige);
  assert.equal(recovered.journal,null);
  console.log('PASS RF02 Chrome explicit clear and independent normal/challenge byte-exact recovery.');

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
