# Real World roadmap — build the first loop, then evolve

**Status:** Proposed development sequence, not a committed release schedule or implementation authorization. The product direction in [decisions](decisions.md) is approved; exact milestone boundaries and effort estimates are subject to design and RF readiness review.

## Design tenet

**The first publicly playable Outer Loop must be more than a portal and a pretty room.** On the very first successful return to Beginnersville, the player should already be running around 10× faster **and** have access to meaningful new capabilities. Build a narrow but complete second-playthrough loop before adding multiverse-scale complexity.

| Phase | Goal | Player-visible outcome | Readiness / acceptance |
| --- | --- | --- | --- |
| **RW00 — Contract and test preparation** | Resolve critical design choices, original ending characterization and veteran save safety | No player-visible behavior change | RF01 fixtures, RF02 safety plan, speed timekeeping baseline, first-self/legacy entitlements, **three-vs-four-tree decision and Valley/potion ending choice (RW-Q17–RW-Q21)** |
| **RW01 — First nexus vertical slice (internal)** | Introduce post-Restore Time threshold, small scene and first self, persisted outer flags, explicit return/new-timeline flow | Two versions of the protagonist meet in Real World; **no forced reset** | First meeting once, save/reload, no Town#9, original ending and credits still accessible; keep hidden until replacement loop works |
| **RW02 — First compelling outer replay (minimum releasable)** | Make single prestige home, retire standalone old menus, safe veteran migration, free ~10× replay and initial meaningful upgrades | A **new timeline feels unmistakably different** in speed and planning; no parallel prestige shop | One or more distinct upgrade decisions; idempotent completion; no double rewards; old save/challenge cases safe; speed/worker parity green |
| **RW03 — Deepen upgrades and first useful self** | Add bounded automation, retained-knowledge abilities and functional first-self assignment | Player can delegate/automate a mastered task rather than only watch a faster clock | Explicit rule constraints, override/pause, deterministic reward; no hidden duplicate tasks or infinite grants |
| **RW04 — Divergent timeline challenges** | Add selected thematic variant rules and unique rewards/selves | Choosing a challenge meaningfully changes strategy and expands the nexus | Optional variants, separate activation context, safe challenge transition; old separate menu absent |
| **RW05 — Multi-self/timeline management** | Coordinate several distinct selves and bounded archived/active timeline activities | Player manages a growing ensemble of alternate lives with competing priorities | Performance bounds, deterministic background outcomes, save recovery and clear UI |
| **ART — Pixel-art workstream (parallel)** | Establish style bible from nexus; later apply to inner world | Cohesive, legible two-character nexus scene and expanded game presentation | Controlled asset scope, readable UI, responsive/reduced motion, asset rights documented |

**RW00–RW02** form the first target development effort. RW01 may be demoed internally as a narrative prototype, but should **not** be shipped to ordinary players while the only rewards are inaccessible or dmchurch's full old prestige shop still sits alongside it.

## Endgame design gate — unresolved

The current RW01–RW02 flow below is based on **nine zones and the existing Valley `Action.RestoreTime`**, consistent with approved RW-D02. Separately, a [source-grounded design comparison](potion-and-endgame-options.md) proposes **A** keeping Valley, **B** shortening its tower/trial grind, or **C** removing it from active play and using a shorter **Commerceville potion/temporal research climax** before Real World. **C is recommended for exploration, not chosen.**

RW00 must settle this before finalizing the portal trigger, first-restoration flags, ending narrative and tests. If option B/C is approved, revise this roadmap and RW-D02 **explicitly**, add migration coverage for saved zone-8/tower/trial progress, protect the Spatiomancy/Valhalla bypass branch, and verify optional Totem/Wunderkind remains useful. Avoid a simplistic "delete town 8" patch: the nine-zone survey average, `Ruins/Haul`, key, `SecretTrial` and old prestiges also depend on it.

## Proposed detailed first slice: RW01 + RW02

### First completion

- Normal nine-zone game concludes at `Action.RestoreTime` under its existing conditions.
- The original time-restoration story still plays and credits remain accessible.
- A *new* nexus portal/threshold unlocks once; the game **does not** substitute `Action.OpenPortal` and does not renumber zones.
- The player explicitly enters Real World; a short first meeting conveys the presence of an alternate self.
- Leaving without starting a new timeline preserves the completed timeline and original progression.

### First replay

- Real World offers a deliberate "Start New Timeline" control with a summary of what resets, what remains, and a recoverable backup/undo route.
- The first new timeline starts with **~10× automatic playback/execution speed**, shown clearly.
- A small initial set of **powerful, differentiated** upgrade choices is available. Current [working three-tree concept](upgrade-trees.md): **Will / Pivot**, **Echoes / First Apprentice**, **Anchors / Anchored Memory**; [four-tree Dominion alternative](dominion-alternative.md) adds **Timeless Treasury** as a separate economic specialization. Exact starter grant and branch structure require approval. Upgrades are not only stacked +5%/20% stat multipliers.
- The other self remains in the nexus and can later become a functional helper; at least one immediate planning interaction should connect the companion to the second run (final choice requires approval).
- The old Prestige Perks and Challenges *menus* are no longer independent player-facing systems. If old challenge concepts are retained, they appear as future nexus-launched variants.
- Relaunches and save reloads preserve the nexus and new timeline state; no doubled original 90-point legacy grant.

### Exit criteria for minimum releasable version

**Narrative:** Player experiences the existing Restore Time climax, recognizes the second self and knows why returning is interesting.  
**Systems:** Inner loops continue working, second timeline is measurably faster, chosen upgrade changes actual play, transitions are under player control.  
**Safety:** Both novice and veteran saves, including legacy purchases and challenge-active saves, have a reviewed, recoverable migration path.  
**Technical:** Browser + predictor tests cover exact idempotent rewards, relevant time-based gates, normal/new timeline reset and storage.  
**Visual:** Nexus scene is understandable, attractive and accessible; no need to illustrate all nine regions immediately.

## Deferred deliberately

- Hundreds of unique alternate selves per run.
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
