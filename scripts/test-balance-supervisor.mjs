#!/usr/bin/env node
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runSupervised} from './balance/supervisor.mjs';

const worker=fileURLToPath(new URL('./balance/supervisor-fixture-worker.mjs',import.meta.url));
const complete=await runSupervised({modulePath:worker,args:['complete'],maxHostMs:2000});
assert.equal(complete.status,'complete');
assert.deepEqual(complete.result,{status:'complete',value:42});

// The short deadline also covers startup with no IPC evidence. Separately
// allow a native process to start before proving an active tight loop is killed.
const silentTimeout=await runSupervised({modulePath:worker,args:['hang-silent'],maxHostMs:250});
assert.equal(silentTimeout.status,'budget_exceeded');
assert.ok(silentTimeout.hostMs<2000,'startup/silent worker must retain its short hard deadline');
const timeout=await runSupervised({modulePath:worker,args:['hang'],maxHostMs:2000});
assert.equal(timeout.status,'budget_exceeded');
assert.equal(timeout.lastDiagnostic?.checkpoint,'before-tight-loop');
assert.ok(timeout.hostMs<3500,'active hung worker must be killed by independent parent deadline');

const memory=await runSupervised({modulePath:worker,args:['memory'],maxHostMs:2000,maxHeapBytes:1024});
assert.equal(memory.status,'memory_exceeded');
assert.equal(memory.lastDiagnostic?.checkpoint,'memory-limit');
const silentMemory=await runSupervised({modulePath:worker,args:['memory-silent'],
  maxHostMs:4500,maxHeapBytes:64*1024*1024});
assert.equal(silentMemory.status,'memory_exceeded',
  'uncooperative worker memory is observed independently of its IPC messages');
assert.ok(silentMemory.lastDiagnostic?.memoryMonitor?.observedBytes>64*1024*1024);
assert.ok(silentMemory.hostMs<4500,'memory guard must win before host-time ceiling');
const measurementWorker=fileURLToPath(new URL('./balance/measurement-worker.mjs',import.meta.url));
const missingCalibration=await runSupervised({modulePath:measurementWorker,
  args:[JSON.stringify({endpoint:'potion-craft',seed:42,mode:'accelerated',maxHostSeconds:1})],
  maxHostMs:3000});
assert.equal(missingCalibration.status,'complete','real worker must exit and return structured failure');
assert.equal(missingCalibration.result.status,'incomplete');
assert.match(missingCalibration.result.failure.message,/Missing browser calibration/);
console.log('PASS process supervision: host timeout, cooperative and independent RSS ceilings, structured failure.');
