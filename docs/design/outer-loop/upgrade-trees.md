# Permanent progression — Will, Echoes and Anchors (recommended)

**Status:** Documented working recommendation, **not final product approval**. The three-branch structure, nodes, costs, prerequisites and examples remain design proposals. The user asked to preserve the separate [four-tree alternative with Dominion](dominion-alternative.md). Nothing in this document is implemented.

**Related:** [nexus systems](systems.md), [decision ledger](decisions.md), [mechanics and state guardrails](upgrade-tree-contracts.md), [alternate selves](selves.md), [legacy retirement](legacy-transition.md) and [planned tests](validation.md).

## 1. Why change the original Active / Automation / Currency proposal?

The first categorization mixed two **control methods** (active input and automation) with a **resource domain** (currency). If left uncorrected, the Currency tree risks becoming an uninteresting stack of +gold and +prestige-points modifiers, while the others confer new forms of agency.

The proposed alternative asks how a character learns to exert power over time:

| Main branch | Core question | Promise to the player | What it should *not* become |
| --- | --- | --- | --- |
| **Will** | What can I change *right now*? | Direct control of an already-running loop and, later, alternate outcomes | Mandatory constant clicking or quick-reaction inputs |
| **Echoes** | What no longer requires *my* attention? | Conditional automation; eventually delegate mastered work to other selves | Merely pressing the existing saved-loadout button automatically |
| **Anchors** | What should *never need repeating*? | Persist bounded knowledge, capital and infrastructure across reset boundaries | An unconditional "keep everything" option that destroys progression |

**Memorable shorthand:** **Will changes what you can do. Echoes changes what you have to do. Anchors changes what you have to do again.**

All three branches deal with the same timeline but grant different kinds of power. **Gold/economy is not removed**; it gets a major subpath under Anchors called **Treasury**. The four-tree alternative instead promotes that subpath to **Dominion** and isolates **Memory** as its own main branch.

## 2. Common progression rules (proposed)

- **Automatic replay speed is not part of a tree.** The already agreed ~10× faster new timeline is granted by the first completion by default, independently of the first upgrade choice. It does not cost an upgrade point.
- **One nexus progression system.** Spend from one *not-yet-named, not-yet-balanced* outer advancement pool or equivalent earned milestones. Do **not** resurrect dmchurch's old 90-point bonus shop as a second system. Ordinary-world gold is not the outer upgrade currency.
- **Choose a specialty, not a class.** Recommend one impactful starter choice after meeting the first other self; the other two paths remain unlockable later. No permanent mutually exclusive starting class without a new design decision.
- **Unlock abilities, not mostly percentages.** Nodes introduce new controls, legal automation policies or explicit persistence capacities. Stat/resource multipliers can supplement, but should not be the main reward.
- **Meaningful branches, with combinations.** Avoid a purely linear mandatory I→II→III→IV purchase chain. Tiers are broad examples; within them, allow specializations, alternative routes and later cross-tree synergies.
- **Real World is the authority.** Tree purchases, owned capacities and cross-tree unlocks survive full timeline resets. Actual inner-game buffs, temporary resources and conditional tasks obey their own lifetime contracts.
- **Readability before breadth.** An early hub with three approachable choices is better than a giant passive node map. Reveal later tiers as capabilities become relevant.
- **No required challenge grind.** Challenge timelines are a separate activity launched from the nexus, potentially rewarding special selves or unlocks, but not a fourth baseline tree or an extension of the old menu.

### Conceptual layout (not a committed UI)

```text
                            REAL WORLD
                    one persistent progression
                              |
             +----------------+----------------+
             |                |                |
            WILL             ECHOES          ANCHORS
       active agency     automation/selves   persistence
             |                |                |
        interventions     goals & routines    MEMORY
        tactical rewind   specialist selves    TREASURY
        alternate plans   timeline delegates    STRUCTURES
             +----------------+----------------+
                    cross-tree synergies
```

## 3. WILL — control, interventions and rewinds

