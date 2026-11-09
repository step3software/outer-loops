#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {POTION_SOURCE_FILES,potionSourceIdentity} from './balance/potion-runner.mjs';

const source=resolve(import.meta.dirname,'..');
const sourceFiles=[...new Set(POTION_SOURCE_FILES)];
const fixture=mkdtempSync(join(tmpdir(),'outerloops-source-eol-'));
try {
  for(const path of sourceFiles) {
    const destination=join(fixture,path);
    mkdirSync(dirname(destination),{recursive:true});
    writeFileSync(destination,readFileSync(join(source,path),'utf8').replace(/\r\n/g,'\n'));
  }
  const lf=potionSourceIdentity(fixture);
  for(const path of sourceFiles) {
    const destination=join(fixture,path);
    writeFileSync(destination,readFileSync(destination,'utf8').replace(/\n/g,'\r\n'));
  }
  const crlf=potionSourceIdentity(fixture);
  assert.deepEqual(crlf,lf,'checkout line endings cannot invalidate identical source calibration');
  const changed=join(fixture,'saving.js');
  writeFileSync(changed,readFileSync(changed,'utf8')+'\r\n// changed source fixture\r\n');
  assert.notEqual(potionSourceIdentity(fixture).identity,lf.identity,
    'real source changes must still invalidate the complete calibration fingerprint');
} finally {
  assert.equal(dirname(fixture),resolve(tmpdir()));
  rmSync(fixture,{recursive:true,force:true});
}
console.log('PASS source identity: LF/CRLF checkouts match; changed source invalidates calibration.');
