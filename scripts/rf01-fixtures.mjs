// RF01 synthetic-only save mutations used by an isolated Chromium profile.
// These are *reconstructed* legacy shapes, NOT historical player-save exports.
// The baseline comes from doSave() in a fresh disposable browser profile.
export function makeRf01Fixtures(baseline) {
    const clone = () => structuredClone(baseline);
    const current=clone();
    current.expWander=400;
    current.townsUnlocked=[0,1];
    current.nextList=[{name:'Wander',loops:2,disabled:false,loopsType:'actions'}];

    const pre75=clone();
    delete pre75.version75; // triggers older dungeon-completion reconstruction
    delete pre75.townsUnlocked;
    pre75.maxTown=3;
    pre75.expWander=600;
    pre75.totalSDungeon=8;
    pre75.nextList=[
        {name:'Train Dex',loops:1,disabled:false},
        {name:'Sell Gold',loops:1,disabled:false}
    ];
    pre75.loadouts[0]=[{name:'Train Dex',loops:1,disabled:false}];
    pre75.storyReqs.loopingPotionMade=true;

    const earlyAliases=clone();
    delete earlyAliases.extraOptions;
    earlyAliases.townsUnlocked=[0,1,2];
    earlyAliases.expWander=800;
    earlyAliases.goldInvested=4000;
    earlyAliases.nextList=[
        {name:'Tournament',loops:1,disabled:false},
        {name:'Purchase Mana',loops:1,disabled:false}
    ];
    earlyAliases.loadouts[0]=[{name:'Purchase Mana',loops:1,disabled:false}];

    const challenge=clone();
    challenge.challengeSave={challengeMode:2,inChallenge:true};
    challenge.expWander=100;
    return {
        current:{label:'synthetic-current-ILSV01',value:current},
        pre75:{label:'synthetic-pre-version75-maxTown-aliases',value:pre75},
        earlyAliases:{label:'synthetic-early-aliases-and-investment',value:earlyAliases},
        challenge:{label:'synthetic-challenge-slot',value:challenge},
        malformed:[
            {label:'synthetic-truncated-json',value:'{"nextList":'},
            {label:'synthetic-wrong-top-level',value:'{"stats":[],"buffs":null}'},
        ],
    };
}
