import {fingerprint} from './ui-inputs.mjs';

export const POTION_POLICY_VERSION = 'rw00-r01-potion/v1';
export const POTION_ENDPOINTS = Object.freeze(['potion-craft','potion-totem']);
export const POTION_SECTIONS = Object.freeze([
  'fresh_campaign','opening_mana_economy','forest_entry','forest_alchemy_and_herbs',
  'merchanton_entry','merchanton_preparation','mt_olympus_entry','judgement',
  'valhalla_training','spatiomancy_requirement_met','potion_requirements_complete',
  'looping_potion_crafted','jungle_entry','jungle_totem_unlocked',
  'looping_potion_used_at_totem'
]);

const CANDIDATES = Object.freeze([
  'Wander','Smash Pots','Pick Locks','Buy Mana Z1','Meet People','Train Strength',
  'Short Quest','Investigate','Long Quest','Warrior Lessons','Mage Lessons',
  'Heal The Sick','Fight Monsters','Small Dungeon','Haggle','Buy Supplies','Start Journey',
  'Explore Forest','Wild Mana','Gather Herbs','Old Shortcut','Talk To Hermit',
  'Practical Magic','Learn Alchemy','Follow Flowers','Clear Thicket','Continue On',
  'Explore City','Gamble','Buy Mana Z3','Adventure Guild','Read Books','Buy Pickaxe','Start Trek',
  'Climb Mountain','Mana Geyser','Decipher Runes','Chronomancy','Pyromancy',
  'Looping Potion','Face Judgement','Guided Tour','Canvass','Donate','Accept Donations',
  'Tidy Up','Buy Mana Z5','Wizard College','Restoration','Spatiomancy','Fall From Grace',
  'Meander','Mana Well','Purchase Supplies','Journey Forth','Explore Jungle','Totem'
]);

export const POTION_POLICY_ACTIONS = CANDIDATES;
export const POTION_POLICY_IDENTITY = fingerprint({version:POTION_POLICY_VERSION,actions:CANDIDATES});

const q = (name, loops, loopsType) => ({name,loops,...(loopsType?{loopsType}:{})});

function openingEconomy() {
  return [q('Wander',100),q('Smash Pots',200,'unchecked'),q('Pick Locks',200,'unchecked'),
    q('Buy Mana Z1',1),q('Meet People',200),q('Short Quest',200,'unchecked'),
    q('Investigate',200),q('Long Quest',200,'unchecked'),q('Buy Mana Z1',1),
    q('Warrior Lessons',100),q('Mage Lessons',100),q('Heal The Sick',30,'maxEffort'),
    q('Fight Monsters',30,'maxEffort'),q('Small Dungeon',10,'maxEffort')];
}

function forestTravel() {
  return [q('Long Quest',80,'knownGood'),q('Buy Mana Z1',1),q('Haggle',16),
    q('Buy Supplies',1),q('Start Journey',1)];
}

function forestWork() {
  return [q('Explore Forest',300),q('Wild Mana',500,'unchecked'),
    q('Gather Herbs',1000,'unchecked'),q('Old Shortcut',300),q('Talk To Hermit',300),
    q('Practical Magic',300),q('Learn Alchemy',1000),q('Follow Flowers',300),
    q('Clear Thicket',300)];
}

function routeToOlympus() {
  return [...forestTravel(),q('Explore Forest',20),q('Wild Mana',200,'knownGood'),
    q('Gather Herbs',1000,'knownGood'),q('Continue On',1),q('Explore City',300),
    q('Gamble',100,'unchecked'),q('Buy Mana Z3',1),q('Adventure Guild',20,'maxEffort'),
    q('Read Books',200),q('Buy Pickaxe',1),q('Start Trek',1)];
}

function mountainWork() {
  return [q('Climb Mountain',500),q('Mana Geyser',500,'unchecked'),q('Decipher Runes',500),
    q('Chronomancy',500),q('Pyromancy',1000)];
}

function valhallaWork() {
  return [q('Face Judgement',1),q('Guided Tour',500),q('Canvass',300),q('Donate',100),
    q('Accept Donations',200,'unchecked'),q('Tidy Up',20,'maxEffort'),q('Buy Mana Z5',1),
    q('Wizard College',1,'maxEffort'),q('Restoration',500),q('Spatiomancy',500),
    q('Fall From Grace',1)];
}

