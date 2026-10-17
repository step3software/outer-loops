# Upgrade-tree mechanics contract — implementation questions and invariants

**Status:** **Proposed design guardrails**, not implemented API or finalized balance. This document supports both [three-tree recommendation](upgrade-trees.md) and [four-tree Dominion alternative](dominion-alternative.md). All player-visible node names/tiers remain provisional.

## 1. Define the boundaries before inventing node effects

Outer Loops has three reset scopes. Upgrade behavior must name the one it changes.

| Boundary | Trigger | Examples of current life cycle | What trees may eventually change |
| --- | --- | --- | --- |
| **Ordinary inner loop** | `restart()` or equivalent run boundary | Temporary gold/mana, active queued actions, run timer; some experience/town progress retained | Pivot charge replenishment, ordinary-loop Treasury, Echo goal schedule |
| **New timeline / outer prestige** | Explicit "Start New Timeline" after Real World unlock | Reset a chosen set of once-per-timeline skills, town progress, trials/story and inner-world economy | Memory selections, owned permanents, nexus-owned resources, selected Economic/Structures entitlements |
| **Nexus persistent state** | Never automatically on a loop/timeline reset | First meeting/unlock, ability ownership, archived timelines, roster and accepted grants | Should only be changed by explicit purchases/achievements or a separately safeguarded hard reset |

In the current **as-coded** game, dmchurch prestige resets progress and preserves specific buffs; that is **not** an already implemented version of this new contract. See [legacy transition](legacy-transition.md), [state and saving](../../state-and-saving.md) and [RF02](../../refactoring/RF02-persistence-safety.md).

### Node effects must declare

A proposed ability should be specifiable with stable ID; displayed tree and name; unlock prerequisites; earned/purchased/granted source; persisted owner; action during an inner loop; action during new timeline reset; whether an alternate self is required; refund/rollback policy; repeatability/cap; and evidence that it does something existing abilities *cannot already do*.

Do not hard-code ownership to the UI tree number. Categorization may change from **Anchors/Treasury** to **Dominion** without changing an owned perk.

## 2. Conceptual definition of ability records

This is a documentation model, **not approved JSON/JS serialization**:

```text
Ability:
  id: stable semantic key (e.g. "will.pivot")
  displayTree: "Will" | "Echoes" | "Anchors" | "Memory" | "Dominion"
  group: intervention | automation | knowledge | treasury | structures | synergy
  prerequisites: explicit earned mastery and/or owned ability keys
  grant: first-free | earned | purchased | special challenge (undecided)
  lifetime: persistent nexus ownership
  activeRules: explicit effect and use/recharge boundary
  limits: charges, cost, cap, applicable actions/zones, replay lifetime
  predictedEffects: deterministic evaluation without real writes
  uiControls: discoverability, feedback, pause/override
  migration: old save/legacy prestige entitlement treatment
```

**IDs are examples, not a request to add globals.** In three-tree UI, `memory.anchored_memory` and `economy.timeless_treasury` can both display under Anchors. In four-tree UI, they display under Memory and Dominion respectively. Their persistent ownership and costs must not change just because the navigation grouping does.

**Shared nexus purchasing economy:** at most one standard persistent progression currency/advancement ledger initially. It must not be confused with `resources.gold`; old `prestigeCurrentPoints` are legacy entitlements, not automatically spendable new currency. Optional unique challenge/story unlocks are non-fungible achievements, not a second duplicate prestige shop.

## 3. First-choice behavior examples and non-examples

### Will — Pivot

**Difference from existing game:** Original action queue code distinguishes planned `Actions.next` and running `Actions.current`; ordinary loadout editing already exists. The first Will node must therefore alter **not-yet-executed work of the actual current loop** in a way that the default player cannot already do. Before implementation, characterize any existing mid-run editing shortcuts to avoid selling a no-op.

**Valid example:** The player pauses in an early run, invokes one charge, changes the remaining *legal* action suffix (e.g. skip a failed training strategy and use an achievable route) and continues without restarting. Completed rewards and already spent mana stay spent. If the suggested route needs a different town or lacks resources, the game refuses or constructs explicit legal travel actions.

**Not valid:** Giving extra progress from actions never performed; rewinding both the timer and permanent resource accrual; changing future loadout only; bypassing a quest's `canStart` gate.

**Engineering constraints:** actions' current/next copies, loop counts, queued travel, `getNextValidAction` eligibility, limited-item modes, multipart completion, predictor snapshots, pause/restart, UI refresh and save/reload. Pivot's charge and its *already-invoked* state need deterministic owner and reset policy.

### Echoes — First Apprentice