**Fantasy:** become more capable of making consequential decisions *inside* an active loop. Will should offer higher potential efficiency to a player who actively plans and intervenes, but should **never** require a click every few seconds—especially at 10× speed.

### First node — Pivot (proposed)

**Experience:** once per **ordinary inner loop** (initial example, not balanced), pause execution and **replace a bounded not-yet-executed portion of the *current* action schedule** with a newly valid plan, then resume **without restarting the loop**.

This must go beyond existing `Actions.next`/loadout editing, which already lets the player prepare a *future* loop. The implementation should prove that Pivot changes the **running** loop, not just the next one. It may not retroactively refund mana, repeat completed rewards, teleport between zones or start invalid actions. Exact edit scope, uses and cooldown remain open.

**Active-play value:** a difficult or inefficient action sequence can be salvaged now rather than replayed from the beginning. Player agency rises even though the game is already faster.

### Progression sketches

| Tier (concept) | Example node | New decision | Non-negotiable risk control |
| --- | --- | --- | --- |
| I — Awakening | **Pivot** | Replan remaining actions of the running loop | Never rewind costs or bypass `canStart`/travel |
| II — Mastery | **Temporal Anchor** | Place a checkpoint before a risky sequence and deliberately retry | Isolation from permanent rewards and transaction/restore semantics |
| III — Authority | **Focused Reality** | Spend a limited intervention to redirect a difficult but legal outcome or protect a run from one failure | Explicit effect limits; no infinite duplication of resources |
| IV — Transcendence | **Master of Moments** | Evaluate or branch a substantial segment and intentionally commit a single timeline result | Exactly one committed outcome, predictable performance |

The earlier concept "split a run into alternate approaches and choose the better result" is **aspirational tier III–IV**, not an approved ability to farm both outcomes. Rewinding/branching may require very different engineering from simple mid-loop schedule edits and must have a separate implementation decision.

### Subpaths worth exploring later

- **Intervention:** immediate legal redirects and limited action rescues.
- **Reversal:** checkpointing and retrying one outcome.
- **Foresight:** better compare/preview facilities, but keep actual prediction deterministic and side-effect free.

## 4. ECHOES — automation, delegation and other selves

**Fantasy:** teach an alternate self how to do mastered work, then free the player to make higher-level choices.

### First node — First Apprentice (proposed)

**Experience:** define **one conditional objective** in a familiar portion of the world. Example: "gather herbs *until* I have enough for this previously mastered recipe," rather than queueing Gather Herbs a fixed 20 times. The Echo produces or updates a **legal, visible plan** and stops at the threshold.

This is importantly **not** a synonym for loading an existing `Actions.next` preset. It has to **inspect game state against a bounded, declared goal**, respect resources/available actions/zone travel, and expose why it stopped. At 10×, it must not secretly waste the player's action budget when a condition is satisfied.

**Narrative fit:** "First Apprentice" can be taught or unlocked through dialogue with the first other self, but the story does not yet require that character to be a permanently recruited helper or invent a second NPC.

### Progression sketches

| Tier | Example node | New player responsibility | Guardrail |
| --- | --- | --- | --- |
| I — Awakening | **First Apprentice** | Specify one conditional goal and safety limit | Bounded target, clear stop reason, pause/manual override |
| II — Mastery | **Routine Chains** | Compose multiple legal goals with fallbacks and priorities | No contradictory infinite loops, strict action/zone constraints |
| III — Authority | **Delegated Work** | Assign a specialist self to own an established subsystem | One finite job/resource budget per assignment, visible outcome |
| IV — Transcendence | **Timeline Steward** | Oversee large portions of a **mastered** timeline with exceptions escalated | Do not require concurrent full-game simulations per self |

### Subpaths worth exploring later

- **Routines:** conditional, composable queue logic.
- **Specialists:** character-specific strengths and assignment tradeoffs.
- **Coordination:** multiple selves and limited timeline management.

