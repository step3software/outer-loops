# Outer loop systems — progression, replay, upgrades, automation and challenges

**Status:** High-level goals approved; individual upgrade effects, currencies, speed stacking, unlock thresholds and automation policies are **provisional**.

## The systemic loop

```text
Play the original inner loops to reach Restore Time
  → cross the Real World threshold
  → meet/consult an alternate self, inspect outcomes
  → acquire/select permanent capabilities
  → choose and explicitly start a NEW TIMELINE
  → begin with ~10× baseline replay throughput + purchased/earned powers
  → discover new optimizations, achievements and eventually self variants
  → return to Real World and make another strategic choice
```

The intended expansion is **from optimizing actions to optimizing timelines**. Permanent changes should make the game require *new types of decisions*, not just the same actions with smaller timers.

## Unlocked automatically: approximately 10× replay acceleration

**Approved experience:** Beginning with the first new timeline after the original Restore Time completion, the inner game runs **approximately 10× faster by default**, **without buying anything**. The player also receives meaningful permanent upgrade choices.

**Operational definition for design/testing:** For a fixed initial progression state, equivalent valid action queue and no simulation bottleneck, the same sequence should take about one-tenth the **player's wall-clock waiting time** compared with the first campaign. The upgrade should **not** inherently grant 10× XP per completed action, extra gold, free mana-budget, additional item discoveries, or changed quest requirements. It makes actions resolve faster in real time, not richer in game-time rewards.

**Important unresolved implementation detail:** `driver.js` currently uses `gameSpeed`, `getSpeedMult`, `bonusSpeed` and `effectiveTime` differently. We must define where the new baseline factor sits so that `Escape`'s "effectiveTime < 60" constraint, challenge pacing, time budgets, offline bonus accounting, predictor snapshots and high-speed frame limits behave coherently. "Set `gameSpeed = 10`" is *not* automatically an adequate specification; see [technical design](technical-architecture.md) and RW-Q04.

**Onboarding:** The player should see why the second timeline feels different (e.g. a small "Accelerated timeline ×10" indicator). It should be permanent and automatic on eligible new timelines, without spending points. It need not apply retroactively to an existing unfinished timeline solely because the player opened a menu.

## Permanent upgrade philosophy

The original dmchurch prestige menu offers mostly additive/exponential multipliers. We are **retiring that standalone shop**. New choices should be substantial **capabilities**. Raw speed/XP increases can exist, but they must complement the already free ~10× improvement rather than constitute the entire design.

An upgrade is compelling when it does at least one of these:

- **Changes planning:** conditional action sequences, reusable schedules, better forecasting/route automation.
- **Removes mastered repetition:** an alternate self prepares known supplies or handles an established, previously solved routine.
- **Preserves selected knowledge:** unlocked route familiarity, surveyed discoveries, training patterns or one well-defined piece of prior progress across *timelines*.
- **Enables new strategic constraints:** opt-in challenge timelines with unique rewards or alternate selves.
- **Deepens the nexus:** recruit a specialist, open a facility or unlock new ways to coordinate timelines.

### Example first-visit upgrade choices — proposals, not tuned or guaranteed

| Candidate | What feels different in timeline two | Risks / balance questions |
| --- | --- | --- |
| **Remember the Route** | Reuse a previously successful action sequence or partial travel plan without reconstructing it manually | Preserve the player's agency to edit; avoid skipping conditions they haven't met |
| **Keep the Map** | Carry a carefully bounded portion of survey/route **knowledge** to the next timeline | Decide whether this means discovery visibility, numeric progress or merely a hint; otherwise it may bypass an intended late-game loop |
| **Preparatory Echo** | An alternate self can perform one narrow, already-mastered setup routine (such as acquiring certain starting supplies) | No full extra simulation, no infinite free resources; establish cost and eligibility |
| **Stable Thread** | Retain one selected kind of long-term investment when explicitly resetting to a new timeline | Could trivialize some areas; define caps, exclusions and prerequisites |
| **Clearer Forecast** | Gain a more informative planning/prediction capability for uncertain action chains | Must never make predictor forecast inaccurate or introduce hidden cheating |

**Recommended first playable slice:** offer a small set of **distinct, legible** choices from different play styles, with at least one genuinely useful planning/automation option. The first player should not confront a giant upgrade grid or dozens of marginal percentage bonuses. Prices, actual numerical effects and how many choices are initially affordable are open.

## Automation progression — make mastery meaningful

| Stage | Control gained | What the player still chooses |
| --- | --- | --- |
| **A. Remember** (initial) | Save/reapply an effective action template, potentially scoped to an early route | Edit/inspect the plan, new objectives and resource order |
| **B. Conditional routine** | Stop/repeat/reorder a known preparation sequence according to explicit resource/skill conditions | Choose condition, fallback behavior and constraints |
| **C. Delegate** | Assign a particular alternate self to an established task | Specialist, allocation, return timing and conflicts |
| **D. Timeline manager** (later) | Multiple selves perform limited summarized/background work across timelines | Portfolio strategy, variants, focus and conflicting opportunities |

Preserve the core game's tactical richness. **Do not automatically clear unknown zones or bypass first discovery**; the player earns convenience by demonstrating mastery. An automated plan should expose what it will do, respect `canStart`/valid action constraints, and allow manual override or pause. Deterministic executor behavior is necessary before introducing conditions or delegation.

The first release **must not require concurrently running multiple 157-action engines in the browser**. Off-screen delegation may be task-based with discrete results and clearly bounded rewards, rather than full per-tick simulation.

## Challenges become divergent timelines (or are retired)

Existing `Mana Drought`, `Noodle Arms` and `Mana Burn` are bonus-less standalone modes under the current Challenges menu, implemented with global function overrides. In the new product **that menu goes away**. Two legitimate options remain:

1. **Reimagine selected challenge mechanics** as optional special **timeline rules** unlocked/started in Real World; attach story, interesting strategic rewards or distinctive selves.
2. **Discard older challenge modes** that don't support the new theme, rather than carrying over every inherited feature.

**Recommendation:** keep the concept of altered/restricted timelines, not an obligation to retain all three old modes. New challenge options should enhance replay diversity, not gate the entire upgrade tree behind tedious restrictions or punish players who prefer normal timelines. Details depend on save and challenge-rule modernization; see [legacy transition](legacy-transition.md) and [RF integration](integration-with-refactoring.md).

## Reward economy — no premature commitment to old 90-point values

Original `RestoreTime` awards 90 prestige points once per cycle. That specific currency, shop pricing, and upgrade curve are **legacy implementation details**, not the approved Real World economic model.

Recommended principles: outcomes rather than idle waits, meaningful first rewards, finite/diminishing repeat farming, transparent prerequisites, and no double-crediting migrated players. A separate outer currency may be useful, but its name, sources, costs and relation to archived timelines remain open. We should playtest the time-to-first-upgrade and total second-run duration before locking a progression economy.

## Design failure modes

- **Pure multiplier treadmill:** 10× faster but no new decisions.
- **Empty first hub:** beautiful room with no meaningful replay effect.
- **Over-automation:** second run becomes a passive checklist.
- **Too many selves:** hundreds of redundant NPCs after repeated restores.
- **Second prestige shop:** inherited menu and nexus both sell permanent improvements.
- **Balance explosion:** 10× baseline combined accidentally with the old Chronomancy prestige multiplier, bonus seconds and new XP effects.
- **Unrewarding challenges:** players repeat punishing modes for nothing distinct.
- **Destructive transition:** first crossing or buying an upgrade silently resets valuable progress.

Each must be an explicit playtest or acceptance case rather than an implementation surprise.
