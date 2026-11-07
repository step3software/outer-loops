#!/usr/bin/env node
// Isolated earned-route worker. Only the parent supervises the hard host deadline.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {runPotionCampaign} from './potion-runner.mjs';

const root=resolve(import.meta.dirname,'../..');
const {endpoint='potion-craft',seed=42,mode='accelerated',maxHostSeconds=35,
  calibrationPath=null}=JSON.parse(process.argv[2]??'{}');

function heartbeat(diagnostic){
  process.send?.({type:'heartbeat',heapUsed:process.memoryUsage().heapUsed,diagnostic});
}

async function sendResult(result){
  if(!process.send){console.log(JSON.stringify(result));return;}
  await new Promise((resolve,reject)=>{
    process.send({type:'result',result},error=>error?reject(error):resolve());
  });
}

try{
  heartbeat({checkpoint:'starting',endpoint,seed});
  const calibrationReport=calibrationPath?
    JSON.parse(readFileSync(resolve(root,calibrationPath),'utf8')):null;
  const result=runPotionCampaign({root,endpoint,seed,mode,
    // Leave the parent time to transmit diagnostics and the returned report.
    maxHostSeconds:Math.max(.01,maxHostSeconds*.9),calibrationReport,
    onTransition:transition=>heartbeat({checkpoint:'policy-transition',endpoint,seed,
      loop:transition.loop,phase:transition.phase,reason:transition.reason})});
  heartbeat({checkpoint:'finished',endpoint,seed,status:result.status,
    lastSuccessfulCheckpoint:result.lastSuccessfulCheckpoint});
  await sendResult(result);
}catch(error){
  heartbeat({checkpoint:'failed',endpoint,seed,reason:error.message});
  await sendResult({status:'incomplete',endpoint,seed,
    failure:{code:error.code??'worker_error',message:error.message},
    lastSuccessfulCheckpoint:null});
}