**Difference from existing game:** Current loadouts and repeated action counts are *fixed* plans. First Apprentice is a **conditional objective with feedback**.

**Valid example:** The player selects a known recipe's required-herb quantity. The Echo adds **only legal existing actions** until the target is satisfied, with a clear stop reason and maximum loop/action budget. If herbs cannot be gathered or travel is inaccessible, it stops and notifies rather than continuing indefinitely.

**Not valid:** Producing herbs out of thin air, assuming unexplored routes, running a full independent worker simulation for every NPC, ignoring cost/zone restrictions or silently performing unlimited work while offline.

**Engineering constraints:** explicit read-only planning state; action eligibility/predicate purity ([RF03](../../refactoring/RF03-gameplay-rules-and-resources.md)); action queue ordering; limits; state changes and cancellation; predictor worker; deterministic outcomes. Later delegated self abilities can be modeled as jobs with bounded resource/time budgets without running multiple game engines.

### Anchors / Memory — Anchored Memory

**Difference from existing game:** A saved action preset retains a *plan*, but a true Memory ability retains a bounded item of **earned world mastery** as initial state of the *next timeline*.

**Valid example:** a carefully whitelisted completed discovery/progress record survives one new-timeline reset and is visible in the new run; ordinary progress not selected still resets under its established lifetime. Exact candidate must be tested for unlocking consistency.

**Not valid:** marking all towns/quests completed, retaining every skill, bypassing normal survey bootstrap or granting prior challenge rewards again.

**Engineering constraints:** old `saving.js` dynamic ```exp<varName>``` / `townsUnlocked` / `storyFlags` keys, action identity, town progress initialization, eligibility recomputation, migration, predictor state and story presentation. A remembered milestone must not be applied twice on reload or re-award achievement currency.

### Dominion / Anchors Treasury — Timeless Treasury

**Difference from existing game:** Original gold and most resources reset on an ordinary inner loop; there are late-game investment mechanics. Treasury explicitly creates a **bounded persistent reserve/starting-capital policy** with chosen lifetime.

**Valid example:** a fixed-cap reserve survives specified ordinary restarts; the player chooses when to withdraw a finite amount, which then participates in the **normal** Buy Mana economics. The reserve is not replenished automatically by simply restarting unless there is a separately earned/upgraded income rule.

**Not valid:** "All gold and profits compound without limit across ordinary loops," "10× world gold," automatic unlimited refunds at reset, reusing the same stored reserve on multiple snapshots simultaneously, or unbounded offline minting.

**Engineering constraints:** `resources.gold`, `addResource`/`resetResources`, merchant-conversion `goldCost`, normal investment `goldInvested` and `Collect Interest`, mode/variant rules, serialization, duplicate-award prevention and numeric overflow bounds. Per-timeline transfers demand their own later ability and stronger constraints.

## 4. Rewinds, forks and checkpoints require an anti-exploit model

High-tier Will (**Temporal Anchor**, **Fixed Point**, **Master of Moments**) sounds exciting but is much more invasive than Pivot.

Before implementing any rollback/branch ability, define:

1. **Snapshot scope:** exactly which inner-loop/timeline fields are reverted. Permanent nexus ownership, unique unlocks, challenge completions, earned outer currency and archive history must **not be rewound into multiple awardable copies**.
2. **Commit semantics:** at most **one branch's rewards** become real. Other simulated approaches are previews or discarded candidates.
3. **Cost/charge semantics:** intervention charges and rare activation costs cannot be restored by reverting to a snapshot from before they were spent.
4. **Side effects:** no save/Google writes, UI notifications, achievement events or material economic payouts during speculative replay. Prediction is read-only from the authoritative world perspective.
5. **Performance:** snapshot depth and branching cannot grow without bound; no mandatory 10× faster real-time clicking to choose outcomes.

This area should be a **later standalone engineering milestone**, not secretly bundled with the first three starter perks. The original `Data` snapshot/predictor system is not automatically a safe transactional rewind API.

## 5. Automation requires a finite contract

Every automated objective (early or late) should expose: target, whitelisted action set, known zones, resource/time budget, priority, stop condition, failure condition, progress feedback, cancellation, alternate-self assignment (if applicable), persistence boundary, and deterministic simulator behavior.

**Mastery is a gate:** players should demonstrate an activity at least once manually, or meet another explicit recorded unlock, before the Echo can automate it. The exact mastery definition is open. Autopilot should not invalidate story triggers, progression credit, or first-time player choices.

**At ~10× replay:** Conditional routines should reduce missed opportunities and queue busywork. Avoid a design that adds more attention-demanding interruptions than it removes.

