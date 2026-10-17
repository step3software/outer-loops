#!/usr/bin/env node
// Generates an index from the actual initialized game model, not editor XML.
// It runs in a worker-like Node VM; no browser I/O or player saves are accessed.
// --write: write docs; --check: fail on drift; --emit: print base64 for bootstrap.
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadGameModel} from './load-game-model.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'docs/reference/action-mechanics.generated.md');
const source = readFileSync(join(root, 'actionList.js'), 'utf8');
const {evaluate} = loadGameModel();
const model = evaluate(`(() => Object.entries(Action)
  .filter(([,action]) => action instanceof Action)
  .map(([id, action]) => {
    const callbacks = {};
    for(const name of ["manaCost", "goldCost", "canStart", "visible", "unlocked",
      "allowed", "cost", "finish", "storyReqs", "story", "loopCost",
      "tickProgress", "loopsFinished", "floorReward", "segmentFinished"]) {
      if (typeof action[name] === "function" && 
          (Object.hasOwn(action, name) || ["loopCost", "loopsFinished"].includes(name))) {
        callbacks[name] = Function.prototype.toString.call(action[name]);
      }
    }
    return {
      id, name: action.name, type: action.type, zone: action.townNum,
      varName: action.varName, className: action.constructor.name,
      segments: action.segments ?? null, progressScaling: action.progressScaling ?? null,
      stats: action.stats ? Object.entries(action.stats) : [],
      skills: action.skills ? Object.entries(action.skills).map(([n,v]) =>
          [n, typeof v === "function" ? Function.prototype.toString.call(v) : v]) : [],
      affectedBy: action.affectedBy ?? [],
      grantsBuff: action.grantsBuff ?? null,
      callbacks
    };
  }))()`);
const zones = ["Beginnersville", "Forest Path", "Merchanton", "Mt. Olympus",
    "Valhalla", "Startington", "Jungle Path", "Commerceville", "Valley of Olympus"];
