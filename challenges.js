// Stable, shared challenge policy (classic browser script and predictor Worker).
"use strict";

const normalChallengePolicy = Object.freeze({
    gameSpeed: 1,
    manaDrought: false,
    buyManaZ1CanStart: () => true,
    buyManaZ1ManaCost: () => 100,
    buyManaZ1GoldCost: normalCost => normalCost(),
    buyManaZ1Trade(gold, merchantMana, rate) {
        return {spentGold: gold, manaGain: gold * rate, merchantRemaining: merchantMana};
    },
    finishBuyManaZ1(action) {
        const trade = this.buyManaZ1Trade(resources.gold, totalMerchantMana, action.goldCost());
        addMana(trade.manaGain);
        if (this.manaDrought) {
            totalMerchantMana = trade.merchantRemaining;
            addResource("gold", -trade.spentGold);
        } else {
            resetResource("gold");
        }
    },
    buyManaZ3Visible: () => true,
    buyManaZ5Visible: () => true,
    selfCombat: normalSelf => normalSelf(),
    teamCombat: (self, zombie, team) => self() + zombie() + team(),
    restartTimeNeeded: initial => initial,
    updateCurrentLoopOnRestart: true,
    updateSnapshotOnRestart: true,
});
const challengePolicies = Object.freeze({
    0: normalChallengePolicy,
    1: Object.freeze({
        ...normalChallengePolicy,
        gameSpeed: 2,
        manaDrought: true,
        buyManaZ1CanStart: (available = totalMerchantMana) => available > 0,
        buyManaZ1ManaCost: () => 1,
        buyManaZ1GoldCost: () => 30,
        buyManaZ1Trade(gold, merchantMana, rate) {
            const spentGold = Math.min(gold, 300);
            const manaGain = Math.min(spentGold * rate, merchantMana);
            return {spentGold, manaGain, merchantRemaining: merchantMana - manaGain};
        },
        buyManaZ3Visible: () => false,
        buyManaZ5Visible: () => false,
    }),
    2: Object.freeze({
        ...normalChallengePolicy,
        selfCombat: (_normal, zombie, team) => Math.max(zombie(), team()) / 2,
        teamCombat: (_self, zombie, team) => zombie() + team(),
    }),
    3: Object.freeze({
        ...normalChallengePolicy,
        // Owner RF04-Q03 A: no clamp, including non-positive time budgets.
        restartTimeNeeded: (_initial, totalEffectiveTime) => 4320000 - totalEffectiveTime * 50,
        // Preserve the original mode-3 restart omissions.
        updateCurrentLoopOnRestart: false,
        updateSnapshotOnRestart: false,
    }),
});
function getActiveChallengeMode() {
    const mode = challengeSave.challengeMode;
    return Number.isInteger(mode) && mode >= 1 && mode <= 3 ? mode : 0;
}
function getChallengePolicy(mode = getActiveChallengeMode()) {
    return challengePolicies[mode] || normalChallengePolicy;
}
let previouslyLoadedChallengeMode = 0;
function loadChallenge() {
    const mode = getActiveChallengeMode();
    // The original modes 0/2/3 did not modify a manually selected game speed.
    // Reset it only when leaving Mana Drought's forced 2× speed.
    if (mode === 1) gameSpeed = 2;
    else if (previouslyLoadedChallengeMode === 1) gameSpeed = 1;
    previouslyLoadedChallengeMode = mode;
}