Progress should remove **chores after mastery**, not first-time discovery or meaningful strategic decisions. Automating whole Beginnersville immediately on the first replay is an **alternate pacing option to evaluate**, not an approved first node.

## 5. ANCHORS — persistence, memory, treasury and structures

**Fantasy:** change what survives when time resets. Anchors should reward having done something before, while preserving clear distinctions between an **ordinary inner-loop restart**, a **new timeline**, and an **outer nexus progression reset/hard reset**.

### First node — Anchored Memory (proposed)

**Experience:** at the nexus, select **one bounded, previously earned discovery/mastery** to retain when beginning the next timeline. It has an observable in-game consequence—for example, retaining a limited portion of an already achieved progress/unlock *when the exact state contract permits it*. This is **not** merely remembering the player's custom action list, which belongs nearer to Echoes.

The final category, numerical cap and allowed early-game progress are open. A first version should not carry across the entire world survey, all skills or every quest requirement, and must not accidentally bypass the Explorer Guild bootstrap.

### Three distinct subpaths

| Anchors subpath | What it makes permanent | Early examples | Later examples |
| --- | --- | --- | --- |
| **Memory** | Bounded learned mastery, discoveries and relevant progress | Choose one learned progress element at a timeline reset | Preserve a curated set of milestones or training memories |
| **Treasury** | Economic value: reserves and agreements | Carry a **capped** amount of gold or grant a bounded starting-capital policy | Retain investments, trade arrangements and eventually intertimeline transfers |
| **Structures** | Persistent tools and preparation infrastructure | A limited starting supply agreement or workshop access | Nexus facilities and preparation systems maintained across runs |

**Treasury has meaningful depth.** Currency is not demoted to +10% gold. Early wealth retention might apply only between **ordinary loops**, with carrying anything across a **full timeline reset** reserved for more advanced upgrades. Later holdings and trade networks can affect multiple timelines—but with caps and meaningful opportunity costs.

### Progression sketches

| Tier | Example node | New decision | Guardrail |
| --- | --- | --- | --- |
| I — Awakening | **Anchored Memory** | Which mastered item of progression deserves to survive a new timeline? | Whitelisted field, exact carry rule, no recursive unlock exploit |
| II — Mastery | **Timeless Treasury** or **Starting Resources** | Invest in persistent capital or a bounded preparation package | Define which reset it survives and prevent uncapped gold→mana conversion |
| III — Authority | **Compound Holdings** or **Permanent Workshop** | What infrastructure creates value between timelines? | No infinite idle production, explicit returns and capacity |
| IV — Transcendence | **Intertimeline Estate** | Move selected assets/preparations across different timelines | Deterministic accounting, archives and anti-duplication guards |

The basic *idea* of wealth persistence is compelling; its exact cap is not. The old game converts gold into mana and has investment features. Unlimited gold persistence—even just across ordinary inner loops—could trivialize early optimization and is **not** proposed.

## 6. First Real World choice

The proposed onboarding sequence is **one free impactful specialization**, on top of the separate **automatic ~10× replay acceleration**:

| First option | Immediate distinction on the second timeline | Why it is not just an old prestige multiplier |
| --- | --- | --- |
| **Will → Pivot** | Salvage/replan a running loop at a crucial moment | Changes direct control, not a stat percentage |
| **Echoes → First Apprentice** | Give an alternate self one conditional, resource-aware task | Changes routine planning, not only execution speed |
| **Anchors → Anchored Memory** | Bring one specifically bounded prior accomplishment into the new timeline | Changes initial state and available strategies |

**Recommendation:** make these **choices of first unlock order**, not irreversible subclasses. Later progression can acquire all three. Their strength must be compared through real examples of what a player can accomplish, not merely how much time they save.

**Unresolved:** Is the initial choice free? Is it guaranteed to grant *one* ability or instead enough shared advancement for a choice? Do the remaining starter nodes cost the same? What counts as "mastered" for a First Apprentice task? No number, price, prerequisite, refund or class restriction is approved yet.

