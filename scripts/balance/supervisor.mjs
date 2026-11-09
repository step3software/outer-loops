// Independent process watchdog: synchronous workers cannot bypass the host
// deadline or resident-memory ceiling by withholding their IPC heartbeats.
import {spawn,execFile} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';

export const SUPERVISOR_VERSION = 'rw00-benchmark-supervisor/v2';

function residentBytes(pid,callback) {
  if(process.platform==='linux'){
    try{
      const status=readFileSync('/proc/'+pid+'/status','utf8');
      const matched=/^VmRSS:\s*(\d+)\s*kB/m.exec(status);
      if(!matched)throw new Error('Missing /proc RSS field');
      callback(null,Number(matched[1])*1024);
    }catch(error){callback(error);}
    return;
  }
  const windows=process.platform==='win32';
  // tasklist reads the OS working set without booting a PowerShell runtime
  // for every 150-ms sample. The PID is checked before accepting its CSV row.
  const command=windows?'tasklist.exe':'ps';
  const args=windows?['/FI','PID eq '+pid,'/FO','CSV','/NH']:
    ['-o','rss=','-p',String(pid)];
  execFile(command,args,{timeout:1500,maxBuffer:4096,windowsHide:true},
    (error,stdout)=>{
      if(error){callback(error);return;}
      const row=windows?/^"[^"]*","(\d+)","[^"]*","[^"]*","([^"]*)"/m.exec(stdout.trim()):null;
      const sample=windows&&row&&Number(row[1])===pid
        ? row[2].replace(/[,.\s\u00a0]/g,'').replace(/K$/i,'') : windows?'':stdout.trim();
      const amount=/^\d+$/.test(sample)?Number(sample):NaN;
      if(!Number.isFinite(amount)||amount<=0){
        callback(new Error('Invalid resident-memory sample'));return;
      }
      callback(null,amount*1024);
    });
}

export function runSupervised({modulePath,args=[],maxHostMs=35000,maxHeapBytes=512*1024*1024,
  env={}} = {}) {
  if(typeof modulePath!=='string'||!modulePath)throw new TypeError('Worker module required');
  if(!Number.isSafeInteger(maxHostMs)||maxHostMs<1)throw new RangeError('Positive host deadline required');
  if(!Number.isSafeInteger(maxHeapBytes)||maxHeapBytes<1)throw new RangeError('Positive memory ceiling required');
  const started=performance.now();
  return new Promise(resolve=>{
    const child=spawn(process.execPath,[modulePath,...args],{
      stdio:['ignore','pipe','pipe','ipc'],windowsHide:true,
      env:{...process.env,...env,RW00_MAX_HEAP_BYTES:String(maxHeapBytes)}
    });
    let status='running',result=null,lastDiagnostic=null,stderr='',stdout='',settled=false;
    let sampling=false,monitorErrors=0;
    const finish=(exitCode,signal)=>{
      if(settled)return;
      settled=true;clearTimeout(deadline);clearInterval(memoryWatch);
      resolve({schema:SUPERVISOR_VERSION,status,exitCode,signal,
        hostMs:performance.now()-started,result,lastDiagnostic,stdout,stderr});
    };
    const terminate=nextStatus=>{
      if(status!=='running')return;
      status=nextStatus;
      child.kill('SIGKILL');
    };
    const deadline=setTimeout(()=>terminate('budget_exceeded'),maxHostMs);
    const memoryWatch=setInterval(()=>{
      if(status!=='running'||sampling||!child.pid)return;
      sampling=true;
      residentBytes(child.pid,(error,bytes)=>{
        sampling=false;
        if(status!=='running')return;
        if(error){
          if(++monitorErrors>=3){
            stderr=(stderr+'\nIndependent RSS monitor unavailable: '+error.message).trim();
            terminate('memory_monitor_unavailable');
          }
          return;
        }
        monitorErrors=0;
        if(bytes>maxHeapBytes){
          lastDiagnostic={...lastDiagnostic,memoryMonitor:{
            source:'os-resident-set',observedBytes:bytes,ceilingBytes:maxHeapBytes}};
          terminate('memory_exceeded');
        }
      });
    },150);
    child.stdout.on('data',chunk=>{stdout=(stdout+chunk).slice(-65536);});
    child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-65536);});
    child.on('message',message=>{
      if(!message||typeof message!=='object')return;
      if(message.type==='heartbeat'){
        lastDiagnostic=message.diagnostic??lastDiagnostic;
        if(Number.isFinite(message.heapUsed)&&message.heapUsed>maxHeapBytes)terminate('memory_exceeded');
      }else if(message.type==='result')result=message.result;
    });
    child.on('error',error=>{
      stderr=(stderr+'\n'+error.stack).trim();status='worker_error';finish(null,null);
    });
    child.on('exit',(code,signal)=>{
      if(status==='running')status=code===0&&result?'complete':'worker_error';
      finish(code,signal);
    });
  });
}
