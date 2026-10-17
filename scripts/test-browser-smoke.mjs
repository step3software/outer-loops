#!/usr/bin/env node
// Real-browser smoke test using Chrome DevTools Protocol (no npm dependencies).
// Uses a fresh temporary profile; no production saves/accounts are accessed.
import assert from 'node:assert/strict';
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
    +"actions.clearActions();actions.addAction('Wander',1);actions.restart();"
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
  console.log('PASS Chrome: game boot, XML localization, 157 actions, Wander execution and save/reload.');
} finally {
  client?.close();
  if(chrome && chrome.exitCode===null)chrome.kill('SIGKILL');
  if(server.listening) {
    server.closeAllConnections?.();
    await new Promise(resolve=>server.close(resolve));
  }
  rmSync(profile,{recursive:true,force:true});
}