### How the first other self contributes

Instead of running a shop, the other self might demonstrate the three approaches:

- **Will:** "I learned to change an hour that had already begun."
- **Echoes:** "I learned to stop doing everything myself."
- **Anchors:** "I learned to keep something that time was supposed to take."

These are conceptual teaching beats, **not final dialogue**.

## 7. Cross-tree synergies

The trees should **interact** rather than behave as three isolated, linear shops. Some of the most interesting eventual nodes require investment in two paths.

| Pair | Synergy candidate | What it changes | Integrity requirement |
| --- | --- | --- | --- |
| **Will + Echoes** | **Adaptive Intervention** | A running Echo requests a high-leverage decision when its routine cannot safely proceed; the player can intervene | Respect pause/notification policy; no spam or compulsory clicking |
| **Echoes + Anchors** | **Persistent Workshop** | A self uses previously earned persistent tools to prepare a bounded starting kit for the next timeline | Costs/caps/production are accounted for exactly once |
| **Anchors + Will** | **Fixed Point** | Establish a bounded checkpoint rooted in an anchored timeline state, then examine an alternative outcome | A branch cannot grant duplicate XP, currency, resources, completed rewards or achievements |

A fourth aspirational interaction is an **all-three convergence** allowing a single committed, directed and partially delegated timeline operation. It must not arrive before each underlying mechanic is individually understood and safe.

**Unlock structure recommendation:** prerequisites reference *capabilities* or earned mastery rather than unrelated raw level counts. Cross-tree nodes can be rare, memorable power spikes. Avoid forcing players to buy dozens of low-impact nodes for one exciting effect.

## 8. Challenges, currencies and future scalability

**Challenges are outside the three trees.** Real World may offer optional **divergent timeline configurations** (possibly inspired by dmchurch's Mana Drought, Noodle Arms and Mana Burn), which unlock unusual selves or special nodes. The old standalone challenge menu is still destined for retirement. A speculative **Divergence / Paradox** tree is a possible *future* fourth theme, not part of this initial proposal and **not the same as Dominion**.

**Currency vocabulary matters:**
- **World gold** is the original in-game spendable resource.
- **Treasury** is an upgrade subpath about what gold/other material value survives and where it can be invested.
- **Nexus advancement** is the eventual shared permanent-purchase mechanism; its name, earning schedule, grants, costs and cap are not defined.
- **Legacy prestige points (90 per completion)** are old save data requiring a deliberate conversion/entitlement policy, **not automatically the new nexus currency**.

Do not allow a "get more nexus currency" node to become the dominant obligatory first purchase. Distinctive capabilities and replay diversity are the design goal.

## 9. Three versus four trees — the decision

**Current working recommendation:** **three main trees (Will, Echoes, Anchors)** with Anchors containing **Memory, Treasury and Structures**.

**Serious alternative:** **four main trees (Will, Echoes, Memory, Dominion)**. Dominion is a **full economic/infrastructure pillar**, not a cosmetic rename. See [four-tree alternative](dominion-alternative.md) for tier examples, initial choices, alternative synergies, pros/cons and a migration path if the taxonomy changes later.

### Selection criteria for a later product decision

1. **Onboarding clarity:** Can the first other self explain the choices without a large menu or jargon?
2. **Mechanical parity:** Does economic progression contain as many *distinct capability* unlocks as direct control, automation and retained knowledge?
3. **Choice diversity:** Are at least two viable first-upgrade options attractive for very different play styles?
4. **Progression breadth:** Can the tree expand without turning one branch into a catch-all or bloating the whole hub?
5. **Save/API stability:** Can abilities have stable IDs independent of the tree's visible grouping so this choice does not force veteran-save churn?

**Recommendation is not approval.** The source of final design decisions remains [decisions.md](decisions.md); the user explicitly requested the Dominion alternative stay documented. See [mechanics contract](upgrade-tree-contracts.md) and [test questions](validation.md) before implementing any node.
