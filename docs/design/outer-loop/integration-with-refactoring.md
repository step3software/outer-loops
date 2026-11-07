# Coordination with RF01–RF06

**Status:** Cross-program planning only. The [approved RF01–RF06 milestone charters](../../refactoring/README.md) remain unchanged and unimplemented. Real World will require separately authorized development and compatibility tests.

The Real World design is a product change, whereas RF01–RF06 are generally *behavior-preserving* refactors. Mixing the new metagame into those refactors would destroy the ability to isolate regressions. **Keep explicit boundaries and separate PRs**.

## Selected retained Valley and independent potion gateway

The owner selected **a shorter Valley of Olympus within a later campaign-wide rebalance**, while keeping zone 8 and its original `RestoreTime` story/credits. Real World is instead entered by **deliberately drinking the Looping Potion**, which brings the player to an alternate Beginnersville populated by other selves. The old `RestoreTime → portal` gateway is superseded in [decisions](decisions.md). This is a design-only change, not authorization to alter existing gameplay or the RF charters.

- **RF01:** Characterize potion crafting, Totem consumption, story flags, both reputation routes, ordinary and Valley completion, and old 90-point rewards as **separate events**. Include a pre-Valley potion entry fixture and post-entry Valley history fixture.
- **RF02:** Protect save/import/export and recovery before introducing persistent Real World first-visit, guide dialogue, initial point grant, temporary boost and explicit new-timeline reset. Preserve unfinished tower/trial and original prestige saves.
- **RF03:** The new potion use, skill-point effects and temporary boost need deterministic typed state/predicates, bounded lifetimes and parity with the predictor without mutating eligibility queries.
- **RF04:** Old challenge modes remain a separate compatibility/scoping question; do not substitute a key/wager system or remove them merely because the Real World gateway changes.
- **RF05/RF06:** Preserve nine original towns, action IDs, travel logic and existing UI while a new outer scene reuses only the **look** of Beginnersville, not its gameplay counters.

The normal high-reputation path accesses Spatiomancy via Valhalla, while the shadow route can bypass it. **Both must legitimately reach the potion gateway**. Preserve the existing Totem/Wunderkind use. The [historical endgame study](potion-and-endgame-options.md) documents discarded town-removal alternatives without approving them.

## Dependency and conflict register

| Existing milestone | Relevance to Real World | Recommendation |
| --- | --- | --- |
| [RF01 Regression coverage](../../refactoring/RF01-regression-coverage.md) | Must characterize distinct potion craft/drink/Totem, Valley `RestoreTime`, original prestige reset, old saves, challenges and predictor behavior | **High-priority hard gate** for implementing outer rewards and resets; add new tests on top |
| [RF02 Persistence safety](../../refactoring/RF02-persistence-safety.md) | Potion entry, first village visit, first-rerun points/temporary boost, migration, archives, import/export and veteran entitlements need safe writes and rollback | **Hard gate** for any irreversible new timeline reset or migration; allow only disposable UI prototypes before this |
| [RF03 Pure gameplay rules/resources](../../refactoring/RF03-gameplay-rules-and-resources.md) | Upgrade modifiers, eligibility, time-sensitive actions and predictor must not depend on DOM or mutating queries | **Strong dependency** before introducing systemic upgrades and complex automation; minimal prototypes may be possible sooner |
| [RF04 Challenge rule isolation](../../refactoring/RF04-challenge-rule-isolation.md) | Existing RF04 promises exact preservation of three bonus-less old modes through stable policy dispatch; new product says **old standalone challenge system is retired** | **Scope conflict to resolve**. If adapting legacy modes as new timeline variants, a stable rule policy is useful. If discarding them, refactoring all three for long-term preservation may waste effort; do not rewrite RF04 scope without a separate decision |
| [RF05 Action module organization](../../refactoring/RF05-action-module-organization.md) | Easier later development, but not a logical prerequisite for a separate nexus scene | Useful to reduce change conflicts; **not a hard nexus gate**. Do not append Real World as an ordinary town to avoid this dependency |
| [RF06 View layer decomposition](../../refactoring/RF06-view-layer-decomposition.md) | Helps long-term UI work; Real World can be a separate scene rather than another gigantic responsibility inside `View` | Follow boundaries and avoid deep coupling; **not a hard nexus gate** if interfaces are tested and new UI stays clean |

## Upgrade-tree implementation dependencies

The current [three-tree recommendation](upgrade-trees.md), [Dominion four-tree alternative](dominion-alternative.md) and [mechanics contract](upgrade-tree-contracts.md) are **design only**. They sharpen the need for RF01/RF02 before any live-state checkpoint, new-timeline progress retention or Treasury balance. **Pivot** touches `Actions.current` and mid-run mutation; **First Apprentice** touches conditional planning, legal `canStart` and predictor behavior (RF03); **Anchored Memory** touches dynamic save fields and story/zone dependencies; **Timeless Treasury** touches `addResource`, `resources.gold`, `goldInvested` and merchant mana conversion. High-tier forks need an explicit anti-duplicate reward model.

The three-vs-four *visual grouping* decision should not determine save field names; plan stable ability ownership IDs so a later Dominion promotion does not silently rewrite player progress. This does not amend or authorize RF01–RF06 implementation.

## Original gameplay and new feature ownership

The planned RF codebase refactor should preserve the nine-zone source exactly as it exists. A separate Real World implementation PR can then **deliberately** alter the old prestige and challenge UX, with explicit migration and changed expectations in tests. RF04's "retain old modes exactly" can serve as a compatibility staging step, but it should not dictate final product design.

The [technical audit](../../audit/technical-review.md) and [current action catalog](../../reference/action-mechanics.generated.md) remain as-coded historical references until gameplay changes are authorized and landed; do not rewrite them to claim Real World already exists.

## Suggested engineering sequence

1. Extend RF01 characterization to potion acquisition, Totem versus new drink transition, both reputation routes, optional Valley Restore Time and veteran prestige tests.
2. Implement RF02 validation/backup before any new save schema or resetting existing players' progress.
3. Preserve the adopted potion-first/shorter-Valley direction; resolve legal potion acquisition, initial skill-point and temporary-boost lifetimes, veteran credits, return rules, first-self story and 10× stacking.
4. Make only required RF03 gameplay state/predicate seams and timing tests before enabling outer upgrades.
5. Build potion-to-alternate-Beginnersville and the recognizer-self introduction first, behind a development-only flag. Add explicit first empowered rerun with safe reset, points/temporary boost and ~10× replay; leave Valley independent. Retire old visible menus only with a migration plan.
6. Revisit RF04: either use its stable mode dispatch for legacy compatibility or replace the *planned* scope with an explicitly approved variant-timeline policy, preserving legacy player data.
7. Schedule RF05/RF06 based on actual development pain and test coverage; don't force whole-repo code moves or a global visual redesign before the new loop is fun.

## Acceptance safeguards

Never use the word "prestige" to identify two independent, spendable progression systems at the same time. Any temporarily retained legacy code must be a **migration/compatibility adapter**, not a second meta-shop. Never silently overwrite `prestigeBackup` or `idleLoopsChallenge`, duplicate old 90-point rewards or first-rerun points/boost, or conflate potion entry with Valley completion. Do not treat a new speed multiplier as permission to alter the original action costs, story thresholds or replay game-time semantics.

This document highlights RF04 product-direction tension but does not by itself amend an approved refactor milestone or permit implementation.
