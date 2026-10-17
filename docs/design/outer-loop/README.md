# Outer Loops — Real World / Timeloop Nexus

**Status:** Product direction agreed; **design in progress**. This is a concept specification, not an implemented system or approval to change gameplay. Last updated: 2026-10-17.

## North star

The original game teaches the player to **master a day**. Real World changes the problem: **master whole timelines**, meet alternative versions of the same protagonist, earn transformational permanent capabilities, and eventually coordinate those selves.

The first milestone should feel like a new chapter and immediately change the experience of replaying the original game—not simply unveil another menu of small percentage buffs.

### Approved direction

- **Real World** is the name of the additional area, **outside** the existing nine-zone world.
- The first visit follows the original ending, **Restore Time**. The player crosses a *new* threshold/portal afterward and encounters **another version of themselves**.
- Real World is the **only player-facing prestige/metaprogression home**. The separate dmchurch **Prestige Perks** system and separate **Challenges** menu **will not remain as independent systems**. Individual effects or challenge concepts may be adapted, or discarded; selection is not settled.
- After the first completion, a **new timeline/replay is approximately 10× faster by default**, with substantial, interesting permanent upgrade choices *in addition* to the free baseline speed increase. Exact multiplication/stacking is still a technical design decision.
- Alternate selves are ongoing **characters with agency and eventual gameplay roles**, not automatically one identical NPC per completion.
- Build a meaningful **small hub and initial replay loop first**, leaving a path toward richer multi-self/timeline management later.
- **Upgrade-tree design is being explored:** the current working recommendation is **Will / Echoes / Anchors** (active control / automation / persistent knowledge, treasury and infrastructure). **Will / Echoes / Memory / Dominion** is preserved as a serious four-tree alternative. The number, starter grants, exact node effects and economics are **not final approved rules**.
- Real World is a strong **pixel-art art-direction anchor**. The wider game's eventual pixel-art treatment is a related but separate workstream.
- Do not establish that the earlier game was "fake" or a simulation; keep what **Real World** means deliberately mysterious at first.

### Out of scope at this stage

Implementing the nexus; replacing or deleting existing prestige code; migrating saves; changing any of the 157 original actions; rewriting challenge rules; renumbering towns; generating pixel-art assets; adopting a UI/game-engine framework. This PR changes **documentation only**.

## What already exists, precisely

The current original ending is **not** the jungle `Open Portal`. That action returns Jungle Path (zone 6) to Forest Path (zone 1). At the end of Valley of Olympus (zone 8), `Action.RestoreTime` becomes available after completing the tower and gathering enough power from the gods. Its completion calls `completedCurrentGame()` in `prestige.js`; the old system awards 90 points for the first completion of that prestige cycle.

Importantly, the English **Restore Time** story describes repairing time by weaving **many formerly broken strands into independent alternate timelines**, where the protagonist lived different lives (including as a Witch's friend and a crafter). That is an unusually clean piece of existing canon on which to base the new nexus. Refer to `lang/en-EN/game.xml` and [the narrative bridge](narrative.md). Preserve the original authors' credit and historical ending somewhere accessible even if its UI presentation becomes a transition rather than a final stop.

## Three layers of play

```text
REAL WORLD — outer progression (persists through entire timelines)
  alternate selves • acquired permanent abilities • automation • timeline history
      |
      +-- TIMELINE — a playthrough from Beginnersville through Restore Time
             chosen upgrades and variant rules define the run
             |
             +-- INNER TIME LOOPS — the existing gameplay
                    plan action queue → spend mana → repeat → retain normal-loop growth
```

**Ordinary loop restart ≠ new timeline ≠ returning to Real World.** An ordinary restart must never wipe the outer layer. A new timeline is an explicit player action and must preserve the outer layer while resetting the designated inner-world progression safely. Returning to the nexus should not silently abandon a completed or still-active timeline.

## First playable release — definition of success

The minimum compelling vertical slice is **not just a decorative room**. It includes:

1. Completing `Restore Time` unlocks and introduces the nexus and its portal/threshold; the original endgame remains intact.
2. The player enters a small pixel-art-ready Real World scene and meets **one other self** with a short, characterful conversation.
3. The player can inspect/leave the hub without being automatically forced into a reset.
4. Beginning a **new** timeline triggers the **~10× baseline replay acceleration automatically**, with a clear UI indication.
5. The player can make at least **one impactful upgrade choice** that changes how the second playthrough is planned; [proposed first options](upgrade-trees.md) are **Will / Pivot**, **Echoes / First Apprentice**, and **Anchors / Anchored Memory**. The alternative four-tree model also offers **Dominion / Timeless Treasury**. These choices and any free starting grant still need approval and balancing.
6. The new state survives refresh, normal loop restart, nexus entry/exit and a new timeline, with an explicit migration path for older saves.
7. Real World replaces the old player-facing Prestige/Challenges presentation when it launches. No parallel, confusing second prestige shop.

The [release plan](roadmap.md) separates design decisions and testing prerequisites from these user-facing requirements.

## Design documents

- [Decisions and open questions](decisions.md) — confirmed vs provisional vs unresolved
- [Narrative and first meeting](narrative.md) — ending continuity, mystery and dialogue proposal
- [Outer loop and upgrade systems](systems.md) — 10× replay, meaningful permanent choices, automation and challenges
- [**Three-tree working recommendation: Will / Echoes / Anchors**](upgrade-trees.md) — starter nodes, subpaths, tier progressions and cross-tree synergies
- [**Four-tree alternative: Will / Echoes / Memory / Dominion**](dominion-alternative.md) — an independent economic/infrastructure tree and comparison
- [Upgrade-tree mechanics contracts](upgrade-tree-contracts.md) — persistence, balance/exploit guardrails, deterministic execution and planned tests
- [Alternate selves](selves.md) — character identity, roster model and future delegation
- [Retiring legacy prestige/challenges](legacy-transition.md) — options, migration and compatibility
- [Technical architecture and state boundaries](technical-architecture.md) — *not* town #9, save/predictor/rule considerations
- [Pixel-art and hub experience](visual-direction.md) — future art direction, no assets generated
- [Roadmap and acceptance gates](roadmap.md) — thin slice → deeper timeline management
- [Playtest/validation questions](validation.md) — future scenarios, key pacing risks and decisions
- [Integration with RF01–RF06](integration-with-refactoring.md) — refactor dependencies and conflicts

Related: [technical audit](../../audit/README.md), [existing endgame map](../../audit/progression.md), [RF plan](../../refactoring/README.md), and [source of truth](../../reference/code-map.md).

## Status / handoff rule

All mechanics described outside the **Approved direction** section are proposals unless explicitly confirmed in [decisions](decisions.md). An implementation agent must not guess currency exchange rates, legacy migration policy, NPC identities or speed stacking. Starting development requires a **separate explicit user request**, approved acceptance criteria and safe save/restart tests. No automatic merges.
