# Real World roadmap — build the first loop, then evolve

**Status:** Proposed development sequence, not a committed release schedule or implementation authorization. The product direction in [decisions](decisions.md) is approved; exact milestone boundaries and effort estimates are subject to design and RF readiness review.

## Design tenet

**The first publicly playable Outer Loop must be more than a portal and a pretty room.** On the very first successful return to Beginnersville, the player should already be running around 10× faster **and** have access to meaningful new capabilities. Build a narrow but complete second-playthrough loop before adding multiverse-scale complexity.

| Phase | Goal | Player-visible outcome | Readiness / acceptance |
| --- | --- | --- | --- |
| **RW00 — Contract and test preparation** | Characterize potion acquisition, both reputation routes, independent Valley pacing, timeline entry and first-rerun entitlement semantics | No player-visible behavior change | RF01/RF02 protection, real potion/Totem flags, [campaign balance test plan](balance-tests-implementation-plan.md), free 10×/boost and points contracts |
| **RW01 — Potion arrival and alternate Beginnersville (internal)** | Explicit potion drinking, several visible alternate selves, first guide conversation and small explorations | A self recognizes the newcomer in a familiar changed village; no forced reset | First visit once, safe return/save, no Town#9, original Valley and credits preserved |
| **RW02 — First empowered rerun (minimum releasable)** | Initial skill points, substantial temporary boost, permanent free ~10× speed, enduring capability and safe new-timeline transition | A dramatically different first replay without full future systems unlocked | One-time grants, expiry/stacking, migration, worker/timekeeping parity, recoverable reset |
| **RW03 — Reveal advanced upgrades and first useful self** | Contextual new upgrade choices and bounded companion/delegation tasks | The guide-self can eventually help without removing core strategy | Mastery limits, safe eligibility, deterministic automation and clear UI |
| **RW04 — Divergent timeline challenges** | Add selected thematic variant rules and unique rewards/selves | Choosing a challenge meaningfully changes strategy and expands the nexus | Optional variants, separate activation context, safe challenge transition; old separate menu absent |
| **RW05 — Parties and multi-self management** | Grow distinct selves into small selectable parties and coordinated timeline activities | Parties become a meaningful later stage of progress, not a starting roster dump | Bounded roles, resource/performance limits, safe save and recovery |
| **RW06–RW07 — Keys and Wagers (separate proposals)** | [Draft PR #9](https://github.com/step3software/outer-loops/pull/9) documents later key-modified runs and will/will-not wagers; not adopted into this branch | Discover them gradually after the first rerun | Keep review/implementation independent of early village mechanics |
| **[RW08 — Incremental Timeline Bosses](RW08.md)** | Reuse Valley's god fights as a foundation for deterministic, scaling incremental bosses across timelines | Solve through improving stats, resources and legal action queues; no real-time combat or parties | Characterized old trial behavior, bounded pacing, safe persistence and predictor parity |
| **ART — Pixel-art workstream (parallel)** | Establish style bible from nexus; later apply to inner world | Cohesive, legible two-character nexus scene and expanded game presentation | Controlled asset scope, readable UI, responsive/reduced motion, asset rights documented |

**RW00–RW02** form the first target development effort. RW01 may be demoed internally as a narrative prototype, but should **not** be shipped to ordinary players without its first empowered rerun and safe state transitions.

## Endgame direction and pacing gate

On 2026-11-06 the owner selected **a retained, shorter Valley of Olympus** as a future campaign-wide rebalance. The [RW00 campaign pacing test plan](balance-tests-implementation-plan.md) still measures the unchanged nine-zone game before proposing section time budgets. No numeric tower, gods trial or potion balance changes are approved.

**The Real World gateway is now independent of that Valley ending.** Drinking the recreated Looping Potion brings the player to an alternate Beginnersville, whether or not they have completed `RestoreTime`. The old post-`RestoreTime` portal approach is superseded in [decisions](decisions.md#selected-entry-and-valley-direction--2026-11-06). Preserve the Valley's own gods, tower, story, rewards and credits as meaningful ordinary-world content.

Both high-reputation Valhalla and shadow/Startington routes must have fair access to the potion gateway; current Spatiomancy gating and existing Totem/Wunderkind potion consumption are separate implementation contracts. The historical [potion and Valley research](potion-and-endgame-options.md) remains source evidence, not an instruction to delete zone 8. Pacing tests and this documentation are not authorizations to rewrite gameplay.

## Proposed detailed first slice: RW01 + RW02

### Potion and first arrival (RW01)

- **Recreate and deliberately drink the Looping Potion.** A new player-controlled use enters Real World rather than the existing Jungle Totem use; exact eligibility and access route are not yet decided.
- **Arrive in an altered Beginnersville,** inhabited by multiple alternate selves, without replacing normal `Town(0)` or adding `Town(9)`.
- **Be greeted.** One other self notices the player is new, approaches and gives a short, characterful orientation without explaining everything.
- **Explore briefly.** A few available interactions and returning dialogue build intrigue before the new-timeline button.
- **Preserve progress.** No automatic timeline reset, forced Valley completion, duplicate grant or irreversible loss occurs just from potion arrival.
- **Keep Valley independent.** `RestoreTime` and the original ending/credits remain accessible and worthy of completing, but are not needed to reach Real World.

### First replay

- The player explicitly chooses **Start New Timeline** with a clear reset/retention preview and recoverable backup.
- The first new timeline provides **initial allocatable skill points** and a **large temporary boost**. Point types, sources, effect strength, duration and repeatability are open design choices, not implemented grants.
- Automatic **~10× replay acceleration** is permanent, free and separate from that boost. The temporary bonus must not silently compound into a runaway time multiplier.
- The player gains at least one meaningful long-term upgrade decision over the early Real World experience; the three-tree versus four-tree architecture remains unresolved.
- Legacy prestige, challenge-active saves and the original Valley ending are handled safely, with no double reward for repeated potion use, reload or old `RestoreTime`.
- Further capabilities, other selves, variants, keys, wagers and parties are revealed *later* rather than requiring a full metagame tutorial on arrival.

### Exit criteria for minimum releasable version

**Narrative:** The player drinks a potion, enters an uncanny Beginnersville among other selves, is greeted as a newcomer and has a reason to explore; Valley is not the gateway.  
**Systems:** The first rerun has allocatable skill points, an obvious bounded temporary boost, permanent ~10× replay speed and meaningful durable choices, with explicit transition control.  
**Safety:** Both novice and veteran saves, including legacy purchases and challenge-active saves, have a reviewed, recoverable migration path.  
**Technical:** Browser + predictor tests cover exact idempotent rewards, relevant time-based gates, normal/new timeline reset and storage.  
**Visual:** Alternate Beginnersville looks familiar-but-different, several selves are visible, the guide-self and replay action are clear, and no full RPG movement engine is required.

## RW08 — proposed later Valley boss encounters

[RW08](RW08.md) develops **incremental boss** challenges from Valley's existing Gods Trial and Challenge Gods. The player optimizes progression and queues to meet phased divine requirements. The system must not require party mechanics or gate potion entry; optional future [RW06 timeline potions and RW07 wagers](https://github.com/step3software/outer-loops/pull/9) may modify boss conditions. Exact boss and balance rules are unapproved.

## Deferred deliberately

- Hundreds of unique alternate selves per run or a full party-management engine on the first visit.
- True fully concurrent simulation of nine-zone games in multiple tabs/workers.
- Dozens of old prestige buffs simply moved into a new-looking shop.
- Four mandatory entire-tier ladders with no interesting branch choices, or an obligatory "gain more nexus currency" opener.
- Unbounded temporal rewind, automatic unlimited gold→mana generation or many full browser-game engines for self-delegation.
- Copying all three existing challenge modes verbatim for the sake of preserving them.
- A complete RPG overworld traversal engine or large-scale pixel-art replacement before the nexus works.
- Multiplayer, live services, monetization or backend storage (not currently requested).

## Approval boundaries

RW00 design and documentation does **not** authorize RW01 source changes. Before each implementation phase, create a separate scoped issue/milestone handoff with accepted UI flow, migration and speed semantics, test fixtures and rollback plan. Do not merge automatically. Update [decisions](decisions.md) when moving a provisional choice into approved scope.

The [RF01–RF06 refactoring program](integration-with-refactoring.md) remains separate; RF04's old challenge behavior-preservation requirement should be revisited rather than silently assumed to be the target product.
