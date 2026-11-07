#!/usr/bin/env node
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {runSupervised} from './balance/supervisor.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const RESULTS=join(ROOT,'.balance-results');
const WORKER=fileURLToPath(new URL('./balance/measurement-worker.mjs',import.meta.url));
const SEEDS=Object.freeze([1,42,20261106]);

function argumentsOf(argv){
  const result={route:'R01',mode:'accelerated',maxHostSeconds:35};
  for(let index=0;index<argv.length;index++){
    const token=argv[index];
    if(token==='--all-seeds'){result.allSeeds=true;continue;}
    if(!token.startsWith('--'))throw new Error('Unexpected argument: '+token);
    const key=token.slice(2).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
    const value=argv[++index];
    if(value===undefined||value.startsWith('--'))throw new Error('Missing value for '+token);
    result[key]=value;
  }
  result.maxHostSeconds=Number(result.maxHostSeconds);
  result.seed=result.seed===undefined?42:Number(result.seed);
  return result;
}

function resultPath(value){
  const target=resolve(ROOT,value??'.balance-results/potion-measurement.json');
  const inside=relative(RESULTS,target);
  if(inside.startsWith('..')||isAbsolute(inside))throw new Error('Output must be beneath .balance-results');
  return target;
}

const options=argumentsOf(process.argv.slice(2));
if(options.route!=='R01')throw new Error('Potion timing currently supports route R01 only');
if(!['accelerated','reference'].includes(options.mode))throw new Error('Unsupported mode');
if(!Number.isFinite(options.maxHostSeconds)||options.maxHostSeconds<=0||options.maxHostSeconds>300){
  throw new Error('max-host-seconds must be within 0 < seconds <= 300');
}
const endpoints=String(options.endpoints??options.endpoint??'potion-craft').split(',');
if(endpoints.some(endpoint=>!['potion-craft','potion-totem'].includes(endpoint))){
  throw new Error('Unknown potion endpoint');
}
const seeds=options.allSeeds?SEEDS:[options.seed];
if(seeds.some(seed=>!Number.isSafeInteger(seed)||seed<1||seed>0xffffffff))throw new Error('Invalid seed');
if(options.allSeeds&&options.seed!==42)throw new Error('Use either --all-seeds or --seed');
if(options.mode==='accelerated'&&(!options.calibration||!existsSync(resolve(ROOT,options.calibration)))){
  throw new Error('Accelerated measurements require an existing --calibration file');
}

const started=performance.now(),runs=[];
async function supervisedRun(endpoint,seed){
  const remaining=options.maxHostSeconds-(performance.now()-started)/1000;
  if(remaining<=0)return {status:'incomplete',endpoint,seed,
    failure:{code:'batch_budget_exceeded',message:'Complete batch host ceiling reached'}};
  const maxHostSeconds=Math.min(35,remaining);
  const supervised=await runSupervised({modulePath:WORKER,
    args:[JSON.stringify({endpoint,seed,mode:options.mode,maxHostSeconds,
      calibrationPath:options.calibration??null})],
    maxHostMs:Math.max(1,Math.floor(maxHostSeconds*1000))});
  if(supervised.status!=='complete'||!supervised.result){
    return {status:'incomplete',endpoint,seed,
      lastDiagnostic:supervised.lastDiagnostic,
      failure:{code:supervised.status,message:'Campaign worker did not complete under its independent host/memory ceiling'}};
  }
  return {...supervised.result,supervision:{status:supervised.status,
    hostMs:supervised.hostMs,lastDiagnostic:supervised.lastDiagnostic}};
}
for(const endpoint of endpoints){
  for(const seed of seeds)runs.push(await supervisedRun(endpoint,seed));
}
if(options.allSeeds)runs.push({...await supervisedRun(endpoints[0],42),repeat:true});

const report={schema:'rw00-potion-measurement-batch/v1',status:runs.every(run=>run.status==='complete')?
  'complete':'incomplete',route:'R01',mode:options.mode,hostSeconds:(performance.now()-started)/1000,
  maxHostSeconds:options.maxHostSeconds,endpoints,seeds,runs};
const output=resultPath(options.output);
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,output:relative(ROOT,output),runs:runs.map(run=>({
  endpoint:run.endpointRequested??run.endpoint,seed:run.seed,status:run.status,
  checkpoint:run.lastSuccessfulCheckpoint,failure:run.failure?.code??null}))},null,2));
if(report.status!=='complete')process.exitCode=1;
