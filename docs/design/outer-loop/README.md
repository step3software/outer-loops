# Outer Loops — Real World / Timeloop Nexus

**Status:** Product direction agreed; **design in progress**. This is a concept specification, not an implemented system or approval to change gameplay. Last updated: 2026-11-06.

## North star

The original game teaches the player to **master a day**. Real World changes the problem: **master whole timelines**, meet alternative versions of the same protagonist, earn transformational permanent capabilities, and eventually coordinate those selves.

The first milestone should feel like a new chapter and immediately change the experience of replaying the original game—not simply unveil another menu of small percentage buffs.

### Approved direction

- **Real World** is the name of the additional area, **outside** the existing nine-zone world.
- The player deliberately **drinks the recreated Looping Potion** and enters a **transformed Beginnersville** populated by other selves; one notices the newcomer and starts a conversation. **Valley/Restore Time is not required for entry.**
- Real World is the **only player-facing prestige/metaprogression home**. The separate dmchurch **Prestige Perks** system and separate **Challenges** menu **will not remain as independent systems**. Individual effects or challenge concepts may be adapted, or discarded; selection is not settled.
- The first deliberately started **new timeline after potion entry** grants **initial skill points** and a **major temporary boost** on top of permanently free **~10× replay acceleration** and later meaningful permanent upgrade choices. Exact point and temporary-bonus rules remain undecided. Exact multiplication/stacking is still a technical design decision.
- Multiple alternate selves are visible from first arrival. One approaches the new player; others eventually become characters with meaningful roles and potential **party membership**, not automatic clones per completion.
- Build a meaningful first village and empowered rerun before gradually exposing advanced upgrade trees, automation, variant timelines, keys, wagers and parties.
- Real World is a strong **pixel-art art-direction anchor**. The wider game's eventual pixel-art treatment is a related but separate workstream.
- Do not establish that the earlier game was "fake" or a simulation; keep what **Real World** means deliberately mysterious at first.

### Selected potion-first entry and independent faster Valley

On 2026-11-06 the owner selected **a shorter Valley capstone**, following a campaign-wide baseline measurement. The later clarification is decisive: **Valley remains playable but is not the route to Real World**. Recreate and **drink the Looping Potion**, return to an alternate Beginnersville among other versions of yourself, meet a self who notices you are new, explore, then embark on a first rerun with initial skill points and an impactful temporary boost. Automatic ~10× replay speed is an independent permanent effect.

