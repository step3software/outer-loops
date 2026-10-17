#!/usr/bin/env node
// Dependency-free static repository integrity checks. This is not a browser test.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const allFiles = [];
const excludedDirectories = new Set(['.git', 'node_modules']);

function collect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!excludedDirectories.has(entry.name)) collect(full);
        } else if (entry.isFile()) {
            allFiles.push(full);
        }
    }
}
function display(file) {
    return relative(root, file).replaceAll('\\', '/');
}
function fail(message) {
    errors.push(message);
}
function checkRelativeLink(file, url) {
    const clean = url.trim().replace(/^<|>$/g, '').split(/[?#]/)[0];
    if (!clean || clean.startsWith('#') || clean.startsWith('//')
        || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(clean)) return;
    let target;
    try {
        const decoded = decodeURIComponent(clean);
        target = decoded.startsWith('/') ? resolve(root, '.' + decoded)
            : resolve(dirname(file), decoded);
    } catch {
        fail(display(file) + ': invalid relative link ' + url);
        return;
    }
    if (!existsSync(target)) fail(display(file) + ': missing local link target ' + url);
}

collect(root);

let syntaxChecked = 0;
for (const file of allFiles) {
    const name = display(file);
    if ((extname(file) === '.js' || extname(file) === '.mjs')
        && !name.startsWith('lib/')) {
        const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
        syntaxChecked++;
        if (result.status !== 0) {
            fail(name + ': JavaScript syntax check failed\n' + (result.stderr || result.stdout));
        }
    }
}

let markdownFiles = 0;
let markdownLinks = 0;
for (const file of allFiles.filter(file => file.endsWith('.md'))) {
    markdownFiles++;
    const content = readFileSync(file, 'utf8');
    const pattern = /\[[^\]\n]*\]\(([^)\n]+)\)/g;
    for (const match of content.matchAll(pattern)) {
        markdownLinks++;
        checkRelativeLink(file, match[1]);
    }
}

let scriptsChecked = 0;
for (const entry of ['index.html', 'editor.html']) {
    const file = join(root, entry);
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
        const src = match[1];
        if (/^(https?:)?\/\//.test(src)) continue;
        scriptsChecked++;
        checkRelativeLink(file, src);
    }
}

const definitionSource = readFileSync(join(root, 'actionList.js'), 'utf8');
const catalog = readFileSync(join(root, 'docs/reference/action-catalog.md'), 'utf8');
const sourceIds = [...definitionSource.matchAll(/Action\.([A-Za-z0-9_]+)\s*=\s*new\s+(?:Action|MultipartAction|DungeonAction|TrialAction|AssassinAction)\s*\(/g)]
    .map(match => match[1]);
const catalogIds = [...catalog.matchAll(/^\|\s*`Action\.([A-Za-z0-9_]+)`\s*\|/gm)]
    .map(match => match[1]);
for (const [label, ids] of [['source', sourceIds], ['catalog', catalogIds]]) {
    if (new Set(ids).size !== ids.length) fail(label + ': duplicate action IDs in catalog comparison');
}
for (const id of sourceIds) {
    if (!catalogIds.includes(id)) fail('Action.' + id + ': missing from docs/reference/action-catalog.md');
}
for (const id of catalogIds) {
    if (!sourceIds.includes(id)) fail('Action.' + id + ': catalog entry has no registered source action');
}
for (const file of ['AGENTS.md', 'docs/README.md', 'README.md']) {
    if (!existsSync(join(root, file))) fail('Required entry point is missing: ' + file);
}

if (errors.length) {
    for (const error of errors) console.error('FAIL ' + error);
    console.error('Repository check failed: ' + errors.length + ' error(s).');
    process.exitCode = 1;
} else {
    console.log('PASS ' + syntaxChecked + ' JS files, '
        + markdownFiles + ' Markdown files / ' + markdownLinks + ' Markdown links, '
        + scriptsChecked + ' local scripts, '
        + sourceIds.length + ' cataloged actions.');
}
