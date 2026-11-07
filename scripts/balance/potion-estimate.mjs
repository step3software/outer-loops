import {BalanceEngine} from './engine.mjs';
import {createPotionAcceleration,potionSourceIdentity} from './potion-runner.mjs';
import {loadGameModel} from '../load-game-model.mjs';
import {resolve} from 'node:path';

export const POTION_ESTIMATE_SCHEMA='rw00-potion-estimate/v1';
export const POTION_INJECTION_SCHEMA='rw00-synthetic-potion-checkpoint/v1';

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

function progressComponent(model,{id,action,town,varName,to,profile}){
  configure(model,profile);
  const gain=model.evaluate(`(() => {const town=towns[${town}],action=towns.flatMap(t=>t.totalActionList)
    .find(a=>a.name===${JSON.stringify(action)});town['exp'+${JSON.stringify(varName)}]=0;
    const before=town['exp'+${JSON.stringify(varName)}];action.finish();
    return {required:town.expFromLevel(${to}),perAction:town['exp'+${JSON.stringify(varName)}]-before};})()`);
  if(!(gain.perAction>0))throw new Error('Nonpositive progress gain for '+action);
  const timing=actionTiming(model,action,profile),count=Math.ceil(gain.required/gain.perAction);
  return {id,kind:'progress',action,goal:varName+' 0→'+to,count,xp:gain,...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function fixedComponent(model,{id,action,count=1,profile}){
  const timing=actionTiming(model,action,profile);
  return {id,kind:'fixed',action,goal:count+' completion'+(count===1?'':'s'),count,...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function surveyComponents(model,{statLevel=1400,bands=[25,50,75]}={}){
  configure(model,{statLevel});
  return model.evaluate(`(() => {
    for(let index=0;index<towns.length;index++)towns[index]['expSurveyZ'+index]=0;
    towns[0].expSurveyZ0=towns[0].expFromLevel(1);resources.map=1e9;resources.completedMap=0;
    const bands=${JSON.stringify(bands)},result=bands.map((to,index)=>({id:'survey_'+to,
      kind:'survey',action:'Survey',goal:'mean Survey '+(index?bands[index-1]:1)+'→'+to,
      count:0,adjustedTicksTotal:0,statLevel:${statLevel}}));let guard=0;
    while(getExploreProgress()<bands.at(-1)&&guard++<5000){
      let town=towns.reduce((best,item)=>item.getLevel('Survey')<best.getLevel('Survey')?item:best,towns[0]);
      const before=getExploreProgress(),action=town.totalActionList.find(a=>a.name==='SurveyZ'+town.index);
      setAdjustedTicks(action);const gain=getExploreSkill(),varName='expSurveyZ'+town.index,
        next=town.expFromLevel(town.getLevel('Survey')+1),count=Math.ceil((next-town[varName])/gain),
        band=Math.max(0,bands.findIndex(limit=>before<limit));
      town[varName]+=count*gain;result[band].count+=count;
      result[band].adjustedTicksTotal+=count*action.adjustedTicks;
    }
    if(guard>=5000)throw new Error('Survey estimate guard exceeded');return result;
  })()`);
}

function section(id,label,components,baseManaPerSecond){
  const adjustedTicks=components.reduce((sum,item)=>sum+item.adjustedTicksTotal,0);
  const realSeconds=adjustedTicks/baseManaPerSecond;
  return {id,label,components,adjustedTicks,realSeconds,realHours:realSeconds/3600,realDays:realSeconds/86400};
}

export function createPotionRequirementEstimate({root=resolve(import.meta.dirname,'../..')}={}){
  const model=loadGameModel({withViewStubs:true,rngSeed:42}),baseManaPerSecond=model.evaluate('baseManaPerSecond');
  const early={statLevel:100},forest={statLevel:180,townLevels:{'1:Hermit':100}},
    olympus={statLevel:350,townLevels:{'3:Runes':60},skillLevels:{Magic:200}},
    valhalla={statLevel:500},collegeA={statLevel:650,collegeSegment:24},
    collegeB={statLevel:800,collegeSegment:36},collegeC={statLevel:950,collegeSegment:45},
    late={statLevel:1200,buffLevels:{Imbuement:100}};
  const foundations=[
    progressComponent(model,{id:'wander',action:'Wander',town:0,varName:'Wander',to:100,profile:early}),
    progressComponent(model,{id:'meet',action:'Meet People',town:0,varName:'Met',to:100,profile:early}),
    progressComponent(model,{id:'secrets',action:'Investigate',town:0,varName:'Secrets',to:60,profile:early}),
    progressComponent(model,{id:'forest',action:'Explore Forest',town:1,varName:'Forest',to:100,profile:forest}),
    progressComponent(model,{id:'shortcut',action:'Old Shortcut',town:1,varName:'Shortcut',to:100,profile:forest}),
    progressComponent(model,{id:'hermit',action:'Talk To Hermit',town:1,varName:'Hermit',to:100,profile:forest}),
    skillComponent(model,{id:'alchemy',action:'Learn Alchemy',skill:'Alchemy',to:200,profile:forest})];
  const mountain=[
    progressComponent(model,{id:'mountain',action:'Climb Mountain',town:3,varName:'Mountain',to:100,profile:olympus}),
    progressComponent(model,{id:'runes',action:'Decipher Runes',town:3,varName:'Runes',to:60,profile:olympus}),
    skillComponent(model,{id:'pyromancy',action:'Pyromancy',skill:'Pyromancy',to:200,profile:olympus}),
    progressComponent(model,{id:'cavern',action:'Explore Cavern',town:3,varName:'Cavern',to:80,profile:olympus}),
    progressComponent(model,{id:'illusions',action:'Check Walls',town:3,varName:'Illusions',to:5,profile:olympus})];
  const social=[
    progressComponent(model,{id:'tour',action:'Guided Tour',town:4,varName:'Tour',to:60,profile:valhalla}),
    progressComponent(model,{id:'canvass',action:'Canvass',town:4,varName:'Canvassed',to:100,profile:valhalla})];
  const restorationA=[skillComponent(model,{id:'restoration_a',action:'Restoration',skill:'Restoration',
    to:577,profile:collegeA})];
  const restorationB=[skillComponent(model,{id:'restoration_b',action:'Restoration',skill:'Restoration',
    from:577,to:816,profile:collegeB})];
  const restorationC=[skillComponent(model,{id:'restoration_c',action:'Restoration',skill:'Restoration',
    from:816,to:1000,profile:collegeC}),skillComponent(model,{id:'spatiomancy',action:'Spatiomancy',
      skill:'Spatiomancy',to:1,profile:collegeC})];
  const startington=[
    progressComponent(model,{id:'meander',action:'Meander',town:5,varName:'Meander',to:100,profile:late}),
    progressComponent(model,{id:'jungle',action:'Explore Jungle',town:6,varName:'ExploreJungle',to:75,profile:late})];
  const surveys=surveyComponents(model,{statLevel:1400,bands:[21,34,46,56,66,75]});
  const terminal=['Open Portal','Looping Potion','Totem'].map(name=>fixedComponent(model,
    {id:name.toLowerCase().replaceAll(' ','_'),action:name,profile:{statLevel:1500,collegeSegment:45}}));
  const sections=[section('S01','Foundations through Wizard College access',
    [...foundations,...mountain,...social],baseManaPerSecond),
    section('S02','Wizard College: Restoration 0–577',restorationA,baseManaPerSecond),
    section('S03','Wizard College: Restoration 577–816',restorationB,baseManaPerSecond),
    section('S04','Restoration 816–1000, Spatiomancy, Startington, and Jungle',
      [...restorationC,...startington],baseManaPerSecond),
    ...surveys.map((items,index)=>section('S'+String(index+5).padStart(2,'0'),
      index===surveys.length-1?'Final Survey, portal, potion, and Totem':items.goal,
      index===surveys.length-1?[items,...terminal]:[items],baseManaPerSecond))];
  const realSeconds=sections.reduce((sum,item)=>sum+item.realSeconds,0),
    positive=sections.map(item=>item.realSeconds).filter(value=>value>0).sort((a,b)=>a-b),
    median=positive[Math.floor(positive.length/2)];
  return {schema:POTION_ESTIMATE_SCHEMA,kind:'calculated_estimate',sourceRevision:potionSourceIdentity(root).identity,
    baseManaPerSecond,sections,realSeconds,realDays:realSeconds/86400,realYears:realSeconds/(365.25*86400),
    balance:{sectionCount:sections.length,minToMedian:positive[0]/median,
      maxToMedian:positive.at(-1)/median,maxToMin:positive.at(-1)/positive[0]},
    assumptions:{statLevels:{early:100,forest:180,olympus:350,valhalla:500,
      restorationEarly:650,restorationMiddle:800,restorationLate:950,
      startington:1200,survey:1400,terminal:1500},
      wizardCollegeSegments:{restorationEarly:24,restorationMiddle:36,restorationLate:45},
      imbuementForMeander:100},
    caveats:['Pure calculation using production action costs, progress rewards, XP curves, stat multipliers and College bonus.',
      'Representative stat levels and College ranks are explicit scenario assumptions, not an earned-route replay.',
      'Resource discovery, gold/reputation/map acquisition and multipart College entry are outside these section totals.']};
}

export function runInjectedPotionEndpoint({root,endpoint='potion-totem',seed=42}={}){
  if(!['potion-craft','potion-totem'].includes(endpoint))throw new RangeError('Unknown potion endpoint');
  const source=potionSourceIdentity(root);
  const engine=new BalanceEngine({seed,mode:'accelerated',
    calibration:createPotionAcceleration(source.identity),maxHostMs:5000,maxSimulatedSeconds:86400,
    policyBoundaries:true,eventActions:['Open Portal','Looping Potion','Totem']});
  engine.evaluate(`(() => {
    townsUnlocked.length=0;townsUnlocked.push(0,1,2,3,4,5,6);
    for(let index=0;index<towns.length;index++)towns[index]['expSurveyZ'+index]=towns[index].expFromLevel(75);
    towns[5].expMeander=towns[5].expFromLevel(100);
    towns[6].expExploreJungle=towns[6].expFromLevel(75);
    towns[1].expForest=towns[1].expFromLevel(100);
    towns[2].expCity=towns[2].expFromLevel(100);
    towns[3].expMountain=towns[3].expFromLevel(100);
    skills.Alchemy.levelExp.setLevel(200);skills.Spatiomancy.levelExp.setLevel(1);
    skills.Restoration.levelExp.setLevel(1000);skills.Pyromancy.levelExp.setLevel(200);
    for(const stat of Object.values(stats))stat.talentLevelExp.setLevel(10000);
  })()`);
  const queue=[{name:'Open Portal',loops:1},{name:'Continue On',loops:1},
    {name:'Start Trek',loops:1},{name:'Looping Potion',loops:1},
    ...(endpoint==='potion-totem'?[{name:'Face Judgement',loops:1},
      {name:'Journey Forth',loops:1},{name:'Totem',loops:1}]:[])];
  const admission=engine.edit({op:'replay',queue},{source:'synthetic potion checkpoint',
    policyVersion:POTION_INJECTION_SCHEMA});
  if(admission.status!=='admitted')throw new Error('Synthetic checkpoint admission failed: '+JSON.stringify(admission));
  engine.start();
  engine.evaluate('curTown=6;resources.herbs=400;resources.reputation=-50;' +
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
