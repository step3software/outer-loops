import {BalanceEngine} from './engine.mjs';
import {createPotionAcceleration,potionSourceIdentity} from './potion-runner.mjs';

export const POTION_ESTIMATE_SCHEMA='rw00-potion-estimate/v1';
export const POTION_INJECTION_SCHEMA='rw00-synthetic-potion-checkpoint/v1';

const totalExp=level=>level*(level+1)*50;
const actionsFor=(level,expPerAction)=>Math.ceil(totalExp(level)/expPerAction);

export function createPotionRequirementEstimate(){
  const actions={
    learnAlchemy:actionsFor(200,50),
    pyromancy:actionsFor(200,100),
    restoration:actionsFor(1000,100),
    spatiomancy:actionsFor(1,100),
    climbMountain:Math.ceil(totalExp(100)/100),
    decipherRunes:Math.ceil(totalExp(60)/100),
    exploreCavern:Math.ceil(totalExp(80)/100),
    checkWalls:Math.ceil(totalExp(5)/100),
    guidedTour:Math.ceil(totalExp(60)/100),
    canvass:Math.ceil(totalExp(100)/50),
    exploreJungleTo75:Math.ceil(totalExp(75)/20),
    jungleHerbsForPotion:400
  };
  const mana={
    alchemyLessonsAtHermit100:actions.learnAlchemy*2500,
    pyromancyAtRunes60:actions.pyromancy*9800,
    restorationBeforeCollegeBonus:actions.restoration*15000,
    spatiomancyBeforeCollegeBonus:actions.spatiomancy*20000,
    jungleExplorationTo75:actions.exploreJungleTo75*25000,
    terminalActions:50000+30000+30000
  };
  const nominalMana=Object.values(mana).reduce((sum,value)=>sum+value,0);
  const nominalGameplaySecondsAtBaseRate=nominalMana/50;
  return {schema:POTION_ESTIMATE_SCHEMA,kind:'calculated_estimate',actions,mana,nominalMana,
    nominalGameplaySecondsAtBaseRate,
    nominalGameplayDaysAtBaseRate:nominalGameplaySecondsAtBaseRate/86400,
    nominalGameplayYearsAtBaseRate:nominalGameplaySecondsAtBaseRate/(365.25*86400),
    dominantCost:'Restoration 1000 accounts for '+
      (mana.restorationBeforeCollegeBonus/nominalMana*100).toFixed(1)+'% of included nominal mana.',
    caveats:['Excludes prerequisite Survey, Imbuement, resource discovery, travel and economy work.',
      'Stat/talent multipliers and Wizard College reduce actual gameplay time.',
      'This estimate is not an earned fresh-campaign timing measurement.']};
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
