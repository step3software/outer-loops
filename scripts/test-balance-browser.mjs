#!/usr/bin/env node
// RW00 real-browser calibration, reusing the disposable Chrome/CDP smoke patterns.
// No real player saves, accounts or production changes.
import assert from 'node:assert/strict';
import {loadGameModel} from './load-game-model.mjs';
import {BalanceEngine} from './balance/engine.mjs';
import {admitQueueEdit,queueSnapshot,ADMISSION_VERSION} from './balance/admission.mjs';
import {createDefaultUiProfile,installUiProfile,readUiProfile,changeUiInput} from './balance/ui-inputs.mjs';
import {CLOCK_VERSION} from './balance/clock.mjs';
import {SCHEDULER_VERSION} from './balance/fast-scheduler.mjs';
import {CALIBRATION_SCHEMA} from './balance/report.mjs';
import {createPotionAcceleration,potionSourceIdentity} from './balance/potion-runner.mjs';
import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {existsSync, mkdtempSync, readFileSync, rmSync, statSync, mkdirSync, writeFileSync} from 'node:fs';
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
  for(const candidate of [process.env.CHROME_BIN,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean)) {
    if(candidate.includes('\\') && existsSync(candidate))return candidate;
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


const potionSource=potionSourceIdentity(root);
const args=process.argv.slice(2);
const getArg=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const phase=getArg('--phase')??'calibration';
if(!['calibration','boundaries'].includes(phase))throw Error('Unsupported browser phase');
const output=getArg('--output');
const profile=mkdtempSync(join(tmpdir(),'outerloops-rw00-calibration-'));
let chrome,client;
try {
  await new Promise((resolve,reject)=>{
    server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
  });
  const url='http://127.0.0.1:'+server.address().port+'/';
  const bin=browserBinary();
  chrome=spawn(bin,[
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--no-first-run','--disable-extensions','--remote-allow-origins=*',
    '--remote-debugging-port=0','--user-data-dir='+profile,url
  ],{stdio:'ignore'});
  client=await connect(await debuggerPage(await debugPort(profile,chrome),url));
  const browserVersion=(await client.send('Browser.getVersion')).product;
  await client.send('Runtime.enable');await client.send('Page.enable');
  async function waitForBoot(){
    for(let i=0;i<120;i++){
      try {
        const ok=await client.evaluate('typeof Localization!=="undefined"&&Localization.isReady&&typeof actions!=="undefined"&&towns.length===9');
        if(ok)return;
      }catch{/* navigating */}
      await pause(125);
    }
    throw Error('Real browser game failed to boot');
  }
  await waitForBoot();
  const model=loadGameModel({withViewStubs:true,rngSeed:42});
  const defaultProfile=createDefaultUiProfile(model);
  const config=installUiProfile(model,defaultProfile);
  const browserInputs=await client.evaluate('(() => {const ids='+JSON.stringify(Object.keys(defaultProfile.inputs))+
    ';return Object.fromEntries(ids.map(id=>{const e=document.getElementById(id);'+
    'return [id,e instanceof HTMLInputElement?(e.type==="checkbox"?'+
    '{type:e.type,checked:e.checked}:{type:e.type,value:e.value}):null];}));})()');
  for(const [id,spec] of Object.entries(defaultProfile.inputs)){
    assert.ok(browserInputs[id],'Browser missing gameplay input '+id);
    assert.equal(browserInputs[id].type,spec.type,'Browser input wrong type: '+id);
    if(spec.type==='checkbox')assert.equal(browserInputs[id].checked,spec.checked);
    else assert.equal(browserInputs[id].value,spec.value);
  }
  const cases=[];
  const compare=(id,browser,model)=>{
    assert.deepEqual(browser,model,'Browser/model mismatch: '+id);
    cases.push({id,status:'passed',browser,model});
  };
  const browser=expr=>client.evaluate(expr);
  await browser('if(!gameIsStopped)pauseGame();animationTicksEnabled=false;clearInterval(mainTickLoop);cancelAnimationFrame(animationFrameRequest);actions.clearActions();actions.addAmount=1;');
  const browserQueue=()=>browser('actions.next.map(a=>({name:a.name,loops:a.loops,disabled:!!a.disabled,loopsType:a.loopsType??"actions"}))');
  async function compareQueue(id,name,town,travel){
    const before=await browserQueue();
    const admission=admitQueueEdit(model,{op:'add',name,loops:1});
    await browser('addActionToList('+JSON.stringify(name)+','+town+','+travel+',-1)');
    const after=await browserQueue();
    compare(id,after,queueSnapshot(model));
    if(admission.status==='invalid_route')assert.deepEqual(before,after,'Browser changed invalid edit');
    return admission.status;
  }
  assert.equal(await compareQueue('locked-buy-mana','Buy Mana Z1',0,false),'invalid_route');
  assert.equal(await compareQueue('opening-wander','Wander',0,false),'admitted');
  await browser('towns[0].expWander=towns[0].expFromLevel(3)');
  model.evaluate('towns[0].expWander=towns[0].expFromLevel(3)');
  assert.equal(await compareQueue('visible-locked-mana','Buy Mana Z1',0,false),'invalid_route');
  await browser('towns[0].expWander=towns[0].expFromLevel(20)');
  model.evaluate('towns[0].expWander=towns[0].expFromLevel(20)');
  assert.equal(await compareQueue('unlocked-buy-mana','Buy Mana Z1',0,false),'admitted');
  await browser('skills.Combat.levelExp.setLevel(35);resources.supplies=true');
  model.evaluate('skills.Combat.levelExp.setLevel(35);resources.supplies=true');
  assert.equal(await compareQueue('first-travel','Start Journey',0,true),'admitted');
  assert.equal(await compareQueue('excess-travel','Start Journey',0,true),'invalid_route');

  const fixture='(() => {const t=towns[0];t.totalPots=20;t.checkedPots=9;t.goodPots=1;'+
    't.goodTempPots=1;t.lootFromPots=0;Action.SmashPots.finish();'+
    'return {checked:t.checkedPots,good:t.goodPots,temp:t.goodTempPots,loot:t.lootFromPots};})()';
  for(const checked of [false,true]){
    await browser('document.getElementById("searchTogglerPots").checked='+checked);
    changeUiInput(model,'searchTogglerPots',checked);
    compare('real-search-'+checked,await browser(fixture),
      JSON.parse(JSON.stringify(model.evaluate(fixture))));
  }
  // A deliberate mismatch must be observable, rather than made equivalent.
  const mismatched=await browser('document.getElementById("searchTogglerPots").checked=false;document.getElementById("searchTogglerPots").checked');
  assert.notEqual(mismatched,readUiProfile(model).inputs.searchTogglerPots.checked);
  await browser('document.getElementById("buffRitualCap").value="5";updateBuffCaps()');
  changeUiInput(model,'buffRitualCap','5');
  compare('real-cap-update',await browser('({cap:getBuffCap("Ritual"),model:buffCaps.Ritual})'),
    JSON.parse(JSON.stringify(model.evaluate('({cap:getBuffCap("Ritual"),model:buffCaps.Ritual})'))));

  // Fresh browser, real driver clock path, 20 ms quanta, no synthetic progress.
  await browser('localStorage.clear()'); // disposable profile: discard synthetic calibration state
  await client.send('Page.reload',{ignoreCache:true});await waitForBoot();
  const browserRun=await browser('(() => {'+
    'if(!gameIsStopped)pauseGame();animationTicksEnabled=false;clearInterval(mainTickLoop);'+
    'cancelAnimationFrame(animationFrameRequest);'+
    // Headless Chrome can accrue lag credit while the page is booting before
    // CDP can pause it. Record and isolate that pre-measurement state.
    'const bootOfflineMs=totalOfflineMs;totalOfflineMs=0;bonusSpeed=1;lagSpeed=0;gameTicksLeft=0;'+
    'options.predictor=false;options.pauseBeforeRestart=false;'+
    'options.pauseOnFailedLoop=false;options.pauseOnComplete=false;'+
    'options.repeatLastAction=false;options.keepCurrentList=false;options.fractionalMana=false;'+
    'actions.clearActions();actions.addAmount=1;addActionToList("Wander",0,false,-1);'+
    'gameIsStopped=false;restart();'+
    // Keep the simulated quantum at 20 ms while giving host CPU work a distinct
    // deadline. A missed host deadline would create lag/offline credit and fail.
    'for(let i=0;i<260;i++){gameTicksLeft+=20;executeGameTicks(performance.now()+1000);}'+
    'return {bootOfflineMs,measurement:{time:totals.time+timeCounter,effectiveSeconds:totals.effectiveTime+effectiveTime,'+
    'loops:totals.loops,progress:towns[0].expWander,offlineMs:totalOfflineMs}};})()');
  const actual=browserRun.measurement;
  assert.ok(Number.isFinite(browserRun.bootOfflineMs)&&browserRun.bootOfflineMs>=0);
  cases.push({id:'browser-boot-isolation',status:'passed',
    browser:{discardedPreMeasurementOfflineMs:browserRun.bootOfflineMs},
    model:{initialOfflineMs:0},coverage:'pre-measurement headless boot only'});
  const engine=new BalanceEngine({seed:42});
  assert.equal(engine.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  engine.start();const expected=engine.runSteps(260).last;
  for(const [key,value] of Object.entries(actual)){
    const tolerance=['time','effectiveSeconds'].includes(key)?0.021:0;
    assert.ok(Math.abs(value-expected[key])<=tolerance,
      'Real driver clock '+key+' '+value+' vs '+expected[key]);
  }
  cases.push({id:'real-driver-opening',status:'passed',browser:actual,
    model:Object.fromEntries(Object.keys(actual).map(key=>[key,expected[key]]))});
  const accelerationCalibration=createPotionAcceleration(potionSource.identity);
  const accelerated=new BalanceEngine({seed:42,mode:'accelerated',
    calibration:accelerationCalibration,maxSimulatedSeconds:5.2});
  assert.equal(accelerated.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  accelerated.start();
  while(accelerated.clock.elapsedMs<5200)accelerated.step({full:false});
  const acceleratedExpected=accelerated.snapshot();
  for(const [key,value] of Object.entries(actual)){
    const tolerance=['time','effectiveSeconds'].includes(key)?0.021:0;
    assert.ok(Math.abs(value-acceleratedExpected[key])<=tolerance,
      'Accelerated/browser clock '+key+' '+value+' vs '+acceleratedExpected[key]);
  }
  cases.push({id:'accelerated-driver-opening',status:'passed',browser:actual,
    model:Object.fromEntries(Object.keys(actual).map(key=>[key,acceleratedExpected[key]]))});

  const contaminated=new BalanceEngine({seed:42,mode:'accelerated',calibration:accelerationCalibration});
  assert.equal(contaminated.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  contaminated.start();contaminated.model.evaluate('totalOfflineMs=1000;bonusSpeed=5');
  assert.throws(()=>contaminated.step(),error=>error.code==='unsupported_runtime');
  const alteredRng=new BalanceEngine({seed:1});
  assert.notDeepEqual(alteredRng.model.rngSnapshot(),engine.model.rngSnapshot(),
    'altered RNG seed must be detected');
  const offsetClock=new BalanceEngine({seed:42});
  assert.equal(offsetClock.edit({op:'add',name:'Wander',loops:1}).status,'admitted');
  offsetClock.start();offsetClock.step();
  assert.notEqual(offsetClock.clock.elapsedMs,engine.clock.elapsedMs,
    'clock offset negative control must be detected');
  const report={schema:CALIBRATION_SCHEMA,status:'passed',phase,
    sourceHash:potionSource.identity,browserVersion,admissionVersion:ADMISSION_VERSION,
    schedulerVersion:SCHEDULER_VERSION,clockVersion:CLOCK_VERSION,
    accelerationCalibrationIdentity:accelerationCalibration.identity,
    uiConfigurationHash:config.configurationHash,
    clockQuantumMs:20,toleranceSeconds:0.021,scenarios:cases};
  if(output){
    const destination=resolve(root,output);
    if(!destination.startsWith(join(root,'.balance-results')+sep)){
      throw Error('Output must remain beneath .balance-results');
    }
    mkdirSync(dirname(destination),{recursive:true});
    writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
  }
  console.log('PASS RW00 real browser calibration: '+cases.length+' matched cases, '+browserVersion);
}catch(error){
  console.error('FAIL RW00 real browser calibration: '+(error.stack||error));
  process.exitCode=1;
}finally{
  client?.close();
  if(chrome&&chrome.exitCode===null){
    chrome.kill('SIGTERM');
    await new Promise(resolve=>{chrome.once('exit',resolve);setTimeout(resolve,2000);});
  }
  await new Promise(done=>server.close(done));
  rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});
}
