import {resolve} from 'node:path';
import {loadGameModel} from '../load-game-model.mjs';
import {potionSourceIdentity} from './potion-runner.mjs';
import {actionTiming,configure,createPotionRequirementEstimate,fixedComponent,multipartComponent,
  progressComponent,section} from './potion-estimate.mjs';

export const CAMPAIGN_ESTIMATE_SCHEMA='rw00-calculated-campaign-estimate/v1';

export function createRouteAccessBaseline(){
  const model=loadGameModel({withViewStubs:true,rngSeed:42});
  configure(model,{skillLevels:{Alchemy:200,Spatiomancy:0,Pyromancy:200},
    townLevels:{'3:Mountain':100,'5:Meander':100,'6:ExploreJungle':50}});
  const shadow=model.evaluate(`(() => {const potion=towns[3].totalActionList
    .find(action=>action.name==='Looping Potion'),totem=towns[6].totalActionList
    .find(action=>action.name==='Totem');return {potionVisible:potion.visible(),
      potionUnlocked:potion.unlocked(),totemVisible:totem.visible(),totemUnlocked:totem.unlocked()};})()`);
  return {highReputation:{status:'calculated',requires:{Alchemy:200,Spatiomancy:1,Pyromancy:200,
      Meander:100,ExploreJungle:50}},shadow:{status:shadow.potionVisible?'calculated':'blocked',
      observed:shadow,reason:shadow.potionVisible?null:
        'Looping Potion is not visible without Spatiomancy; the current shadow route bypasses Valhalla College.'}};
}

function rewardComponent(model,{id,action,resource,target,profile,goal}){
  configure(model,profile);
  const reward=model.evaluate(`(() => {const action=towns.flatMap(t=>t.totalActionList)
    .find(a=>a.name===${JSON.stringify(action)});resources[${JSON.stringify(resource)}]=0;
    const before=resources[${JSON.stringify(resource)}];action.finish();
    return resources[${JSON.stringify(resource)}]-before;})()`);
  if(!(reward>0))throw new Error('Nonpositive resource reward for '+action);
  const timing=actionTiming(model,action,profile),count=Math.ceil(target/reward);
  return {id,kind:'reward',action,goal,count,reward:{resource,perAction:reward,target},...timing,
    adjustedTicksTotal:count*timing.adjustedTicks};
}

function minimumUnlockLevel(model,{action,town,varName,profile,max=1000}){
  configure(model,profile);
  return model.evaluate(`(() => {const town=towns[${town}],key='exp'+${JSON.stringify(varName)},
    action=towns.flatMap(t=>t.totalActionList).find(a=>a.name===${JSON.stringify(action)});
    for(let level=0;level<=${max};level++){let low=0,high=level?1:0;
      while(level&&(town[key]=high,town.getLevel(${JSON.stringify(varName)}))<level)high*=2;
      while(low+1<high){const mid=Math.floor((low+high)/2);town[key]=mid;
        if(town.getLevel(${JSON.stringify(varName)})>=level)high=mid;else low=mid;}
      town[key]=level?high:0;if(action.unlocked())return level;
    }throw new Error('Unlock level not found');})()`);
}

function surveyStoneOrigins(model,{targets,levels,profile}){
  configure(model,profile);
  return model.evaluate(`(() => {
    for(let index=0;index<towns.length;index++)towns[index]['expSurveyZ'+index]=0;
    towns[7].expSurveyZ7=100;resources.map=1e12;resources.completedMap=0;
    return ${JSON.stringify(targets)}.map((townNum,index)=>{
      const town=towns[townNum],action=town.totalActionList.find(a=>a.name==='SurveyZ'+townNum);
      setAdjustedTicks(action);let count=0,adjustedTicksTotal=0,guard=0;
      const target=${JSON.stringify(levels)}[index];while(town.getLevel('Survey')<target&&guard++<1000){
        const gain=getExploreSkill(),next=town.expFromLevel(town.getLevel('Survey')+1),
          batch=Math.ceil((next-town['expSurveyZ'+townNum])/gain);
        town['expSurveyZ'+townNum]+=batch*gain;count+=batch;
        adjustedTicksTotal+=batch*action.adjustedTicks;
      }
      if(guard>=1000)throw new Error('Survey origin estimate guard exceeded');
      return {id:'survey_z'+townNum,kind:'survey',action:'SurveyZ'+townNum,
        goal:'Survey town '+townNum+' 0→'+target,town:townNum,count,manaCost:action.manaCost(),
        adjustedTicks:action.adjustedTicks,statLevel:${profile.statLevel},
        globalExploreAfter:getExploreProgress(),adjustedTicksTotal};
    });
  })()`);
}

