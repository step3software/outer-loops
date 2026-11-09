# ADR-002: Stable challenge mode policy dispatcher

- **Status:** Proposed (owner-approved RF04 design; implementation verification pending)
- **Date:** 2026-11-08
- **Decision owners:** Project owner — RF04-Q01 A, RF04-Q02 A, RF04-Q03 A
- **Related PR:** [RF04 draft implementation #21](https://github.com/step3software/outer-loops/pull/21)
- **Milestone:** [RF04](../refactoring/RF04-challenge-rule-isolation.md)

## Context

Before RF04, `loadChallenge()` replaced callbacks on Buy Mana Z1/Z3/Z5, global combat methods and `restart`. The browser reload used on challenge exit incidentally discarded those overrides. The predictor Worker did not import the challenge script and its own challenge state differed from the saved game. Legacy normal/challenge saves and RF02 protected import/recovery must survive the refactor.

## Decision

Keep one policy dispatcher in existing `challenges.js` as selected by owner RF04-Q02 A. Both browser and predictor Worker load it after `saving.js`, before `predictor.js`. `getActiveChallengeMode()` and `getChallengePolicy(mode)` read a mode 0–3 policy without replacing any function or Action object. The stable `restart`, `getSelfCombat`, `getTeamCombat`, Buy Mana Z1 and Buy Mana Z3/Z5 callbacks delegate to policies when called.

Forecasts send numeric `challengeMode` and current merchant budget in **forecast-only** `runData.state.resources`; background execution uses those fields instead of an unsnapshotted Worker-global `challengeSave`. The predictor cache identity also includes those inputs. No persisted save schema or live typed resource field is added.

RF04-Q01 A preserves all three legacy challenges as a compatibility layer. Mana Drought retains 2× speed, 1 mana cost, 30 mana/gold, the per-purchase 300 gold bound, merchant budget and *visibility-only* hiding of Z3/Z5. Noodle Arms retains `max(zombie,team)/2` self combat and `zombie+team` team combat. RF04-Q03 A preserves Mana Burn's original `4320000 - totals.effectiveTime * 50` exactly, even at zero or negative time, and its absence of normal-only `currentLoop` and `Data.updateSnapshot` restart operations.

## Alternatives and consequences

| Alternative | Benefit | Cost / risk |
| --- | --- | --- |
| Preserve three modes through stable policy (selected) | Compatible with existing saved players and RF05 boundaries | Legacy logic survives until later Real World work |
| Replace with future Real World variants | Less interim compatibility work | Changes accepted RF04 scope and legacy gameplay |
| New standalone policy file | Dedicated separation | Extra classic-script and Worker ordering without evidence of need |
| Clamp non-positive Mana Burn time | Smoother late-game loop behavior | Unapproved balance and restart change |

The design keeps an explicit interface for future modifications, but a real Worker snapshot, foreground forecast, lifecycle tests and independent verification are still required. See [RF04 evidence](../refactoring/rf04-evidence.md). An ADR proposal/PR is not a milestone completion, release or merge grant.
