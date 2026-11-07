#!/usr/bin/env node
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {runPotionCampaign} from './balance/potion-runner.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const RESULTS=join(ROOT,'.balance-results');
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
let calibration=null;
if(options.mode==='accelerated'){
  if(!options.calibration)throw new Error('Accelerated measurements require --calibration');
  calibration=JSON.parse(readFileSync(resolve(ROOT,options.calibration),'utf8'));
}
const started=performance.now(),runs=[];
for(const endpoint of endpoints){
  for(const seed of seeds){
    const remaining=options.maxHostSeconds-(performance.now()-started)/1000;
    if(remaining<=0){runs.push({status:'incomplete',endpoint,seed,
      failure:{code:'batch_budget_exceeded',message:'Complete batch host ceiling reached'}});continue;}
    runs.push(runPotionCampaign({root:ROOT,endpoint,seed,mode:options.mode,
      maxHostSeconds:Math.min(35,remaining),calibrationReport:calibration}));
  }
}
if(options.allSeeds){
  const repeat=runs.find(run=>run.seed===42&&run.endpoint===endpoints[0]);
  if(repeat){
    const remaining=options.maxHostSeconds-(performance.now()-started)/1000;
    runs.push(remaining>0?runPotionCampaign({root:ROOT,endpoint:endpoints[0],seed:42,
      mode:options.mode,maxHostSeconds:Math.min(35,remaining),calibrationReport:calibration}):
      {status:'incomplete',endpoint:endpoints[0],seed:42,repeat:true,
        failure:{code:'batch_budget_exceeded',message:'No budget for seed-42 repeat'}});
  }
}
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