function summarize(sections,baseManaPerSecond){
  const adjustedTicks=sections.reduce((sum,item)=>sum+item.adjustedTicks,0),
    realSeconds=adjustedTicks/baseManaPerSecond;
  return {adjustedTicks,realSeconds,realHours:realSeconds/3600,realDays:realSeconds/86400,
    realYears:realSeconds/(365.25*86400)};
}

export function createRemainingCampaignEstimate({root=resolve(import.meta.dirname,'../..')}={}){
  const model=loadGameModel({withViewStubs:true,rngSeed:42}),baseManaPerSecond=model.evaluate('baseManaPerSecond');
  model.evaluate(`(() => {for(let trial=0;trial<trials.length;trial++){
    trials[trial].length=0;trials[trial].highestFloor=0;
    for(let floor=0;floor<trialFloors[trial];floor++)trials[trial].push({completed:0});
  }})()`);
  const jungle={statLevel:900},commerce={statLevel:1100},survey={statLevel:1400},
    thieves={statLevel:1600,thievesSegment:18,guildName:'Thieves',
      skillLevels:{Practical:1000,Thievery:500}},
    valley={statLevel:1900,skillLevels:{Magic:10000,Combat:50000,Pyromancy:10000,
      Restoration:10000,Leadership:1000},buffLevels:{Feast:100,Imbuement:500,
      Imbuement2:500,Imbuement3:7},resourceValues:{teamMembers:5,armor:100,enchantments:25}};
  const jungleEscapeLevel=minimumUnlockLevel(model,{action:'Escape',town:6,varName:'ExploreJungle',
      profile:jungle}),explorerLevel=minimumUnlockLevel(model,{action:'Explorers Guild',town:7,
      varName:'Excursion',profile:commerce}),thievesLevel=minimumUnlockLevel(model,
      {action:'Thieves Guild',town:7,varName:'Excursion',profile:commerce}),
    pickPocketsLevel=minimumUnlockLevel(model,{action:'Rob Warehouse',town:7,varName:'PickPockets',
      profile:thieves}),warehouseLevel=minimumUnlockLevel(model,{action:'Insurance Fraud',town:7,
      varName:'RobWarehouse',profile:thieves});
  const jungleFinish=[
    progressComponent(model,{id:'jungle_50_100',action:'Explore Jungle',town:6,
      varName:'ExploreJungle',from:50,to:jungleEscapeLevel,profile:jungle}),
    fixedComponent(model,{id:'escape',action:'Escape',profile:jungle})];
  const commerceBootstrap=[
    progressComponent(model,{id:'excursion_0_10',action:'Excursion',town:7,varName:'Excursion',
      to:explorerLevel,profile:commerce}),
    fixedComponent(model,{id:'explorers_guild',action:'Explorers Guild',profile:commerce})];
  const commerceGold=[
    progressComponent(model,{id:'excursion_10_25',action:'Excursion',town:7,varName:'Excursion',
      from:explorerLevel,to:thievesLevel,profile:commerce}),
    multipartComponent(model,{id:'thieves_guild_rank_s',action:'Thieves Guild',loops:6,
      profile:thieves,goal:'Thieves Guild segment 18'}),
    progressComponent(model,{id:'pick_pockets',action:'Pick Pockets',town:7,varName:'PickPockets',
      to:pickPocketsLevel,profile:thieves}),
    progressComponent(model,{id:'rob_warehouse',action:'Rob Warehouse',town:7,varName:'RobWarehouse',
      to:warehouseLevel,profile:thieves})];
  const keyGold=model.evaluate(`towns[7].totalActionList.find(a=>a.name==='Purchase Key').goldCost()`);
  const insurance=rewardComponent(model,{id:'million_gold',action:'Insurance Fraud',resource:'gold',
    target:keyGold,profile:thieves,goal:keyGold.toLocaleString('en-US')+' gold for the Valley key'});
  const key=[insurance,fixedComponent(model,{id:'purchase_key',action:'Purchase Key',profile:commerce}),
    fixedComponent(model,{id:'leave_city',action:'Leave City',profile:commerce})];
  const targets=model.evaluate(`towns.flatMap(t=>t.totalActionList).filter(a=>a.name.startsWith('RuinsZ'))
    .map(a=>a.townNum).sort((a,b)=>a-b)`),surveyLevels=targets.map(townNum=>
      minimumUnlockLevel(model,{action:'RuinsZ'+townNum,town:townNum,
        varName:'SurveyZ'+townNum,profile:survey})),
    surveys=surveyStoneOrigins(model,{targets,levels:surveyLevels,profile:survey}),
    towerTarget=minimumUnlockLevel(model,{action:'Gods Trial',town:8,varName:'BuildTower',profile:valley}),
    towerBands=targets.map((_,index)=>Math.round(towerTarget*(index+1)/targets.length));
  const stoneSections=targets.map((townNum,index)=>{
    const surveyLevel=surveyLevels[index],
      ruinProfile={...survey,townLevels:{[townNum+':SurveyZ'+townNum]:surveyLevel}},
      tower=progressComponent(model,{id:'tower_'+towerBands[index],action:'Build Tower',town:8,
        varName:'BuildTower',from:index?towerBands[index-1]:0,to:towerBands[index],profile:valley}),
      components=[surveys[index],
        progressComponent(model,{id:'ruins_z'+townNum,action:'RuinsZ'+townNum,town:townNum,
          varName:'RuinsZ'+townNum,to:1,profile:ruinProfile}),
        fixedComponent(model,{id:'haul_z'+townNum,action:'HaulZ'+townNum,count:tower.count,
          profile:ruinProfile,kind:'resource',goal:tower.count+' known-good temporal stones'}),
        tower];
    return section('C'+String(4+index).padStart(2,'0'),
      'Survey/ruins origin '+townNum+' and tower to '+towerBands[index]+'%',components,baseManaPerSecond);
  });
  const godsFloors=model.evaluate('trialFloors[1]'),challengeFloors=model.evaluate('trialFloors[2]'),
    godLimits=[0,.8,.9,.96,.98,.99,1].map(fraction=>Math.round(godsFloors*fraction))
      .filter((value,index,array)=>index===0||value>array[index-1]),
    godBands=godLimits.slice(1).map((to,index)=>[godLimits[index],to]).map(([from,to])=>
      multipartComponent(model,{id:'gods_trial_'+(from+1)+'_'+to,action:'Gods Trial',
        loops:to-from,fromLoop:from,profile:valley,
        goal:from+1===to?'Gods Trial floor '+to:'Gods Trial floors '+(from+1)+'–'+to})),
    challenge=multipartComponent(model,{id:'challenge_gods',action:'Challenge Gods',loops:challengeFloors,
      profile:valley,goal:challengeFloors+' Challenge Gods powers'}),
    restore=fixedComponent(model,{id:'restore_time',action:'Restore Time',profile:valley});
  const sections=[
    section('C01','Jungle 50–100 and Commerceville entry',jungleFinish,baseManaPerSecond),
    section('C02','Commerceville Explorer bootstrap',commerceBootstrap,baseManaPerSecond),
    section('C03','Commerceville Thieves route and Valley key',[...commerceGold,...key],baseManaPerSecond),
    ...stoneSections,
    ...godBands.map((component,index)=>section('C'+String(8+index).padStart(2,'0'),
      component.goal,[component],baseManaPerSecond)),
    section('C14','Challenge Gods powers and Restore Time',[challenge,restore],baseManaPerSecond)];
  return {schema:CAMPAIGN_ESTIMATE_SCHEMA,kind:'calculated_remaining_campaign',
    sourceRevision:potionSourceIdentity(root).identity,baseManaPerSecond,sections,
    ...summarize(sections,baseManaPerSecond),assumptions:{statLevels:{jungle:900,commerce:1100,
      survey:1400,thieves:1600,valley:1900},thievesGuildSegment:18,
      skills:valley.skillLevels,buffs:valley.buffLevels,resources:valley.resourceValues,
      stoneOrigins:targets,requirements:{jungleEscapeLevel,explorerLevel,thievesLevel,
        pickPocketsLevel,warehouseLevel,keyGold,towerTarget,godsFloors,challengeFloors}},caveats:[
      'Pure calculation using loaded production action, progress, reward, Survey, multipart and trial formulas.',
      'Known-good maps, stones and limited actions omit discovery failures and repeated-loop travel/economy overhead.',
      'Late combat, stats, buffs, party, armor and Thieves rank are explicit injected scenario assumptions.',
      'Optional guild, investment, shortcut and ritual comparisons are separate scenarios, not added to this route.']};
}

export function createFullCampaignEstimate({root=resolve(import.meta.dirname,'../..')}={}){
  const potion=createPotionRequirementEstimate({root}),remaining=createRemainingCampaignEstimate({root}),
    realSeconds=potion.realSeconds+remaining.realSeconds;
  return {schema:CAMPAIGN_ESTIMATE_SCHEMA,kind:'calculated_full_campaign',
    sourceRevision:remaining.sourceRevision,baseManaPerSecond:remaining.baseManaPerSecond,
    phases:{potion,remaining},variants:createRouteAccessBaseline(),realSeconds,
    realHours:realSeconds/3600,realDays:realSeconds/86400,
    realYears:realSeconds/(365.25*86400)};
}