function startingtonWork() {
  return [q('Meander',800),q('Mana Well',500,'unchecked'),q('Purchase Supplies',1),
    q('Journey Forth',1),q('Explore Jungle',500),q('Totem',1)];
}

export function readPotionPolicyState(engine) {
  return JSON.parse(JSON.stringify(engine.evaluate(`(() => {
    const names=${JSON.stringify(CANDIDATES)};
    const all=towns.flatMap(t=>t.totalActionList);
    const action=Object.fromEntries(names.map(name=>{const a=all.find(x=>x.name===name);
      return [name,a?{town:a.townNum,type:a.type,visible:!!a.visible(),unlocked:!!a.unlocked(),
        accessible:a.townNum===0||townsUnlocked.includes(a.townNum)}:null]}));
    const level=(town,name)=>towns[town].getLevel(name);
    return {resources:{...resources},townsUnlocked:[...townsUnlocked],curTown,
      levels:{wander:level(0,'Wander'),met:level(0,'Met'),secrets:level(0,'Secrets'),
        forest:level(1,'Forest'),shortcut:level(1,'Shortcut'),hermit:level(1,'Hermit'),
        flowers:level(1,'Flowers'),city:level(2,'City'),mountain:level(3,'Mountain'),
        runes:level(3,'Runes'),tour:level(4,'Tour'),canvassed:level(4,'Canvassed'),
        meander:level(5,'Meander'),jungle:level(6,'ExploreJungle')},
      progressExp:{wander:towns[0].expWander,met:towns[0].expMet,secrets:towns[0].expSecrets,
        forest:towns[1].expForest,shortcut:towns[1].expShortcut,hermit:towns[1].expHermit,
        flowers:towns[1].expFlowers,city:towns[2].expCity,mountain:towns[3].expMountain,
        runes:towns[3].expRunes,tour:towns[4].expTour,canvassed:towns[4].expCanvassed,
        meander:towns[5].expMeander,jungle:towns[6].expExploreJungle},
      skills:Object.fromEntries(Object.entries(skills).map(([k,v])=>[k,v.levelExp.level])),
      skillExp:Object.fromEntries(Object.entries(skills).map(([k,v])=>[k,v.levelExp.exp])),
      limited:{goodPots:towns[0].goodPots,checkedPots:towns[0].checkedPots,
        totalPots:towns[0].totalPots,goodLocks:towns[0].goodLocks,
        checkedLocks:towns[0].checkedLocks,totalLocks:towns[0].totalLocks,
        goodShort:towns[0].goodSQuests,checkedShort:towns[0].checkedSQuests,
        totalShort:towns[0].totalSQuests,
        goodWild:towns[1].goodWildMana,checkedWild:towns[1].checkedWildMana,
        totalWild:towns[1].totalWildMana,
        goodGamble:towns[2].goodGamble,checkedGamble:towns[2].checkedGamble,
        totalGamble:towns[2].totalGamble,
        goodHerbs:towns[1].goodHerbs,checkedHerbs:towns[1].checkedHerbs,
        totalHerbs:towns[1].totalHerbs,goodLong:towns[0].goodLQuests,
        checkedLong:towns[0].checkedLQuests,totalLong:towns[0].totalLQuests},storyFlags:{...storyFlags},
      persistent:{towns:towns.map(t=>Object.fromEntries(Object.entries(t).filter(([k,v])=>
          typeof v==='number'&&/^(exp|checked|good|total)/.test(k)))),
        stats:Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,{exp:v.levelExp?.exp,
          talentExp:v.talentLevelExp?.exp,soulstone:v.soulstone}])),
        skills:Object.fromEntries(Object.entries(skills).map(([k,v])=>[k,v.levelExp?.exp])),
        buffs:Object.fromEntries(Object.entries(buffs).map(([k,v])=>[k,v.amt])),
        storyFlags:{...storyFlags},storyVars:{...storyVars},townsUnlocked:[...townsUnlocked],
        completedActions},
      totals:{...totals},loopingPotion:!!resources.loopingPotion,
      suppliesCost:towns[0].suppliesCost,
      wunderkind:getSkillLevel('Wunderkind'),action};
  })()`)));
}

