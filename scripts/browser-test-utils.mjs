// Test-only browser discovery. Windows Chrome does not implement the POSIX
// --version probe; an installed executable is verified by the real CDP boot.
import {existsSync,statSync,mkdtempSync,realpathSync} from 'node:fs';
import {lstat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,isAbsolute} from 'node:path';
import {spawnSync,execFile} from 'node:child_process';

const ownedProfiles=new Set();
const exited=child=>child.exitCode!==null||child.signalCode!==null;

function waitForExit(child,timeoutMs) {
  if(exited(child))return Promise.resolve(true);
  return new Promise(resolve=>{
    const done=value=>{
      clearTimeout(timer);child.removeListener('close',closed);
      resolve(value);
    };
    const closed=()=>done(true);
    const timer=setTimeout(()=>done(exited(child)),timeoutMs);
    child.once('close',closed);
  });
}

export function browserBinary() {
  const windows=process.platform==='win32';
  const roots=[process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)'],process.env.LOCALAPPDATA];
  const candidates=[process.env.CHROME_BIN,
    ...(windows?roots.filter(Boolean).map(root=>join(root,'Google','Chrome','Application','chrome.exe')):[]),
    'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
  for(const candidate of candidates) {
    if(windows&&isAbsolute(candidate)&&existsSync(candidate)&&statSync(candidate).isFile())return candidate;
    if(spawnSync(candidate,['--version'],{timeout:4000,windowsHide:true}).status===0)return candidate;
  }
  throw Error('Google Chrome / Chromium not available; cannot run browser test');
}

export async function stopBrowser(child,client) {
  if(!child?.pid||exited(child))return 'already-exited';
  if(client){
    // Let Chrome stop its own subprocesses and flush/release the profile. A
    // force-killed Windows tree can leave an unsupported child holding files.
    const closed=waitForExit(child,30000);
    try {await Promise.race([Promise.resolve().then(()=>client.send('Browser.close')),closed]);}
    catch {/* A closing CDP connection is expected; process exit is the proof. */}
    client.close();
    if(await closed)return 'graceful';
  }
  if(process.platform==='win32') {
    await new Promise(resolve=>execFile('taskkill.exe',['/PID',String(child.pid),'/T','/F'],
      {timeout:10000,windowsHide:true},()=>resolve()));
  }
  if(!exited(child))child.kill('SIGKILL');
  if(!await waitForExit(child,10000))throw Error('Owned test browser did not exit; profile retained.');
  return 'forced';
}

export function browserProfile(prefix) {
  // Resolve Windows 8.3 aliases before Chrome materializes its profile tree.
  const profile=mkdtempSync(join(realpathSync.native(tmpdir()),prefix));
  ownedProfiles.add(profile);
  return profile;
}

export async function removeBrowserProfile(profile) {
  if(!ownedProfiles.has(profile))throw Error('Refusing to remove a profile not owned by this test.');
  let info;
  try {info=await lstat(profile);}
  catch(error){if(error.code==='ENOENT')return;throw error;}
  if(info.isSymbolicLink()||realpathSync.native(profile)!==profile)
    throw Error('Owned profile path changed; refusing recursive removal.');
  // Async removal keeps child/socket exit events flowing during Windows retries.
  await rm(profile,{recursive:true,force:true,maxRetries:20,retryDelay:100});
}

export async function cleanupBrowser({child,client,profile}) {
  try {await stopBrowser(child,client);}
  finally {client?.close();}
  await removeBrowserProfile(profile);
}
