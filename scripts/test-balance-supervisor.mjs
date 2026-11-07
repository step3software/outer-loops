#!/usr/bin/env node
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runSupervised} from './balance/supervisor.mjs';

const worker=fileURLToPath(new URL('./balance/supervisor-fixture-worker.mjs',import.meta.url));
const complete=await runSupervised({modulePath:worker,args:['complete'],maxHostMs:2000});
assert.equal(complete.status,'complete');
assert.deepEqual(complete.result,{status:'complete',value:42});

const timeout=await runSupervised({modulePath:worker,args:['hang'],maxHostMs:250});
assert.equal(timeout.status,'budget_exceeded');
assert.equal(timeout.lastDiagnostic?.checkpoint,'before-tight-loop');
assert.ok(timeout.hostMs<2000,'hung worker must be killed by independent parent deadline');

const memory=await runSupervised({modulePath:worker,args:['memory'],maxHostMs:2000,maxHeapBytes:1024});
assert.equal(memory.status,'memory_exceeded');
assert.equal(memory.lastDiagnostic?.checkpoint,'memory-limit');
console.log('PASS independent supervisor: complete result, synchronous hang timeout, memory ceiling, partial diagnostics.');