const quote = String.fromCharCode(96);
const inline = value => quote + String(value).replaceAll(quote, "'").replaceAll('\n', ' ').trim() + quote;
const methodText = (s, max = 230) => {
    if (!s) return '—';
    const cleaned = s.replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\s+/g, ' ').trim();
    const returns = [...cleaned.matchAll(/\breturn\s+([^;]*);/g)].map(m => m[1].trim());
    if (returns.length === 1 && returns[0].length <= max)
        return inline(returns[0]);
    if (returns.length > 1) {
        const unique = [...new Set(returns)];
        if (unique.length === 1 && unique[0].length <= max) return inline(unique[0]);
        return 'conditional / ' + returns.length + ' return paths (see source)';
    }
    return 'callback (see source)';
};
const effects = (callbacks) => {
    const code = ["cost","finish","loopsFinished","floorReward","segmentFinished"]
        .map(k => callbacks[k] || '').join('\n');
    if (!code.trim()) return 'No direct action-specific effect callback';
    const things = new Set();
    for(const m of code.matchAll(/\baddResource\s*\(\s*["']([^"']+)["']/g)) things.add('resource:' + m[1]);
    const funcs = [
        ["addMana", "mana budget"], ["finishProgress", "progress"],
        ["finishRegular", "limited-item discovery"], ["handleSkillExp", "skill XP"],
        ["addSkillExp", "skill XP"], ["addBuffAmt", "buff"],
        ["setStoryFlag", "story flag"], ["increaseStoryVarTo", "story variable"],
        ["unlockTown", "zone unlock"], ["completedCurrentGame", "prestige completion"],
        ["changeActionAmount", "queue quantity"], ["addOffline", "offline time"],
    ];
    for (const [fn, desc] of funcs) if(new RegExp('\\b'+fn+'\\s*\\(').test(code))things.add(desc);
    if(/\b(?:goldInvested|stonesUsed|totalMerchantMana|totals)\s*(?:\+|\-)?=/.test(code))
        things.add('direct economic/counter mutation');
    if(things.size === 0) things.add('custom implementation (inspect callback)');
    return [...things].join(', ');
};
function storySummary(cb) {
    if(!cb) return 'None declared here';
    const cases = [...cb.matchAll(/\bcase\s+(\d+)\s*:/g)].map(m=>m[1]);
    return cases.length ? 'story checkpoints ' + cases.join(', ') : 'custom story conditions';
}
const lines = [
'# Action mechanics — generated from initialized runtime',
'',
'> **Generated reference.** Run '+inline('node scripts/generate-action-mechanics.mjs --write')+
  ' after changing '+inline('actionList.js')+'. The CI checker uses '+
  inline('--check')+' to detect drift. Do not hand-edit this file.',
'',
'This inventory reads **actual Action instances**, including Survey/Ruins/Haul factories and inherited assassin types. It is not read from the experimental XML editor. '+
'Costs and gates below are **source expressions**, not guaranteed prices/availability in every save. '+
'Callback effect labels identify only *direct textual calls* within the listed callbacks; other functions, indirect effects, and conditional branches must be reviewed in source.',
'',
'Action identity, '+inline('varName')+', town indexing, skills and stat weights are save/balance contracts. '+
'Classify proposed changes using [gameplay](../gameplay.md), [state](../state-and-saving.md) and [review](../audit/README.md).',
'',
'## Summary', '',
'| Type | Count |', '| --- | ---: |',
...['normal','progress','limited','multipart'].map(t =>
    '| '+t+' | '+model.filter(a=>a.type===t).length+' |'),
'| **Total** | **'+model.length+'** |', ''
];
for(let zone=0;zone<zones.length;zone++){
    const actions=model.filter(a=>a.zone===zone).sort((a,b)=>a.name.localeCompare(b.name));
    lines.push('## Zone '+zone+' — '+zones[zone]+' ('+actions.length+' actions)', '');
    for(const a of actions){
        const position=source.indexOf('Action.'+a.id+' = new ');
        const line=position<0?'':source.slice(0,position).split('\n').length;
        const link=line?'[source](https://github.com/step3software/outer-loops/blob/dmchurch/actionList.js#L'+line+')':'source location unknown';
        lines.push('### '+a.name+' — '+inline('Action.'+a.id), '');
        lines.push('- **Identity:** '+inline(a.type)+' / '+inline(a.className)+
            ' · '+inline('townNum='+a.zone)+' · '+inline('varName='+a.varName)+
            (a.segments==null?'':' · '+inline('segments='+a.segments))+
            (a.progressScaling?' · '+inline('progressScaling='+a.progressScaling):'')+
            ' · '+link);
        const c=a.callbacks;
        lines.push('- **Cost:** mana '+methodText(c.manaCost)+
            (c.goldCost?' · gold '+methodText(c.goldCost):'')+
            (c.allowed?' · allowed '+methodText(c.allowed):'')+
            (c.cost?' · extra cost callback':''));
        lines.push('- **Gates:** visible '+methodText(c.visible)+
            ' · unlocked '+methodText(c.unlocked)+
            (c.canStart?' · canStart '+methodText(c.canStart):''));
        const stat=a.stats.length ? a.stats.map(([k,v])=>k+':'+v).join(', ') : 'none';
        const skill=a.skills.length ? a.skills.map(([k,v])=>k+':'+
            (typeof v==='number'?v:'dynamic')).join(', ') : 'none';
        lines.push('- **Growth:** stat weights '+inline(stat)+'; skills '+inline(skill)+
            (a.grantsBuff ? '; grants '+inline(a.grantsBuff) : ''));
        lines.push('- **Effects:** '+effects(c)+'. **Story:** '+storySummary(c.storyReqs)+
            (a.affectedBy.length ? '. **Affected by:** '+a.affectedBy.map(inline).join(', '):'')+'.');
        const specials=['loopCost','tickProgress','loopsFinished','floorReward','segmentFinished']
          .filter(k=>c[k] && k!=='loopsFinished');
        if(specials.length)lines.push('- **Extra hooks:** '+specials.map(inline).join(', ')+'; inspect segment/floor formulas in source.');
        lines.push('');
    }
}
const output=lines.join('\n')+'\n';
if(process.argv.includes('--emit')) {
    process.stdout.write('GENERATED_ACTION_MECHANICS_BASE64='+
        Buffer.from(output,'utf8').toString('base64')+'\n');
} else if(process.argv.includes('--check')) {
    let current;
    try { current=readFileSync(path,'utf8'); }catch{current='';}
    if(current!==output) {
        console.error('FAIL action mechanics reference differs from initialized Action definitions. Run --write.');
        process.exitCode=1;
    } else console.log('PASS '+model.length+' generated action mechanics entries match runtime.');
} else if(process.argv.includes('--write')) {
    writeFileSync(path,output);
    console.log('Wrote '+model.length+' action mechanics to '+path);
} else {
    console.log(output);
}
