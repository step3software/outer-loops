# RF04 — Challenge rule isolation

- **Status:** Planned — approved scope; implementation not authorized
- **Priority:** After RF03
- **Hard dependencies:** RF01 challenge-mode characterization, RF02 challenge save boundaries, RF03 pure gameplay rule APIs
- **Enables:** A stable action/runtime surface for RF05, fewer cross-system cases for RF06
- **Primary implementation handoff:** [RF04](handoffs/RF04.md)

## Objective

Replace challenge-specific **global function/Action method replacement** with explicit, stable rules selected from game context, while preserving the behavior and storage separation of all three existing challenge modes. The refactor is about lifecycle reliability, not rebalancing or introducing a new challenge.

## Source-confirmed current behaviors

`challenges.js` `loadChallenge` contains three switch branches:

| Mode | Existing modifications to preserve | Key sources |
| --- | --- | --- |
| **1** | Sets `gameSpeed = 2`; overwrites `Action.BuyManaZ1.canStart`, `manaCost`, `goldCost` and `finish`; prevents Buy Mana Z3/Z5 visibility. The Z1 converter uses merchant-mana availability, a per-use gold spending bound and current `totalMerchantMana`. | `challenges.js`, `actionList.js`, `driver.js` |
| **2** | Replaces global `getSelfCombat` and `getTeamCombat` functions; combat depends on max(zombie/team) and combines zombie + team strength. | `challenges.js`, `stats.js` |
| **3** | Replaces global `restart`; run duration is based on `4320000 - totals.effectiveTime * 50` and reset logic differs from normal mode. | `challenges.js`, `driver.js` |

`saving.js` `load`/`doLoad` apply `loadChallenge` after restoring state; `beginChallenge`, `resumeChallenge` and `exitChallenge` coordinate separate `idleLoopsChallenge` and `idleLoops1` slots, with a reload on exit. The current `predictor-worker.js` import list does **not** include `challenges.js`. Challenge-state propagation and worker behavior must therefore be examined deliberately rather than assumed.

## Scope

1. Introduce an **explicit challenge context / policy surface** for economy, combat, available actions and restart budgeting, with stable top-level function references. The exact policy API/file layout requires a reviewed design/ADR.
2. Preserve mode 0 baseline and all mode 1/2/3 formulas, action availability, ability to queue/execute, story implications, failure/stop conditions, and **separate slot** lifecycle.
3. Make mode selection deterministic at initialization and after import/exit; avoid stale closures, reused overrides or behavior from a previously active challenge.
4. Ensure the predictor (foreground and worker) sees the same challenge mode and parameters; keep `Data` snapshots and any global virtualization coherent.
5. Change only callers necessary to retire function overwrites, preserving existing public functions/callback contracts to the extent possible.

## Explicitly out of scope

Adding or removing challenges, adjusting difficulty, changing the 2× speed, merchant gold/mana conversion, combat formulas, restart time budget, save format, or UI aesthetics. Do not modify default gameplay just to make challenge policies convenient.

## Acceptance criteria

- **A1:** All three modes reproduce characterized RF01 player-visible actions, resource conversion, combat and restart outcomes for the same seeded fixtures (with explicit numeric tolerance where required).
- **A2:** Global `restart`, `getSelfCombat`, `getTeamCombat` and `Action.BuyManaZ1` method identities do not change when selecting, loading, exiting or resuming challenges. Branch-specific calculations instead dispatch through documented rule policies.
- **A3:** Starting a challenge writes only the intended challenge slot, preserves the regular save, enforces existing overwrite confirmation, and resumes correctly. Exiting restores default-game rules with no stale challenge state, including after browser reload.
- **A4:** Mode 1 reaches exactly the expected gold/mana result and `totalMerchantMana` balance at zero, low and high amounts, and appropriately hides Buy Mana Z3/Z5.
- **A5:** Mode 2 self/team/zombie combat values match original formulas for zero and nonzero teams/zombies plus buffs and prestige modifiers.
- **A6:** Mode 3 duration and looping match the original for representative `totals.effectiveTime` values, with a documented decision for any problematic non-positive budget boundary; no accidental changes to normal restart or prestige.
- **A7:** Foreground and worker predictions use identical selected challenge policies and match actual outcomes for representative short queues. Snapshot restores do not change the active mode unexpectedly.
- **A8:** Tests cover mode 0 → mode 1 → normal, 0 → 2 → normal, 0 → 3 → normal, and challenge reload/import/resume. All existing CI and browser smoke pass.

## Proposed implementation slices

1. Capture **immutable baseline outputs** for each mode using RF01 F06/F07 and F13. Include the current `loadChallenge` identity changes so that future tests intentionally assert stable identities only **after** refactoring.
2. Design policy ownership. Prefer a small context-selected rule object/dispatcher to proliferating `if (challengeMode)` branches across dozens of actions; do not instantiate an additional game engine.
3. Replace mode 1 action formula/availability overrides, mode 2 combat dispatch and mode 3 restart strategy sequentially; test each in isolation.
4. Reconcile regular mode restoration, challenge slots, predictor-worker dependencies, `Data` snapshots and UI menus. Remove the old monkey-patch path only after parity.
5. Update source maps, architecture/ADR, handoff evidence and any new test fixtures.

## Risks and rollout

A reload currently clears overwritten code. A policy-based version may change mode within one page lifecycle, which creates subtle differences if caches and queues are not reset. Do not change this user-visible transition policy without explicitly validating it. Mode 3 touches time accounting, so a "clean" generic restart could be wrong. Keep source implementation reversible and demonstrate migration-free rollback of user saves.

RF05 may start once the stable challenge contracts and model parity tests have landed, and the action-registration/order baseline is known. Separate instruction and PR required; no merge during planning.
