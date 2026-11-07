// Independent-process watchdog. The parent deadline remains effective when a
// game worker is stuck in synchronous JavaScript and cannot service timers.
import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';

export const SUPERVISOR_VERSION = 'rw00-benchmark-supervisor/v1';

export function runSupervised({modulePath,args=[],maxHostMs=35000,maxHeapBytes=512*1024*1024,
  env={}} = {}) {
  if (typeof modulePath !== 'string' || !modulePath) throw new TypeError('Worker module required');
  if (!Number.isSafeInteger(maxHostMs) || maxHostMs < 1) throw new RangeError('Positive host deadline required');
  if (!Number.isSafeInteger(maxHeapBytes) || maxHeapBytes < 1) throw new RangeError('Positive heap ceiling required');
  const started=performance.now();
  return new Promise(resolve=>{
    const child=spawn(process.execPath,[modulePath,...args],{
      stdio:['ignore','pipe','pipe','ipc'],windowsHide:true,
      env:{...process.env,...env,RW00_MAX_HEAP_BYTES:String(maxHeapBytes)}
    });
    let status='running',result=null,lastDiagnostic=null,stderr='',stdout='',settled=false;
    const finish=(exitCode,signal)=>{
      if(settled)return;
      settled=true;clearTimeout(deadline);
      resolve({schema:SUPERVISOR_VERSION,status,exitCode,signal,
        hostMs:performance.now()-started,result,lastDiagnostic,stdout,stderr});
    };
    const terminate=nextStatus=>{
      if(status!=='running')return;
      status=nextStatus;
      child.kill('SIGKILL');
    };
    const deadline=setTimeout(()=>terminate('budget_exceeded'),maxHostMs);
    child.stdout.on('data',chunk=>{stdout=(stdout+chunk).slice(-65536);});
    child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-65536);});
    child.on('message',message=>{
      if(!message||typeof message!=='object')return;
      if(message.type==='heartbeat'){
        lastDiagnostic=message.diagnostic??lastDiagnostic;
        if(Number.isFinite(message.heapUsed)&&message.heapUsed>maxHeapBytes)terminate('memory_exceeded');
      } else if(message.type==='result') {
        result=message.result;
      }
    });
    child.on('error',error=>{stderr=(stderr+'\n'+error.stack).trim();status='worker_error';});
    child.on('exit',(code,signal)=>{
      if(status==='running') status=code===0&&result?'complete':'worker_error';
      finish(code,signal);
    });
  });
}