The [decision record](decisions.md#selected-entry-and-valley-direction--2026-11-06) explicitly supersedes the old `RestoreTime → new portal` gateway but does not reverse the faster-Valley direction. The [RW00 campaign pacing plan](balance-tests-implementation-plan.md) is preserved; the [earlier A/B/C endgame study](potion-and-endgame-options.md) is historical research, not active scope. Both reputation routes, the separate Jungle Totem use, the first point/boost economy, return policies and save migration remain design and test work. **None of this is implemented.**

### Working upgrade-tree recommendation — not yet approved

The preferred **three-tree** model is **Will / Echoes / Anchors** (active control, automation and persistent knowledge/treasury/infrastructure). A **four-tree** model — **Will / Echoes / Memory / Dominion** — is deliberately preserved as a substantial economic/infrastructure alternative. Their final number, first grants, exact node effects, synergy prerequisites and economy are not yet approved. Review the [three-tree specification](upgrade-trees.md) and [Dominion alternative](dominion-alternative.md) together.

### Out of scope at this stage

Implementing the nexus; replacing or deleting existing prestige code; migrating saves; changing any of the 157 original actions; rewriting challenge rules; renumbering towns; generating pixel-art assets; adopting a UI/game-engine framework. This PR changes **documentation only**.

## What already exists, precisely

**As-coded:** The original game does not yet have the potion-to-Real-World transition. Its existing ending is **not** the jungle `Open Portal`. That action returns Jungle Path (zone 6) to Forest Path (zone 1). At the end of Valley of Olympus (zone 8), `Action.RestoreTime` becomes available after completing the tower and gathering enough power from the gods. Its completion calls `completedCurrentGame()` in `prestige.js`; the old system awards 90 points for the first completion of that prestige cycle.

Importantly, the English **Restore Time** story describes repairing time by weaving **many formerly broken strands into independent alternate timelines**, where the protagonist lived different lives (including as a Witch's friend and a crafter). That remains a valuable optional lore connection to the other selves, **not an entry prerequisite**. Refer to `lang/en-EN/game.xml` and [the narrative bridge](narrative.md). Preserve the original authors' credit and historical ending somewhere accessible even if its UI presentation becomes a transition rather than a final stop.

## Three layers of play

```text
REAL WORLD — outer progression (persists through entire timelines)
  alternate selves • acquired permanent abilities • automation • timeline history
      |
      +-- TIMELINE — playthrough starting in normal Beginnersville
             Valley/Restore Time is separate from potion-entry eligibility
             chosen upgrades and variant rules define the run
             |
             +-- INNER TIME LOOPS — the existing gameplay
                    plan action queue → spend mana → repeat → retain normal-loop growth
```

**Ordinary loop restart ≠ new timeline ≠ returning to Real World.** An ordinary restart must never wipe the outer layer. A new timeline is an explicit player action and must preserve the outer layer while resetting the designated inner-world progression safely. Returning to the nexus should not silently abandon a completed or still-active timeline.

## First playable release — definition of success

The initial slice is not just a decorative room:

1. A legitimate **Looping Potion** can be deliberately used to enter Real World **without completing Valley**. Existing Totem/Wunderkind consumption remains a separate supported interaction.
2. The player arrives in an altered **Beginnersville** among several other selves, one of whom recognizes the newcomer, talks briefly and invites exploration.
3. Entering the village does **not** automatically reset the current timeline, lose unfinished Valley progress or spend a first-rerun entitlement.
4. The first explicit **Start New Timeline** delivers allocatable **skill points**, a large **temporary boost**, free permanent **~10× replay speed** and an early lasting ability choice. Quantitative grant and boost rules are still open.
5. The outer world and ordinary game preserve separate state, recoverable saves and idempotent entry/reward grants; the original Valley story and credits remain accessible.
6. Old standalone Prestige/Challenges presentation is retired only with a safe migration; additional selves, advanced upgrades, keys, wagers and eventual parties reveal gradually.

The [roadmap](roadmap.md) separates the arrival, initial replay and future systems.

## Design documents

- [Decisions and open questions](decisions.md) — confirmed vs provisional vs unresolved
- [Narrative and first meeting](narrative.md) — potion arrival, alternate village, guide-self dialogue and preserved original ending
- [**Looping Potion and independent Valley**](potion-and-endgame-options.md) — as-coded potion gates, chosen new entry and historical ending alternatives
- [Outer loop and upgrade systems](systems.md) — 10× replay, meaningful permanent choices, automation and challenges
- [**Three-tree working recommendation: Will / Echoes / Anchors**](upgrade-trees.md) — starter nodes, subpaths, tier progressions and cross-tree synergies
- [**Four-tree alternative: Will / Echoes / Memory / Dominion**](dominion-alternative.md) — an independent economic/infrastructure tree and comparison
- [Upgrade-tree mechanics contracts](upgrade-tree-contracts.md) — persistence, balance/exploit guardrails, deterministic execution and planned tests
- [Alternate selves](selves.md) — character identity, roster model and future delegation
- [Retiring legacy prestige/challenges](legacy-transition.md) — options, migration and compatibility
- [Technical architecture and state boundaries](technical-architecture.md) — *not* town #9, save/predictor/rule considerations
- [Pixel-art and hub experience](visual-direction.md) — future art direction, no assets generated
- [RW00 campaign balance tests — implementation plan](balance-tests-implementation-plan.md) · [structured draft](balance-tests.plan.json)
- [Roadmap and acceptance gates](roadmap.md) — potion village → empowered rerun → later party play
- [RW06 Timeline Potions and RW07 Wagers proposals (draft PR #9)](https://github.com/step3software/outer-loops/pull/9) — proposed future mechanics, not adopted into this source branch
- [RW08 — Incremental Timeline Bosses](RW08.md) — proposed gods-as-bosses milestone, solved with incremental progression and action queues; no party system
- [Playtest/validation questions](validation.md) — future scenarios, key pacing risks and decisions
- [Integration with RF01–RF06](integration-with-refactoring.md) — refactor dependencies and conflicts

Related: [technical audit](../../audit/README.md), [existing endgame map](../../audit/progression.md), [RF plan](../../refactoring/README.md), and [source of truth](../../reference/code-map.md).

## Status / handoff rule

All mechanics described outside the **Approved direction** section are proposals unless explicitly confirmed in [decisions](decisions.md). An implementation agent must not guess currency exchange rates, legacy migration policy, NPC identities or speed stacking. Starting development requires a **separate explicit user request**, approved acceptance criteria and safe save/restart tests. No automatic merges.
