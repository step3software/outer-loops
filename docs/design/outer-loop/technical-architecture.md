# Real World — preliminary technical architecture

**Status:** Proposed architecture, no code implemented. The **separate outer layer** is approved product direction; exact class names/files, serialization layout and speed formula are recommendations awaiting review. Coordinate with [RF01–RF06](integration-with-refactoring.md).

## Why this should not be `townNum = 9`

The existing game represents its nine regions with `townNames`, `initializeTowns` (0–8), `TownList<9>`, `SurveyZ0..8`, numeric travel deltas (`getTravelNum`), UI zone panels in `index.html`, action registrations and predictor worker imports. A tenth ordinary town would entangle a supposedly transcendent nexus with normal intra-loop progress and resource resets.

**Proposed separation:** Real World is its own **scene/metagame layer**. It is entered by a newly unlocked transition **after** `Action.RestoreTime`, not by `Action.OpenPortal` and not from the queue's ordinary travel arithmetic. Existing `Action.*` IDs and all nine inner-world town indices remain unchanged.

## Model: explicit state lifetimes

| Lifetime | Examples | Reset when |
| --- | --- | --- |
| **One inner loop** | `resources`, `timer`, `curTown`, current action segments, some stats | Normal `restart()` |
| **One timeline** | Existing town progress, talents, skills, buffs, action/loadout development, story state, dungeon/trial history, the ability to reach Restore Time | Player **explicitly starts another timeline** using a validated reset transaction |
| **Outer nexus** | First restoration, first-visit flags, alternate selves, permanent upgrades, unlocked variants, automation ownership, completed timeline summaries | **Never** on normal restart or timeline reset; only explicit hard reset under separate safeguards |
| **Temporary UI session** | Open panel, conversation focus, animations, hover/camera | View transition/reload as appropriate |

This table is conceptual. **Existing dmchurch `prestigeValues` / `buffs` cross the old prestige boundary differently** and must be reconciled by a planned, versioned transition. Similarly, saved queue templates may be outer "knowledge" or timeline-bound—do not decide their new lifetime as an incidental technical choice.

## Proposed outer state (illustrative, not a production schema)

```js
outerState = {
  schemaVersion: 1,
  unlocked: false,
  firstRestorationRecorded: false,
  firstNexusVisitSeen: false,
  firstConversationSeen: false,
  replayAccelerationUnlocked: false, // automatic once a NEW timeline begins
  timelineCounter: 0,
  activeTimelineId: null,
  archives: [],        // bounded summaries, not necessarily full save snapshots
  ownedUpgrades: [],   // stable upgrade IDs with separate config
  selves: [],          // stable identity, origin and earned capabilities
  assignments: [],    // future bounded tasks; not a full game simulation
  challengeUnlocks: [],
  migration: {
    version: 0,
    legacyEntitlementSnapshot: null
  }
}
```

**Important:** The draft field names express boundaries, not final code. The old `ILSV01` format and browser/cloud persistence need a compatibility plan. A single validated serialization envelope is generally easier to keep consistent than unrelated outer/timeline localStorage keys, but the final data layout must be decided with RF02. If separate keys are chosen, establish explicit atomicity-like recovery semantics because `localStorage` cannot commit multiple keys atomically.

## New state transitions (design contract)

```text
INNER PLAY
   │
   └─ RestoreTime finish (once for an eligible timeline)
       └─ record restoration and unlock new Real World threshold
            └─ player explicitly crosses threshold
                 └─ Real World first encounter (once)
                      ├─ inspect/return to previous timeline
                      ├─ view/choose permanent abilities
                      └─ confirm NEW TIMELINE
                           ├─ archive/record previous timeline
                           ├─ persist permanent nexus state and entitlements
                           ├─ reset precisely timeline-scoped progress
                           ├─ apply owned outer benefits / selected variant
                           └─ start inner loop with ~10× baseline rate
```

Proposed rule: **Completing Restore Time, entering the nexus and choosing a new timeline must be separate, idempotent events.** A player should not get duplicate rewards by refreshing, crossing the portal twice or executing Restore Time again in the same completed timeline. The player should be able to leave/return without automatically resetting until the new-timeline confirmation.

`Action.RestoreTime.finish` currently calls `completedCurrentGame()`, which grants old currency. The implementation must replace or adapt that hook *deliberately*, preserving the existing story unlock and once-per-completion guard without layering the old 90-point shop underneath the new system.

## Speed model — approximately 10×, but preserve causality

Existing `driver.js` has multiple mechanisms:

- `gameSpeed` (default 1) scales wall-clock budget conversion to game ticks.
- `getSpeedMult` combines Dark Ritual, Chronomancy, Imbue Soul and existing prestige effects.
- `bonusSpeed` and `totalOfflineMs` account for offline/bonus-seconds behavior.
- `timeCounter` is real elapsed game session seconds; `effectiveTime` is a separately scaled in-world clock.
- `Action.Escape.canStart` checks `effectiveTime < 60`, and challenge mode 3 derives its restart budget using `totals.effectiveTime`.
- `executeGameTicks` also has a per-frame budget and lag fallback; multiplying throughput may trigger saturation or alter offline-credit bookkeeping.