function legalize(recipe, state) {
  const seenTravel=new Set();
  return recipe.filter(item=>{
    const a=state.action[item.name];
    if(!a||!a.accessible||!a.visible||!a.unlocked)return false;
    if(['Start Journey','Continue On','Start Trek','Face Judgement','Fall From Grace',
      'Journey Forth'].includes(item.name)){
      if(seenTravel.has(item.name))return false;seenTravel.add(item.name);
    }
    return true;
  });
}

export function choosePotionPolicy(state, endpoint='potion-totem') {
  if(!POTION_ENDPOINTS.includes(endpoint))throw new RangeError('Unknown potion endpoint');
  let phase,reason,recipe;
  if(state.wunderkind>=1){phase='complete';reason='observed first successful Totem reward';recipe=[];}
  else if(state.loopingPotion){phase='carry_potion';reason='potion crafted; continue legal travel to Totem';
    recipe=[...routeToOlympus(),...mountainWork(),...valhallaWork(),...startingtonWork()];}
  else if(state.skills.Spatiomancy>=1&&state.skills.Alchemy>=200&&state.levels.meander>=100){
    phase='craft_and_totem';reason='all persistent craft and Jungle access prerequisites earned';
    recipe=[...routeToOlympus(),q('Looping Potion',1),...mountainWork(),...valhallaWork(),...startingtonWork()];
  }else if(state.townsUnlocked.includes(5)){
    phase='startington';reason='Startington earned; progress Meander and Jungle route';
    recipe=[...routeToOlympus(),...mountainWork(),...valhallaWork(),...startingtonWork()];
  }else if(state.townsUnlocked.includes(4)){
    phase='valhalla';reason='Valhalla earned; train College, Spatiomancy and Pyromancy';
    recipe=[...routeToOlympus(),...mountainWork(),...valhallaWork()];
  }else if(state.townsUnlocked.includes(3)){
    phase='olympus';reason='Mt. Olympus earned; progress Mountain, Runes and positive Judgement';
    recipe=[...routeToOlympus(),...mountainWork(),...valhallaWork()];
  }else if(state.townsUnlocked.includes(2)){
    phase='merchanton';reason='Merchanton earned; progress City and prepare Mt. Olympus entry';
    const longGold=Array.from({length:state.limited.goodLong},(_,index)=>index===state.limited.goodLong-1?
      [q('Long Quest',1,'knownGood')]:[q('Long Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat();
    const prefix=[q('Smash Pots',state.limited.goodPots,'knownGood'),
      ...Array.from({length:state.limited.goodShort},()=>
        [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),...longGold,
      q('Heal The Sick',1,'maxEffort'),q('Haggle',15),q('Buy Supplies',1),q('Start Journey',1),
      q('Wild Mana',state.limited.goodWild,'knownGood'),q('Continue On',1)];
    const gambleUnchecked=Math.max(0,state.limited.totalGamble-state.limited.checkedGamble);
    const gamble=gambleUnchecked?[q('Gamble',gambleUnchecked,'unchecked')]:
      state.limited.goodGamble?[q('Gamble',Math.min(5,state.limited.goodGamble),'knownGood')]:[];
    recipe=[...prefix,...(state.levels.city<90?[q('Explore City',100)]:[]),...gamble,
      ...(state.levels.city>=90?[q('Buy Pickaxe',1),q('Start Trek',1)]:[])];
  }else if(state.townsUnlocked.includes(1)){
    phase='forest';reason='Forest earned; train Alchemy, herbs and onward travel';
    const potsUnchecked=Math.max(0,state.limited.totalPots-state.limited.checkedPots);
    if(potsUnchecked)recipe=[q('Smash Pots',potsUnchecked,'unchecked')];
    else{
      const journey=[q('Smash Pots',state.limited.goodPots,'knownGood'),
        ...Array.from({length:state.limited.goodShort},()=>
          [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),
        ...Array.from({length:state.limited.goodLong},()=>
          [q('Long Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),
        q('Heal The Sick',1,'maxEffort'),q('Haggle',15),q('Buy Supplies',1),q('Start Journey',1)];
      const wildUnchecked=Math.max(0,state.limited.totalWild-state.limited.checkedWild);
      const forestMana=wildUnchecked?[q('Wild Mana',wildUnchecked,'unchecked')]:
        state.limited.goodWild?[q('Wild Mana',state.limited.goodWild,'knownGood')]:[];
      const herbsUnchecked=Math.max(0,state.limited.totalHerbs-state.limited.checkedHerbs);
      const herbs=herbsUnchecked?[q('Gather Herbs',herbsUnchecked,'unchecked')]:
        state.limited.goodHerbs?[q('Gather Herbs',Math.min(30,state.limited.goodHerbs),'knownGood')]:[];
      recipe=[...journey,...(state.levels.forest<100?[q('Explore Forest',100)]:[]),...forestMana,
        ...(state.levels.shortcut<100?[q('Old Shortcut',100)]:[]),
        ...(state.levels.hermit<100?[q('Talk To Hermit',100)]:[]),
        ...((state.skills.Practical??0)<50?[q('Practical Magic',50)]:[]),...herbs,
        ...(state.skills.Alchemy<200?[q('Learn Alchemy',3)]:[]),
        ...(state.skills.Alchemy>=200?[q('Continue On',1)]:[])];
    }
  }else{
    phase='opening';reason='fresh route requires mana economy, skills and first travel';
    const potsUnchecked=Math.max(0,state.limited.totalPots-state.limited.checkedPots);
    const locksUnchecked=Math.max(0,state.limited.totalLocks-state.limited.checkedLocks);
    const mana=potsUnchecked?[q('Smash Pots',potsUnchecked,'unchecked')]:
      [q('Smash Pots',Math.max(1,state.limited.goodPots),'knownGood')];
    const locks=locksUnchecked?[q('Pick Locks',locksUnchecked,'unchecked')]:
      [q('Pick Locks',1,'knownGood')];
    const cash=[...mana,...locks,q('Buy Mana Z1',1)];
    const shortBuys=Array.from({length:Math.min(5,state.limited.goodShort)},()=>
      [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat();
    const reputationMana=[...shortBuys,q('Long Quest',1,'knownGood'),q('Buy Mana Z1',1),
      q('Long Quest',1,'knownGood'),q('Buy Mana Z1',1)];
    if(state.levels.wander<30)recipe=[q('Wander',1)];
    else if(state.levels.wander<60)recipe=[...mana,q('Wander',100)];
    else if(state.levels.met<25)recipe=[...mana,q('Meet People',100)];
    else if(state.levels.secrets<20)recipe=[...cash,q('Investigate',100)];
    else if((state.skills.Combat??0)+(state.skills.Magic??0)<35){
      if(state.levels.wander<60)recipe=[...mana,q('Wander',100)];
      else if(state.limited.checkedShort<state.limited.totalShort)recipe=[...mana,
        q('Short Quest',state.limited.totalShort-state.limited.checkedShort,'unchecked')];
      else if(state.limited.checkedLong<state.limited.totalLong)recipe=[...mana,
        q('Long Quest',state.limited.totalLong-state.limited.checkedLong,'unchecked')];
      else recipe=[...mana,...reputationMana,
        q((state.skills.Combat??0)<(state.skills.Magic??0)?'Warrior Lessons':'Mage Lessons',3)];
    }
    else if((state.skills.Magic??0)<60)recipe=[...mana,...reputationMana,q('Mage Lessons',10)];
    else if(state.levels.wander<100)recipe=[...mana,q('Wander',100)];
    else if(state.levels.met<100)recipe=[...mana,q('Meet People',100)];
    else if(state.limited.checkedShort<state.limited.totalShort)recipe=[...mana,
      q('Short Quest',state.limited.totalShort-state.limited.checkedShort,'unchecked')];
    else if(state.levels.secrets<60)recipe=[...mana,
      ...Array.from({length:state.limited.goodShort},()=>
        [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),q('Investigate',100)];
    else if(state.limited.checkedLong<state.limited.totalLong)recipe=[...mana,
      ...Array.from({length:state.limited.goodShort},()=>
        [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),
      q('Long Quest',state.limited.totalLong-state.limited.checkedLong,'unchecked')];
    else recipe=[...mana,
      ...Array.from({length:state.limited.goodShort},()=>
        [q('Short Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),
      ...Array.from({length:state.limited.goodLong},()=>
        [q('Long Quest',1,'knownGood'),q('Buy Mana Z1',1)]).flat(),
      q('Heal The Sick',1,'maxEffort'),q('Haggle',15),q('Buy Supplies',1),q('Start Journey',1)];
  }
  const queue=legalize(recipe,state);
  return {policyVersion:POTION_POLICY_VERSION,policyIdentity:POTION_POLICY_IDENTITY,
    phase,reason,queue,endpoint};
}
