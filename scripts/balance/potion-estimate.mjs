import {BalanceEngine} from './engine.mjs';
import {createPotionAcceleration,potionSourceIdentity} from './potion-runner.mjs';
import {loadGameModel} from '../load-game-model.mjs';
import {resolve} from 'node:path';

export const POTION_ESTIMATE_SCHEMA='rw00-direct-potion-estimate/v2';
export const POTION_INJECTION_SCHEMA='rw00-synthetic-direct-potion-checkpoint/v2';

function configure(model,{statLevel=0,collegeSegment=0,townLevels={},skillLevels={},buffLevels={}}={}){
  model.evaluate(`(() => {
    for(const stat of Object.values(stats))stat.statLevelExp.setLevel(${statLevel});
    curWizCollegeSegment=${collegeSegment};resources.wizardCollege=true;
    for(const [key,value] of Object.entries(${JSON.stringify(townLevels)})){
      const [town,varName]=key.split(':');towns[Number(town)]['exp'+varName]=towns[Number(town)].expFromLevel(value);
    }
    for(const [name,level] of Object.entries(${JSON.stringify(skillLevels)}))skills[name].levelExp.setLevel(level);
    for(const [name,level] of Object.entries(${JSON.stringify(buffLevels)}))buffs[name].amt=level;
  })()`);
}

function actionTiming(model,name,profile={}){
  configure(model,profile);
  return model.evaluate(`(() => {const action=towns.flatMap(t=>t.totalActionList).find(a=>a.name===${JSON.stringify(name)});
    if(!action)throw new Error('Unknown estimate action');setAdjustedTicks(action);
    curWizCollegeSegment=0;const unreducedManaCost=action.manaCost();
    curWizCollegeSegment=${profile.collegeSegment??0};setAdjustedTicks(action);
    return {action:${JSON.stringify(name)},manaCost:action.manaCost(),unreducedManaCost,
      adjustedTicks:action.adjustedTicks,statLevel:${profile.statLevel??0},
      collegeSegment:${profile.collegeSegment??0},collegeBonus:getWizCollegeRank().bonus};})()`);
}