## 6. Tree shape, affordability and economy

The proposed trees are **branches, not level ladders**. A meaningful early ability may unlock a small cluster of alternatives; cross-tree synergies can require capabilities from multiple paths. The UI must explain prerequisites, changed game rules and whether a selected ability is permanently owned.

### Recommended safeguards

- Do not make **automatic ~10×** a required first purchase or a node in Will.
- Do not force an irreversible class choice: an initial one-of-three or one-of-four **free starter** is provisional. There is no commitment that later purchases cannot access other branches.
- Avoid a "gain more nexus currency" effect that becomes a dominant obligatory opener.
- Avoid one branch scaling purely from NPC unlock counts and another from statistics; balance by **player choices/options** unlocked rather than raw button quantity.
- Delay high-end compound investments, entire-timeline automation and outcome selection until second-run playtests establish the loop's pacing.
- Use **one source of truth for ability ownership**, rather than parallel branch level, character rank, prestige buff and town state counts that independently grant the same power.
- Make cross-tree synergy eligibility insensitive to the *display taxonomy* if the project later adopts Dominion as a fourth tree.

## 7. Specific future test matrix (none currently implemented)

| Test ID | Test | Expected proof |
| --- | --- | --- |
| UT01 | Three-tree first choice on a newly restored synthetic save | Exactly one free starting ability if approved, all alternatives still available later, no duplicate grant on revisit |
| UT02 | Four-tree taxonomy on the **same** owned-ability records | Memory/Treasury ownership and effect unchanged; only displayed grouping differs |
| UT03 | ~10× replay with any/all first-node choices | Baseline automatic speed does not come from a node, action costs/gates still correct |
| UT04 | Pivot use while paused, resumed, after failed action and after restart | Current loop changes once; past costs/rewards are unchanged; charge expires/resets correctly |
| UT05 | Pivot vs unupgraded queue controls | Concrete functionality is newly unlocked, not just an alias for preexisting queue editing |
| UT06 | First Apprentice conditional herb target, impossible target and zone constraint | Stops exactly, honors legal actions and budgets; manual override and predictor parity work |
| UT07 | Anchored Memory whitelist with new timeline reset, refresh and migration | Selected legitimate progress retained once, other timeline state reset, story/survey gates coherent |
| UT08 | Treasury gold deposit/withdrawal/ordinary reset/full timeline reset | Exact capped reserve accounted once, no gold→mana multiplication or invalid numeric state |
| UT09 | Rewind/fork replay vs snapshot and unique award | At most one branch committed, no permanent/challenge currency duplication |
| UT10 | Echoes+Anchors workshop and Will+Echoes intervention | Bounded action/resource accounting and clear pause/notification behavior |
| UT11 | Three→four display taxonomy migration | IDs, purchases, price history, save data and first grant preserved; synergies remain eligible |
| UT12 | Late-game automation/performance at accelerated speed | No uncontrolled lag, offline accumulation exploit, duplicate completion or worker divergence |
| UT13 | Veteran legacy prestige/challenge import | Old entitlements preserved through agreed conversion, no dual shop or invisible stacking |
| UT14 | Different player approaches to timeline two | Active, automation and persistence/economic picks each have a measurable distinct benefit |

These supplement [Real World validation](validation.md) and the [RF01–RF06 regression plan](../../refactoring/validation-matrix.md). No test named `UTxx` is currently checked into the repository.

## 8. Decisions required before node implementation

1. **Tree count:** three (recommended) or four (Dominion alternative), and whether player-facing branch grouping can change later.
2. **First grant:** exact single-free choice vs another early unlock scheme, availability of other trees and any refundable choice.
3. **Will Pivot semantics:** one-use/charges, permissible live edits, validation and restart boundary.
4. **Echo mastery rules:** what is already "known" and what conditions may control actions.
5. **Memory whitelist:** exactly which progress can cross a full timeline reset without breaking gating or stories.
6. **Treasury reset scopes/caps:** ordinary loop vs timeline, withdrawal, initial capital and gold/mana scaling.
7. **Nexus advancement:** currency name, earning, purchase prices and veteran entitlement conversion; no default conversion of old 90-point grants.
8. **High-tier branch semantics:** checkpoint/fork anti-duplication and maximum delegated work.
9. **Cross-tree nodes:** which few ship first and whether unlocks cost shared advancement, story achievements, or both.

Any implementation must also have [RF01 characterization](../../refactoring/RF01-regression-coverage.md), [RF02 safe import/reset](../../refactoring/RF02-persistence-safety.md), predictor parity and an accepted schema/design decision as applicable. Design documentation does **not** authorize code changes.