**Design invariant:** On equivalent action sequences, ~10× faster wall-clock execution for *eligible subsequent timelines* should produce the **same in-world action costs, mana budget, quest progression, story gates and effective-time conditions** as the original game at comparable in-world progress. Differences should only be intentional outer upgrades or chosen variant rules. Explicitly test chronological gates near 60 effective seconds, offline bonuses, large queues, pause/resume and predictor worker parity.

**Recommendation:** track "free outer replay acceleration" as an **explicit, persisted outer permission/policy**, separate from `PrestigeChronomancy` and temporary offline boosts. Exactly how that policy affects driver math must be determined by fixture-backed tests; do not blindly set `gameSpeed=10` without checking clock, challenge and worker semantics. Do not increase XP per action or make 10× more spendable mana in the *same* logical inner loop.

## Ability identity and branch presentation

The [three-tree recommendation](upgrade-trees.md) is Will/Echoes/Anchors, with Memory/Treasury/Structures under Anchors. The [four-tree alternative](dominion-alternative.md) separates Memory and Dominion. **Persisting UI tree indices, not specific stable ability keys, would turn that choice into a risky save migration.** Proposed stable ID families: `will.*`, `echoes.*`, `memory.*`, `economy.*` and `structures.*`. These are examples, not a committed schema.

Every effect needs an **explicit reset boundary**: Will charges usually belong to an inner loop, Echo goals may belong to a current loop or timeline but their *unlocks* persist, and Memory/Treasury/Structures can cross selected timeline boundaries in tightly specified ways. A bounded Treasury reserve is not ordinary `resources.gold` and must be debited exactly once when withdrawn.

Early Will **Pivot** must modify the not-yet-executed **current** action schedule in a way the existing `Actions.next` editing cannot; new game logic cannot claim a feature that is already free. Echoes **First Apprentice** must have read-only eligibility and a deterministic goal/stop condition. Higher-tier rollback/fork synergies must never duplicate nexus advancements or achievement rewards; the predictor's existing snapshots are not automatically a safe transaction framework. See [upgrade-tree contracts](upgrade-tree-contracts.md).

## Predictor and automation contracts

`predictor.js` and `predictor-worker.js` must read the same *immutable* outer upgrade selection and timeline rules as the live game. A prediction should not award currencies, spawn selves, consume a real upgrade purchase or archive a timeline. Snapshots/reversion must include relevant derived modifiers without writing to permanent state.

Automation is not synonymous with hiding ticks. Early action-template reuse should construct legal `Actions.next` entries and honor existing action `canStart`, zone spans, costs and loop limits. Later conditional and delegated work needs an explicit deterministic policy and offline accounting model; no full concurrent worker for every self is assumed.

## Saving, player-data safety and rollback

`saving.js` currently builds `doSave()`, stores `idleLoops1` and `idleLoopsChallenge`, exports `ILSV01`, and migrates a number of historical fields. `prestigeConfirmation` also handles a `prestigeBackup` key. The new system may require cross-timeline archives and veteran migration, so **RF01 synthetic fixtures and RF02 validation-first backup recovery are direct prerequisites to irreversible reset/save work**.

Before implementation:
1. Define precise outer, timeline, session and UI lifetimes.
2. Decide whether the new system extends existing export JSON with optional fields or uses a new schema/envelope, with backward-compatibility/rollback guarantees.
3. Define per-timeline completion idempotency and veteran legacy mapping; never invent a conversion rate.
4. Test incomplete, corrupted and challenge-active old saves; protect both save slots and existing `prestigeBackup`.
5. Ensure previous versions either safely ignore new optional fields or reject them without corrupting the save, according to a documented compatibility policy.
6. Plan how a live timeline can be retained/archived and whether "return" means full playable saved state or viewing a summary (unresolved RW-Q06).

## Integration / minimal touchpoint inventory

| Current source | Later implementation concern |
| --- | --- |
| `actionList.js` `Action.RestoreTime` | Completion event and optional portal unlock; do not confuse `Action.OpenPortal` |
| `prestige.js` | Old grant/reset/effects and veterans' earned purchases; no duplicate prestige shops |
| `challenges.js` | Legacy mode overrides; if kept, rebuild behind new timeline policy |
| `saving.js` | Outer state, migration, new reset lifetime, archives, export/import, idempotency |
| `driver.js` | Free replay acceleration, effective-time semantics, normal restart |
| `stats.js`, `actions.js` | Upgrades, valid queues, resource/predicate behavior |
| `data.js`, `predictor.js`, `predictor-worker.js` | Snapshot/reference identity, worker parity and read-only metagame during forecast |
| `index.html`, `views/*`, `localization.js`, `lang/en-EN/game.xml` | Separate scene, portal, first dialogue, navigation, upgrade menus, credits |
| `google.js` | Optional cloud save versioning and future integration; never use real accounts for tests |

## Architecture decision needed

A reviewed ADR should specify: authoritative outer/timeline saved state; completion and portal event boundary; reset semantics; 10× clock and predictor policy; compatibility with veteran prestige/challenge data; and rollback. No such ADR is adopted simply by this conceptual design.
