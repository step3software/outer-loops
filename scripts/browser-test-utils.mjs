// Test-only browser discovery. Windows Chrome does not implement the POSIX
// --version probe; an installed executable is verified by the real CDP boot.
import {existsSync,statSync,mkdtempSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,isAbsolute} from 'node:path';
import {spawnSync} from 'node:child_process';

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

export function stopBrowser(child) {
  if(!child||child.exitCode!==null)return;
  if(process.platform==='win32') {
    // This exact child owns the fresh mkdtemp profile, never a user's session.
    spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],
      {timeout:10000,windowsHide:true,stdio:'ignore'});
  } else child.kill('SIGKILL');
}

export function browserProfile(prefix) {
  // Resolve Windows 8.3 aliases before Chrome materializes its profile tree.
  return mkdtempSync(join(realpathSync.native(tmpdir()),prefix));
}