function skillComponent(model,{id,action,skill,from=0,to,profile}){
  const timing=actionTiming(model,action,profile);
  const xp=model.evaluate(`({required:LevelExp.totalExpForLevel(${to})-LevelExp.totalExpForLevel(${from}),
    perAction:(()=>{const action=towns.flatMap(t=>t.totalActionList).find(a=>a.name===${JSON.stringify(action)});
      const value=action.skills[${JSON.stringify(skill)}];return typeof value==='function'?value():value;})()})`);
  const count=Math.ceil(xp.required/xp.perAction);
  return {id,kind:'skill',action,goal:skill+' '+from+'→'+to,count,xp,...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function progressComponent(model,{id,action,town,varName,from=0,to,profile}){
  configure(model,profile);
  const gain=model.evaluate(`(() => {const town=towns[${town}],action=towns.flatMap(t=>t.totalActionList)
    .find(a=>a.name===${JSON.stringify(action)});town['exp'+${JSON.stringify(varName)}]=town.expFromLevel(${from});
    const before=town['exp'+${JSON.stringify(varName)}];action.finish();
    return {required:town.expFromLevel(${to})-town.expFromLevel(${from}),
      perAction:town['exp'+${JSON.stringify(varName)}]-before};})()`);
  if(!(gain.perAction>0))throw new Error('Nonpositive progress gain for '+action);
  const timing=actionTiming(model,action,profile),count=Math.ceil(gain.required/gain.perAction);
  return {id,kind:'progress',action,goal:varName+' '+from+'→'+to,count,xp:gain,...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function fixedComponent(model,{id,action,count=1,profile,kind='fixed',goal}){
  const timing=actionTiming(model,action,profile);
  return {id,kind,action,goal:goal??count+' completion'+(count===1?'':'s'),count,...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function multipartComponent(model,{id,action,loops=1,profile,goal}){
  configure(model,profile);
  const goalLabel=goal??loops+' completion'+(loops===1?'':'s');
  return model.evaluate(`(() => {const action=towns.flatMap(t=>t.totalActionList)
    .find(a=>a.name===${JSON.stringify(action)});setAdjustedTicks(action);
    let loopCounter=0,totalCompletions=0,adjustedTicksTotal=0;const segments=[];
    for(let loop=0;loop<${loops};loop++){
      for(let segment=0;segment<action.segments;segment++){
        const stat=stats[action.loopStats[(loopCounter+segment)%action.loopStats.length]],
          cost=action.loopCost(segment,loopCounter),progress=action.tickProgress(segment,loopCounter,totalCompletions),
          multiplier=progress*(action.manaCost()/action.adjustedTicks)*stat.effortMultiplier,
          ticks=cost/multiplier;
        if(!(ticks>0&&Number.isFinite(ticks)))throw new Error('Invalid multipart estimate');
        adjustedTicksTotal+=ticks;segments.push({loop,segment,cost,progress,
          stat:action.loopStats[(loopCounter+segment)%action.loopStats.length],
          effortMultiplier:stat.effortMultiplier,ticks});
      }
      loopCounter+=action.segments;totalCompletions++;
    }
    return {id:${JSON.stringify(id)},kind:'multipart',action:${JSON.stringify(action)},
      goal:${JSON.stringify(goalLabel)},count:${loops},segments,
      manaCost:action.manaCost(),adjustedTicks:action.adjustedTicks,
      statLevel:${profile.statLevel??0},collegeSegment:${profile.collegeSegment??0},
      collegeBonus:getWizCollegeRank().bonus,adjustedTicksTotal};})()`);
}

function section(id,label,components,baseManaPerSecond){
  const adjustedTicks=components.reduce((sum,item)=>sum+item.adjustedTicksTotal,0);
  const realSeconds=adjustedTicks/baseManaPerSecond;
  return {id,label,components,adjustedTicks,realSeconds,realHours:realSeconds/3600,realDays:realSeconds/86400};
}

export function createPotionRequirementEstimate({root=resolve(import.meta.dirname,'../..')}={}){
  const model=loadGameModel({withViewStubs:true,rngSeed:42}),baseManaPerSecond=model.evaluate('baseManaPerSecond');
  const early={statLevel:100},forest={statLevel:180,townLevels:{'1:Hermit':100}},
    merchanton={statLevel:260},olympus={statLevel:350,townLevels:{'3:Runes':60},
      skillLevels:{Magic:200,Practical:50}},
    valhalla={statLevel:500,skillLevels:{Magic:200,Practical:50,Pyromancy:200}},
    college={...valhalla,collegeSegment:3},
    startington={statLevel:650,buffLevels:{Imbuement:100}},jungle={statLevel:750},
    terminal={statLevel:850,collegeSegment:3,skillLevels:{Magic:200,Practical:50,
      Alchemy:200,Pyromancy:200,Spatiomancy:1},townLevels:{'1:Hermit':100,'1:Shortcut':100,
      '2:City':60,'3:Mountain':100,'3:Runes':60,'5:Meander':100,'6:ExploreJungle':50}};
  const foundations=[
    progressComponent(model,{id:'wander',action:'Wander',town:0,varName:'Wander',to:100,profile:early}),
    progressComponent(model,{id:'meet',action:'Meet People',town:0,varName:'Met',to:100,profile:early}),
    progressComponent(model,{id:'secrets',action:'Investigate',town:0,varName:'Secrets',to:60,profile:early}),
    fixedComponent(model,{id:'first_journey',action:'Start Journey',profile:early}),
    progressComponent(model,{id:'forest',action:'Explore Forest',town:1,varName:'Forest',to:100,profile:forest}),
    progressComponent(model,{id:'shortcut',action:'Old Shortcut',town:1,varName:'Shortcut',to:100,profile:forest}),
    progressComponent(model,{id:'hermit',action:'Talk To Hermit',town:1,varName:'Hermit',to:100,profile:forest})];
  const alchemyA=skillComponent(model,{id:'alchemy_a',action:'Learn Alchemy',skill:'Alchemy',
    to:100,profile:forest}),alchemyB=skillComponent(model,{id:'alchemy_b',action:'Learn Alchemy',
      skill:'Alchemy',from:100,to:160,profile:forest}),alchemyC=skillComponent(model,{id:'alchemy_c',
      action:'Learn Alchemy',skill:'Alchemy',from:160,to:200,profile:forest});
  const herbTraining=component=>fixedComponent(model,{id:'herbs_for_'+component.id,action:'Gather Herbs',
    count:component.count*10,profile:forest,kind:'resource',goal:'known-good herbs consumed by '+component.goal});
  const merchant=[fixedComponent(model,{id:'continue_on',action:'Continue On',profile:forest}),
    progressComponent(model,{id:'city',action:'Explore City',town:2,varName:'City',to:60,profile:merchanton}),
    fixedComponent(model,{id:'start_trek',action:'Start Trek',profile:merchanton})];
  const mountain=[
    progressComponent(model,{id:'mountain',action:'Climb Mountain',town:3,varName:'Mountain',to:100,profile:olympus}),
    progressComponent(model,{id:'runes',action:'Decipher Runes',town:3,varName:'Runes',to:60,profile:olympus}),
    progressComponent(model,{id:'cavern',action:'Explore Cavern',town:3,varName:'Cavern',to:80,profile:olympus}),
    progressComponent(model,{id:'illusions',action:'Check Walls',town:3,varName:'Illusions',to:5,profile:olympus})];
  const pyroA=skillComponent(model,{id:'pyromancy_a',action:'Pyromancy',skill:'Pyromancy',to:100,
    profile:olympus}),pyroB=skillComponent(model,{id:'pyromancy_b',action:'Pyromancy',skill:'Pyromancy',
      from:100,to:160,profile:olympus}),pyroC=skillComponent(model,{id:'pyromancy_c',action:'Pyromancy',
      skill:'Pyromancy',from:160,to:200,profile:olympus});
  const valhallaAccess=[fixedComponent(model,{id:'artifacts',action:'Take Artifacts',count:20,
      profile:olympus,kind:'resource',goal:'20 known-good artifacts for College gold and favors'}),
    multipartComponent(model,{id:'positive_reputation',action:'Heal The Sick',loops:17,
      profile:olympus,goal:'51 reputation for positive Judgement'}),
    fixedComponent(model,{id:'first_judgement',action:'Face Judgement',profile:olympus})];
  const collegeEntry=[
    progressComponent(model,{id:'tour',action:'Guided Tour',town:4,varName:'Tour',to:60,profile:valhalla}),
    fixedComponent(model,{id:'gift_artifacts',action:'Gift Artifact',count:10,profile:valhalla,
      kind:'resource',goal:'10 favors for Wizard College'}),
    fixedComponent(model,{id:'sell_artifacts',action:'Sell Artifact',count:10,profile:valhalla,
      kind:'resource',goal:'500 gold for Wizard College'}),
    multipartComponent(model,{id:'wizard_college',action:'Wizard College',profile:valhalla}),
    skillComponent(model,{id:'spatiomancy',action:'Spatiomancy',skill:'Spatiomancy',to:1,profile:college}),
    fixedComponent(model,{id:'fall_from_grace',action:'Fall From Grace',profile:valhalla}),
    progressComponent(model,{id:'meander',action:'Meander',town:5,varName:'Meander',to:100,
      profile:startington})];
  const jungleA=progressComponent(model,{id:'jungle_a',action:'Explore Jungle',town:6,
    varName:'ExploreJungle',to:35,profile:jungle}),jungleB=progressComponent(model,{id:'jungle_b',
      action:'Explore Jungle',town:6,varName:'ExploreJungle',from:35,to:50,profile:jungle});
  const carry=[
    fixedComponent(model,{id:'carry_gold_reputation',action:'Long Quest',count:27,profile:terminal,
      kind:'resource',goal:'810+ gold and 27 reputation in the carry loop'}),
    multipartComponent(model,{id:'carry_reputation',action:'Heal The Sick',loops:8,profile:terminal,
      goal:'remaining 24 reputation in the carry loop'}),
    ...['Buy Supplies','Start Journey'].map(name=>fixedComponent(model,
      {id:'carry_'+name.toLowerCase().replaceAll(' ','_'),action:name,profile:terminal})),
    fixedComponent(model,{id:'carry_herbs',action:'Gather Herbs',count:400,profile:terminal,
      kind:'resource',goal:'400 known-good herbs for Looping Potion'}),
    ...['Continue On','Start Trek','Looping Potion','Face Judgement','Fall From Grace',
      'Purchase Supplies','Journey Forth','Totem'].map(name=>fixedComponent(model,
      {id:'carry_'+name.toLowerCase().replaceAll(' ','_'),action:name,profile:terminal}))];
  const sections=[
    section('S01','Foundations, Forest access, and Hermit mastery',foundations,baseManaPerSecond),
    section('S02','Alchemy 0–100 and its herbs',[herbTraining(alchemyA),alchemyA],baseManaPerSecond),
    section('S03','Alchemy 100–160 and its herbs',[herbTraining(alchemyB),alchemyB],baseManaPerSecond),
    section('S04','Alchemy 160–200 and Merchanton access',[herbTraining(alchemyC),alchemyC,...merchant],baseManaPerSecond),
    section('S05','Mt. Olympus gates and Pyromancy 0–100',[...mountain,pyroA],baseManaPerSecond),
    section('S06','Pyromancy 100–160',[pyroB],baseManaPerSecond),
    section('S07','Pyromancy 160–200 and first Valhalla entry',[pyroC,...valhallaAccess],baseManaPerSecond),
    section('S08','Wizard College, Startington, and Jungle path 0–35',
      [...collegeEntry,jungleA],baseManaPerSecond),
    section('S09','Totem unlock and direct potion carry',[jungleB,...carry],baseManaPerSecond)];
  const realSeconds=sections.reduce((sum,item)=>sum+item.realSeconds,0),
    positive=sections.map(item=>item.realSeconds).filter(value=>value>0).sort((a,b)=>a-b),
    median=positive[Math.floor(positive.length/2)];
  return {schema:POTION_ESTIMATE_SCHEMA,kind:'calculated_estimate',sourceRevision:potionSourceIdentity(root).identity,
    baseManaPerSecond,sections,realSeconds,realDays:realSeconds/86400,realYears:realSeconds/(365.25*86400),
    balance:{sectionCount:sections.length,minToMedian:positive[0]/median,
      maxToMedian:positive.at(-1)/median,maxToMin:positive.at(-1)/positive[0]},
    assumptions:{statLevels:{early:100,forest:180,merchanton:260,olympus:350,valhalla:500,
      startington:650,jungle:750,terminal:850},
      wizardCollegeSegments:{spatiomancy:3},
      imbuementForMeander:100},
    caveats:['Pure calculation using production action costs, progress rewards, XP curves, stat multipliers and College bonus.',
      'Representative stat levels and College ranks are explicit scenario assumptions, not an earned-route replay.',
      'Known-good herb, quest and artifact counts omit discovery failures; repeated-loop travel and mana-economy overhead are outside these totals.',
      'Imbuement 100 is injected as an explicit representative Startington assumption.']};
}

export function runInjectedPotionEndpoint({root,endpoint='potion-totem',seed=42}={}){
  if(!['potion-craft','potion-totem'].includes(endpoint))throw new RangeError('Unknown potion endpoint');
  const source=potionSourceIdentity(root);
  const engine=new BalanceEngine({seed,mode:'accelerated',
    calibration:createPotionAcceleration(source.identity),maxHostMs:5000,maxSimulatedSeconds:86400,
    policyBoundaries:true,eventActions:['Start Journey','Continue On','Start Trek','Looping Potion',
      'Face Judgement','Fall From Grace','Purchase Supplies','Journey Forth','Totem']});
  engine.evaluate(`(() => {
    townsUnlocked.length=0;townsUnlocked.push(0,1,2,3,4,5,6);
    towns[5].expMeander=towns[5].expFromLevel(100);
    towns[6].expExploreJungle=towns[6].expFromLevel(50);
    towns[1].expForest=towns[1].expFromLevel(100);
    towns[1].expShortcut=towns[1].expFromLevel(100);
    towns[2].expCity=towns[2].expFromLevel(100);
    towns[3].expMountain=towns[3].expFromLevel(100);
    skills.Magic.levelExp.setLevel(200);skills.Practical.levelExp.setLevel(50);
    skills.Alchemy.levelExp.setLevel(200);skills.Spatiomancy.levelExp.setLevel(1);
    skills.Pyromancy.levelExp.setLevel(200);
    for(const stat of Object.values(stats))stat.talentLevelExp.setLevel(10000);
  })()`);
  const queue=[{name:'Start Journey',loops:1},{name:'Continue On',loops:1},
    {name:'Start Trek',loops:1},{name:'Looping Potion',loops:1},
    ...(endpoint==='potion-totem'?[{name:'Face Judgement',loops:1},
      {name:'Fall From Grace',loops:1},{name:'Purchase Supplies',loops:1},
      {name:'Journey Forth',loops:1},{name:'Totem',loops:1}]:[])];
  const admission=engine.edit({op:'replay',queue},{source:'synthetic potion checkpoint',
    policyVersion:POTION_INJECTION_SCHEMA});
  if(admission.status!=='admitted')throw new Error('Synthetic checkpoint admission failed: '+JSON.stringify(admission));
  engine.start();
  engine.evaluate('curTown=0;resources.herbs=400;resources.reputation=50;resources.gold=500;' +
    'resources.supplies=true;timeNeeded=1000000');
  let terminal=false;
  for(let step=0;step<1000&&!terminal;step++){
    engine.step({full:false});
    terminal=!!engine.evaluate(endpoint==='potion-craft'?'resources.loopingPotion':
      'getSkillLevel("Wunderkind")>=1&&!resources.loopingPotion');
  }
  const state=engine.evaluate(`({loopingPotion:!!resources.loopingPotion,
    wunderkind:getSkillLevel('Wunderkind'),portalOpened:!!storyFlags.portalOpened,
    herbs:resources.herbs})`);
  const exact=engine.events.filter(event=>event.type==='action_completed');
  return {schema:POTION_INJECTION_SCHEMA,kind:'synthetic_injected_checkpoint',endpoint,
    sourceRevision:source.identity,terminal,state,events:exact,
    simulatedGameplaySeconds:engine.lightweightObservation().time,
    diagnostics:{clock:engine.clock.snapshot(),model:engine.evaluate(`({explore:getExploreProgress(),restoration:getSkillLevel('Restoration'),
      stopped:gameIsStopped,timer,timeNeeded,gameTicksLeft,shouldRestart,
      selected:actions.currentAction?.name??null,next:actions.next.map(a=>({name:a.name,loops:a.loops})),
      current:actions.current.map(a=>({name:a.name,loopsLeft:a.loopsLeft,ticks:a.ticks}))})`)}};
}
